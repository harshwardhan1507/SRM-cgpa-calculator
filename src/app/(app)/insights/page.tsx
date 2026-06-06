'use client';

import { useFirebase } from '@/components/firebase-provider';
import { generateAcademicProfile } from '@/lib/academic-dna';
import AcademicDNA from '@/components/academic-dna';
import RiskAnalysis from '@/components/risk-analysis';
import { Button } from '@/components/ui/button';
import { Sparkles, BrainCircuit, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InsightsPage() {
  const { semesters, insights, refreshInsights, loading, user } = useFirebase();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dna' | 'risk'>('dna');

  if (loading) {
    return (
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow flex items-center justify-center font-mono text-xs text-muted-foreground animate-pulse"
      >
        Loading Academic Insights Engine...
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
          <BrainCircuit className="w-12 h-12 text-muted-foreground mx-auto animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No Semester Data Found</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Academic Insights Engine requires grades to calculate your profile. Add at least 1 completed semester to unlock local DNA, risk mappings, and GPA planning.
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

  const handleRefreshInsights = async () => {
    setRefreshing(true);
    try {
      await refreshInsights(profile);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex-grow pt-[90px] pb-24 max-w-[1440px] mx-auto px-4 sm:px-6 w-full space-y-8"
    >
      
      {/* Top Header Card */}
      <section className="bg-[#090909] border border-border p-6 sm:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
        <div className="space-y-2.5 max-w-xl">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-1 border border-border rounded-lg inline-block">
            AI Insights Engine v1.0
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none">
            Academic DNA & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Domain mappings, risk reports, and targets are computed locally and deterministically. Connect to Gemini 2.5 Flash on-demand for personalized academic coaching.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            onClick={handleRefreshInsights}
            disabled={refreshing}
            className="bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold px-5 h-10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {insights ? 'Re-Generate AI Insights' : 'Generate AI Insights'}
          </Button>
        </div>
      </section>

      {/* AI Recommendations Layer */}
      <AnimatePresence mode="wait">
        {insights && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Summary columns */}
            <div className="lg:col-span-2 bg-[#090909] border border-border p-6 rounded-xl space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  AI Domain Performance Summary
                </h3>
                <span className="font-mono text-[9px] text-muted-foreground uppercase">
                  Generated: {insights.generatedAt ? new Date(insights.generatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Strengths Explanation
                  </h4>
                  <p className="text-neutral-200">{insights.strengthSummary}</p>
                </div>
                <div>
                  <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Weaknesses & Challenges
                  </h4>
                  <p className="text-neutral-200">{insights.weaknessSummary}</p>
                </div>
                <div>
                  <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Future Forecasting & Projections
                  </h4>
                  <p className="text-neutral-200">{insights.futurePrediction}</p>
                </div>
              </div>
            </div>

            {/* Side focus areas list */}
            <div className="bg-[#090909] border border-border p-6 rounded-xl space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-border pb-3">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  Focus Areas & Guidance
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2.5">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider block">
                    Target Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {insights.focusAreas?.map((item: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-neutral-950 border border-border text-white px-2.5 py-1 rounded-md font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-border/40">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider block">
                    Study Recommendations
                  </span>
                  <ul className="space-y-2.5 text-xs text-muted-foreground leading-normal">
                    {insights.studyRecommendations?.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-white shrink-0 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Tab Navigation Menu */}
      <section className="space-y-6">
        <div className="border-b border-border flex gap-4 overflow-x-auto pb-px">
          {(['dna', 'risk'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono text-xs uppercase pb-3 border-b-2 font-medium transition-colors cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'border-white text-white font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-white'
              }`}
            >
              {tab === 'dna' && 'Academic DNA'}
              {tab === 'risk' && 'Risk Analysis'}
            </button>
          ))}
        </div>

        {/* Render Tab Contents */}
        <div className="bg-black">
          {activeTab === 'dna' && <AcademicDNA profile={profile} />}
          {activeTab === 'risk' && <RiskAnalysis profile={profile} />}
        </div>
      </section>

    </motion.main>
  );
}
