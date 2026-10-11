'use client';

import React, { useState, useEffect } from 'react';
import { BaharLogo } from './BaharLogo';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't show if user previously dismissed in this session
      if (!sessionStorage.getItem('bahar_pwa_dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not standalone, show after 3 seconds on first visit
    if (isIosDevice && !sessionStorage.getItem('bahar_pwa_dismissed')) {
      const timer = setTimeout(() => setShowBanner(true), 3500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('bahar_pwa_dismissed', 'true');
  };

  if (!showBanner || isStandalone) return null;

  return (
    <aside 
      aria-label="Install Bahar application"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-lg md:left-auto md:right-6 z-40 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-lime-400/30 backdrop-blur-md p-4 rounded-2xl shadow-xl dark:shadow-2xl shadow-slate-900/10 dark:shadow-black/80 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-3">
        <BaharLogo size={40} className="shrink-0" />
        <div>
          <div className="font-jersey text-sm text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
            <span>Install Bahar App</span>
            <span className="font-jersey text-[10px] bg-lime-500/10 dark:bg-lime-400/10 text-lime-600 dark:text-lime-400 px-1.5 py-0.2 rounded border border-lime-500/20 dark:border-lime-400/20">
              Offline Court Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
            {isIOS 
              ? 'Tap Share ⎋ then "Add to Home Screen" for instant court access.' 
              : 'Add to your device home screen for 1-tap instant launch.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-jersey px-3.5 py-2 rounded-xl text-xs transition-all shadow-md shadow-lime-400/20 active:scale-95"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}
