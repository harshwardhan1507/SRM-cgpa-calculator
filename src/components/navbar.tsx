'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirebase } from './firebase-provider';
import { 
  Home, 
  Calculator, 
  TrendingUp, 
  BookOpen, 
  User as UserIcon, 
  LogOut, 
  Settings,
  Flame,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loginWithGoogle, logout, profile } = useFirebase();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Connection listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
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

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Add Semester', href: '/semester/new' },
    { name: 'CGPA', href: '/cgpa' },
    { name: 'Predictor', href: '/predictor' },
    { name: 'Grading', href: '/grading' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const notificationFeed = [
    { id: 1, text: 'Academic database synced successfully.', time: 'Just now' },
    { id: 2, text: 'Offline PWA services initialized.', time: '10m ago' },
    { id: 3, text: 'SRM Grading Thresholds verified.', time: '1h ago' }
  ];

  return (
    <>
      {/* Desktop Navbar Header */}
      <header className="fixed top-0 w-full z-40 border-b border-[#1A1A1A] bg-black/80 backdrop-blur-md">
        <div className="flex justify-between items-center w-full px-6 py-3.5 max-w-[1440px] mx-auto">
          {/* Left Logo Group */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="bg-[#111111] border border-[#1A1A1A] w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white transition-colors group-hover:border-[#71717A]">
                SA
              </div>
              <span className="font-sans text-sm font-semibold tracking-tight text-white hidden sm:inline-block">
                SRM Academic Suite
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                      active ? 'text-white' : 'text-[#71717A] hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-[#111111] border border-[#1A1A1A] rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-4 relative">
            {/* Sync Indicator */}
            {isOnline ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[9px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                SYNCED
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[9px] text-amber-500 bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded-full">
                <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                OFFLINE
              </span>
            )}

            {/* Search Input trigger button */}
            <button 
              onClick={() => window.dispatchEvent(new Event('toggle-command-palette'))}
              className="hidden md:flex items-center gap-2 bg-[#090909] border border-[#1A1A1A] text-[#71717A] hover:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all hover:bg-neutral-900 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <span className="text-[8px] bg-black border border-[#1A1A1A] px-1 py-0.5 rounded text-muted-foreground">Ctrl+K</span>
            </button>

            {/* Mobile command trigger */}
            <button 
              onClick={() => window.dispatchEvent(new Event('toggle-command-palette'))}
              className="md:hidden text-[#71717A] hover:text-white transition-colors p-1"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Bell Icon */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="text-[#71717A] hover:text-white transition-colors p-1 hover:bg-[#111111] rounded-lg cursor-pointer"
              >
                <Bell className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2.5 w-64 bg-[#090909] border border-[#1A1A1A] rounded-xl shadow-xl py-3 z-50 overflow-hidden"
                  >
                    <div className="px-4 pb-2 border-b border-[#1A1A1A] flex justify-between items-center">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">Activities</span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    </div>
                    <div className="divide-y divide-[#1A1A1A]">
                      {notificationFeed.map(feed => (
                        <div key={feed.id} className="p-3 text-[11px] leading-normal text-neutral-300 hover:bg-[#111111] transition-colors">
                          <p>{feed.text}</p>
                          <span className="font-mono text-[9px] text-[#71717A] mt-1 block">{feed.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown Profile Menu */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-hover cursor-pointer"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-6 h-6 rounded-full border border-[#1A1A1A]"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#111111] border border-[#1A1A1A] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {profile?.name ? profile.name.substring(0, 2) : 'US'}
                    </div>
                  )}
                </button>
 
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-56 bg-[#090909] border border-[#1A1A1A] rounded-xl shadow-xl py-2 z-50 overflow-hidden"
                    >
                      {profile ? (
                        <div className="px-4 py-3 border-b border-[#1A1A1A] bg-black/30">
                          <p className="text-[10px] text-[#71717A] uppercase font-mono tracking-wider">Account Profile</p>
                          <p className="text-xs font-semibold truncate text-white mt-1 leading-none">{profile.name}</p>
                          <p className="text-[10px] text-[#71717A] truncate mt-1 leading-none uppercase">
                            {profile.program} {profile.branch.includes('Computer Science') ? 'CSE' : profile.branch}
                          </p>
                          <p className="text-[9px] text-[#71717A] font-mono mt-1 leading-none uppercase">Semester {profile.currentSemester}</p>
                        </div>
                      ) : (
                        <div className="px-4 py-2 border-b border-[#1A1A1A]">
                          <p className="text-xs text-[#71717A] uppercase font-mono tracking-wider">Account</p>
                          <p className="text-sm font-medium truncate text-white mt-0.5">{user.displayName || user.email}</p>
                        </div>
                      )}
                      
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-[#111111] transition-colors flex items-center gap-2 cursor-pointer mt-1"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#71717A]" />
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-[#111111] transition-colors flex items-center gap-2 cursor-pointer border-t border-[#1A1A1A] mt-1 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={loginWithGoogle}
                className="bg-transparent border border-[#1A1A1A] text-white hover:bg-[#111111] rounded-xl text-xs px-3.5 py-1.5 cursor-pointer"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setShowMobileDrawer(!showMobileDrawer)}
              className="md:hidden text-[#71717A] hover:text-white p-1"
            >
              {showMobileDrawer ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Side Drawer Navigation Menu */}
      <AnimatePresence>
        {showMobileDrawer && (
          <div className="fixed inset-0 z-30 md:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileDrawer(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Drawer body */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative w-64 bg-black border-l border-[#1A1A1A] h-full pt-20 px-6 z-10 flex flex-col justify-between pb-8"
            >
              <div className="space-y-6">
                <span className="font-mono text-[10px] text-[#71717A] uppercase tracking-widest border-b border-[#1A1A1A] pb-2 block">
                  Navigation
                </span>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMobileDrawer(false)}
                      className={`text-sm font-semibold tracking-wide transition-colors ${
                        isActive(item.href) ? 'text-white' : 'text-[#71717A] hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link
                    href="/profile"
                    onClick={() => setShowMobileDrawer(false)}
                    className={`text-sm font-semibold tracking-wide transition-colors ${
                      isActive('/profile') ? 'text-white' : 'text-[#71717A] hover:text-white'
                    }`}
                  >
                    Edit Profile
                  </Link>
                </nav>
              </div>

              {/* Drawer footer */}
              {user && (
                <div className="border-t border-[#1A1A1A] pt-4">
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileDrawer(false);
                    }}
                    className="w-full text-left py-2 text-sm text-red-400 hover:text-red-350 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Bar Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black border-t border-[#1A1A1A] z-45 flex justify-around py-3 px-4">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/') ? 'text-white' : 'text-[#71717A] hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="font-mono text-[8px] uppercase tracking-wider">Home</span>
        </Link>
        <Link
          href="/semester/new"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/semester/new') ? 'text-white' : 'text-[#71717A] hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span className="font-mono text-[8px] uppercase tracking-wider">GPA</span>
        </Link>
        <Link
          href="/cgpa"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/cgpa') ? 'text-white' : 'text-[#71717A] hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span className="font-mono text-[8px] uppercase tracking-wider">CGPA</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/profile') ? 'text-white' : 'text-[#71717A] hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span className="font-mono text-[8px] uppercase tracking-wider">Profile</span>
        </Link>
      </nav>

      {/* Mobile FAB: Floating Action Button */}
      <Link href="/semester/new" className="md:hidden fixed bottom-20 right-5 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white hover:bg-neutral-200 text-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-[#1A1A1A] cursor-pointer"
        >
          <Plus className="w-5 h-5 text-black stroke-[2.5px]" />
        </motion.button>
      </Link>
    </>
  );
}
