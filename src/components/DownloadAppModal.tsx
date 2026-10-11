'use client';

import React, { useState, useEffect } from 'react';
import { BaharLogo } from './BaharLogo';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });

  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    const nav = window.navigator as unknown as { standalone?: boolean };
    return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setTimeout(() => onClose(), 1500);
      }
      setDeferredPrompt(null);
    } else {
      // If browser doesn't have deferred prompt available
      alert('To install, open your browser menu (⋮ or Share) and select "Add to Home Screen" or "Install App".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BaharLogo size={42} />
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Download &amp; Install Bahar
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official Progressive Web App (PWA)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5">
          {/* Status banner */}
          {isStandalone || installed ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <strong className="block text-xs font-black">App Already Installed!</strong>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  You are running Bahar in standalone app mode with offline readiness active.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Features Pill Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                  <span className="text-lg block mb-1">⚡</span>
                  <span className="font-bold text-[11px] text-slate-900 dark:text-white block">Offline First</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">No cell service needed</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                  <span className="text-lg block mb-1">🎙️</span>
                  <span className="font-bold text-[11px] text-slate-900 dark:text-white block">Audio Coach</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Hands-free court cues</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                  <span className="text-lg block mb-1">🛡️</span>
                  <span className="font-bold text-[11px] text-slate-900 dark:text-white block">Zero Store Bloat</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Installs in &lt;1 second</span>
                </div>
              </div>

              {/* iOS Instructions */}
              {isIOS ? (
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🍎</span>
                    <strong className="text-xs font-black text-sky-900 dark:text-sky-300 uppercase tracking-wider">
                      iPhone &amp; iPad Install Steps:
                    </strong>
                  </div>
                  <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-decimal list-inside leading-relaxed pl-1">
                    <li>
                      In Safari, tap the <strong>Share</strong> button (box with an arrow pointing up <span className="font-mono text-sm">⎋</span>) at the bottom of your screen.
                    </li>
                    <li>
                      Scroll down the options list and tap <strong>&quot;Add to Home Screen&quot;</strong> (with the plus icon <span className="font-mono text-sm">⊕</span>).
                    </li>
                    <li>
                      Tap <strong>&quot;Add&quot;</strong> in the top-right corner. Bahar will appear directly on your home screen!
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android & Desktop 1-Click Install */
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-4 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm transition-all shadow-xl shadow-lime-400/25 active:scale-[0.99] flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Install Bahar to Device</span>
                  </button>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-bold text-slate-800 dark:text-slate-300">
                      Alternative Manual Installation:
                    </p>
                    <p>
                      Click the <strong>Install icon</strong> in your browser&apos;s address bar, or tap the three dots (<span className="font-mono">⋮</span>) menu and choose <strong>&quot;Install app&quot;</strong>.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">Bahar v0.1.0 • PWA Certified</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
