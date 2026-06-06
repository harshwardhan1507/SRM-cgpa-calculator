'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mail } from 'lucide-react';

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

export default function DeveloperSpotlight() {
  return (
    <div className="hidden md:block max-w-[1440px] mx-auto px-6 pt-16 pb-12 border-b border-[#1A1A1A]">
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
  );
}
