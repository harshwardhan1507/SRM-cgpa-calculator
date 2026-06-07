import { Subject } from './subject';

export interface Semester {
  semester: number; // 1-8
  cgpa: number; // This is actually the SGPA of this semester (maintained as cgpa for legacy compatibility)
  courses: Subject[];
  totalPoints: number;
  totalCredits: number;
  earnedCredits?: number;
  academicYear?: string; // e.g. "2023-2024"
}
