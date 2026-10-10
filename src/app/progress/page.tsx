'use client';

import { useState, useEffect } from 'react';
import { getAllCheckins } from '../../data/local/queries';
import { calculateMomentum } from '../../domain/progress/momentum';
import { getDayKey } from '../../domain/time/day_key';
import { DayCheckin } from '../../data/local/db';
import Link from 'next/link';

export default function ProgressPage() {
  const [checkins, setCheckins] = useState<DayCheckin[]>([]);
  const [momentum, setMomentum] = useState(0);

  useEffect(() => {
    async function load() {
      const all = await getAllCheckins();
      // sort desc
      all.sort((a, b) => b.dayKey.localeCompare(a.dayKey));
      setCheckins(all);
      
      const streak = calculateMomentum(all, getDayKey());
      setMomentum(streak);
    }
    load();
  }, []);

  const totalOutdoorMinutes = checkins.reduce((acc, c) => acc + (c.minutes || 0), 0);
  const totalScreenSeconds = checkins.reduce((acc, c) => acc + (c.screenSeconds || 0), 0);
  const completedWorkouts = checkins.filter(c => c.completed);
  
  // Format screen time
  const screenMins = Math.floor(totalScreenSeconds / 60);
  const isWinning = totalOutdoorMinutes >= screenMins;

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-lg mx-auto text-slate-900 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
            Analytics & History
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Your Progress
          </h1>
        </div>
        <Link 
          href="/today" 
          className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm transition-colors"
        >
          &larr; Today
        </Link>
      </div>

      {/* Momentum Streak Hero Card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-6 rounded-3xl shadow-xl shadow-blue-600/20 text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🔥</span>
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-blue-100">
            Momentum Streak
          </h2>
        </div>
        <div className="text-6xl sm:text-7xl font-black tracking-tight my-1">
          {momentum}
        </div>
        <p className="text-xs text-blue-100/90 font-medium max-w-xs mx-auto">
          {momentum === 0 
            ? 'Start your streak today. Rest days with smart envelopes count toward momentum!' 
            : `${momentum} active days locked in. Consistency built on failure-tolerant planning.`}
        </p>
      </div>

      {/* Screen vs Outdoor Contrast Card */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Screen vs Outdoor
            </h2>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isWinning ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {isWinning ? 'Outdoor Victory 🌿' : 'Screen Dominating ⚠️'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-center mb-3">
          <div>
            <div className="text-3xl font-black text-rose-400">{screenMins}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Screen Mins
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">{totalOutdoorMinutes}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              Outdoor Mins
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-slate-300 font-medium">
          {isWinning 
            ? 'You are beating the screen! Your physical court volume surpasses passive screen time.' 
            : 'The screen is winning. Get outside and add court minutes to flip the ratio!'}
        </p>
      </div>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-sm text-center">
          <div className="text-2xl font-black text-slate-800">{completedWorkouts.length}</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Total Sessions
          </div>
        </div>
        <div className="bg-white border border-slate-200/90 p-4 rounded-2xl shadow-sm text-center">
          <div className="text-2xl font-black text-blue-600">{totalOutdoorMinutes}m</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Court Practice
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
            Workout History
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {completedWorkouts.length} logged
          </span>
        </div>

        <div className="space-y-2.5">
          {completedWorkouts.map(c => (
            <div 
              key={c.dayKey} 
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold shadow-sm">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{c.dayKey}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Completed
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Badminton Drill Session</span>
                  </div>
                </div>
              </div>
              <div className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200/50">
                {c.minutes} min
              </div>
            </div>
          ))}

          {completedWorkouts.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <div className="text-3xl mb-2">🏸</div>
              <div className="text-sm font-semibold">No completed workouts yet.</div>
              <p className="text-xs text-slate-400 mt-1">
                Complete your first drill session to start logging history.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Review & Retest Shortcuts */}
      <div className="grid grid-cols-2 gap-3 pb-6">
        <Link 
          href="/week" 
          className="bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-purple-900 p-4 rounded-2xl text-center transition-all group"
        >
          <div className="text-lg mb-1 group-hover:scale-110 transition-transform">📋</div>
          <div className="font-bold text-xs uppercase tracking-wider text-purple-700">Sunday Review</div>
          <div className="text-[11px] text-purple-600/80 mt-0.5">AI Weekly Assessment</div>
        </Link>
        
        <Link 
          href="/retest" 
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200/80 text-blue-900 p-4 rounded-2xl text-center transition-all group"
        >
          <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🎯</div>
          <div className="font-bold text-xs uppercase tracking-wider text-blue-700">30-Day Retest</div>
          <div className="text-[11px] text-blue-600/80 mt-0.5">Gauge Baseline Shift</div>
        </Link>
      </div>
    </main>
  );
}
