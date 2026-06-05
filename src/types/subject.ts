export type CourseType = 'theory' | 'lab';

export interface Subject {
  id: string;
  name: string;
  credit: number;
  grade: number; // 0-10 grade points scale
  hasBack: boolean;
  type: CourseType;
  
  // Theory marks breakdown
  mst1?: number; // 0-30
  mst2?: number; // 0-30
  assignment?: number; // 0-10
  endsem?: number; // 0-100
  
  // Lab marks breakdown
  labInternal?: number; // 0-60
  labExternal?: number; // 0-40
  
  totalMarks: number;
}
