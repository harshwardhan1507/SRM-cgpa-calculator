import { Subject } from '@/types/subject';

export interface SGPAResult {
  sgpa: number;
  totalPoints: number;
  totalCredits: number;
  earnedCredits: number;
}

export function calculateSGPA(courses: Subject[]): SGPAResult {
  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  courses.forEach((course) => {
    totalPoints += course.grade * course.credit;
    totalCredits += course.credit;
    if (!course.hasBack) {
      earnedCredits += course.credit;
    }
  });

  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    sgpa,
    totalPoints,
    totalCredits,
    earnedCredits,
  };
}
