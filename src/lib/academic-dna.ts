import { Semester } from '@/types/semester';
import { calculateCGPA } from './cgpa';
import { analyzePerformance, CategoryAnalysis } from './performance-analyzer';

export interface AcademicProfile {
  totalSemesters: number;
  averageSGPA: number;
  totalCredits: number;
  overallCGPA: number;
  confidence: 'low' | 'medium' | 'high';
  strengths: string[];
  moderates: string[];
  weaknesses: string[];
  highestSubject: { name: string; grade: number; semester: number } | null;
  lowestSubject: { name: string; grade: number; semester: number } | null;
  categoryAnalysis: Record<string, { averageGP: number; confidence: number; subjectCount: number }>;
  trends: { subject: string; trend: string }[];
  riskReport: {
    highRisk: string[];
    highOpportunity: string[];
  };
}



/**
 * Generates the full academic profile and DNA locally (deterministic).
 */
export function generateAcademicProfile(semesters: Semester[]): AcademicProfile {
  const cgpaResult = calculateCGPA(semesters);
  const totalSemesters = semesters.length;
  
  // Calculate average SGPA
  const totalSGPA = semesters.reduce((sum, sem) => sum + sem.cgpa, 0);
  const averageSGPA = totalSemesters > 0 ? parseFloat((totalSGPA / totalSemesters).toFixed(2)) : 0;
  
  // Get confidence level based on semester count
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (totalSemesters === 2) {
    confidence = 'medium';
  } else if (totalSemesters >= 3) {
    confidence = 'high';
  }

  // Run performance analysis
  const performance = analyzePerformance(semesters);
  
  // Classify DNA: Strengths, Moderates, Weaknesses
  const strengths: string[] = [];
  const moderates: string[] = [];
  const weaknesses: string[] = [];
  const categoryAnalysis: Record<string, { averageGP: number; confidence: number; subjectCount: number }> = {};

  Object.entries(performance.categories).forEach(([category, data]) => {
    if (data.subjectCount > 0) {
      categoryAnalysis[category] = {
        averageGP: data.averageGP,
        confidence: data.confidence,
        subjectCount: data.subjectCount
      };

      if (data.averageGP >= 9.0) {
        strengths.push(category);
      } else if (data.averageGP >= 8.0) {
        moderates.push(category);
      } else {
        weaknesses.push(category);
      }
    }
  });


  // Generate Risk Report (Phase 12)
  const highRisk: string[] = [];
  const highOpportunity: string[] = [];

  // 1. Collect from weak/strong categories
  weaknesses.forEach((cat) => highRisk.push(`${cat} Category (Avg GP: ${categoryAnalysis[cat].averageGP})`));
  strengths.forEach((cat) => highOpportunity.push(`${cat} Category (Avg GP: ${categoryAnalysis[cat].averageGP})`));

  // 2. Add specific low/high performing courses
  semesters.forEach((sem) => {
    sem.courses.forEach((course) => {
      if (course.hasBack) {
        highRisk.push(`⚠️ Backlog: ${course.name} (Semester ${sem.semester})`);
      } else if (course.grade < 8) {
        highRisk.push(`${course.name} (GP: ${course.grade} in Sem ${sem.semester})`);
      } else if (course.grade >= 9.5) {
        highOpportunity.push(`${course.name} (GP: ${course.grade} in Sem ${sem.semester})`);
      }
    });
  });

  return {
    totalSemesters,
    averageSGPA,
    totalCredits: cgpaResult.totalCredits,
    overallCGPA: parseFloat(cgpaResult.cgpa.toFixed(2)),
    confidence,
    strengths,
    moderates,
    weaknesses,
    highestSubject: performance.highestSubject,
    lowestSubject: performance.lowestSubject,
    categoryAnalysis,
    trends: performance.trends,
    riskReport: {
      highRisk: Array.from(new Set(highRisk)),
      highOpportunity: Array.from(new Set(highOpportunity))
    }
  };
}
