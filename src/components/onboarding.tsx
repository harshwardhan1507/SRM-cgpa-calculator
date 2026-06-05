'use client';

import React, { useState } from 'react';
import { useFirebase } from './firebase-provider';
import { Button } from './ui/button';
import { useToast } from './toast';
import { BookOpen, User, GraduationCap, Calendar, Compass, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const { updateProfile } = useFirebase();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [regNum, setRegNum] = useState('');
  const [program, setProgram] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('1');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        registrationNumber: regNum.trim().toUpperCase(),
        program,
        branch: branch.trim(),
        currentYear: parseInt(year),
        currentSemester: parseInt(semester)
      });
      showToast('Academic profile configured successfully!', 'success');
    } catch (err) {
      showToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black">
      {/* Dynamic matrix grid background effect */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg bg-[#090909] border border-[#1A1A1A] rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Aesthetic top ambient bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />

        <div className="text-center mb-8">
          <span className="font-mono text-[10px] tracking-widest text-[#71717A] uppercase border border-[#1A1A1A] px-2.5 py-1 rounded-md inline-block mb-3">
            Initial Setup
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Welcome to SRM Academic Suite
          </h2>
          <p className="text-xs text-[#71717A] mt-2">
            Set up your academic profile to enable auto-fill and personalized analytics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Program & Branch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Current Year & Current Semester */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.99] cursor-pointer mt-2"
          >
            {loading ? 'Configuring Profile...' : 'Continue'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
