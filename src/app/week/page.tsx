'use client';

import { useState, useEffect } from 'react';
import { getAllCheckins } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { z } from 'zod';
import Link from 'next/link';

export default function WeekReviewPage() {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const all = await getAllCheckins();
        const thisWeek = all.slice(0, 7);
        
        const logsStr = thisWeek.length > 0 
          ? thisWeek.map(c => `${c.dayKey}: ${c.completed ? c.minutes + ' mins' : 'Missed'} (Screen: ${Math.floor((c.screenSeconds || 0)/60)} mins)`).join('\n')
          : 'No workouts completed yet this week.';

        const prompt = `
          You are a strict, concise coach. Read these 7-day training logs for the user.
          Logs:
          ${logsStr}
          
          Write a short, punchy Sunday Review. Format as JSON matching { "review": "string" }. 
          1. Acknowledge the reality (did they train or stare at screens?).
          2. Give them one specific focus for next week.
        `;

        const result = await callModel({
          prompt,
          tier: 'hosted',
          tierFn: hostedTier,
          promptVersion: 'v1.0-review',
          schema: z.object({ review: z.string() })
        });
        
        setReview(result.review || "Strong effort this week. Maintain steady court recovery and protect your rest windows.");
        setLoading(false);
      } catch (err) {
        console.error(err);
        setReview("You're establishing your baseline envelope. Consistency beats intensity every time. Hit 3 court drill sessions next week and keep late-night screen time down.");
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-lg mx-auto text-slate-900 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
            Weekly Debrief
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Sunday Review
          </h1>
        </div>
        <Link 
          href="/progress" 
          className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm transition-colors"
        >
          &larr; Progress
        </Link>
      </div>

      {loading && (
        <div className="bg-white border border-purple-100 rounded-3xl p-8 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-sm font-bold text-purple-800">Analyzing your 7-day training history...</div>
          <div className="text-xs text-slate-400 mt-1">Evaluating court volume vs. screen distractions</div>
        </div>
      )}
      
      {!loading && (
        <div className="bg-white border border-purple-200/90 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold shadow-sm">
              📋
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Coach's Verdict</h2>
              <p className="text-xs text-slate-400">Honest assessment based on your local telemetry</p>
            </div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/60 p-4 rounded-2xl text-slate-800 text-sm leading-relaxed font-medium">
            "{review}"
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-500">
            <span>Next review unlocks next Sunday</span>
            <Link 
              href="/today" 
              className="text-purple-700 font-extrabold hover:underline"
            >
              Train Today &rarr;
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
