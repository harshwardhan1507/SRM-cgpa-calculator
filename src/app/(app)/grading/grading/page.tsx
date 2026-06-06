'use client';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  BookOpen, 
  Award, 
  ArrowUpRight,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { officialRegulationsPdfUrl } from '@/lib/official-links';

export default function GradingPage() {
  const gradingScale = [
    { range: '90 — 100', grade: 'S', label: 'Outstanding', points: 10, bg: 'hover:bg-neutral-900/50' },
    { range: '80 — 89', grade: 'A', label: 'Excellent', points: 9, bg: 'hover:bg-neutral-900/50' },
    { range: '70 — 79', grade: 'B', label: 'Very Good', points: 8, bg: 'hover:bg-neutral-900/50' },
    { range: '60 — 69', grade: 'C', label: 'Good', points: 7, bg: 'hover:bg-neutral-900/50' },
    { range: '50 — 59', grade: 'D', label: 'Above Average', points: 6, bg: 'hover:bg-neutral-900/50' },
    { range: '40 — 49', grade: 'E', label: 'Average', points: 5, bg: 'hover:bg-neutral-900/50' },
    { range: '< 40', grade: 'F', label: 'Fail', points: 0, bg: 'hover:bg-red-950/10 text-red-400' },
    { range: 'Lack of Attendance', grade: 'Ab', label: 'Absent', points: 0, bg: 'hover:bg-red-950/20 text-red-500' },
  ];

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-[80px] pb-24 max-w-[1440px] mx-auto px-6 w-full flex flex-col gap-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden p-8 sm:p-12 border border-border bg-[#090909] rounded-2xl mt-8">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest block">
                Academic Regulations
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-white leading-none">
                Grading System <span className="text-muted-foreground">Overview</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                A comprehensive guide to the SRM Institute of Science and Technology evaluation framework, covering internal assessments, external examinations, and grade point calculations.
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-end gap-1.5 font-mono text-xs">
              <span className="text-white bg-neutral-950 px-3 py-1 border border-border rounded-lg">
                REV: 2024.1
              </span>
              <span className="text-muted-foreground">
                Last Updated Oct 2023
              </span>
              <a
                href={officialRegulationsPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1"
              >
                Official PDF
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* Evaluation Split */}
        <section id="erp-guide" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theory Courses */}
          <div className="bg-[#090909] border border-border p-6 rounded-xl hover:border-neutral-800 transition-all duration-300 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white">Theory Courses</h2>
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex gap-6 items-center h-24 mt-4">
              <div className="flex-1 h-full flex flex-col justify-end">
                <div className="bg-white h-[40%] w-full mb-2 rounded-sm"></div>
                <span className="font-mono text-[10px] text-muted-foreground">INTERNAL 40%</span>
              </div>
              <div className="flex-1 h-full flex flex-col justify-end">
                <div className="bg-neutral-800 border border-neutral-700 h-[60%] w-full mb-2 rounded-sm"></div>
                <span className="font-mono text-[10px] text-muted-foreground">EXTERNAL 60%</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Theory assessment involves continuous internal evaluation through Cycle Tests (CTs), assignments, and surprise tests, followed by a summative semester-end examination.
              </p>
            </div>
          </div>

          {/* Practical Courses */}
          <div className="bg-[#090909] border border-border p-6 rounded-xl hover:border-neutral-800 transition-all duration-300 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white">Practical / Labs</h2>
              <Award className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex gap-6 items-center h-24 mt-4">
              <div className="flex-1 h-full flex flex-col justify-end">
                <div className="bg-white h-[60%] w-full mb-2 rounded-sm"></div>
                <span className="font-mono text-[10px] text-muted-foreground">INTERNAL 60%</span>
              </div>
              <div className="flex-1 h-full flex flex-col justify-end">
                <div className="bg-neutral-800 border border-neutral-700 h-[40%] w-full mb-2 rounded-sm"></div>
                <span className="font-mono text-[10px] text-muted-foreground">EXTERNAL 40%</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Practical assessment prioritizes performance in the laboratory, records maintenance, and models, with a moderate weightage for the final practical exam.
              </p>
            </div>
          </div>
        </section>

        {/* Grade Point Table */}
        <section className="bg-[#090909] border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-neutral-900/50 flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">Grade Point Table</h3>
            <span className="font-mono text-xs text-muted-foreground">10-POINT SCALE</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="font-mono text-[11px] text-muted-foreground border-b border-border">
                  <th className="px-6 py-4 font-normal">RANGE OF MARKS</th>
                  <th className="px-6 py-4 font-normal">LETTER GRADE</th>
                  <th className="px-6 py-4 font-normal text-right">GRADE POINTS</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs sm:text-sm divide-y divide-border">
                {gradingScale.map((row, index) => (
                  <tr key={index} className={`transition-colors duration-150 ${row.bg}`}>
                    <td className="px-6 py-4 text-muted-foreground">{row.range}</td>
                    <td className="px-6 py-4 font-semibold text-white">{row.grade} ({row.label})</td>
                    <td className="px-6 py-4 text-right text-white font-bold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Relative vs Absolute */}
        <section id="faq">
          <div className="bg-[#090909] border border-border rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-white" />
                Relative vs Absolute Grading
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SRM Institute of Science and Technology follows a hybrid relative grading system. While the base criteria mapped above represents absolute performance thresholds, grade boundaries for specific batches or courses may shift slightly depending on the statistical metrics (mean and standard deviation) of the class performance.
              </p>
              <div className="flex gap-4 pt-2">
                <Link href="/sgpa">
                  <Button className="bg-white hover:bg-neutral-200 text-black px-4 py-2.5 rounded-xl text-xs font-semibold">
                    Calculate GPA
                  </Button>
                </Link>
                <a
                  href={officialRegulationsPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border border-border text-white hover:bg-neutral-900 px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  Official Regulations PDF
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            
            {/* Visualizer */}
            <div className="w-full md:w-64 aspect-video sm:aspect-square border border-border bg-black rounded-xl relative flex items-end justify-center p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
              <div className="w-full h-32 flex items-end gap-1.5">
                <div className="flex-1 bg-neutral-900 h-[20%] rounded-t-sm"></div>
                <div className="flex-1 bg-neutral-900 h-[40%] rounded-t-sm"></div>
                <div className="flex-1 bg-neutral-800 h-[65%] rounded-t-sm"></div>
                <div className="flex-1 bg-white h-[90%] rounded-t-sm"></div>
                <div className="flex-1 bg-neutral-800 h-[55%] rounded-t-sm"></div>
                <div className="flex-1 bg-neutral-900 h-[30%] rounded-t-sm"></div>
                <div className="flex-1 bg-neutral-900 h-[15%] rounded-t-sm"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
