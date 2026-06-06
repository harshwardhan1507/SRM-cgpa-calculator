'use client';

import { useFirebase } from '@/components/firebase-provider';
import { generateAcademicProfile } from '@/lib/academic-dna';
import GPAPlanner from '@/components/gpa-planner';
import AICoach from '@/components/ai-coach';
import { Button } from '@/components/ui/button';
import { Calculator, BrainCircuit, Sparkles, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PlannerPage() {
  const { semesters, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState<'planner' | 'coach'>('planner');

  if (loading) {
    return (
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow flex items-center justify-center font-mono text-xs text-muted-foreground animate-pulse"
      >
        Loading Smart GPA Planner...
      </motion.main>
    );
  }

  // If no semesters exist
  if (!semesters || semesters.length === 0) {
    return (
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow pt-[100px] pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 w-full flex flex-col justify-center items-center text-center"
      >
        <div className="max-w-md space-y-6 border border-border p-8 rounded-2xl bg-[#090909]">
          <Calculator className="w-12 h-12 text-muted-foreground mx-auto animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No Semester Data Found</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Smart GPA Planner requires your academic history to generate personalized grade targets. Add at least 1 completed semester to unlock planning and AI coaching.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = '/sgpa'; }}
            className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-6 py-2.5 rounded-xl cursor-pointer"
          >
            Add Semester Data
          </Button>
        </div>
      </motion.main>
    );
  }

  // Generate local deterministic academic profile
  const profile = generateAcademicProfile(semesters);

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex-grow pt-[90px] pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 w-full space-y-8"
    >
      {/* Top Header */}
      <section className="bg-[#090909] border border-border p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
        <div className="space-y-2.5 max-w-2xl">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-1 border border-border rounded-lg inline-block">
            Smart GPA Planner v1.0
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
            Smart GPA Planner
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Map target grades deterministically, then explain feasibility using your Academic DNA. Chat with AI Coach for personalized academic guidance.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="space-y-6">
        <div className="border-b border-border flex gap-4 overflow-x-auto pb-px">
          {([
            { key: 'planner' as const, label: 'GPA Planner', icon: Calculator },
            { key: 'coach' as const, label: 'Ask AI Coach', icon: MessageSquare },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`font-mono text-xs uppercase pb-3 border-b-2 font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                activeTab === key
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-black">
          {activeTab === 'planner' && <GPAPlanner profile={profile} />}
          {activeTab === 'coach' && <AICoach profile={profile} />}
        </div>
      </section>
    </motion.main>
  );
}
