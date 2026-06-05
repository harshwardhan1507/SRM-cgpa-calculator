import { Subject, CourseType } from '@/types/subject';
import { GRADE_POINTS } from './grade-mapping';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standardizes grades from legacy systems or minor OCR misreadings.
 */
function normalizeGrade(raw: string): string {
  const g = raw.trim().toUpperCase();
  if (['S', 'O'].includes(g)) return 'S'; // Map O to S (Outstanding)
  if (g === 'A') return 'A';
  if (g === 'B') return 'B';
  if (g === 'C') return 'C';
  if (g === 'D') return 'D';
  if (g === 'E') return 'E';
  if (['F', 'FA'].includes(g)) return 'F';
  if (['AB', 'ABS'].includes(g)) return 'Ab';
  
  // Return the closest matching grade or default to E
  const validGrades = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'Ab'];
  if (validGrades.includes(g)) return g;
  
  return 'E'; // fallback
}

/**
 * Normalizes subject codes by correcting common OCR mistakes where letters
 * and numbers are swapped (e.g., O for 0, I/l for 1).
 */
function normalizeCode(rawCode: string): string {
  // Use case-sensitive matching for the middle letters to prevent lowercase 'l' or 'i' from matching as letters.
  const match = rawCode.match(/^([0-9OIld|]{2})([A-Z]{2,6})([0-9OIld|]{2,4})([A-Z]?)$/);
  if (!match) {
    // Try case-insensitive fallback if it doesn't match case-sensitively
    const matchIC = rawCode.match(/^([0-9OIld|]{2})([a-zA-Z]{2,6})([0-9OIld|]{2,4})([a-zA-Z]?)$/);
    if (!matchIC) return rawCode.toUpperCase();
    return normalizeCodeParts(matchIC[1], matchIC[2], matchIC[3], matchIC[4]);
  }
  
  return normalizeCodeParts(match[1], match[2], match[3], match[4]);
}

function normalizeCodeParts(p1: string, p2: string, p3: string, p4: string): string {
  const cleanDigits = (s: string) => {
    return s.toUpperCase()
      .replace(/O/g, '0')
      .replace(/[ILl|]/g, '1')
      .replace(/S/g, '5')
      .replace(/B/g, '8');
  };
  
  const prefix = cleanDigits(p1);
  const middle = p2.toUpperCase();
  const suffix = cleanDigits(p3);
  const final = p4.toUpperCase();
  
  return `${prefix}${middle}${suffix}${final}`;
}

/**
 * Parse text copied from SRM ERP Portal or output by Tesseract OCR.
 * Uses a robust subject-code anchor chunking algorithm.
 */
