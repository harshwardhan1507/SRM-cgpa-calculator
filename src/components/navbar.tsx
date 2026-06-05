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
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loginWithGoogle, logout } = useFirebase();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Add Semester', href: '/semester/new', icon: Calculator },
    { name: 'CGPA & Analytics', href: '/cgpa', icon: Flame },
    { name: 'Grade Predictor', href: '/predictor', icon: TrendingUp },
    { name: 'About Grading', href: '/grading', icon: BookOpen },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation Top Bar */}
      <header className="fixed top-0 w-full z-50 border-b border-border-subtle bg-black">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-sans text-xl font-semibold text-primary tracking-tight">
              SRM Academic Suite
            </Link>
            <nav className="hidden md:flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-white pb-1 border-b-2 ${
                    isActive(item.href)
                      ? 'text-white border-white'
                      : 'text-text-muted border-transparent'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 relative">
            <button className="text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-hover">
              <Settings className="w-5 h-5" />
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-hover"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-6 h-6 rounded-full border border-border-strong"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-strong rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-border-subtle">
                      <p className="text-xs text-text-muted uppercase font-mono tracking-wider">Account</p>
                      <p className="text-sm font-medium truncate text-white">{user.displayName || user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-surface-hover transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-text-muted" />
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-hover transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={loginWithGoogle}
                className="bg-transparent border border-border-strong text-white hover:bg-surface-hover rounded-xl text-xs"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black border-t border-border-subtle z-50 flex justify-around py-3 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? 'text-white' : 'text-text-muted hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              <span className="font-mono text-[9px] uppercase tracking-wider">{item.name === 'CGPA & Analytics' ? 'CGPA' : item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
