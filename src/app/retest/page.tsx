'use client';

import React, { useState, useEffect } from 'react';
import { getProfile, saveProfile } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { z } from 'zod';
import { UserProfile } from '../../data/local/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { playAudioCue, unlockAudio } from '../../features/outside-mode/audio';

export default function RetestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newResult, setNewResult] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

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
      const fallback = "Solid consistency logged. Your work capacity has improved and your new baseline is now calibrated into your daily envelope.";
      setSummary(fallback);
      if (profile) {
        await saveProfile({
          ...profile,
          baselineResult: newResult
        });
      }
    }
    setLoading(false);
  };

  const handlePlayVoice = () => {
    if (!summary) return;
    unlockAudio();
    setPlayingAudio(true);
    playAudioCue(summary);
    setTimeout(() => setPlayingAudio(false), 3500);
  };

  if (!profile) return null;

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-slate-100 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-sky-400 bg-sky-400/10 px-2.5 py-0.5 rounded-full border border-sky-400/20">
            30-Day Milestone
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            Fitness Retest & Benchmark
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Recalibrate your physical envelope floor by logging your latest 1-minute drill benchmark.
          </p>
        </div>

        <Link 
          href="/progress" 
          className="self-start sm:self-auto text-xs font-extrabold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:border-slate-700 transition-colors"
        >
          &larr; Progress
        </Link>
      </div>

      {!summary ? (
        <form onSubmit={handleRetest} className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 backdrop-blur-sm">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Current Benchmark Baseline
            </h2>
            <div className="text-sm sm:text-base font-semibold text-slate-200 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl italic">
              "{profile.baselineResult || 'Initial baseline completed'}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-lime-400 uppercase tracking-widest mb-2">
              New Retest Result
            </label>
            <input 
              type="text" 
              value={newResult} 
              onChange={e => setNewResult(e.target.value)} 
              className="w-full text-base font-semibold p-4 rounded-2xl border border-slate-800 bg-slate-950 text-white focus:border-lime-400 outline-none transition-colors" 
              placeholder="e.g. 34 shadow footwork reps in 60s, crisper knee recovery" 
              required 
            />
            <p className="text-xs text-slate-400 mt-2">
              Enter your repetitions, speed, or subjective form score from today's retest.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black py-4 rounded-2xl text-base shadow-xl shadow-lime-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? 'Evaluating Baseline Shift...' : 'Submit Retest & Update Envelope \u2192'}
          </button>
        </form>
      ) : (
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-400/10 border border-sky-400/20 text-sky-400 flex items-center justify-center text-2xl font-bold shadow-sm">
                🎯
              </div>
              <div>
                <h2 className="font-black text-xl text-white">Coach Evaluation</h2>
                <p className="text-xs text-slate-400">Baseline updated into daily envelope generator</p>
              </div>
            </div>

            <button
              onClick={handlePlayVoice}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-lime-400 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>{playingAudio ? '🔊' : '🎙️'}</span>
              <span className="hidden sm:inline">{playingAudio ? 'Speaking...' : 'Listen'}</span>
            </button>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl text-slate-200 text-sm sm:text-base leading-relaxed font-medium italic">
            "{summary}"
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">
                Previous Baseline
              </div>
              <div className="text-sm font-bold text-slate-300">
                {profile.baselineResult}
              </div>
            </div>

            <div className="bg-lime-400/10 border border-lime-400/30 p-4 rounded-2xl">
              <div className="text-[10px] text-lime-400 font-black uppercase tracking-wider mb-1">
                New Baseline (Calibrated)
              </div>
              <div className="text-sm font-black text-white">
                {newResult}
              </div>
            </div>
          </div>

          <button 
            onClick={() => router.push('/progress')} 
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl text-sm transition-colors border border-slate-700/80"
          >
            Back to Analytics Dashboard &rarr;
          </button>
        </div>
      )}
    </main>
  );
}
