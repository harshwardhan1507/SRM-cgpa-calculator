'use client';

import { useState, useEffect } from 'react';
import { AcademicProfile } from '@/lib/academic-dna';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, BookOpen, Calculator, Info, CheckCircle2 } from 'lucide-react';
import { categorizeSubject, SubjectCategory } from '@/lib/subject-categories';
import { useFirebase } from '@/components/firebase-provider';
import { motion, AnimatePresence } from 'framer-motion';

interface GPAPlannerProps {
  profile: AcademicProfile;
}

interface PlannedCourse {
  id: string;
  name: string;
  credit: number;
  category: SubjectCategory;
  confidence: 'strong' | 'average' | 'weak';
}

interface GradePlan {
  grades: { courseName: string; grade: string; gradePoint: number; credit: number }[];
  possible: boolean;
  averageGP: number;
}


function parseBulkSubjects(text: string): PlannedCourse[] {
  const lines = text.split('\n');
  const parsed: PlannedCourse[] = [];
  
  lines.forEach((line) => {
    let cleanLine = line.replace(/\r/g, '').trim();
    if (!cleanLine) return;
    
    const words = cleanLine.split(/\s+/);
    let credits = 3;
    let nameParts = [...words];
    
    const lastWord = words[words.length - 1];
    const lastDigitMatch = lastWord.match(/^[1-5]$/);
    
    if (lastDigitMatch) {
      credits = parseInt(lastWord);
      nameParts.pop();
    } else {
      const creditIdx = words.findIndex(w => /^[1-5]$/.test(w));
      if (creditIdx !== -1) {
        credits = parseInt(words[creditIdx]);
        nameParts.splice(creditIdx, 1);
      }
    }
    
    let subjectName = nameParts.join(' ').trim();
    // Only strip course codes (that contain at least one digit, e.g. 18CS301J) or format CS301, leaving standard words
    subjectName = subjectName
      .replace(/\b(?=\w*\d)\w{5,10}\b/gi, '')
      .replace(/\b[A-Z]{2,4}\d{3,4}[A-Z]?\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (subjectName.length < 2) {
      subjectName = cleanLine;
    }
    
    const category = categorizeSubject(subjectName);
    parsed.push({
      id: Math.random().toString(36).substring(2, 9),
      name: subjectName,
      credit: credits,
      category,
      confidence: 'average'
    });
  });
  
  return parsed;
}

export default function GPAPlanner({ profile }: GPAPlannerProps) {
  const { user } = useFirebase();
  const [targetSgpa, setTargetSgpa] = useState<number>(9.0);
  const [courses, setCourses] = useState<PlannedCourse[]>([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredit, setNewCourseCredit] = useState(3);
  const [bulkText, setBulkText] = useState('');
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single');
  const [activePlan, setActivePlan] = useState<'conservative' | 'balanced' | 'ambitious'>('balanced');
  
  // AI Explanation State
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Get SRM grade letter from grade point
  const getGradeLetter = (gp: number, category?: SubjectCategory) => {
    if (gp >= 10) return 'S (Outstanding) • Min 90 Marks';
    if (gp >= 9) return 'A (Excellent) • Min 80 Marks';
    if (gp >= 8) return 'B (Very Good) • Min 70 Marks';
    if (gp >= 7) return 'C (Good) • Min 60 Marks';
    if (gp >= 6) return 'D (Average) • Min 50 Marks';
    if (gp >= 5) {
      if (category === 'Laboratory') {
        return 'F (Fail) • Min 50 Marks';
      }
      return 'E (Pass) • Min 40 Marks';
    }
    return 'F (Fail)';
  };

  // Planned subjects credit sum
  const totalCredits = courses.reduce((sum, c) => sum + c.credit, 0);

  // Deterministic Planner Algorithm
  const calculatePlan = (mode: 'conservative' | 'balanced' | 'ambitious'): GradePlan => {
    if (courses.length === 0) {
      return {
        grades: [],
        possible: true,
        averageGP: 0
      };
    }
    const targetPoints = targetSgpa * totalCredits;
    
    // 1. Initial pass: Give everyone minimum passing grade (6 points for Lab, 5 for others)
    const grades = courses.map((c) => ({
      courseName: c.name,
      gradePoint: c.category === 'Laboratory' ? 6 : 5,
      credit: c.credit,
      category: c.category
    }));

    let currentPoints = grades.reduce((sum, g) => sum + g.gradePoint * g.credit, 0);
    let pointsNeeded = targetPoints - currentPoints;

    if (pointsNeeded <= 0) {
      // Already met target with minimum passing grades
      return {
        grades: grades.map(g => ({ ...g, grade: getGradeLetter(g.gradePoint, g.category) })),
        possible: true,
        averageGP: parseFloat((currentPoints / totalCredits).toFixed(2))
      };
    }

    // Compute Subject Importance Score = credits * confidenceWeight
    // Strong = 1.0, Average = 0.7, Weak = 0.4
    const confidenceWeights = { strong: 1.0, average: 0.7, weak: 0.4 };
    const importanceScores = courses.map((c) => {
      return c.credit * confidenceWeights[c.confidence];
    });

    // 2. Distribute points one-by-one to courses based on mode priority
    let possible = true;
    while (pointsNeeded > 0) {
      let bestIndex = -1;
      let maxPriority = -Infinity;

      for (let i = 0; i < grades.length; i++) {
        if (grades[i].gradePoint >= 10) continue;

        let priority = 0;
        const g = grades[i].gradePoint;
        const m = grades[i].category === 'Laboratory' ? 6 : 5;
        const imp = importanceScores[i];

        if (mode === 'conservative') {
          // Prioritize higher importance scores first (Strong + High Credit)
          priority = imp * 10 - g * 0.01;
        } else if (mode === 'ambitious') {
          // Prioritize lower importance scores first (Ambitious targets on Weak + Low Credit)
          priority = (5.0 - imp) * 10 - g * 0.01;
        } else {
          // Balanced: spread grades relative to importance using remaining grade capacity ratio
          priority = imp - (g - m) / (10 - m);
        }

        if (priority > maxPriority) {
          maxPriority = priority;
          bestIndex = i;
        }
      }

      if (bestIndex === -1) {
        possible = false;
        break;
      }

      grades[bestIndex].gradePoint += 1;
      pointsNeeded -= grades[bestIndex].credit;
    }

    // Format output
    return {
      grades: grades.map(g => ({
        courseName: g.courseName,
        gradePoint: g.gradePoint,
        grade: getGradeLetter(g.gradePoint, g.category),
        credit: g.credit
      })),
      possible,
      averageGP: parseFloat((grades.reduce((sum, g) => sum + g.gradePoint * g.credit, 0) / totalCredits).toFixed(2))
    };
  };

  const currentPlanResult = calculatePlan(activePlan);

  // Difficulty & Feasibility scoring engine
  const calculateFeasibilityAndDifficulty = (plan: GradePlan) => {
    if (courses.length === 0 || !plan.possible) {
      return { score: 0, level: 'Unrealistic' as const };
    }

    const confidenceGPMapping = { strong: 9.5, average: 8.0, weak: 6.5 };
    let expectedPointsSum = 0;
    let totalCreditsSum = 0;

    courses.forEach((c) => {
      let baseExpected = confidenceGPMapping[c.confidence];
      if (profile.strengths.includes(c.category)) {
        baseExpected += 0.5;
      } else if (profile.weaknesses.includes(c.category)) {
        baseExpected -= 0.5;
      }
      const minGP = c.category === 'Laboratory' ? 6 : 5;
      baseExpected = Math.max(minGP, Math.min(10, baseExpected));
      
      expectedPointsSum += baseExpected * c.credit;
      totalCreditsSum += c.credit;
    });

    const expectedSGPA = totalCreditsSum > 0 ? expectedPointsSum / totalCreditsSum : 7.5;
    const diff = targetSgpa - expectedSGPA;
    let score = 90;

    if (diff > 0) {
      score = 90 - 70 * (diff / (10 - expectedSGPA));
    } else {
      score = 90 - diff * 10;
    }

    const historicalGP = profile.averageSGPA || profile.overallCGPA || 7.5;
    if (targetSgpa > historicalGP) {
      const historyDiff = targetSgpa - historicalGP;
      score -= historyDiff * 15;
    }

    const finalScore = Math.max(5, Math.min(99, Math.round(score)));

    let level: 'Easy' | 'Moderate' | 'Hard' | 'Unrealistic' = 'Moderate';
    if (finalScore >= 85) {
      level = 'Easy';
    } else if (finalScore >= 70) {
      level = 'Moderate';
    } else if (finalScore >= 45) {
      level = 'Hard';
    } else {
      level = 'Unrealistic';
    }

    return { score: finalScore, level };
  };

  const { score: feasibilityScore, level: difficultyLevel } = calculateFeasibilityAndDifficulty(currentPlanResult);

  const getFeasibilityExplanation = () => {
    const historicalGP = profile.averageSGPA || profile.overallCGPA || 7.5;
    if (!currentPlanResult.possible) {
      return `Target appears unrealistic. Even with maximum performance in your strongest subjects, the target is unlikely to be achieved because the maximum points achievable is lower than the target. Please lower your target or add more credits.`;
    }

    if (difficultyLevel === 'Unrealistic') {
      const weakCount = courses.filter(c => c.confidence === 'weak').length;
      return `Target appears unrealistic. Even with maximum performance in your strongest subjects, the target is unlikely to be achieved ${
        weakCount > 0 
          ? `because ${weakCount} of your subjects are marked as Weak` 
          : 'due to high grade requirements relative to your confidence level'
      } and requires a level of performance that significantly exceeds your historical average of ${historicalGP.toFixed(2)}.`;
    }

    if (difficultyLevel === 'Hard') {
      return `Based on your historical performance and confidence levels, this target is highly challenging and requires top performance in subjects where you are less confident.`;
    }

    if (difficultyLevel === 'Moderate') {
      return `Based on your historical performance and confidence levels, this target appears achievable with steady, focused effort.`;
    }

    return `Based on your historical performance and confidence levels, this target is highly realistic and well within reach.`;
  };

  const getDifficultyStyle = (diff: 'Easy' | 'Moderate' | 'Hard' | 'Unrealistic') => {
    switch (diff) {
      case 'Easy':
        return 'border-emerald-800/60 bg-emerald-950/20 text-emerald-400';
      case 'Moderate':
        return 'border-yellow-800/60 bg-yellow-950/20 text-yellow-400';
      case 'Hard':
        return 'border-orange-800/60 bg-orange-950/20 text-orange-400';
      case 'Unrealistic':
      default:
        return 'border-red-800/60 bg-red-950/20 text-red-400';
    }
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const detectedCategory = categorizeSubject(newCourseName);
    const newCourse: PlannedCourse = {
      id: Date.now().toString(),
      name: newCourseName,
      credit: newCourseCredit,
      category: detectedCategory,
      confidence: 'average'
    };

    setCourses([...courses, newCourse]);
    setNewCourseName('');
    setAiExplanation(null);
  };

  const handleRemoveCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    setAiExplanation(null);
  };

  // Call API for AI explanation
  const handleRequestAiExplanation = async () => {
    setAiLoading(true);
    setAiExplanation(null);

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'explain_gpa_plan',
          targetSGPA: targetSgpa,
          selfAssessment: courses.reduce((acc, c) => {
            acc[c.name] = c.confidence.charAt(0).toUpperCase() + c.confidence.slice(1);
            return acc;
          }, {} as Record<string, string>),
          academicDNA: {
            strengths: profile.strengths,
            weaknesses: profile.weaknesses,
            categoryAnalysis: profile.categoryAnalysis
          },
          recommendedPlan: currentPlanResult,
          planMode: activePlan,
          uid: user?.uid
        })
      });

      const data = await response.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation('Could not generate AI explanation. Please check your Gemini API key configurations.');
      }
    } catch (e) {
      setAiExplanation('Failed to reach AI Engine API endpoint. Please verify you are online.');
    } finally {
      setAiLoading(false);
    }
  };

  // Reset explanation when plan parameters change
  useEffect(() => {
    setAiExplanation(null);
  }, [targetSgpa, activePlan]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-white" />
          Smart GPA Planner
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Map target grades deterministically, then explain feasibility using your Academic DNA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Config Panel */}
        <div className="bg-[#090909] border border-border p-5 rounded-xl space-y-6">
          {/* Target SGPA Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-muted-foreground">TARGET SGPA</span>
              <span className="text-white font-semibold">{targetSgpa.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="5.00"
              max="10.00"
              step="0.05"
              value={targetSgpa}
              onChange={(e) => setTargetSgpa(parseFloat(e.target.value))}
              className="w-full h-1 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
              <span>5.0</span>
              <span>7.5</span>
              <span>10.0</span>
            </div>
          </div>

          {/* Plan Modes */}
          <div className="space-y-2.5">
            <span className="font-mono text-xs text-muted-foreground uppercase">Planner Mode</span>
            <div className="grid grid-cols-3 gap-2">
              {(['conservative', 'balanced', 'ambitious'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActivePlan(mode)}
                  className={`text-[10px] capitalize font-medium py-2 px-1 border rounded-lg transition-all ${
                    activePlan === mode
                      ? 'bg-white border-white text-black font-semibold'
                      : 'bg-black border-border text-muted-foreground hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {activePlan === 'conservative' && 'Conservative: Minimize risk (relies on Strong and high-credit subjects).'}
              {activePlan === 'balanced' && 'Balanced: Default recommendation (spreads targeted grades evenly relative to importance scores).'}
              {activePlan === 'ambitious' && 'Ambitious: Maximize SGPA potential (forces higher grade targets in weaker or low-credit subjects).'}
            </p>
          </div>

          {/* Add planned subjects */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-muted-foreground uppercase">Add Planned Subjects</span>
              <div className="flex gap-1.5 bg-black border border-border p-0.5 rounded-lg">
                <button
                  onClick={() => setInputMode('single')}
                  className={`text-[9px] font-semibold px-2 py-1 rounded-md transition-all cursor-pointer ${
                    inputMode === 'single' ? 'bg-[#111111] border border-border text-white' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setInputMode('bulk')}
                  className={`text-[9px] font-semibold px-2 py-1 rounded-md transition-all cursor-pointer ${
                    inputMode === 'bulk' ? 'bg-[#111111] border border-border text-white' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  Bulk Paste
                </button>
              </div>
            </div>

            {inputMode === 'single' ? (
              <form onSubmit={handleAddCourse} className="space-y-2">
                <input
                  type="text"
                  placeholder="Subject Name (e.g. French-II)"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full text-xs bg-black border border-border rounded-lg px-3 py-2 text-white placeholder-muted-foreground focus:outline-none focus:border-white transition-colors"
                />
                <div className="flex gap-2">
                  <select
                    value={newCourseCredit}
                    onChange={(e) => setNewCourseCredit(parseInt(e.target.value))}
                    className="flex-grow text-xs bg-black border border-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {[1, 2, 3, 4, 5].map(c => (
                      <option key={c} value={c}>{c} Credits</option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" className="bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold px-4 cursor-pointer">
                    Add
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <textarea
                  placeholder="Paste ERP lines here, e.g.:&#10;18CS301J Database Systems 4&#10;18LE101 English 2"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={4}
                  className="w-full text-xs bg-black border border-border rounded-lg p-3 text-white placeholder-muted-foreground focus:outline-none focus:border-white transition-colors font-mono resize-none"
                />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!bulkText.trim()) return;
                    const newCourses = parseBulkSubjects(bulkText);
                    if (newCourses.length > 0) {
                      setCourses([...courses, ...newCourses]);
                      setBulkText('');
                      setAiExplanation(null);
                    }
                  }}
                  disabled={!bulkText.trim()}
                  className="w-full bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold py-2 cursor-pointer disabled:opacity-50"
                >
                  Add Bulk Subjects
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Center Target Grades Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#090909] border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs text-muted-foreground uppercase">Target Distribution</span>
              <span className="font-mono text-xs text-white bg-neutral-900 border border-border px-2.5 py-0.5 rounded-md">
                Total Credits: {totalCredits}
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-lg text-xs text-muted-foreground space-y-2">
                <BookOpen className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="font-semibold text-white">No Subjects Added Yet</p>
                <p className="max-w-xs mx-auto text-muted-foreground">
                  Add the subjects you plan to take this semester using the form on the left to start mapping your target grades.
                </p>
              </div>
            ) : currentPlanResult.possible ? (
              <div className="space-y-4">
                {/* Feasibility & Difficulty Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-border/50">
                  <div className="bg-black border border-border/60 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider block font-semibold">Feasibility</span>
                      <span className="text-2xl font-bold text-white mt-1 block">{feasibilityScore}%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed font-sans">
                      {getFeasibilityExplanation()}
                    </p>
                  </div>
                  <div className="bg-black border border-border/60 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider block font-semibold">Difficulty</span>
                      <span className={`mt-1.5 inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wider font-mono uppercase ${getDifficultyStyle(difficultyLevel)}`}>
                        {difficultyLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed font-sans">
                      {difficultyLevel === 'Easy' && "Standard effort should be sufficient to reach this semester target."}
                      {difficultyLevel === 'Moderate' && "Consistent study and focused preparation will be needed."}
                      {difficultyLevel === 'Hard' && "Requires a rigorous study schedule and high performance across all courses."}
                      {difficultyLevel === 'Unrealistic' && "Mathematically impossible or requires an unprecedented level of grade improvement."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {currentPlanResult.grades.map((item, idx) => {
                    const courseCat = courses[idx]?.category || 'Other';
                    const isStrength = profile.strengths.includes(courseCat);
                    const isWeakness = profile.weaknesses.includes(courseCat);
                    let labelColor = 'text-muted-foreground';
                    if (isStrength) labelColor = 'text-white border-white bg-neutral-950';
                    if (isWeakness) labelColor = 'text-red-400 border-red-950 bg-red-950/10';
                    
                    return (
                      <div
                        key={idx}
                        className="bg-black border border-border p-3.5 rounded-lg flex justify-between items-center"
                      >
                        <div className="space-y-1 max-w-[70%]">
                          <div className="text-xs font-semibold text-white truncate">{item.courseName}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-muted-foreground">Credits: {item.credit}</span>
                            <span className={`font-mono text-[8px] border px-1.5 py-0.2 rounded-full uppercase ${labelColor}`}>
                              {courseCat}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0.5 bg-black border border-border p-0.5 rounded-lg">
                            {(['strong', 'average', 'weak'] as const).map((conf) => (
                              <button
                                key={conf}
                                onClick={() => {
                                  setCourses(courses.map(c => c.id === courses[idx].id ? { ...c, confidence: conf } : c));
                                  setAiExplanation(null);
                                }}
                                className={`text-[8px] capitalize font-semibold px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                                  courses[idx]?.confidence === conf
                                    ? conf === 'strong'
                                      ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-400'
                                      : conf === 'weak'
                                        ? 'bg-red-950/40 border border-red-800/50 text-red-400'
                                        : 'bg-neutral-900 border border-border text-white'
                                    : 'text-muted-foreground hover:text-white'
                                }`}
                              >
                                {conf}
                              </button>
                            ))}
                          </div>
                          <span className="font-mono text-xs text-white bg-neutral-900 border border-border px-3 py-1 rounded-md font-semibold">
                            {item.grade}
                          </span>
                          <button
                            onClick={() => handleRemoveCourse(courses[idx].id)}
                            className="text-muted-foreground hover:text-red-400 text-xs font-mono font-bold px-1.5 py-0.5"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-red-900/50 bg-red-950/5 rounded-lg text-xs text-red-400 space-y-2">
                <Info className="w-6 h-6 text-red-500 mx-auto" />
                <p className="font-semibold">Target SGPA Impossible</p>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  A target SGPA of {targetSgpa.toFixed(2)} exceeds the maximum points achievable with the currently registered courses. Decrease your target SGPA or add more credits.
                </p>
              </div>
            )}
          </div>

          {/* Bottom AI explanation card */}
          {currentPlanResult.possible && courses.length > 0 && (
            <div className="bg-[#090909] border border-border rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  AI Feasibility Audit
                </div>
                <Button
                  onClick={handleRequestAiExplanation}
                  disabled={aiLoading}
                  size="sm"
                  className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  {aiLoading ? 'Auditing Plan...' : 'Explain Plan with AI'}
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {aiExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-muted-foreground leading-relaxed bg-black border border-border/50 p-4 rounded-lg font-sans overflow-hidden"
                  >
                    {aiExplanation}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
