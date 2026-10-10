'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../data/remote/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BuddyPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [buddies, setBuddies] = useState<any[]>([
    {
      id: 'demo-buddy',
      slot_days: 'Tue & Thu',
      slot_time: '6:30 PM',
      partner_name: 'Marcus K. (Training Partner)',
      status: 'Active',
      last_streak: 5
    }
  ]);
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState('BAHAR-COURT-77');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const fetchBuddies = async () => {
      try {
        const { data } = await supabase
          .from('buddy_pairs')
          .select('*, user_a, user_b');
        if (data && data.length > 0) setBuddies(data);
      } catch (err) {
        // preserve local demo buddy
      }
    };
    fetchBuddies();
  }, [router]);

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/buddy?invite=${inviteCode}` : `https://bahar.app/buddy?invite=${inviteCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-lg mx-auto text-slate-900 flex flex-col gap-5">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
          Accountability
        </span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
          Your Buddy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pair with a court partner to keep each other honest. Zero spam, mutual streak checks.
        </p>
      </div>

      {/* Active Buddy Card */}
      {buddies.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Active Accountability Pair
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Synced
            </span>
          </div>

          {buddies.map(b => (
            <div key={b.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shadow-sm">
                  🏸
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {b.partner_name || 'Accountability Partner'}
                  </div>
                  <div className="text-xs text-slate-500">
                    Slot: <strong className="text-slate-700">{b.slot_days}</strong> at <strong className="text-slate-700">{b.slot_time}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Partner's Active Streak:</span>
                <span className="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  🔥 {b.last_streak || 5} days
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite a New Buddy */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-200/80 rounded-3xl p-5 shadow-sm">
        <h3 className="font-black text-base text-slate-900 mb-1">
          Invite a New Court Buddy
        </h3>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Share your invite code with a friend or training partner. When they enter your code, you'll see each other's check-ins without sharing private data.
        </p>

        <div className="bg-white border border-blue-200 rounded-2xl p-3 flex items-center justify-between gap-2 mb-3 shadow-inner">
          <div className="font-mono font-bold text-xs sm:text-sm text-slate-800 tracking-wider truncate">
            {inviteCode}
          </div>
          <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
            Invite Code
          </span>
        </div>

        <button 
          onClick={handleCopyLink}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>{copied ? '✓ Copied to Clipboard!' : '📋 Copy Invite Link'}</span>
        </button>
      </div>

      {/* Privacy Guarantee */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-500 flex items-start gap-2.5">
        <span className="text-base leading-none">🛡️</span>
        <div>
          <strong className="text-slate-700 block mb-0.5">Privacy First Pairing:</strong>
          Only your check-in completion and minutes are shared. Your health logs, soreness notes, and personal inputs stay strictly local on your phone.
        </div>
      </div>
    </main>
  );
}
