export type SubjectCategory =
  | 'Mathematics'
  | 'Programming'
  | 'Electronics'
  | 'Physics'
  | 'Chemistry'
  | 'Languages'
  | 'Humanities'
  | 'Management'
  | 'Laboratory'
  | 'Other';

const CATEGORY_KEYWORDS: Record<Exclude<SubjectCategory, 'Other' | 'Laboratory'>, string[]> = {
  Languages: ['english', 'french', 'german', 'spanish', 'japanese', 'chinese', 'language', 'tamil', 'hindi', 'sanskrit', 'telugu', 'communicative'],
  Mathematics: ['mathematics', 'maths', 'math', 'calculus', 'algebra', 'probability', 'statistics', 'discrete', 'numerical', 'differential', 'geometry'],
  Programming: ['programming', 'python', 'java', 'c++', 'c#', 'data structures', 'algorithm', 'software', 'web', 'database', 'sql', 'dbms', 'operating system', 'compiler', 'network', 'machine learning', 'artificial intelligence', 'ai', 'ml', 'deep learning', 'cloud', 'computation', 'object oriented', 'coding'],
  Electronics: ['electronics', 'circuit', 'semiconductor', 'microprocessor', 'microcontroller', 'vlsi', 'embedded', 'signal', 'communication', 'electrical', 'power', 'electromagnetic', 'analog', 'digital systems'],
  Physics: ['physics', 'optics', 'quantum', 'mechanics', 'thermodynamics', 'acoustics', 'astronomy'],
  Chemistry: ['chemistry', 'environmental', 'evs', 'organic', 'inorganic', 'ecology'],
  Humanities: ['constitution', 'ethics', 'values', 'sociology', 'psychology', 'economics', 'history', 'professional development', 'career', 'soft skills', 'aptitude', 'co-curricular', 'human rights'],
  Management: ['management', 'entrepreneurship', 'finance', 'marketing', 'operations', 'business', 'mba', 'administration', 'organizational']
};

/**
 * Categorizes a subject based on its name and course type.
 */
export function categorizeSubject(name: string, type?: 'theory' | 'lab'): SubjectCategory {
  const cleanName = name.toLowerCase().trim();

  // 1. Explicit Laboratory check
  if (
    type === 'lab' ||
    cleanName.includes('lab') ||
    cleanName.includes('laboratory') ||
    cleanName.includes('practical') ||
    cleanName.includes('workshop') ||
    cleanName.includes('clinic')
  ) {
    return 'Laboratory';
  }

  // 2. Scan keywords for other categories
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (cleanName.includes(keyword)) {
        return category as SubjectCategory;
      }
    }
  }

  return 'Other';
}
