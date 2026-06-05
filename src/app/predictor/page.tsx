'use client';

import Navbar from '@/components/navbar';
import { useFirebase } from '@/components/firebase-provider';
import { calculateCGPA } from '@/lib/cgpa';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Calculator,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/animated-counter';

interface SimSemester {
  semesterNum: number;
  credits: number;
  projectedSgpa: number;
  isLocked?: boolean;
}

export default function PredictorPage() {
  const { semesters } = useFirebase();
  const { showToast } = useToast();
  const [targetCgpa, setTargetCgpa] = useState<number>(9.00);
  const [simSemesters, setSimSemesters] = useState<SimSemester[]>([]);

  // Local editable copy of completed semesters for simulation
  const [localCompletedSemesters, setLocalCompletedSemesters] = useState<any[]>([]);

  useEffect(() => {
    if (semesters) {
      setLocalCompletedSemesters(semesters);
    }
  }, [semesters]);

  // Calculate completed values from local simulation state
  const completedSemestersCount = localCompletedSemesters.length;
  const completedCredits = localCompletedSemesters.reduce((acc, s) => acc + (s.totalCredits || 0), 0);
  const completedPoints = localCompletedSemesters.reduce((acc, s) => acc + ((s.cgpa || 0) * (s.totalCredits || 0)), 0);
  const completedCgpa = completedCredits > 0 ? completedPoints / completedCredits : 0;

  // Initialize simulation with remaining semesters (up to 8)
  useEffect(() => {
    const nextSemStart = semesters.length + 1; // Base next semesters on actual saved count initially
    const initialSims: SimSemester[] = [];
    
    // Create default mock semesters for whatever is left from nextSemStart to 8
    for (let sem = nextSemStart; sem <= 8; sem++) {
      initialSims.push({
        semesterNum: sem,
        credits: 20, // default credits
        projectedSgpa: 8.50, // default projected SGPA
        isLocked: false
      });
    }
    
    setSimSemesters(initialSims);
  }, [semesters.length]);

  const handleUpdateCompletedSem = (semNum: number, field: 'totalCredits' | 'cgpa', value: number) => {
    setLocalCompletedSemesters(localCompletedSemesters.map(s => {
      if (s.semester === semNum) {
        return {
          ...s,
          [field]: value
        };
      }
      return s;
    }));
  };

  // Handle changes in simulator
  const handleUpdateSimSem = (semNum: number, field: 'credits' | 'projectedSgpa', value: number) => {
    setSimSemesters(simSemesters.map(s => {
      if (s.semesterNum === semNum) {
        return {
          ...s,
          [field]: value
        };
      }
      return s;
    }));
  };

  const handleToggleSimSemLock = (semNum: number) => {
    setSimSemesters(simSemesters.map(s => {
      if (s.semesterNum === semNum) {
        return {
          ...s,
          isLocked: !s.isLocked
        };
      }
      return s;
    }));
  };

  const handleAddSimSemester = () => {
    const nextSemNum = simSemesters.length > 0 
      ? Math.max(...simSemesters.map(s => s.semesterNum)) + 1 
      : completedSemestersCount + 1;

    if (nextSemNum > 8) {
      showToast('Maximum of 8 semesters can be simulated.', 'warning');
      return;
    }

    setSimSemesters([...simSemesters, {
      semesterNum: nextSemNum,
      credits: 20,
      projectedSgpa: 8.50,
      isLocked: false
    }]);
  };

  const handleDeleteSimSemester = (semNum: number) => {
    setSimSemesters(simSemesters.filter(s => s.semesterNum !== semNum));
  };

  // Calculations for predicting/feasibility
  const totalCreditsSim = simSemesters.reduce((acc, s) => acc + s.credits, 0);
  const totalPointsSim = simSemesters.reduce((acc, s) => acc + (s.projectedSgpa * s.credits), 0);
  
  const overallCredits = completedCredits + totalCreditsSim;
  const overallPoints = completedPoints + totalPointsSim;
  const projectedCumulativeCgpa = overallCredits > 0 ? overallPoints / overallCredits : 0;

  // Split into fixed (locked) and flexible (unlocked) simulated semesters
  const lockedSims = simSemesters.filter(s => s.isLocked);
  const unlockedSims = simSemesters.filter(s => !s.isLocked);

  const lockedCredits = lockedSims.reduce((acc, s) => acc + s.credits, 0);
  const lockedPoints = lockedSims.reduce((acc, s) => acc + (s.projectedSgpa * s.credits), 0);

  const unlockedCredits = unlockedSims.reduce((acc, s) => acc + s.credits, 0);

  // Total fixed targets (completed terms + locked simulated terms)
  const totalFixedPoints = completedPoints + lockedPoints;
  const totalFixedCredits = completedCredits + lockedCredits;

  // Required points to reach target CGPA
  const requiredTotalPoints = targetCgpa * overallCredits;
  const requiredPointsFromUnlocked = requiredTotalPoints - totalFixedPoints;
  const requiredAverageSgpa = unlockedCredits > 0 ? requiredPointsFromUnlocked / unlockedCredits : 0;

  // Feasibility status
  let feasibility: 'possible' | 'impossible' | 'achieved' = 'possible';
  if (unlockedCredits > 0) {
    if (requiredAverageSgpa > 10.00) {
      feasibility = 'impossible';
    } else if (requiredAverageSgpa <= 0) {
      feasibility = 'achieved';
    }
  } else {
    // If all simulated terms are locked, feasibility depends on if the total fixed cumulative is enough
    feasibility = projectedCumulativeCgpa >= targetCgpa ? 'achieved' : 'impossible';
  }

  // Bounds range of possibility
  const maxPossibleCgpa = overallCredits > 0 
    ? (completedPoints + (10.00 * totalCreditsSim)) / overallCredits 
    : 10.00;

  const minPossibleCgpa = overallCredits > 0 
    ? (completedPoints + (5.00 * totalCreditsSim)) / overallCredits 
    : 5.00;

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] flex flex-col font-sans">
      <Navbar />

      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow pt-[80px] pb-24 max-w-[1440px] mx-auto px-6 w-full flex flex-col gap-12"
      >
        {/* Hero & Target Input */}
        <section className="flex flex-col md:flex-row gap-8 items-start justify-between mt-8">
          <div className="flex flex-col gap-3 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-none">
              Grade Predictor
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Simulate future semester performances to understand what is required to reach your academic milestones.
            </p>
          </div>
          <div className="bg-[#090909] border border-border rounded-xl p-6 w-full md:w-96 flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Target CGPA</label>
              <span className="text-2xl font-bold text-white leading-none" id="target-display">
                {targetCgpa.toFixed(2)}
              </span>
            </div>
            <input 
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white" 
              id="target-slider" 
              max="10.00" 
              min="5.00" 
              step="0.05" 
              type="range" 
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(parseFloat(e.target.value))}
            />
            <div className="flex flex-col gap-1.5 font-mono text-[10px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Min: {minPossibleCgpa.toFixed(2)}</span>
                <span>Max: {maxPossibleCgpa.toFixed(2)}</span>
              </div>
              {targetCgpa > maxPossibleCgpa && (
                <span className="text-red-400 font-semibold text-center mt-1">⚠️ Unreachable! Max: {maxPossibleCgpa.toFixed(2)}</span>
              )}
              {targetCgpa < minPossibleCgpa && (
                <span className="text-green-400 font-semibold text-center mt-1">✓ Already achieved! Min: {minPossibleCgpa.toFixed(2)}</span>
              )}
            </div>
          </div>
        </section>

        {/* Summary Dashboard Bento */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Required Avg SGPA */}
          <div className="bg-[#090909] border border-border rounded-xl p-6 flex flex-col justify-between min-h-[160px] group hover:bg-neutral-900/50 transition-colors">
            <span className="font-mono text-xs text-muted-foreground uppercase">Required Avg. SGPA</span>
            <div>
              <div className="text-4xl font-bold text-white leading-none tracking-tight">
                {unlockedCredits > 0 ? (
                  <AnimatedCounter value={feasibility === 'achieved' ? 0 : requiredAverageSgpa} />
                ) : (
                  <span className="text-2xl text-muted-foreground font-semibold">ALL FIXED</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {unlockedCredits > 0 ? (
                  `across ${unlockedSims.length} flexible semester${unlockedSims.length > 1 ? 's' : ''}`
                ) : (
                  'all future semesters are fixed'
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Current CGPA */}
          <div className="bg-[#090909] border border-border rounded-xl p-6 flex flex-col justify-between min-h-[160px] group hover:bg-neutral-900/50 transition-colors">
            <span className="font-mono text-xs text-muted-foreground uppercase">Current CGPA</span>
            <div>
              <div className="text-4xl font-bold text-white leading-none tracking-tight">
                <AnimatedCounter value={completedCgpa} />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                after {completedSemestersCount} completed semesters ({completedCredits} credits)
              </div>
            </div>
          </div>

          {/* Card 3: Feasibility */}
          <div className="bg-[#090909] border border-border rounded-xl p-6 flex flex-col justify-between min-h-[160px] group hover:bg-neutral-900/50 transition-colors relative overflow-hidden">
            <span className="font-mono text-xs text-muted-foreground uppercase relative z-10">Feasibility</span>
            <div className="relative z-10">
              {feasibility === 'impossible' ? (
                <>
                  <div className="text-2xl font-bold text-red-400 flex items-center gap-2 leading-none">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Impossible
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Required SGPA exceeds 10.00 limit.</div>
                </>
              ) : feasibility === 'achieved' ? (
                <>
                  <div className="text-2xl font-bold text-green-400 flex items-center gap-2 leading-none">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Achieved
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Target already reached with current CGPA!</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-400 flex items-center gap-2 leading-none">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Possible
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Target is mathematically achievable.</div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Simulation Workspace */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Completed Semesters (Read-only list) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Completed Semesters
            </h3>
            
            {localCompletedSemesters.length === 0 ? (
              <div className="text-center py-12 border border-border border-dashed rounded-xl bg-black/40 text-xs text-muted-foreground">
                No semesters registered. Real completed data will sync from your home dashboard.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {localCompletedSemesters.map((sem) => (
                  <div 
                    key={sem.semester} 
                    className="bg-[#090909] border border-border rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-neutral-800"></div>
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-white">Semester {sem.semester} (Editable Past)</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[10px] text-muted-foreground uppercase">Credits</label>
                        <input 
                          type="number"
                          min="1"
                          value={sem.totalCredits}
                          onChange={(e) => handleUpdateCompletedSem(sem.semester, 'totalCredits', parseInt(e.target.value) || 0)}
                          className="bg-black border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-white transition-colors"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[10px] text-muted-foreground uppercase">SGPA</label>
                        <input 
                          type="number"
                          step="0.05"
                          min="0"
                          max="10"
                          value={sem.cgpa}
                          onChange={(e) => handleUpdateCompletedSem(sem.semester, 'cgpa', parseFloat(e.target.value) || 0)}
                          className="bg-black border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Simulation workspace */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                Simulated Future Semesters
              </h3>
              <button 
                onClick={handleAddSimSemester}
                className="text-xs font-medium text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Semester
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {simSemesters.map((sem) => (
                <div 
                  key={sem.semesterNum}
                  className={`bg-[#090909] border rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden transition-colors ${
                    sem.isLocked ? 'border-neutral-800' : 'border-border'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    sem.isLocked ? 'bg-neutral-600' : 'bg-white'
                  }`}></div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-white">Semester {sem.semesterNum} {sem.isLocked ? '(Fixed)' : '(Flexible)'}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSimSemLock(sem.semesterNum)}
                        className={`p-1 hover:bg-neutral-900 rounded-lg transition-all cursor-pointer`}
                        title={sem.isLocked ? 'Make SGPA Flexible' : 'Lock SGPA (Keep fixed in calculations)'}
                      >
                        {sem.isLocked ? (
                          <Lock className="w-4 h-4 text-white" />
                        ) : (
                          <Unlock className="w-4 h-4 text-muted-foreground hover:text-white" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleDeleteSimSemester(sem.semesterNum)}
                        className="text-muted-foreground hover:text-red-400 p-1 hover:bg-neutral-900 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] text-muted-foreground uppercase">Credits</label>
                      <input 
                        type="number"
                        min="1"
                        value={sem.credits}
                        onChange={(e) => handleUpdateSimSem(sem.semesterNum, 'credits', parseInt(e.target.value) || 0)}
                        className="bg-black border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[10px] text-muted-foreground uppercase">Projected SGPA</label>
                      <input 
                        type="number"
                        step="0.05"
                        min="0"
                        max="10"
                        value={sem.projectedSgpa}
                        onChange={(e) => handleUpdateSimSem(sem.semesterNum, 'projectedSgpa', parseFloat(e.target.value) || 0)}
                        className="bg-black border border-border text-white text-xs p-2.5 rounded-lg outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky/Fixed Calculation Bar */}
        <div className="bg-[#090909] border border-border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-neutral-900 p-2.5 rounded-xl border border-border">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-mono text-xs text-muted-foreground uppercase">Projected Cumulative CGPA</div>
              <div className="text-xs text-muted-foreground">Computed dynamically across all semesters</div>
            </div>
          </div>
          <div className="text-4xl font-bold text-white font-mono">
            <AnimatedCounter value={projectedCumulativeCgpa} />
          </div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-border bg-black mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 py-6 gap-4 max-w-[1440px] mx-auto">
          <div className="font-mono text-xs text-muted-foreground">
            © 2024 SRM Academic Suite. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a className="text-muted-foreground hover:text-white transition-colors font-mono text-xs" href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="text-muted-foreground hover:text-white transition-colors font-mono text-xs" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <span className="text-muted-foreground font-mono text-xs">Powered by Firebase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
