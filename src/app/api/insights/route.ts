import { NextResponse } from 'next/server';
import {
  buildInsightsPrompt,
  buildGpaPlanPrompt,
  buildCoachPrompt
} from '@/services/prompt-builder';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      action, 
      profile, 
      targetSgpa, 
      planMode, 
      planDetails, 
      chatHistory, 
      userQuestion,
      targetSGPA,
      selfAssessment,
      academicDNA,
      recommendedPlan,
      feasibility,
      difficulty
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Fallbacks if GEMINI_API_KEY is not defined
    if (!apiKey || apiKey === '') {
      if (action === 'generate_insights') {
        const topStrength = profile.strengths.length > 0 ? profile.strengths[0] : 'None';
        const primaryWeakness = profile.weaknesses.length > 0 ? profile.weaknesses[0] : 'None';
        
        return NextResponse.json({
          strengthSummary: `Deterministic analysis indicates ${topStrength} is currently your strongest category with an average GP of ${profile.categoryAnalysis[topStrength]?.averageGP || '0.00'}.`,
          weaknessSummary: primaryWeakness !== 'None' 
          ? `Your primary weakness category is ${primaryWeakness} with an average GP of ${profile.categoryAnalysis[primaryWeakness]?.averageGP || '0.00'}. Focus on this area.` 
          : 'No distinct weak categories detected (average GP < 8.00).',
          studyRecommendations: [
            'Strengthen your preparation in weak categories by practicing previous year question papers.',
            'Aim to clear any pending backlogs as soon as they become available in consecutive odd/even semesters.',
            'Add your GEMINI_API_KEY to the .env file to enable custom, AI-grounded study recommendations.'
          ],
          futurePrediction: `With your current SGPA trend of ${profile.averageSGPA.toFixed(2)}, your CGPA is projected to stay stable. Set up the Gemini API key to view long-term forecasting.`,
          focusAreas: [
            primaryWeakness !== 'None' ? `${primaryWeakness} subjects` : 'Upcoming syllabus review',
            'Backlog resolution and credit mapping'
          ]
        });
      }

      if (action === 'explain_gpa_plan') {
        const tSgpa = targetSGPA !== undefined ? targetSGPA : targetSgpa;
        return NextResponse.json({
          explanation: `Plan feasible: True. This is a deterministic planning distribution under "${planMode}" mode. To audit this target SGPA of ${tSgpa} using Gemini AI, configure the GEMINI_API_KEY in your local environment file.`
        });
      }

      if (action === 'ai_coach_chat') {
        return NextResponse.json({
          response: `Hello! I am your local SRM Academic Coach helper. I see you have completed ${profile.totalSemesters} semesters with a CGPA of ${profile.overallCGPA}. \n\n**(Developer Note: To chat with the AI-powered coach, please add a GEMINI_API_KEY to your .env file).**`
        });
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // 2. Build Gemini Request Prompts
    let promptText = '';
    if (action === 'generate_insights') {
      promptText = buildInsightsPrompt(profile);
    } else if (action === 'explain_gpa_plan') {
      const tSgpa = targetSGPA !== undefined ? targetSGPA : targetSgpa;
      const selfAssess = selfAssessment || (planDetails?.courseConfidence ? planDetails.courseConfidence.reduce((acc: any, c: any) => {
        acc[c.name] = c.confidence;
        return acc;
      }, {}) : {});
      const recPlan = recommendedPlan || planDetails || { grades: [] };
      const feas = feasibility !== undefined ? feasibility : 80;
      const diffLvl = difficulty || 'Moderate';
      
      promptText = buildGpaPlanPrompt(tSgpa, recPlan, selfAssess, feas, diffLvl, planMode);
    } else if (action === 'ai_coach_chat') {
      promptText = buildCoachPrompt(profile, chatHistory || [], userQuestion);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // 3. Direct Gemini API REST request
    const geminiBody: any = {
      contents: [{
        parts: [{ text: promptText }]
      }]
    };

    if (action === 'generate_insights') {
      geminiBody.generationConfig = {
        responseMimeType: 'application/json'
      };
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiBody)
      }
    );

    if (!geminiResponse.ok) {
      console.error('Gemini API returned error code:', geminiResponse.status);
      return NextResponse.json(
        { error: 'Gemini API execution error.' },
        { status: 500 }
      );
    }

    const responseJson = await geminiResponse.json();
    const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json({ error: 'No content generated.' }, { status: 500 });
    }

    // 4. Return results
    if (action === 'generate_insights') {
      try {
        // Strip markdown backticks if Gemini ignored instructions
        const cleanedText = rawText.replace(/```json/i, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanedText);
        
        // Validate required schema
        if (
          parsedData.strengthSummary &&
          parsedData.weaknessSummary &&
          Array.isArray(parsedData.studyRecommendations) &&
          parsedData.futurePrediction &&
          Array.isArray(parsedData.focusAreas)
        ) {
          return NextResponse.json(parsedData);
        }
        
        throw new Error('Schema validation failed.');
      } catch (e) {
        console.error('Failed to parse or validate JSON from Gemini:', e, rawText);
        return NextResponse.json(
          { error: 'Malformed structured AI response.' },
          { status: 500 }
        );
      }
    }

    if (action === 'explain_gpa_plan') {
      return NextResponse.json({ explanation: rawText.trim() });
    }

    if (action === 'ai_coach_chat') {
      return NextResponse.json({ response: rawText.trim() });
    }

    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });

  } catch (error) {
    console.error('Error handling API route POST request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