export function parseERPText(text: string): Subject[] {
  const subjects: Subject[] = [];
  
  // 1. Preprocess text to resolve line breaks within columns and normalize whitespace
  const cleanText = text.replace(/\r/g, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ');

  // 2. Find all subject code anchors in the text (allowing common OCR errors)
  const codeRegex = /\b[0-9OIld|]{2}[A-Z]{2,6}[0-9OIld|]{2,4}[A-Z]?\b/gi;
  
  const matches: { rawCode: string; index: number }[] = [];
  let match;
  while ((match = codeRegex.exec(cleanText)) !== null) {
    matches.push({
      rawCode: match[0],
      index: match.index
    });
  }

  // If no code anchors were found, fallback to line-by-line scanning
  if (matches.length === 0) {
    return parseLineByLineFallback(text);
  }

  // 3. Process each subject chunk using anchors
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    
    // Chunk of text starting at current code and ending at next code (or end of text)
    let chunk = cleanText.substring(current.index, next ? next.index : cleanText.length).trim();
    
    // Remove the raw subject code from the beginning of the chunk
    let remaining = chunk.substring(current.rawCode.length).trim();
    
    // Normalize code (correcting 0/O, 1/l, etc.)
    const subjectCode = normalizeCode(current.rawCode);
    
    // A. Find grade points (decimal number with dot or comma, allowing OCR errors)
    const gpMatch = remaining.match(/\b([0-9OIld|]+[\.,][0-9OIld|]{2})\b/);
    let gradePoints = 8.0; // default fallback
    let gpStr = '';
    
    if (gpMatch) {
      gpStr = gpMatch[1];
      const cleanGP = gpStr.toUpperCase()
        .replace(/,/g, '.')
        .replace(/O/g, '0')
        .replace(/[ILl|]/g, '1')
        .replace(/S/g, '5')
        .replace(/B/g, '8');
      gradePoints = parseFloat(cleanGP) || 0;
    } else {
      // Look for any integer between 0 and 10
      const intMatch = remaining.match(/\b(10|[0-9])\b/);
      if (intMatch) {
        gpStr = intMatch[1];
        gradePoints = parseFloat(gpStr) || 0;
      }
    }
    
    // B. Find credit (number 1-5 or OCR equivalent: I, l, |, d)
    // Search in the text of the chunk before the grade points
    let beforeGp = remaining;
    if (gpStr) {
      const idx = remaining.indexOf(gpStr);
      if (idx !== -1) {
        beforeGp = remaining.substring(0, idx).trim();
      }
    }
    
    // Search for credit candidates from right to left
    const creditMatches = [...beforeGp.matchAll(/\b([1-5Ild|])\b/g)];
    let credit = 3; // default fallback
    let creditStr = '';
    if (creditMatches.length > 0) {
      const lastMatch = creditMatches[creditMatches.length - 1];
      creditStr = lastMatch[1];
      
      const cleanCredit = creditStr.toUpperCase()
        .replace(/[ILl|d]/g, '1')
        .replace(/S/g, '5')
        .replace(/B/g, '8');
      credit = parseInt(cleanCredit) || 3;
    }
    
    // C. Extract description
    let description = beforeGp;
    if (creditStr) {
      const idx = beforeGp.lastIndexOf(creditStr);
      if (idx !== -1) {
        description = beforeGp.substring(0, idx).trim();
      }
    }
    
    // Clean up description (strip trailing standalone grade letters if any)
    description = description
      .replace(/\s+\b(S|A|B|C|D|E|F|Ab|O|A\+|B\+|C\+)\b$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    // Determine grade letter and hasBack status
    const gradeLetter = normalizeGrade(gradePoints === 10 ? 'S' : gradePoints === 9 ? 'A' : gradePoints === 8 ? 'B' : gradePoints === 7 ? 'C' : gradePoints === 6 ? 'D' : gradePoints === 5 ? 'E' : 'F');
    const hasBack = gradeLetter === 'F' || gradeLetter === 'Ab';
    
    // Heuristic for course type
    const isLab = /lab|practical|workshop|project|seminar/i.test(description) || /[JjPp]$/.test(subjectCode);
    const type: CourseType = isLab ? 'lab' : 'theory';

    subjects.push({
      id: uuidv4(),
      name: `${subjectCode} - ${description || `Subject ${subjectCode}`}`,
      credit,
      grade: hasBack ? 0 : gradePoints,
      hasBack,
      type,
      totalMarks: hasBack ? 39 : (gradePoints === 10 ? 95 : gradePoints === 9 ? 85 : gradePoints === 8 ? 75 : gradePoints === 7 ? 65 : gradePoints === 6 ? 55 : 45),
      ...(type === 'theory' ? {
        mst1: hasBack ? 10 : 25,
        mst2: hasBack ? 10 : 26,
        assignment: hasBack ? 5 : 9,
        endsem: hasBack ? 30 : (gradePoints * 10)
      } : {
        labInternal: hasBack ? 30 : (gradePoints * 6),
        labExternal: hasBack ? 10 : (gradePoints * 4)
      })
    });
  }
  
  return subjects;
}

/**
 * Fallback parser scanning text line-by-line if no course code anchors were found.
 */
function parseLineByLineFallback(text: string): Subject[] {
  const subjects: Subject[] = [];
  const lines = text.split('\n');

  const codeRegex = /\b[0-9]{2}[A-Z]{2,6}[0-9]{2,4}[A-Z]?\b/;
  const gradeRegex = /\b(S|A|B|C|D|E|F|Ab)\b/i;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const codeMatch = line.match(codeRegex);
    const gradeMatch = line.match(gradeRegex);
    
    const isSubjectLine = codeMatch || /credit|grade|passed|fail/i.test(line) || /[a-z]{4,}/i.test(line);
    
    if (gradeMatch && isSubjectLine) {
      const gradeLetter = normalizeGrade(gradeMatch[0]);
      const gradePoints = GRADE_POINTS[gradeLetter] || 0;
      
      let temp = line;
      if (codeMatch) temp = temp.replace(codeMatch[0], '');
      temp = temp.replace(gradeMatch[0], '');
      
      const creditsMatch = temp.match(/\b([1-5])\b/);
      const credit = creditsMatch ? parseInt(creditsMatch[1]) : 3;
      
      let name = '';
      if (codeMatch) {
        const parts = line.split(codeMatch[0]);
        if (parts[1]) {
          name = parts[1].replace(gradeMatch[0], '').replace(/\b[1-5]\b/, '').replace(/pass|fail|passed/i, '').trim();
        }
      }
      
      if (!name || name.length < 3) {
        name = line
          .replace(codeMatch ? codeMatch[0] : '', '')
          .replace(gradeMatch[0], '')
          .replace(/\b[1-5]\b/g, '')
          .replace(/pass|fail|passed|theory|practical|lab/gi, '')
          .replace(/[^a-zA-Z\s\-]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      if (!name) {
        name = codeMatch ? `Subject ${codeMatch[0]}` : `Subject ${subjects.length + 1}`;
      }

      const hasBack = gradeLetter === 'F' || gradeLetter === 'Ab';
      const isLab = /lab|practical|workshop|project|seminar/i.test(name) || (codeMatch && /[JjPp]$/.test(codeMatch[0]));
      const type: CourseType = isLab ? 'lab' : 'theory';
      const subjectCode = codeMatch ? normalizeCode(codeMatch[0]) : '';

      subjects.push({
        id: uuidv4(),
        name: subjectCode ? `${subjectCode} - ${name}` : name,
        credit: credit,
        grade: gradePoints,
        hasBack: hasBack,
        type: type,
        totalMarks: hasBack ? 40 : 85,
        ...(type === 'theory' ? {
          mst1: hasBack ? 10 : 25,
          mst2: hasBack ? 10 : 26,
          assignment: hasBack ? 5 : 9,
          endsem: hasBack ? 30 : 80
        } : {
          labInternal: hasBack ? 30 : 52,
          labExternal: hasBack ? 10 : 33
        })
      });
    }
  }

  return subjects;
}
