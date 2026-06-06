import { AcademicProfile } from '@/lib/academic-dna';

export function buildInsightsPrompt(profile: AcademicProfile): string {
  const dataForGemini = {
    cgpa: profile.overallCGPA,
    strengths: profile.strengths,
    weaknesses: profile.weaknesses,
    highestSubject: profile.highestSubject,
    lowestSubject: profile.lowestSubject,
    trends: profile.trends
  };

  return `
You are an expert Academic Advisor at SRM University.
Analyze the following student's historical academic profile and performance data:
${JSON.stringify(dataForGemini, null, 2)}

Based on this data:
1. Summarize their strongest domains (areas with high GPs).
2. Summarize their weakest domains (areas needing focus/improvement).
3. Provide 3-4 highly specific, actionable study recommendations tailored to their profile.
4. Give a realistic prediction of future performance trends (e.g. likely CGPA trajectory).
5. Highlight 2-3 specific focus areas for upcoming semesters.

You MUST return your response in JSON format. Do not include markdown code block formatting (like \`\`\`json). Return ONLY raw JSON matching this schema:
{
  "strengthSummary": "A concise paragraph summarizing strengths.",
  "weaknessSummary": "A concise paragraph summarizing weaknesses.",
  "studyRecommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "futurePrediction": "A short prediction paragraph.",
  "focusAreas": ["Focus Area 1", "Focus Area 2"]
}
`;
}

export function buildGpaPlanPrompt(
  targetSGPA: number,
  recommendedPlan: any,
  selfAssessment: Record<string, string>,
  feasibility: number,
  difficulty: string,
  planMode: string
): string {
  return `
You are an SRM Academic Advisor auditing a student's targeted GPA plan.
Student Target SGPA: ${targetSGPA} (Planned in "${planMode}" mode)
Deterministic recommended plan generated:
${JSON.stringify(recommendedPlan.grades, null, 2)}

Student's self-assessed confidence for each planned subject (Strong/Average/Weak):
${JSON.stringify(selfAssessment, null, 2)}

Plan Feasibility: ${feasibility}%
Plan Difficulty: ${difficulty}

Audit the feasibility of this plan:
1. Explain why this specific plan was generated based on their self-assessments (e.g. why grades are distributed this way under "${planMode}" mode).
2. Highlight which subjects matter most and where their study effort should be focused.
3. Identify what academic risks exist (e.g. if they are weak in a subject but need a high grade).
Keep your response under 120 words, direct, and formatted as a single plain text paragraph. Do not return JSON. Never generate or modify the grade plan yourself; only explain the deterministic plan provided.
`;
}

export function buildCoachPrompt(
  profile: AcademicProfile,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userQuestion: string
): string {
  const studentContext = {
    cgpa: profile.overallCGPA,
    strengths: profile.strengths,
    weaknesses: profile.weaknesses,
    trends: profile.trends,
    highRisk: profile.riskReport.highRisk,
    highOpportunity: profile.riskReport.highOpportunity
  };

  return `
You are a friendly, motivating, and highly intelligent SRM Academic Coach.
You have the student's Academic Profile & DNA:
${JSON.stringify(studentContext, null, 2)}

Here is the conversation history:
${JSON.stringify(chatHistory, null, 2)}

Here is the student's new question:
"${userQuestion}"

Provide a direct, helpful, and highly personalized coaching response. 
- Ground your advice in their actual strengths and weaknesses.
- If they ask for GPA targets, tell them what's achievable based on their category averages.
- Keep it concise (under 120 words), motivational, and formatted in clean markdown. 
- Never do grade calculations yourself (calculations are deterministic, trust the values provided).
- Answer the student directly. Do not use JSON.
`;
}
