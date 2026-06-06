'use client';

import { AcademicProfile } from '@/lib/academic-dna';
import { BrainCircuit, ShieldAlert, BookOpen, Award, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AcademicDNAProps {
  profile: AcademicProfile;
}

export default function AcademicDNA({ profile }: AcademicDNAProps) {
  const { strengths, moderates, weaknesses, categoryAnalysis } = profile;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-white" />
          Academic DNA
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Local, deterministic classification of subject categories based on your performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#090909] border border-border p-5 rounded-xl space-y-4"
        >
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-white" />
              Strengths (GP &ge; 9)
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {strengths.length} areas
            </span>
          </div>

          {strengths.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {strengths.map((cat) => (
                <div
                  key={cat}
                  className="text-xs bg-neutral-950 border border-border text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="font-medium">{cat}</span>
                  <span className="font-mono text-[9px] text-muted-foreground border-l border-border pl-1.5">
                    GP: {categoryAnalysis[cat]?.averageGP}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              No categories currently classified as strong areas (average GP &ge; 9.00). Keep adding data to see adjustments.
            </p>
          )}
        </motion.div>

        {/* Moderates Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#090909] border border-border p-5 rounded-xl space-y-4"
        >
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Moderate (GP 8-9)
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {moderates.length} areas
            </span>
          </div>

          {moderates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {moderates.map((cat) => (
                <div
                  key={cat}
                  className="text-xs bg-neutral-950 border border-border text-neutral-300 px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                  <span className="font-medium">{cat}</span>
                  <span className="font-mono text-[9px] text-muted-foreground border-l border-border pl-1.5">
                    GP: {categoryAnalysis[cat]?.averageGP}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              No categories currently classified as moderate (average GP between 8.00 and 9.00).
            </p>
          )}
        </motion.div>

        {/* Weaknesses Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#090909] border border-red-950/30 p-5 rounded-xl space-y-4"
        >
          <div className="flex justify-between items-center border-b border-border pb-3">
            <span className="font-mono text-xs text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Weaknesses (GP &lt; 8)
            </span>
            <span className="text-[10px] text-red-400 font-mono">
              {weaknesses.length} areas
            </span>
          </div>

          {weaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {weaknesses.map((cat) => (
                <div
                  key={cat}
                  className="text-xs bg-red-950/10 border border-red-950/30 text-red-400 px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="font-medium">{cat}</span>
                  <span className="font-mono text-[9px] text-red-900 border-l border-red-950/30 pl-1.5">
                    GP: {categoryAnalysis[cat]?.averageGP}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              No categories classified as weak (average GP &lt; 8.00). Excellent standing!
            </p>
          )}
        </motion.div>
      </div>

      {/* Category Grade Point Listing */}
      <div className="bg-[#090909] border border-border p-5 rounded-xl">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-4">
          Detailed Category Score Breakdown
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(categoryAnalysis).map(([cat, data], idx) => {
            const isStrength = strengths.includes(cat);
            const isWeakness = weaknesses.includes(cat);
            let barColor = 'bg-neutral-500';
            let borderColor = 'border-border';
            if (isStrength) {
              barColor = 'bg-white';
              borderColor = 'border-white/20';
            }
            if (isWeakness) {
              barColor = 'bg-red-500';
              borderColor = 'border-red-900/50';
            }

            return (
              <div
                key={cat}
                className={`bg-black border ${borderColor} p-4 rounded-lg flex flex-col justify-between h-28`}
              >
                <div>
                  <div className="text-xs font-semibold text-white truncate">{cat}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    Subjects: {data.subjectCount}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-[9px] text-muted-foreground">AVG GP</span>
                    <span className="text-sm font-bold text-white font-mono">{data.averageGP.toFixed(2)}</span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${data.averageGP * 10}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
