'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BaharLogo } from '../../components/BaharLogo';

export default function LoginPage() {
  const router = useRouter();
  const { user, isSupabaseConnected, signInWithPassword, signUp, signOut, signInGuest } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isAnonymous) {
      // If already signed in, go to today after 1s
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await signUp(email, password, displayName);
        if (res.success) {
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => router.push('/today'), 1000);
        } else {
          setErrorMsg(res.error || 'Failed to create account');
        }
      } else {
        const res = await signInWithPassword(email, password);
        if (res.success) {
          setSuccessMsg('Signed in successfully! Redirecting...');
          setTimeout(() => router.push('/today'), 1000);
        } else {
          setErrorMsg(res.error || 'Invalid email or password');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    signInGuest();
    setSuccessMsg('Welcome Guest Athlete! Redirecting to court...');
    setTimeout(() => router.push('/today'), 800);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-lg mx-auto flex flex-col justify-center text-slate-900 dark:text-slate-100">
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/today" className="inline-flex items-center gap-2 mb-4 group">
            <BaharLogo size={48} className="group-hover:scale-105 transition-transform" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {user ? 'Athlete Profile' : mode === 'signin' ? 'Sign In to Bahar' : 'Create Athlete Account'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
            Synchronize training streaks, buddy pairings, and custom training baselines.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-lime-500'}`} />
            <span>{isSupabaseConnected ? 'Supabase Cloud Sync Ready' : 'Local Offline Athlete Vault Active'}</span>
          </div>
        </div>

        {user ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-lg">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : '🏸'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {user.displayName || 'Athlete'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-lime-700 dark:text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-500/20">
                    {user.isAnonymous ? 'Guest Athlete' : 'Authenticated Member'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push('/today')}
                className="flex-1 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition-colors shadow-md shadow-lime-400/20"
              >
                Go to Today's Plan →
              </button>
              <button
                type="button"
                onClick={signOut}
                className="py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {errorMsg && (
              <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Athlete Name / Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="athlete@domain.com"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-3 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-lime-500 dark:focus:border-lime-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-semibold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition-all shadow-md shadow-lime-400/20 active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <span>{mode === 'signin' ? 'Sign In to Account' : 'Create Free Account'}</span>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                <span className="bg-white dark:bg-slate-900 px-2">Or instant offline access</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGuest}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>🏸 Continue as Local Guest Athlete</span>
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
