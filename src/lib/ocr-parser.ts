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
 * Parse text copied from SRM ERP Portal or output by Tesseract OCR.
 */
export function parseERPText(text: string): Subject[] {
  const subjects: Subject[] = [];

  // Try matching the structured AcademiA table format
  // Example row: 1 NOV 2025 23VAC102 INDIAN CONSTITUTION AND POLITY 2 C 7.00 PASS 1
  const structuredRegex = /(\d+)\s+([A-Z]{3}\s+\d{4})\s+([0-9]{2}[A-Z]{2,6}[0-9]{3,4}[A-Z]?)\s+(.+?)\s+(\d+)\s+([SABCDEF]|AB|ABS|O|A\+|B\+|C\+)\s+(\d+(?:\.\d+)?)\s+([A-Z]+)\s+(\d+)/gi;
  
  const matches = [...text.matchAll(structuredRegex)];
  
  if (matches.length > 0) {
    for (const match of matches) {
      const subjectCode = match[3];
      const description = match[4].trim();
      const credit = parseInt(match[5]);
      const gradeLetter = normalizeGrade(match[6]);
      const gradePoints = parseFloat(match[7]);
      const resultStatus = match[8].toUpperCase();
      
      const hasBack = gradeLetter === 'F' || gradeLetter === 'Ab' || resultStatus === 'FAIL' || resultStatus === 'RA';
      
      const isLab = /lab|practical|workshop|project|seminar/i.test(description) || /[JjPp]$/.test(subjectCode);
      const type: CourseType = isLab ? 'lab' : 'theory';

      subjects.push({
        id: uuidv4(),
        name: `${subjectCode} - ${description}`,
        credit: credit,
        grade: hasBack ? 0 : gradePoints,
        hasBack: hasBack,
        type: type,
        totalMarks: hasBack ? 39 : (gradePoints === 10 ? 95 : gradePoints === 9 ? 85 : gradePoints === 8 ? 75 : gradePoints === 7 ? 65 : gradePoints === 6 ? 55 : 45),
        // Add default mock marks details based on parsed grade points
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

  const lines = text.split('\n');

  // Common course code regex (e.g. 18CSB101T, 21MA102, 15CS302J)
  const codeRegex = /\b[0-9]{2}[A-Z]{2,6}[0-9]{3,4}[A-Z]?\b/;

  // Valid grades regex
  const gradeRegex = /\b(S|A|B|C|D|E|F|Ab)\b/i;


  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Check if the line has a grade and credits
    const codeMatch = line.match(codeRegex);
    const gradeMatch = line.match(gradeRegex);
    
    // Fallback heuristic if no code is present but the line contains typical subject keywords
    const isSubjectLine = codeMatch || /credit|grade|passed|fail/i.test(line) || /[a-z]{4,}/i.test(line);
    
    if (gradeMatch && isSubjectLine) {
      const gradeLetter = normalizeGrade(gradeMatch[0]);
      const gradePoints = GRADE_POINTS[gradeLetter] || 0;
      
      // Look for credit (usually a single number 1-5, often preceded or followed by tabs/spaces)
      // Remove the code and grade first to avoid matching parts of code as credit
      let temp = line;
      if (codeMatch) temp = temp.replace(codeMatch[0], '');
      temp = temp.replace(gradeMatch[0], '');
      
      // Find numbers between 1 and 5 in the remaining text
      const creditsMatch = temp.match(/\b([1-5])\b/);
      const credit = creditsMatch ? parseInt(creditsMatch[1]) : 3; // Default to 3 credits if not found
      
      // Try to extract name
      // Name is usually the text remaining between code (if exists) and credit/grade
      let name = '';
      if (codeMatch) {
        const parts = line.split(codeMatch[0]);
        if (parts[1]) {
          name = parts[1].replace(gradeMatch[0], '').replace(/\b[1-5]\b/, '').replace(/pass|fail|passed/i, '').trim();
        }
      }
      
      if (!name || name.length < 3) {
        // Fallback name extraction: clean the whole line from code, grade, credits, and typical status words
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
      
      // Heuristic for course type
      const isLab = /lab|practical|workshop|project|seminar/i.test(name) || (codeMatch && /[JjPp]$/.test(codeMatch[0]));
      const type: CourseType = isLab ? 'lab' : 'theory';

      subjects.push({
        id: uuidv4(),
        name: name,
        credit: credit,
        grade: gradePoints,
        hasBack: hasBack,
        type: type,
        totalMarks: hasBack ? 40 : 85, // Mocked total marks for display
        // Add default mock marks for theory/lab details
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
