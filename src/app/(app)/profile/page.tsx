'use client';

import React, { useState, useEffect } from 'react';
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
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow flex items-center justify-center font-sans"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">Loading user profile...</p>
        </div>
      </motion.main>
    );
  }

  if (!user) {
    return (
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex-grow flex items-center justify-center font-sans p-6"
      >
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-bold text-white">Sign In Required</h2>
          <p className="text-xs text-muted-foreground">Please sign in to access your academic profile.</p>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-xs py-3 mt-2 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign In with Google
          </Button>
          <Link href="/">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-white font-semibold rounded-xl text-xs py-3">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex-grow pt-[80px] pb-24 max-w-[800px] mx-auto px-4 sm:px-6 w-full flex flex-col gap-8"
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

      {/* Vertical Profile Preview Card */}
      <div className="bg-[#090909] border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4">
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={name || 'Student'} 
            className="w-20 h-20 rounded-full border border-border shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-neutral-900 border border-border flex items-center justify-center text-2xl font-bold text-white uppercase shadow-lg">
            {name ? name.substring(0, 2) : 'US'}
          </div>
        )}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white leading-none">{name || 'Student Name'}</h2>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">{regNum || 'Registration Number'}</p>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-mono border-t border-[#1A1A1A] pt-4 w-full max-w-[280px]">
          <span>Program: <strong className="text-white">{program}</strong></span>
          <span>Branch: <strong className="text-white">{branch.includes('Computer Science') ? 'CSE' : branch}</strong></span>
          <span>Semester: <strong className="text-white">Semester {semester}</strong></span>
        </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              size="xl"
              className="w-full flex items-center justify-center gap-2"
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
  );
}
