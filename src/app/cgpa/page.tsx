'use client';

import Navbar from '@/components/navbar';
import { useFirebase } from '@/components/firebase-provider';
import { calculateCGPA } from '@/lib/cgpa';
import { useState, useEffect } from 'react';
import { 
  Flame, 
  TrendingUp, 
  Target, 
  Download, 
  Plus, 
  Trash2,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useToast } from '@/components/toast';

interface MockSemester {
  id: string;
  semesterNum: number;
  sgpa: number;
  credits: number;
  isActive: boolean;
}

export default function CGPAPage() {
  const { semesters } = useFirebase();
  const { showToast } = useToast();
  const [mockSemesters, setMockSemesters] = useState<MockSemester[]>([]);
  const [newSgpa, setNewSgpa] = useState<string>('9.00');
  const [newCredits, setNewCredits] = useState<string>('20');

  // Load existing semesters into simulation initially
  useEffect(() => {
    if (semesters.length > 0) {
      const initialMock = semesters.map(s => ({
        id: `real-${s.semester}`,
        semesterNum: s.semester,
        sgpa: s.cgpa,
        credits: s.totalCredits,
        isActive: true,
      }));
      setMockSemesters(initialMock);
    }
  }, [semesters]);

  // Calculations on the simulated semesters
  const activeSimulated = mockSemesters.filter(s => s.isActive);
  let totalCreditsSim = 0;
  let totalPointsSim = 0;
  activeSimulated.forEach(s => {
    totalCreditsSim += s.credits;
    totalPointsSim += s.sgpa * s.credits;
  });
  const simulatedCgpa = totalCreditsSim > 0 ? totalPointsSim / totalCreditsSim : 0;

  // Real data calculations
  const realCgpaResult = calculateCGPA(semesters);
  const realCgpa = realCgpaResult.cgpa;
  const realCredits = realCgpaResult.totalCredits;

  // Class rank logic based on simulated CGPA
  const getRankPercentile = (val: number) => {
    if (val >= 9.8) return 'TOP 0.5%';
    if (val >= 9.5) return 'TOP 2%';
    if (val >= 9.0) return 'TOP 5%';
    if (val >= 8.5) return 'TOP 10%';
    if (val >= 7.5) return 'TOP 25%';
    return 'TOP 50%';
  };

  const handleAddMockSemester = () => {
    const sgpaVal = parseFloat(newSgpa);
    const creditsVal = parseFloat(newCredits);
    
    if (isNaN(sgpaVal) || sgpaVal < 0 || sgpaVal > 10 || isNaN(creditsVal) || creditsVal <= 0) {
      showToast('Please enter valid SGPA (0-10) and Credits.', 'error');
      return;
    }

    const nextSemNum = mockSemesters.length > 0 
      ? Math.max(...mockSemesters.map(s => s.semesterNum)) + 1 
      : 1;

    if (nextSemNum > 8) {
      showToast('You can simulate up to 8 semesters.', 'warning');
      return;
    }

    const newMock: MockSemester = {
      id: `mock-${Date.now()}`,
      semesterNum: nextSemNum,
      sgpa: sgpaVal,
      credits: creditsVal,
      isActive: true
    };

    setMockSemesters([...mockSemesters, newMock]);
    setNewSgpa('9.00');
    setNewCredits('20');
  };

  const handleDeleteMock = (id: string) => {
    setMockSemesters(mockSemesters.filter(s => s.id !== id));
  };

  const handleToggleMock = (id: string) => {
    setMockSemesters(mockSemesters.map(s => {
      if (s.id === id) {
        return { ...s, isActive: !s.isActive };
      }
      return s;
    }));
  };

  // Recharts data format for simulation
  const chartData = [...mockSemesters]
    .sort((a, b) => a.semesterNum - b.semesterNum)
    .map(s => ({
      name: `SEM ${s.semesterNum}`,
      SGPA: parseFloat(s.sgpa.toFixed(2)),
      Status: s.isActive ? 'Active' : 'Inactive'
    }));

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-[80px] pb-24 max-w-[1440px] mx-auto px-6 w-full">
        {/* Hero: Current CGPA */}
        <section className="py-12 flex flex-col md:flex-row justify-between items-end border-b border-border">
          <div className="space-y-4">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest block">
              Academic Overview & Simulation
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-none">
              Cumulative CGPA {simulatedCgpa > 0 ? simulatedCgpa.toFixed(2) : '0.00'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
              Simulated performance across {mockSemesters.length} semesters. Toggle semesters or add hypothetical future semesters to see how it affects your final graduation CGPA.
            </p>
          </div>
          <div className="mt-8 md:mt-0 flex gap-4 w-full md:w-auto">
            <div className="p-5 bg-[#090909] border border-border flex flex-col gap-1 min-w-[140px] rounded-xl flex-1 md:flex-none">
              <span className="font-mono text-[10px] text-muted-foreground uppercase">Credits</span>
              <span className="text-2xl font-bold text-white leading-tight">{totalCreditsSim}</span>
            </div>
            <div className="p-5 bg-[#090909] border border-border flex flex-col gap-1 min-w-[140px] rounded-xl flex-1 md:flex-none">
              <span className="font-mono text-[10px] text-muted-foreground uppercase">Estimated Rank</span>
              <span className="text-2xl font-bold text-white leading-tight">{getRankPercentile(simulatedCgpa)}</span>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-12">
          {/* Performance Trend Chart & Simulator */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Chart */}
            <div className="p-6 border border-border bg-[#090909] rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                  SGPA Progression
                </h2>
                <span className="font-mono text-xs text-muted-foreground uppercase">SIMULATION PATH</span>
              </div>
              
              <div className="h-56 w-full mt-4 flex items-center justify-center">
                {mockSemesters.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                      <CartesianGrid stroke="#1A1A1A" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717A" 
                        fontSize={11}
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#71717A" 
                        fontSize={11}
                        domain={[0, 10]}
                        tickLine={false} 
                        axisLine={false} 
                        ticks={[0, 2, 4, 6, 8, 10]}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#090909', borderColor: '#1A1A1A', color: '#FAFAFA', borderRadius: '8px' }}
                        labelStyle={{ color: '#71717A', fontSize: 11, fontWeight: 'bold' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="SGPA" 
                        stroke="#FAFAFA" 
                        strokeWidth={2}
                        activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#000000', strokeWidth: 2 }} 
                        dot={{ r: 4, fill: '#090909', stroke: '#FAFAFA', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                    No semesters in simulation. Add real semesters or mock semesters below.
                  </div>
                )}
              </div>
            </div>

            {/* Simulation Controls Panel */}
            <div className="bg-[#090909] border border-border p-6 rounded-2xl flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-white" />
                  Add Simulator Semester
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Input a hypothetical future semester SGPA and credit total.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-muted-foreground uppercase">Projected SGPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="10"
                    value={newSgpa}
                    onChange={(e) => setNewSgpa(e.target.value)}
                    className="bg-black border border-border text-white text-sm p-3 rounded-xl outline-none focus:border-white transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-muted-foreground uppercase">Credits</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    className="bg-black border border-border text-white text-sm p-3 rounded-xl outline-none focus:border-white transition-colors"
                  />
                </div>
                <Button 
                  onClick={handleAddMockSemester}
                  className="bg-white hover:bg-neutral-200 text-black p-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to simulation
                </Button>
              </div>
            </div>

            {/* Insights Bento Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-[#090909] border border-border group hover:border-neutral-800 transition-colors rounded-2xl">
                <Flame className="w-6 h-6 text-white mb-4" />
                <h3 className="text-base font-bold text-white mb-1.5">Simulation Gap</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your simulated CGPA is <strong className="text-white">{(simulatedCgpa - realCgpa).toFixed(2)}</strong> points {simulatedCgpa >= realCgpa ? 'above' : 'below'} your actual recorded CGPA ({realCgpa.toFixed(2)}).
                </p>
              </div>
              <div className="p-6 bg-[#090909] border border-border group hover:border-neutral-800 transition-colors rounded-2xl">
                <Target className="w-6 h-6 text-white mb-4" />
                <h3 className="text-base font-bold text-white mb-1.5">Simulation Target</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In this simulation, you have earned <strong className="text-white">{totalCreditsSim} credits</strong> with a grade point product of <strong className="text-white">{totalPointsSim.toFixed(1)}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Semester Simulation List */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-6 border border-border bg-[#090909] rounded-2xl">
              <h2 className="font-mono text-xs text-muted-foreground uppercase mb-6 tracking-wider">Simulation Breakdown</h2>
              
              {mockSemesters.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">
                  No semesters added. Add semesters in dashboard or use the simulator.
                </div>
              ) : (
                <ul className="space-y-3">
                  {mockSemesters.map((sem) => (
                    <li 
                      key={sem.id} 
                      className={`flex justify-between items-center p-4 border rounded-xl bg-black hover:bg-neutral-900 transition-all ${
                        sem.isActive ? 'border-border' : 'border-neutral-900 opacity-40'
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <button 
                          onClick={() => handleToggleMock(sem.id)}
                          className="text-muted-foreground hover:text-white transition-colors"
                        >
                          {sem.isActive ? (
                            <ToggleRight className="w-6 h-6 text-white" />
                          ) : (
                            <ToggleLeft className="w-6 h-6" />
                          )}
                        </button>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white leading-tight">Semester {sem.semesterNum}</span>
                          <span className="font-mono text-[9px] text-muted-foreground mt-0.5">{sem.credits} CREDITS {sem.id.startsWith('mock-') && '• MOCK'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-base font-bold text-white">{sem.sgpa.toFixed(2)}</span>
                        {sem.id.startsWith('mock-') && (
                          <button 
                            onClick={() => handleDeleteMock(sem.id)}
                            className="text-muted-foreground hover:text-red-400 p-1 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <Button 
                variant="outline"
                className="w-full mt-6 py-5 bg-transparent border border-border text-white hover:bg-neutral-900 text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => showToast('Transcript download features are offline. Sync your cloud account to request official transcripts.', 'info')}
              >
                <Download className="w-4 h-4" />
                Download Transcript
              </Button>
            </div>

            {/* Graphic card placeholder */}
            <div className="relative h-[200px] border border-border overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-neutral-900 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                <span className="font-mono text-[9px] text-white bg-black/80 px-2 py-0.5 border border-border rounded-lg max-w-max">
                  STATUS: SIMULATION_ACTIVE
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-black">
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
