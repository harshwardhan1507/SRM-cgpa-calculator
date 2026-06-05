import { Semester } from '@/types/semester';

export interface CGPAResult {
  cgpa: number;
  totalPoints: number;
  totalCredits: number;
}

export function calculateCGPA(semesters: Semester[]): CGPAResult {
  let totalPoints = 0;
  let totalCredits = 0;

  semesters.forEach((sem) => {
    totalPoints += sem.totalPoints;
    totalCredits += sem.totalCredits;
  });

  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    cgpa,
    totalPoints,
    totalCredits,
  };
}
