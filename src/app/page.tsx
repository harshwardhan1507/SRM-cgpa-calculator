'use client';

import Navbar from '@/components/navbar';
import { useFirebase } from '@/components/firebase-provider';
import { calculateCGPA } from '@/lib/cgpa';
import { getGradeLetter } from '@/lib/grade-mapping';
import { Semester } from '@/types/semester';
import { Subject } from '@/types/subject';
import Link from 'next/link';
import { useState } from 'react';
import Onboarding from '@/components/onboarding';
import {
  Plus,
  ChevronRight,
  Calculator,
  TrendingUp,
  Info,
  Flame,
  Trash2,
  X,
  AlertTriangle,
  LayoutGrid,
  TrendingDown,
  BarChart3,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useToast } from '@/components/toast';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { semesters, setSemesters, user, profile, loading } = useFirebase();
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const { showToast } = useToast();

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Calculations
  const cgpaResult = calculateCGPA(semesters);
  const totalSemestersCount = semesters.length;
  const totalCredits = cgpaResult.totalCredits;
  const overallCgpa = cgpaResult.cgpa;

  // Show onboarding screen if user is signed in but has no profile
  if (!loading && user && !profile) {
    return <Onboarding />;
  }

  // Total points (weighted grade points)
  let totalPoints = 0;
  semesters.forEach(s => {
    totalPoints += s.totalPoints;
  });

  // Find best and lowest semesters
  const completedSgpas = semesters.map(s => s.cgpa);
  const bestSgpa = completedSgpas.length > 0 ? Math.max(...completedSgpas) : 0;
  const worstSgpa = completedSgpas.length > 0 ? Math.min(...completedSgpas) : 0;
  const bestSem = completedSgpas.length > 0 ? semesters.find(s => s.cgpa === bestSgpa)?.semester : null;
  const worstSem = completedSgpas.length > 0 ? semesters.find(s => s.cgpa === worstSgpa)?.semester : null;
  const backlogCourses: { course: Subject; semesterNum: number }[] = [];
  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      if (course.hasBack) {
        backlogCourses.push({ course, semesterNum: sem.semester });
      }
    });
  });

  // Recharts data format
  const chartData = semesters
    .slice()
    .sort((a, b) => a.semester - b.semester)
    .map(sem => ({
      name: `SEM ${sem.semester}`,
      SGPA: parseFloat(sem.cgpa.toFixed(2)),
    }));

  const handleOpenSemester = (semNum: number) => {
    const sem = semesters.find(s => s.semester === semNum);
    if (sem) {
      setSelectedSemester(sem);
    } else {
      // Direct navigation to create/new
      window.location.href = `/semester/new?sem=${semNum}`;
    }
  };

  const handleDeleteSemester = (semNum: number) => {
    triggerConfirm(
      'Delete Semester Data',
      `Are you sure you want to delete all data for Semester ${semNum}? This action cannot be undone.`,
      async () => {
        try {
          const updated = semesters.filter(s => s.semester !== semNum);
          await setSemesters(updated);
          setSelectedSemester(null);
          showToast(`Semester ${semNum} data deleted successfully.`, 'success');
        } catch (error) {
          showToast('Failed to delete semester data.', 'error');
        }
      }
    );
  };

  const handleDeleteSubject = (semNum: number, courseId: string) => {
    triggerConfirm(
      'Remove Subject',
      'Are you sure you want to remove this subject from the semester record?',
      async () => {
        const semIndex = semesters.findIndex(s => s.semester === semNum);
        if (semIndex !== -1) {
          try {
            const sem = semesters[semIndex];
            const subjectToDelete = sem.courses.find(c => c.id === courseId);
            const updatedCourses = sem.courses.filter(c => c.id !== courseId);

            // Recalculate SGPA
            let totalPoints = 0;
            let totalCredits = 0;
            updatedCourses.forEach(c => {
              if (!c.hasBack) {
                totalPoints += c.grade * c.credit;
                totalCredits += c.credit;
              }
            });

            const newSgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

            const updatedSemesters = [...semesters];
            updatedSemesters[semIndex] = {
              ...sem,
              courses: updatedCourses,
              cgpa: newSgpa,
              totalPoints,
              totalCredits
            };

            await setSemesters(updatedSemesters);

            // Update local modal view state
            setSelectedSemester(updatedSemesters[semIndex]);
            showToast(
              `Subject "${subjectToDelete?.name || 'Subject'}" removed.`,
              'info'
            );
          } catch (error) {
            showToast('Failed to remove subject.', 'error');
          }
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] flex flex-col font-sans">
      <Navbar />

      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow pt-[80px] pb-24 max-w-[1440px] mx-auto px-6 w-full"
      >
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-8">
          <div className="lg:col-span-7">
            {profile ? (
              <div className="bg-[#090909] border border-border p-8 rounded-2xl relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest px-3 py-1 border border-border rounded-lg inline-block">
                      Student Profile
                    </span>
                    <Link href="/profile">
                      <Button variant="ghost" className="h-7 hover:bg-neutral-900 text-muted-foreground hover:text-white border border-transparent hover:border-border rounded-lg text-[10px] px-2.5 cursor-pointer">
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight leading-none">{profile.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono mt-1.5 uppercase tracking-widest">{profile.registrationNumber}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-border mt-8">
                  <div>
                    <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Program & Branch</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {profile.program} {profile.branch.includes('Computer Science') ? 'CSE' : profile.branch}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Academic Year</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      Sem {profile.currentSemester} • Year {profile.currentYear}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center space-y-6 h-full">
                <div className="space-y-3">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest px-3 py-1 border border-border rounded-lg inline-block">
                    Academic Dashboard v2.0
                  </span>
                  <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
                    SRM Academic Suite
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">
                    Calculate. Predict. Track.
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-lg">
                  Academic performance toolkit built specifically for SRM students. A precision instrument for managing credits, predicting grades, and auditing degree progress with mathematical certainty.
                </p>
                <div className="flex gap-4 pt-2">
                  <Link href="/semester/new">
                    <Button className="bg-white hover:bg-neutral-200 text-black px-6 py-5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/grading">
                    <Button variant="outline" className="bg-transparent border border-border text-white hover:bg-neutral-900 px-6 py-5 rounded-xl text-sm font-medium">
                      Regulations
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Current CGPA Stats Card */}
          <div className="lg:col-span-5">
            <div className="bg-[#090909] border border-border p-8 rounded-2xl relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
              <div>
                <div className="font-mono text-xs text-muted-foreground tracking-wider mb-2">CURRENT CGPA</div>
                <div className="text-6xl font-bold text-white tracking-tighter">
                  {overallCgpa > 0 ? overallCgpa.toFixed(2) : '0.00'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border mt-8">
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase">Credits</div>
                  <div className="text-xl font-semibold text-white mt-1">{totalCredits}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase">Semesters</div>
                  <div className="text-xl font-semibold text-white mt-1">{totalSemestersCount}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase">Total Points</div>
                  <div className="text-xl font-semibold text-white mt-1">{totalPoints.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-white" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/semester/new" className="block">
              <motion.div 
                whileHover={{ y: -4, borderColor: '#FAFAFA' }}
                transition={{ duration: 0.2 }}
                className="bg-[#090909] border border-border p-6 rounded-xl hover:bg-neutral-900 transition-all duration-200 group h-full cursor-pointer"
              >
                <Calculator className="w-6 h-6 text-white mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">SGPA Calculator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Compute term-specific performance based on internal grades.</p>
              </motion.div>
            </Link>
            <Link href="/cgpa" className="block">
              <motion.div 
                whileHover={{ y: -4, borderColor: '#FAFAFA' }}
                transition={{ duration: 0.2 }}
                className="bg-[#090909] border border-border p-6 rounded-xl hover:bg-neutral-900 transition-all duration-200 group h-full cursor-pointer"
              >
                <Flame className="w-6 h-6 text-white mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">CGPA Calculator</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Aggregate multiple semesters to track your overall standing.</p>
              </motion.div>
            </Link>
            <Link href="/predictor" className="block">
              <motion.div 
                whileHover={{ y: -4, borderColor: '#FAFAFA' }}
                transition={{ duration: 0.2 }}
                className="bg-[#090909] border border-border p-6 rounded-xl hover:bg-neutral-900 transition-all duration-200 group h-full cursor-pointer"
              >
                <TrendingUp className="w-6 h-6 text-white mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">Grade Predictor</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Simulate final results based on expected marks.</p>
              </motion.div>
            </Link>
            <Link href="/grading" className="block">
              <motion.div 
                whileHover={{ y: -4, borderColor: '#FAFAFA' }}
                transition={{ duration: 0.2 }}
                className="bg-[#090909] border border-border p-6 rounded-xl hover:bg-neutral-900 transition-all duration-200 group h-full cursor-pointer"
              >
                <Info className="w-6 h-6 text-white mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">About Grading</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Official SRM grading system schemas and conversion tables.</p>
              </motion.div>
            </Link>
          </div>
        </section>

        {/* Semester History */}
        <section className="py-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-white" />
                Semester History
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Breakdown of performance across your academic timeline.</p>
            </div>
            <Link href="/semester/new">
              <Button size="sm" className="bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded-xl flex items-center gap-1 text-xs transition-all active:scale-95">
                <Plus className="w-4 h-4" />
                Add Semester
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {/* List Semesters 1 to 8 */}
            {Array.from({ length: 8 }).map((_, index) => {
              const semNum = index + 1;
              const sem = semesters.find(s => s.semester === semNum);
              const hasBacks = sem?.courses.some(c => c.hasBack);

              if (sem) {
                return (
                  <motion.div
                    key={semNum}
                    whileHover={{ y: -2, borderColor: '#FAFAFA' }}
                    transition={{ duration: 0.15 }}
                    onClick={() => handleOpenSemester(semNum)}
                    className={`bg-[#090909] border border-border p-5 rounded-xl flex items-center justify-between border-l-4 cursor-pointer hover:bg-neutral-900 transition-all duration-200 ${hasBacks ? 'border-l-red-500' : 'border-l-white'
                      }`}
                  >
                    <div className="flex gap-6 items-center">
                      <div className="bg-neutral-900 border border-border w-12 h-12 flex items-center justify-center rounded-lg">
                        <span className="font-mono text-sm font-semibold text-white">0{semNum}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white text-base">Semester {semNum}</h4>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase mt-0.5">
                          {sem.courses.length} courses {hasBacks && '• ⚠️ Backlog(s)'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="hidden sm:block text-right">
                        <div className="font-mono text-[10px] text-muted-foreground">CREDITS EARNED</div>
                        <div className="font-semibold text-white text-sm mt-0.5">{sem.totalCredits}</div>
                      </div>
                      <div className="bg-neutral-900 px-5 py-2 rounded-lg border border-border">
                        <div className="font-mono text-[10px] text-muted-foreground">SGPA</div>
                        <div className="font-semibold text-white text-base mt-0.5">{sem.cgpa.toFixed(2)}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                    </div>
                  </motion.div>
                );
              } else {
                return (
                  <motion.div
                    key={semNum}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => handleOpenSemester(semNum)}
                    className="bg-black border border-border border-dashed p-5 rounded-xl flex items-center justify-between cursor-pointer hover:bg-neutral-950 transition-all duration-200 opacity-60"
                  >
                    <div className="flex gap-6 items-center">
                      <div className="border border-border border-dashed w-12 h-12 flex items-center justify-center rounded-lg">
                        <span className="font-mono text-sm text-muted-foreground">0{semNum}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground text-base">Semester {semNum}</h4>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase mt-0.5">Empty</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-white">
                      Click to initialize
                      <Plus className="w-4 h-4" />
                    </div>
                  </motion.div>
                );
              }
            })}
          </div>
        </section>

        {/* Visualization & Recharts Analytics */}
        <section className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#090909] border border-border rounded-xl p-6 flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-white" />
                Trend Analysis
              </h3>
              <p className="text-xs text-muted-foreground">Visual progression of SGPA across semesters.</p>
            </div>

            <div className="h-48 w-full mt-6 flex items-center justify-center">
              {semesters.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
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
                  <TrendingDown className="w-8 h-8 opacity-20" />
                  No semester data available to visualize. Add a semester to see your academic trend line.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Progress & Insights Bento */}
          <div className="flex flex-col gap-6">
            {/* Target Progress Circle Card */}
            <div className="bg-[#090909] border border-border rounded-xl p-6 flex flex-col justify-center items-center text-center flex-grow">
              <div className="font-mono text-xs text-muted-foreground mb-4 uppercase tracking-wider">REMAINING TO 10.00</div>
              <div className="relative w-36 h-36">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-neutral-900" cx="72" cy="72" fill="transparent" r="62" stroke="currentColor" strokeWidth="8"></circle>
                  <circle
                    className="text-white transition-all duration-500"
                    cx="72"
                    cy="72"
                    fill="transparent"
                    r="62"
                    stroke="currentColor"
                    strokeDasharray={389.5}
                    strokeDashoffset={389.5 - (389.5 * (overallCgpa || 0)) / 10}
                    strokeWidth="8"
                    strokeLinecap="round"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white leading-none">
                    {overallCgpa > 0 ? ((overallCgpa / 10) * 100).toFixed(0) : '0'}%
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 font-mono">
                    {overallCgpa > 0 ? overallCgpa.toFixed(2) : '0.00'} / 10.00
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Insights Card */}
            {semesters.length > 0 && (
              <div className="bg-[#090909] border border-border rounded-xl p-6 flex flex-col justify-between min-h-[140px] text-left">
                <span className="font-mono text-xs text-muted-foreground uppercase mb-4">Academic Insights</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Best Semester</span>
                    <strong className="text-sm font-semibold text-white">
                      Sem {bestSem} ({bestSgpa.toFixed(2)})
                    </strong>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Lowest Semester</span>
                    <strong className="text-sm font-semibold text-white">
                      Sem {worstSem} ({worstSgpa.toFixed(2)})
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Backlogs Section */}
        {backlogCourses.length > 0 && (
          <section className="py-8 bg-[#090909] border border-border rounded-xl p-6 border-l-4 border-l-red-500 mt-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Active Backlogs ({backlogCourses.length})
            </h3>
            <p className="text-xs text-muted-foreground mb-4">You have backlog papers recorded. Based on academic rules, you can clear them in the semesters listed below.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {backlogCourses.map(({ course, semesterNum }) => {
                const clearSem = semesterNum + 2;
                return (
                  <div key={course.id} className="bg-black border border-border p-4 rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-white truncate max-w-[150px]">{course.name}</h4>
                      <span className="font-mono text-[9px] bg-red-950 border border-red-800 text-red-400 px-2 py-0.5 rounded-full">BACK</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Failed in: <strong className="text-white">Semester {semesterNum}</strong></p>
                      <p>Can clear in: <strong className="text-white">Semester {clearSem <= 8 ? clearSem : 'N/A (Exceeds 8)'}</strong></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-border bg-black mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 py-6 gap-4 max-w-[1440px] mx-auto">
          <div className="font-mono text-xs text-muted-foreground">
            © 2026 SRM Academic Suite. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a className="text-muted-foreground hover:text-white transition-colors font-mono text-xs" href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="text-muted-foreground hover:text-white transition-colors font-mono text-xs" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <span className="text-muted-foreground font-mono text-xs">Powered by Firebase</span>
          </div>
        </div>
      </footer>

      {/* Semester Detail Dialog Modal */}
      {selectedSemester && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#090909] border border-border-strong w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-neutral-900/50">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Semester {selectedSemester.semester} Overview
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedSemester.courses.length} subjects recorded for this term
                </p>
              </div>
              <button
                onClick={() => setSelectedSemester(null)}
                className="text-muted-foreground hover:text-white transition-colors p-1 hover:bg-neutral-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4 custom-scrollbar">
              {selectedSemester.courses.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No subjects added yet. Edit the semester to add subjects!
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSemester.courses.map((course) => {
                    const hasDetailedMarks = course.mst1 !== undefined || course.labInternal !== undefined;
                    return (
                      <div
                        key={course.id}
                        className={`p-4 border rounded-xl bg-black flex justify-between items-center ${course.hasBack ? 'border-red-900/50' : 'border-border'
                          }`}
                      >
                        <div className="space-y-1.5 max-w-[70%]">
                          <h4 className="font-semibold text-white text-sm leading-snug">{course.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono">
                            <span>Credits: <strong className="text-white">{course.credit}</strong></span>
                            <span>Total Marks: <strong className="text-white">{course.totalMarks.toFixed(1)}/100</strong></span>
                            {course.type === 'lab' && <span className="bg-neutral-900 px-2 py-0.5 rounded text-[10px]">LAB</span>}
                          </div>
                          {hasDetailedMarks && (
                            <div className="text-[10px] text-muted-foreground font-mono border-t border-neutral-900 pt-1.5 mt-1.5">
                              {course.type === 'theory' ? (
                                <span>
                                  mst1: {course.mst1}/30 • mst2: {course.mst2}/30 • Assg: {course.assignment}/10 • EndSem: {course.endsem}/100
                                </span>
                              ) : (
                                <span>
                                  Internal: {course.labInternal}/60 • External: {course.labExternal}/40
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className={`font-mono text-sm px-3 py-1 rounded-lg font-semibold border ${course.hasBack
                              ? 'bg-red-950 border-red-800 text-red-400'
                              : 'bg-neutral-900 border-border text-white'
                              }`}>
                              {getGradeLetter(course.grade, course.hasBack)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSubject(selectedSemester.semester, course.id)}
                            className="text-muted-foreground hover:text-red-400 p-1 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-neutral-900/20">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground uppercase font-mono">Semester SGPA:</span>
                <span className="text-2xl font-bold text-white">{selectedSemester.cgpa.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleDeleteSemester(selectedSemester.semester)}
                  className="flex-1 sm:flex-none border border-red-900/50 hover:bg-red-950/20 text-red-400 hover:text-red-300 text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer font-medium"
                >
                  Delete Semester
                </button>
                <Link
                  href={`/semester/new?sem=${selectedSemester.semester}`}
                  className="flex-1 sm:flex-none"
                >
                  <Button className="w-full bg-white hover:bg-neutral-200 text-black text-xs px-4 py-2.5 rounded-xl transition-all">
                    Edit Semester
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal overlay */}
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
