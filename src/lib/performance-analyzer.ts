import { Semester } from '@/types/semester';
import { Subject } from '@/types/subject';
import { categorizeSubject, SubjectCategory } from './subject-categories';

export interface CategoryAnalysis {
  averageGP: number;
  confidence: number;
  subjectCount: number;
  semesterCount: number;
  grades: { semesterNum: number; grade: number; name: string }[];
}

export interface TrendAnalysisResult {
  subject: string; // Can be a category or a subject name sequence (e.g. French, Math)
  trend: 'Stable Excellence' | 'Improving' | 'Declining' | 'Stable' | 'Not Enough Data';
}

/**
 * Runs deterministic analysis on the student's semesters.
 */
export function analyzePerformance(semesters: Semester[]) {
  const categories: Record<SubjectCategory, CategoryAnalysis> = {
    Mathematics: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Programming: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Electronics: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Physics: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Chemistry: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Languages: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Humanities: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Management: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Laboratory: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] },
    Other: { averageGP: 0, confidence: 0, subjectCount: 0, semesterCount: 0, grades: [] }
  };

  // Sort semesters chronologically
  const sortedSemesters = [...semesters].sort((a, b) => a.semester - b.semester);

  // Group all subjects into categories
  sortedSemesters.forEach((sem) => {
    sem.courses.forEach((course) => {
      // Don't include active backlogs in averages (but keep track for risk prediction)
      if (course.hasBack) return;

      const category = categorizeSubject(course.name, course.type);
      categories[category].grades.push({
        semesterNum: sem.semester,
        grade: course.grade,
        name: course.name
      });
      categories[category].subjectCount++;
    });
  });

  // Calculate averageGP, semesterCount and confidence for each category
  Object.keys(categories).forEach((catKey) => {
    const cat = categories[catKey as SubjectCategory];
    if (cat.subjectCount > 0) {
      const totalGP = cat.grades.reduce((sum, g) => sum + g.grade, 0);
      cat.averageGP = parseFloat((totalGP / cat.subjectCount).toFixed(2));

      // Count distinct semesters this category was taken
      const uniqueSemesters = new Set(cat.grades.map((g) => g.semesterNum));
      cat.semesterCount = uniqueSemesters.size;

      // Confidence formula: min(1.0, 0.4 + uniqueSemesters * 0.2)
      cat.confidence = parseFloat(Math.min(1.0, 0.4 + uniqueSemesters.size * 0.2).toFixed(2));
    }
  });

  // Detect category-level trends
  const trends: TrendAnalysisResult[] = [];
  
  if (sortedSemesters.length >= 2) {
    Object.keys(categories).forEach((catKey) => {
      const catName = catKey as SubjectCategory;
      const cat = categories[catName];
      
      // Sort the grades in the category by semester
      const sortedGrades = [...cat.grades].sort((a, b) => a.semesterNum - b.semesterNum);
      
      if (sortedGrades.length >= 2) {
        // Group by semester to see semester-by-semester average for this category
        const semAverages: { semesterNum: number; averageGP: number }[] = [];
        const semGroups = new Map<number, number[]>();
        
        sortedGrades.forEach((g) => {
          if (!semGroups.has(g.semesterNum)) {
            semGroups.set(g.semesterNum, []);
          }
          semGroups.get(g.semesterNum)!.push(g.grade);
        });

        semGroups.forEach((gradesList, semNum) => {
          const avg = gradesList.reduce((s, x) => s + x, 0) / gradesList.length;
          semAverages.push({ semesterNum: semNum, averageGP: avg });
        });

        // Sort semester averages chronologically
        semAverages.sort((a, b) => a.semesterNum - b.semesterNum);

        if (semAverages.length >= 2) {
          const firstAvg = semAverages[0].averageGP;
          const lastAvg = semAverages[semAverages.length - 1].averageGP;
          const diff = lastAvg - firstAvg;

          // Check if it's consistently excellent
          const isStableExcellence = semAverages.every((a) => a.averageGP >= 9.0);

          let trendValue: TrendAnalysisResult['trend'] = 'Stable';
          if (isStableExcellence) {
            trendValue = 'Stable Excellence';
          } else if (diff >= 0.5) {
            trendValue = 'Improving';
          } else if (diff <= -0.5) {
            trendValue = 'Declining';
          } else {
            trendValue = 'Stable';
          }

          trends.push({
            subject: catName,
            trend: trendValue
          });
        }
      }
    });

    // Detect subject sequence trends (e.g., French-I vs French-II, Maths-I vs Maths-II)
    // We group subjects by removing roman numerals/suffixes like "-I", " I", "-II", " II", " 1", " 2", etc.
    const subjectSequences = new Map<string, { semesterNum: number; grade: number; fullName: string }[]>();
    sortedSemesters.forEach((sem) => {
      sem.courses.forEach((course) => {
        if (course.hasBack) return;
        
        // Normalize name: e.g. "Engineering Mathematics-I" -> "Engineering Mathematics"
        const baseName = course.name
          .replace(/[- ](I|II|III|IV|V|VI|VII|VIII|1|2|3|4|5)$/i, '')
          .trim();

        if (baseName !== course.name) {
          if (!subjectSequences.has(baseName)) {
            subjectSequences.set(baseName, []);
          }
          subjectSequences.get(baseName)!.push({
            semesterNum: sem.semester,
            grade: course.grade,
            fullName: course.name
          });
        }
      });
    });

    subjectSequences.forEach((gradesList, baseName) => {
      if (gradesList.length >= 2) {
        // Sort chronologically
        gradesList.sort((a, b) => a.semesterNum - b.semesterNum);
        const first = gradesList[0].grade;
        const last = gradesList[gradesList.length - 1].grade;
        const diff = last - first;

        const isStableExcellence = gradesList.every((g) => g.grade >= 9.0);

        let trendValue: TrendAnalysisResult['trend'] = 'Stable';
        if (isStableExcellence) {
          trendValue = 'Stable Excellence';
        } else if (diff >= 0.5) {
          trendValue = 'Improving';
        } else if (diff <= -0.5) {
          trendValue = 'Declining';
        } else {
          trendValue = 'Stable';
        }

        trends.push({
          subject: baseName,
          trend: trendValue
        });
      }
    });
  }

  // Find overall highest and lowest scoring subjects
  let highestSubject: { name: string; grade: number; semester: number } | null = null;
  let lowestSubject: { name: string; grade: number; semester: number } | null = null;

  sortedSemesters.forEach((sem) => {
    sem.courses.forEach((course) => {
      if (course.hasBack) return;

      if (!highestSubject || course.grade > highestSubject.grade) {
        highestSubject = { name: course.name, grade: course.grade, semester: sem.semester };
      }
      // Only set lowest subject if the course is not a backlog and has a grade
      if (!lowestSubject || course.grade < lowestSubject.grade) {
        lowestSubject = { name: course.name, grade: course.grade, semester: sem.semester };
      }
    });
  });

  return {
    categories,
    trends,
    highestSubject,
    lowestSubject
  };
}
