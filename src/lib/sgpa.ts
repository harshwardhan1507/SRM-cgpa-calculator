import { Subject } from '@/types/subject';

export interface SGPAResult {
  sgpa: number;
  totalPoints: number;
  totalCredits: number;
}

export function calculateSGPA(courses: Subject[]): SGPAResult {
  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach((course) => {
    if (!course.hasBack) {
      totalPoints += course.grade * course.credit;
      totalCredits += course.credit;
    }
  });

  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    sgpa,
    totalPoints,
    totalCredits,
  };
}
