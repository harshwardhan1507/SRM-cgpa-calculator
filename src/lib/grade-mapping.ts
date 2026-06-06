export const GRADE_POINTS: Record<string, number> = {
  'S': 10,
  'A': 9,
  'B': 8,
  'C': 7,
  'D': 6,
  'E': 5,
  'F': 0,
  'Ab': 0,
};

export const POINT_GRADES: Record<number, string> = {
  10: 'S',
  9: 'A',
  8: 'B',
  7: 'C',
  6: 'D',
  5: 'E',
  0: 'F',
};

export function getGradeLetter(points: number, hasBack = false): string {
  if (hasBack || points === 0) return 'F';
  return POINT_GRADES[points] || 'F';
}

export function getGradeFromMarks(marks: number, hasBack = false, isLab = false): number {
  const minPassMarks = isLab ? 50 : 40;
  if (hasBack || marks < minPassMarks) return 0;
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 50) return 6;
  if (marks >= 40) return 5;
  return 0;
}

export function getGradeLetterFromMarks(marks: number, hasBack = false, isLab = false): string {
  const points = getGradeFromMarks(marks, hasBack, isLab);
  return getGradeLetter(points, hasBack);
}

