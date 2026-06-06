'use client';

import { useFirebase } from '@/components/firebase-provider';
import { generateAcademicProfile } from '@/lib/academic-dna';
import { Button } from '@/components/ui/button';
import { Sparkles, BrainCircuit, ShieldAlert, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function InsightsCard() {
  const { semesters } = useFirebase();

  // If no semester data exists, display a call to action
  if (!semesters || semesters.length === 0) {
    return (
      <div className="bg-[#090909] border border-border p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px] text-left">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
        <div>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            AI Academic Insights
          </span>
          <h4 className="text-sm font-semibold text-white mt-3">Ready to Analyze Your Profile?</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Add your first semester to unlock Academic DNA, Category Analysis, and Risk Analysis tracking.
          </p>
        </div>
        <div className="mt-4">
          <Link href="/sgpa">
            <Button variant="ghost" size="sm" className="h-8 hover:bg-neutral-900 border border-border text-xs px-3 rounded-xl cursor-pointer">
              Initialize first semester
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate the academic profile locally (deterministic)
  const profile = generateAcademicProfile(semesters);

  // Determine top strength and primary weakness
  const topStrength = profile.strengths.length > 0 ? profile.strengths[0] : 'None';
  const primaryWeakness = profile.weaknesses.length > 0 ? profile.weaknesses[0] : 'None';

  // Get confidence color
  const getConfidenceBadge = (conf: 'low' | 'medium' | 'high') => {
    switch (conf) {
      case 'high':
        return 'border-green-800 text-green-400 bg-green-950/20';
      case 'medium':
        return 'border-yellow-800 text-yellow-400 bg-yellow-950/20';
      case 'low':
      default:
        return 'border-neutral-800 text-muted-foreground bg-neutral-950';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#090909] border border-border p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-full min-h-[140px] text-left"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Academic DNA Preview
          </span>
          <span className={`font-mono text-[9px] uppercase px-2 py-0.5 border rounded-full font-semibold ${getConfidenceBadge(profile.confidence)}`}>
            Conf: {profile.confidence}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 text-white" />
              Strongest Area
            </div>
            <div className="text-sm font-semibold text-white mt-1 truncate">
              {topStrength}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-500" />
              Needs Improvement
            </div>
            <div className="text-sm font-semibold text-white mt-1 truncate">
              {primaryWeakness}
            </div>
          </div>
        </div>


      </div>

      <div className="mt-6">
        <Link href="/insights">
          <Button size="sm" className="w-full bg-white hover:bg-neutral-200 text-black rounded-xl font-medium text-xs py-2 flex items-center justify-center gap-1 cursor-pointer">
            View Full Analysis
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
