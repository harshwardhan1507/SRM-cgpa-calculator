'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import { useFirebase } from '@/components/firebase-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast';
import { User, GraduationCap, Compass, Calendar, BookOpen, Hash, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { profile, updateProfile, loading, user } = useFirebase();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [program, setProgram] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1');
  const [saveLoading, setSaveLoading] = useState(false);

  // Sync state with profile once loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRegNum(profile.registrationNumber);
      setProgram(profile.program);
      setBranch(profile.branch);
      setYear(profile.currentYear.toString());
      setSemester(profile.currentSemester.toString());
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your name.', 'warning');
      return;
    }
    if (!regNum.trim()) {
      showToast('Please enter your registration number.', 'warning');
      return;
    }

    setSaveLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        registrationNumber: regNum.trim().toUpperCase(),
        program,
        branch: branch.trim(),
        currentYear: parseInt(year),
        currentSemester: parseInt(semester)
      });
      showToast('Academic profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-[#FAFAFA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-[#FAFAFA] flex items-center justify-center font-sans p-6">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-muted-foreground">Please return to the dashboard to authenticate your session.</p>
          <Link href="/">
            <Button className="w-full bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-xs py-3 mt-2">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FAFAFA] flex flex-col font-sans">
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow pt-[80px] pb-24 max-w-[800px] mx-auto px-6 w-full flex flex-col gap-8"
      >
        {/* Navigation back link */}
        <div className="pt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            Academic Profile
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your enrollment information, registration credentials, and semester status.
          </p>
        </div>

        {/* Profile Card Form */}
        <div className="bg-[#090909] border border-[#1A1A1A] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#71717A] to-transparent opacity-30" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#71717A]" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Harsh Wardhan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#3F3F46] focus:border-white outline-none transition-colors"
                />
              </div>

              {/* Registration Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#71717A]" /> Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. RA2411026010XXX"
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  className="w-full bg-black border border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#3F3F46] focus:border-white outline-none transition-colors uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Program */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#71717A]" /> Program
                </label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full bg-black border border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm text-white focus:border-white outline-none transition-colors"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>

              {/* Branch */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#71717A]" /> Branch
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-black border border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#3F3F46] focus:border-white outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Current Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#71717A]" /> Current Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-black border border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm text-white focus:border-white outline-none transition-colors"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              {/* Current Semester */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#71717A]" /> Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-black border border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm text-white focus:border-white outline-none transition-colors"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={saveLoading}
                className="bg-white hover:bg-neutral-200 text-black font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer text-xs"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Academic Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-border bg-black mt-auto">
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
    </div>
  );
}
