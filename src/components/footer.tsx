'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, Upload, Plus } from 'lucide-react';
import Logo from '@/components/logo';
import { useFirebase } from '@/components/firebase-provider';
import { officialRegulationsPdfUrl } from '@/lib/official-links';

const developer = {
  name: 'Harsh Wardhan',
  role: 'Full Stack Developer',
  email: 'harshwardhansingh1507@gmail.com',
  portfolio: 'https://harshwardhanportfolio.vercel.app',
  github: 'https://github.com/harshwardhan1507',
  linkedin: 'https://www.linkedin.com/in/harsh-wardhan-singh-cse/',
};

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.29 9.29 0 0 1 12 6.98c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.94 8.98H3.74v10.28h3.2V8.98ZM5.34 4a1.86 1.86 0 1 0 0 3.72 1.86 1.86 0 0 0 0-3.72Zm6.87 4.98H9.15v10.28h3.19v-5.39c0-1.42.27-2.8 2.03-2.8 1.73 0 1.75 1.62 1.75 2.89v5.3h3.2v-5.98c0-2.94-.63-5.2-4.07-5.2-1.65 0-2.76.91-3.22 1.77h-.04V8.98Z" />
    </svg>
  );
}

export default function Footer() {
  const { user } = useFirebase();
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-black text-[#FAFAFA] border-t border-[#1A1A1A] w-full mt-auto"
    >
      {/* Developer Spotlight */}
      <div className="max-w-[1440px] mx-auto px-6 pt-16 pb-12 border-b border-[#1A1A1A]">
        <div className="bg-[#090909] border border-border rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16">
            <div className="flex flex-col justify-between gap-10">
              <div className="space-y-5">
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                  Developer
                </div>
                <div className="space-y-3">
                  <a
                    href={developer.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white hover:text-zinc-300 transition-colors"
                  >
                    {developer.name}
                    <ArrowUpRight className="w-4 h-4 text-zinc-500 transition-colors group-hover:text-white" />
                  </a>
                  <div className="text-sm text-zinc-400 font-medium">
                    {developer.role}
                  </div>
                </div>
                <p className="text-sm sm:text-base text-zinc-500 leading-7 max-w-2xl">
                  Building modern web applications, developer tools, and academic platforms that solve real-world student problems.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <a
                  href={developer.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-neutral-200 text-black px-4 py-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  View Portfolio
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={developer.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black border border-border hover:border-zinc-600 text-zinc-300 hover:text-white px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  GitHub
                </a>
                <a
                  href={developer.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black border border-border hover:border-zinc-600 text-zinc-300 hover:text-white px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
                <a
                  href={`mailto:${developer.email}`}
                  className="bg-black border border-border hover:border-zinc-600 text-zinc-300 hover:text-white px-4 py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact
                </a>
              </div>
            </div>

            <div className="bg-black border border-border rounded-xl p-5 sm:p-6 space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                  Contact Information
                </div>
                <a
                  href={`mailto:${developer.email}`}
                  className="text-sm text-zinc-300 hover:text-white transition-colors break-all inline-flex"
                >
                  {developer.email}
                </a>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                  Links
                </div>
                <div className="space-y-3 text-xs">
                  <a
                    href={developer.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 text-zinc-500 hover:text-white transition-colors"
                  >
                    <span>Portfolio</span>
                    <span className="text-right break-all">{developer.portfolio}</span>
                  </a>
                  <a
                    href={developer.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 text-zinc-500 hover:text-white transition-colors"
                  >
                    <span>GitHub</span>
                    <span className="text-right break-all">{developer.github}</span>
                  </a>
                  <a
                    href={developer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 text-zinc-500 hover:text-white transition-colors"
                  >
                    <span>LinkedIn</span>
                    <span className="text-right break-all">{developer.linkedin}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call To Action Section */}
      <div className="max-w-[1440px] mx-auto px-6 pt-16 pb-12 border-b border-[#1A1A1A]">
        <div className="flex flex-col items-center text-center space-y-6 max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white font-sans">
            Ready to track your academic journey?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link href="/semester/new" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Semester
              </motion.button>
            </Link>
            <Link href="/semester/new?import=true" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full sm:w-auto bg-transparent border border-[#2A2A2A] hover:border-[#FAFAFA] text-zinc-400 hover:text-white px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload ERP Result
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main 4-Column Grid */}
      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Section 1: Brand */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo size="sm" />
              <span className="font-sans text-sm font-semibold tracking-tight text-white transition-colors group-hover:text-zinc-300">
                SRM Academic Suite
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[280px] font-sans">
              Academic performance toolkit built for SRM students. Track SGPA, CGPA, academic progress, and import ERP results effortlessly.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                Developed By
              </div>
              <a
                href={developer.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-white transition-colors font-medium font-sans inline-flex"
              >
                {developer.name}
              </a>
              <div className="flex gap-4 pt-1 text-zinc-600">
                <a 
                  href={developer.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors duration-200"
                  aria-label="Harsh Wardhan on GitHub"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a 
                  href={developer.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors duration-200"
                  aria-label="Harsh Wardhan on LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Section 2: Product */}
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
              Product
            </div>
            <ul className="space-y-2.5 font-sans">
              <li>
                <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/semester/new" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  SGPA Calculator
                </Link>
              </li>
              <li>
                <Link href="/cgpa" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  CGPA Calculator
                </Link>
              </li>
              <li>
                <Link href="/predictor" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  Grade Predictor
                </Link>
              </li>
              <li>
                <Link href="/semester/new" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  Add Semester
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Resources */}
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
              Resources
            </div>
            <ul className="space-y-2.5 font-sans">
              <li>
                <Link href="/grading" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  About Grading
                </Link>
              </li>
              <li>
                <a
                  href={officialRegulationsPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1"
                >
                  Official Regulations PDF
                  <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li>
                <Link href="/profile" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  Academic Profile
                </Link>
              </li>
              <li>
                <Link href="/grading#erp-guide" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  ERP Import Guide
                </Link>
              </li>
              <li>
                <Link href="/grading#faq" className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors duration-200 inline-flex items-center gap-1">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 4: Platform */}
          <div className="space-y-5">
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
              Platform Status
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-sans">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-zinc-200 animate-pulse' : 'bg-zinc-600'}`}></span>
                <span className="text-xs font-semibold text-white">
                  {isOnline ? 'Synced' : 'Offline Mode'}
                </span>
              </div>
              <ul className="space-y-2 font-mono text-[10px] text-zinc-600">
                <li className="flex justify-between border-b border-zinc-900 pb-1">
                  <span>PWA Support</span>
                  <span className="text-zinc-400">ENABLED</span>
                </li>
                <li className="flex justify-between border-b border-zinc-900 pb-1">
                  <span>Cloud DB</span>
                  <span className="text-zinc-400">{user ? 'CONNECTED' : 'LOCAL_ONLY'}</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span>Build Target</span>
                  <span className="text-zinc-400">PRODUCTION</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar Separator & Info */}
      <div className="border-t border-[#1A1A1A]">
        <div className="max-w-[1440px] mx-auto px-6 py-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 text-[10px] font-mono text-zinc-600">
          <div className="space-y-2">
            <div className="text-zinc-500">
              Designed and Developed by{' '}
              <a
                href={developer.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                {developer.name}
              </a>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a href={`mailto:${developer.email}`} className="hover:text-white transition-colors">
                {developer.email}
              </a>
              <a href={developer.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Portfolio
              </a>
              <a href={developer.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                GitHub
              </a>
              <a href={developer.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1 text-zinc-500">
            <span>&copy; 2026 SRM Academic Suite. Built for SRM students by {developer.name}.</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-600" />
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
