import { Semester } from '@/types/semester';

export interface CGPAResult {
  cgpa: number;
  totalPoints: number;
  totalCredits: number;
  earnedCredits: number;
}

export function calculateCGPA(semesters: Semester[]): CGPAResult {
  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  semesters.forEach((sem) => {
    totalPoints += sem.totalPoints;
    totalCredits += sem.totalCredits;
    
    // Support backward compatibility for legacy semester data
    if (sem.earnedCredits !== undefined) {
      earnedCredits += sem.earnedCredits;
    } else {
      const backlogCredits = sem.courses
        .filter(c => c.hasBack)
        .reduce((sum, c) => sum + c.credit, 0);
      earnedCredits += sem.totalCredits - backlogCredits;
    }
  });

  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    cgpa,
    totalPoints,
    totalCredits,
    earnedCredits,
  };
}
