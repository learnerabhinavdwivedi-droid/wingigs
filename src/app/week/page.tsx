'use client';

import React, { useState, useEffect } from 'react';
import { getAllCheckins } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { buildSundayReviewPrompt } from '../../ai/prompts';
import { z } from 'zod';
import Link from 'next/link';
import { playAudioCue, unlockAudio } from '../../features/outside-mode/audio';

export default function WeekReviewPage() {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [playingVoice, setPlayingVoice] = useState(false);
  const [weekSummary, setWeekSummary] = useState<{ totalCourt: number; totalScreen: number; completedCount: number }>({
    totalCourt: 0,
    totalScreen: 0,
    completedCount: 0
  });

  useEffect(() => {
    async function load() {
      try {
        const all = await getAllCheckins();
        const thisWeek = all.slice(0, 7);
        
        const courtMins = thisWeek.reduce((a, b) => a + (b.minutes || 0), 0);
        const screenMins = Math.floor(thisWeek.reduce((a, b) => a + (b.screenSeconds || 0), 0) / 60);
        const done = thisWeek.filter(b => b.completed).length;

        setWeekSummary({
          totalCourt: courtMins,
          totalScreen: screenMins,
          completedCount: done
        });

        const payload = buildSundayReviewPrompt(done, 7, courtMins);

        const result = await callModel({
          prompt: payload.userPrompt,
          tier: 'hosted',
          tierFn: hostedTier,
          promptVersion: 'v1.0-review',
          schema: z.object({ review: z.string() })
        });
        
        setReview(result.review || "Strong effort this week. Maintain steady court recovery and protect your rest windows.");
        setLoading(false);
      } catch (err) {
        console.error(err);
        setReview("You are establishing your baseline envelope. Consistency beats intensity every time. Hit 3 court drill sessions next week and keep late-night screen time down.");
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePlayVoice = () => {
    if (!review) return;
    unlockAudio();
    setPlayingVoice(true);
    playAudioCue(review);
    setTimeout(() => setPlayingVoice(false), 3500);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-slate-900 dark:text-slate-100 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/90 dark:border-slate-800/80">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-400/10 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-400/20">
            Weekly Debrief
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1 font-jersey">
            Sunday Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            AI coaching analysis balancing active court output against passive phone screen hours.
          </p>
        </div>

        <Link 
          href="/progress" 
          className="self-start sm:self-auto text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors font-jersey"
        >
          &larr; Analytics
        </Link>
      </div>

      {loading ? (
        <div className="bg-white/90 dark:bg-slate-900/70 border border-purple-300/80 dark:border-purple-500/30 rounded-3xl p-10 text-center shadow-md dark:shadow-xl backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-base font-black text-slate-900 dark:text-white font-jersey">Synthesizing 7-Day Training Log...</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Evaluating court minutes vs screen distractions</div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          
          {/* 7-Day Metric Badges Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-jersey">{weekSummary.completedCount}</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                Workouts Logged
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-lime-700 dark:text-lime-400 font-jersey">{weekSummary.totalCourt}m</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                Court Practice
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-center shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-jersey">{weekSummary.totalScreen}m</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                Passive Screen
              </div>
            </div>
          </div>

          {/* Coach's Verdict Card */}
          <div className="bg-white/90 dark:bg-slate-900/70 border border-purple-300/80 dark:border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-md dark:shadow-xl backdrop-blur-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center text-2xl font-bold shadow-sm">
                  📋
                </div>
                <div>
                  <h2 className="font-black text-xl text-slate-900 dark:text-white font-jersey">Coach&apos;s Sunday Verdict</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Honest debrief grounded in local telemetry</p>
                </div>
              </div>

              <button
                onClick={handlePlayVoice}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 font-jersey"
              >
                <span>{playingVoice ? '🔊' : '🎙️'}</span>
                <span className="hidden sm:inline">{playingVoice ? 'Speaking...' : 'Listen'}</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium italic">
              &ldquo;{review}&rdquo;
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
              <span>Next review window opens next Sunday</span>
              <Link 
                href="/today" 
                className="bg-purple-600 hover:bg-purple-500 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-purple-600/25 font-jersey"
              >
                Open Today&apos;s Plan &rarr;
              </Link>
            </div>
          </div>

        </div>
      )}

    </main>
  );
}
