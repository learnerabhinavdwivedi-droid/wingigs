'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SettingsModal } from '../components/SettingsModal';
import { ThemeToggle } from '../components/ThemeToggle';

export function Navigation() {
  const pathname = usePathname();
  const [showSettings, setShowSettings] = useState(false);

  // Hide global navigation on active outside workout screen and marketing landing page
  if (pathname === '/outside' || pathname === '/') {
    return null;
  }

  const primaryNavItems = [
    {
      href: '/today',
      label: 'Today',
      icon: (
        <svg width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      href: '/outside',
      label: 'Workout',
      icon: (
        <svg width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      href: '/progress',
      label: 'Progress',
      icon: (
        <svg width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      href: '/buddy',
      label: 'Buddy',
      icon: (
        <svg width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      href: '/spots',
      label: 'Spots',
      icon: (
        <svg width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const secondaryNavItems = [
    { href: '/week', label: 'Sunday Review' },
    { href: '/retest', label: '30-Day Retest' }
  ];

  return (
    <>
      {/* Top Header Bar - Responsive for all screens */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/today" className="flex items-center gap-2.5 group">
              <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-lime-500/20 group-hover:scale-105 transition-transform">
                🏸
              </span>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  Bahar<span className="text-lime-500 dark:text-lime-400">.</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:inline">
                  Resilient Training
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Visible on md and above) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 px-2 py-1.5 rounded-2xl">
            {primaryNavItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-slate-950' : 'text-slate-500 dark:text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="w-px h-5 bg-slate-300 dark:bg-slate-800 mx-1" />

            {secondaryNavItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-200 dark:bg-slate-800 text-lime-600 dark:text-lime-400 font-bold border border-slate-300 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Settings */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Action Pills on Mobile (< md) */}
            <div className="flex md:hidden items-center gap-1.5">
              <Link
                href="/week"
                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all border ${
                  pathname === '/week'
                    ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/50'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Review
              </Link>
              <Link
                href="/retest"
                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all border ${
                  pathname === '/retest'
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/50'
                    : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Retest
              </Link>
            </div>

            {/* Live Local Database & Offline Readiness Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300" title="100% Local IndexedDB Vault Active">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span>Offline Ready</span>
            </div>

            {/* Global Theme Toggle */}
            <ThemeToggle />

            {/* Settings Trigger Modal Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all flex items-center gap-1.5"
              title="Settings & Data Management"
              aria-label="Settings"
            >
              <span className="text-sm">⚙️</span>
              <span className="text-xs font-bold hidden lg:inline">Vault & Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Mobile Tab Bar (Visible on screens < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/80 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_25px_rgba(0,0,0,0.5)] pb-safe">
        <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
          {primaryNavItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'text-lime-600 dark:text-lime-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-lime-400/20 text-lime-600 dark:text-lime-400' : ''
                }`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Settings & Local Data Vault Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}
