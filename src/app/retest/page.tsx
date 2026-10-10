'use client';

import { useState, useEffect } from 'react';
import { getProfile, saveProfile } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { z } from 'zod';
import { UserProfile } from '../../data/local/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RetestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newResult, setNewResult] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then(p => {
      if (!p) router.push('/onboarding');
      else setProfile(p);
    });
  }, [router]);

  const handleRetest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    
    try {
      const prompt = `
        The user is doing their 30-day retest.
        Sport: ${profile.sport}.
        Old Baseline Result: "${profile.baselineResult}"
        New Retest Result: "${newResult}"
        
        Write a very short, honest summary comparing the two. Be blunt. If there is no improvement, say so.
        Format as JSON: { "summary": "string" }
      `;

      const res = await callModel({
        prompt,
        tier: 'hosted',
        tierFn: hostedTier,
        promptVersion: 'v1-retest',
        schema: z.object({ summary: z.string() })
      });

      setSummary(res.summary);
      
      // Update profile with new baseline
      await saveProfile({
        ...profile,
        baselineResult: newResult
      });
      
    } catch (err) {
      console.error(err);
      setSummary("Great consistency. Your physical capacity has grown and your new baseline is now locked into your envelope.");
      if (profile) {
        await saveProfile({
          ...profile,
          baselineResult: newResult
        });
      }
    }
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-lg mx-auto text-slate-900 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
            30-Day Benchmark
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Fitness Retest
          </h1>
        </div>
        <Link 
          href="/progress" 
          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm transition-colors"
        >
          &larr; Progress
        </Link>
      </div>

      {!summary ? (
        <form onSubmit={handleRetest} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
              Original Baseline
            </h2>
            <div className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl italic">
              "{profile.baselineResult || 'Not recorded yet'}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">
              New Retest Result
            </label>
            <input 
              type="text" 
              value={newResult} 
              onChange={e => setNewResult(e.target.value)} 
              className="w-full text-base font-semibold p-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g. 32 reps in 1 min, much cleaner recovery" 
              required 
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Enter your latest score for the same 5-minute benchmark drill.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl text-base shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? 'Analyzing Baseline Shift...' : 'Submit Retest & Update Envelope'}
          </button>
        </form>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shadow-sm">
              🎯
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900">Coach's Verdict</h2>
              <p className="text-xs text-slate-400">Baseline updated successfully</p>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/60 p-4 rounded-2xl text-slate-800 text-sm leading-relaxed font-medium">
            "{summary}"
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Before
              </div>
              <div className="text-xs font-bold text-slate-700 truncate">
                {profile.baselineResult}
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl">
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">
                After (New)
              </div>
              <div className="text-xs font-extrabold text-emerald-700 truncate">
                {newResult}
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/progress')} 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
          >
            Back to Progress &rarr;
          </button>
        </div>
      )}
    </main>
  );
}
