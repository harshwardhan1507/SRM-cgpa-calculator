'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Home, Calculator, TrendingUp, BookOpen, User, Flame, ArrowRight, Upload } from 'lucide-react';

interface CommandItem {
  name: string;
  category: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const COMMANDS: CommandItem[] = [
  { name: 'Dashboard Home', category: 'Navigation', route: '/', icon: Home, description: 'View your CGPA overview and semesters breakdown' },
  { name: 'Add Semester', category: 'Actions', route: '/semester/new', icon: PlusIcon, description: 'Enter term grades or upload copy-pasted tables' },
  { name: 'Upload ERP Result', category: 'Actions', route: '/semester/new?action=upload', icon: Upload, description: 'Directly upload and parse an ERP screenshot' },
  { name: 'CGPA & Analytics', category: 'Navigation', route: '/cgpa', icon: Flame, description: 'Simulate cumulative CGPA across multiple mock terms' },
  { name: 'Grade Predictor', category: 'Navigation', route: '/predictor', icon: TrendingUp, description: 'Predict future outcomes based on internal marks' },
  { name: 'Student Profile', category: 'Navigation', route: '/profile', icon: User, description: 'Update registration number and academic year' },
  { name: 'About Grading', category: 'Navigation', route: '/grading', icon: BookOpen, description: 'SRM academic grading guidelines and GPA conversion scale' }
];

function PlusIcon({ className }: { className?: string }) {
  return <Calculator className={className} />;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleCustomTrigger = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-command-palette', handleCustomTrigger);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-command-palette', handleCustomTrigger);
    };
  }, []);

  // Reset index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (route: string) => {
    router.push(route);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex].route);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        const container = scrollContainerRef.current;
        if (activeEl.offsetTop + activeEl.offsetHeight > container.scrollTop + container.clientHeight) {
          container.scrollTop = activeEl.offsetTop + activeEl.offsetHeight - container.clientHeight;
        } else if (activeEl.offsetTop < container.scrollTop) {
          container.scrollTop = activeEl.offsetTop;
        }
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm pointer-events-auto"
          />

          {/* Palette Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -15 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-[#090909] border border-[#1A1A1A] rounded-xl shadow-2xl z-10 overflow-hidden pointer-events-auto flex flex-col max-h-[450px]"
          >
            {/* Search Input area */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1A1A1A] bg-black/40">
              <Search className="w-4 h-4 text-[#71717A] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or navigate..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-white placeholder-[#71717A] outline-none border-none py-1"
              />
              <span className="text-[10px] font-mono text-[#71717A] bg-black border border-[#1A1A1A] px-1.5 py-0.5 rounded uppercase select-none">
                esc
              </span>
            </div>

            {/* List Results */}
            <div 
              ref={scrollContainerRef}
              className="flex-grow overflow-y-auto p-2 space-y-0.5 custom-scrollbar bg-black/10"
            >
              {filteredCommands.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground font-mono">
                  No commands or pages found matching "{query}"
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={cmd.name}
                      onClick={() => handleSelect(cmd.route)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-100 ${
                        isSelected 
                          ? 'bg-[#111111] border border-[#1A1A1A] text-white' 
                          : 'bg-transparent border border-transparent text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-md border ${
                          isSelected ? 'bg-black border-[#222222] text-white' : 'bg-neutral-950 border-[#1A1A1A] text-neutral-500'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold tracking-tight">{cmd.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[320px] font-mono mt-0.5">{cmd.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-[#71717A] bg-neutral-950 border border-[#1A1A1A] px-1.5 py-0.5 rounded">
                          {cmd.category}
                        </span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Command Palette Footer */}
            <div className="px-4 py-2 bg-[#090909] border-t border-[#1A1A1A] flex justify-between items-center text-[10px] font-mono text-[#71717A] select-none">
              <div className="flex gap-4">
                <span>↑↓ navigate</span>
                <span>enter select</span>
              </div>
              <div>
                <span>SRM Academic Suite</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
