'use client';

import { ShieldAlert, Sparkles, TrendingUp, Info } from 'lucide-react';
import { AcademicProfile } from '@/lib/academic-dna';
import { motion } from 'framer-motion';

interface RiskAnalysisProps {
  profile: AcademicProfile;
}

export default function RiskAnalysis({ profile }: RiskAnalysisProps) {
  const { riskReport, confidence } = profile;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Semester Risk & Opportunity Analysis
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deterministic mapping of performance boundaries based on your historical records.
          </p>
        </div>
        <div className="font-mono text-[10px] bg-neutral-900 border border-border px-3 py-1 rounded-lg text-muted-foreground flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Confidence: <span className="text-white capitalize">{confidence}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* High Risk Card */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#090909] border border-red-950/30 p-5 rounded-xl flex flex-col justify-between"
        >
          <div>
            <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              High Risk Areas
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Domains with average GP &lt; 8.00 or active backlogs. Focus on these to avoid lowering your CGPA.
            </p>

            {riskReport.highRisk.length > 0 ? (
              <ul className="space-y-2.5">
                {riskReport.highRisk.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-neutral-200 bg-red-950/10 border border-red-950/30 px-3.5 py-2.5 rounded-lg flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span className="font-medium truncate">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 border border-dashed border-neutral-900 rounded-lg text-xs text-muted-foreground">
                No high risk domains detected. Keep up the great work!
              </div>
            )}
          </div>
        </motion.div>

        {/* High Opportunity Card */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#090909] border border-border p-5 rounded-xl flex flex-col justify-between"
        >
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              High Opportunity Areas
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Your academic strong suits (GP &ge; 9.00). Maximize registrations or aim for high grades here.
            </p>

            {riskReport.highOpportunity.length > 0 ? (
              <ul className="space-y-2.5">
                {riskReport.highOpportunity.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-neutral-200 bg-neutral-950 border border-border px-3.5 py-2.5 rounded-lg flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    <span className="font-medium truncate">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 border border-dashed border-neutral-900 rounded-lg text-xs text-muted-foreground">
                No high opportunity domains calculated yet. Load more grades to build your DNA.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
