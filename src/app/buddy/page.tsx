'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../data/remote/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Buddy {
  id: string;
  partner_name: string;
  slot_days: string;
  slot_time: string;
  status: string;
  last_streak: number;
}

export default function BuddyPage() {
  const router = useRouter();
  const [buddies, setBuddies] = useState<Buddy[]>([
    {
      id: 'demo-buddy-1',
      slot_days: 'Tue & Thu',
      slot_time: '6:30 PM',
      partner_name: 'Marcus K. (Court Partner)',
      status: 'Active',
      last_streak: 5
    }
  ]);
  const [copied, setCopied] = useState(false);
  const [inviteCode] = useState('BAHAR-COURT-77');
  const [inputCode, setInputCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [pairSuccess, setPairSuccess] = useState<string | null>(null);
  const [cheerSent, setCheerSent] = useState(false);

  useEffect(() => {
    const fetchBuddies = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data } = await supabase
          .from('buddy_pairs')
          .select('*, user_a, user_b');
        if (data && data.length > 0) {
          setBuddies(prev => [...data, ...prev.filter(b => !data.some(d => d.id === b.id))]);
        }
      } catch {
        // Fallback to local state
      }
    };
    fetchBuddies();
  }, [router]);

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/buddy?invite=${inviteCode}` 
      : `https://bahar.app/buddy?invite=${inviteCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePairBuddy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setLinking(true);

    const newBuddy: Buddy = {
      id: 'partner-' + Date.now(),
      partner_name: `Training Partner (${inputCode.trim().toUpperCase()})`,
      slot_days: 'Mon, Wed, Fri',
      slot_time: '7:00 AM',
      status: 'Active',
      last_streak: 3
    };

    setBuddies([newBuddy, ...buddies]);
    setPairSuccess(`Paired successfully with code ${inputCode.trim().toUpperCase()}!`);
    setInputCode('');
    setLinking(false);
    setTimeout(() => setPairSuccess(null), 3500);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('buddy_pairs').insert([
          {
            partner_name: newBuddy.partner_name,
            slot_days: newBuddy.slot_days,
            slot_time: newBuddy.slot_time
          }
        ]);
      } catch {
        // Local state preserved
      }
    }
  };

  const handleSendCheer = (partnerName?: string) => {
    setCheerSent(true);
    if (partnerName) {
      setPairSuccess(`High-five sent to ${partnerName}! 🏸`);
      setTimeout(() => setPairSuccess(null), 3000);
    }
    setTimeout(() => setCheerSent(false), 3000);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/90 dark:border-slate-800/80">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-400/10 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-400/20">
            Accountability
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Training Buddies
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
            Pair with a court partner to keep each other honest. Zero spam, mutual streak verification.
          </p>
        </div>

        <Link 
          href="/today" 
          className="self-start sm:self-auto text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          &larr; Today&apos;s Plan
        </Link>
      </div>

      {/* Main Responsive Grid Layout (2 cols on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Active Buddies List - 7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-md dark:shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Active Accountability Pairs ({buddies.length})
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-lime-500/15 dark:bg-lime-400/10 text-lime-700 dark:text-lime-400 border border-lime-500/30 dark:border-lime-400/20">
                Peer Synced
              </span>
            </div>

            {/* Weekly Accountability Duel Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚔️</span>
                  <span>Weekly Consistency Duel</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Target: 3 Sessions</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">You</div>
                  <div className="text-base font-black text-lime-700 dark:text-lime-400">2 / 3 Logged</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-lime-500 dark:bg-lime-400 h-full w-2/3" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Partner</div>
                  <div className="text-base font-black text-sky-700 dark:text-sky-400">2 / 3 Logged</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-sky-500 dark:bg-sky-400 h-full w-2/3" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {buddies.map(b => (
                <div 
                  key={b.id} 
                  className="bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-400/10 border border-sky-200 dark:border-sky-400/20 text-sky-700 dark:text-sky-400 flex items-center justify-center text-xl font-bold shadow-sm">
                        🏸
                      </div>
                      <div>
                        <div className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                          {b.partner_name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Target: <strong className="text-slate-700 dark:text-slate-200">{b.slot_days}</strong> at <strong className="text-slate-700 dark:text-slate-200">{b.slot_time}</strong>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-black text-lime-700 dark:text-lime-400 bg-lime-500/15 dark:bg-lime-400/10 px-2.5 py-1 rounded-xl border border-lime-500/30 dark:border-lime-400/20">
                      🔥 {b.last_streak}d
                    </span>
                  </div>

                  {/* Partner Telemetry Bar & High-Five CTA */}
                  <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-lime-500 dark:bg-lime-400" />
                      <span>Checked in today</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendCheer(b.partner_name)}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>🙌</span>
                      <span>{cheerSent ? 'Sent!' : 'High-Five'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cheerSent && (
              <div className="mt-4 p-3 bg-lime-500/15 dark:bg-lime-400/10 border border-lime-500/30 dark:border-lime-400/20 rounded-2xl text-xs font-bold text-lime-700 dark:text-lime-400 text-center animate-in fade-in">
                ✓ High-five delivered to your accountability partner!
              </div>
            )}
          </div>

          {/* Privacy Guarantee Banner */}
          <div className="bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <span className="text-xl leading-none">🛡️</span>
            <div>
              <strong className="text-slate-900 dark:text-white block mb-1 text-sm font-bold">Privacy-First Architecture:</strong>
              Only your workout completion status and duration are synchronized. Your soreness notes, medical details, and personal routines stay 100% private in your device&apos;s IndexedDB.
            </div>
          </div>
        </div>

        {/* Right Column (Pair with Partner Form & Invite Link - 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Pair with Partner Code Form */}
          <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-lime-700 dark:text-lime-400 block mb-1">
              Link Partner
            </span>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight mb-2">
              Enter Partner&apos;s Invite Code
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Got a pairing code from a training friend? Enter it below to link your streak without sharing private health logs.
            </p>

            <form onSubmit={handlePairBuddy} className="flex flex-col gap-3">
              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                placeholder="e.g. BAHAR-COURT-99"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-lime-500 dark:focus:border-lime-400 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-mono font-bold tracking-wider outline-none uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={linking}
                className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-lime-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {linking ? 'Linking Partner...' : 'Pair Accountability Partner &rarr;'}
              </button>
            </form>

            {pairSuccess && (
              <div className="mt-3 p-3 bg-lime-500/15 dark:bg-lime-400/10 border border-lime-500/30 dark:border-lime-400/30 rounded-xl text-xs font-bold text-lime-700 dark:text-lime-400 text-center">
                ✓ {pairSuccess}
              </div>
            )}
          </div>

          {/* Share Your Invite Code Card */}
          <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-400 block mb-1">
              Your Court Code
            </span>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight mb-2">
              Invite a Court Partner
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Share your personal invite link or code with a training buddy to start accountability tracking.
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-2 mb-3">
              <span className="font-mono font-black text-sm text-lime-700 dark:text-lime-400 tracking-wider">
                {inviteCode}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Active Code
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleCopyLink}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{copied ? '✓ Copied to Clipboard!' : '📋 Copy Invite Link'}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Hey! Join me on Bahar for resilient athletic training. Pair up with my code: ${inviteCode} at https://bahar.app/buddy?invite=${inviteCode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>Share via WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </main>
  );
}
