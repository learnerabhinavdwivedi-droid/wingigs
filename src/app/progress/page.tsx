'use client';

import React, { useState, useEffect } from 'react';
import { getAllCheckins } from '../../data/local/queries';
import { calculateResilientMomentum, ResilientMomentumResult } from '../../domain/progress/momentum';
import { getDayKey } from '../../domain/time/day_key';
import { DayCheckin } from '../../data/local/db';
import { computeAchievements } from '../../domain/progress/achievements';
import Link from 'next/link';

export default function ProgressPage() {
  const [checkins, setCheckins] = useState<DayCheckin[]>([]);
  const [momentum, setMomentum] = useState(0);
  const [resilient, setResilient] = useState<ResilientMomentumResult>({
    streak: 0,
    shieldCharged: true,
    shieldProtected: false,
    activeDaysLast7: 0,
    weeklyTarget: 3
  });

  useEffect(() => {
    async function load() {
      const all = await getAllCheckins();
      // sort desc
      all.sort((a, b) => b.dayKey.localeCompare(a.dayKey));
      setCheckins(all);
      
      const res = calculateResilientMomentum(all, getDayKey(), 3);
      setResilient(res);
      setMomentum(res.streak);
    }
    load();
  }, []);

  const totalOutdoorMinutes = checkins.reduce((acc, c) => acc + (c.minutes || 0), 0);
  const totalScreenSeconds = checkins.reduce((acc, c) => acc + (c.screenSeconds || 0), 0);
  const completedWorkouts = checkins.filter(c => c.completed);
  
  // Format screen time
  const screenMins = Math.floor(totalScreenSeconds / 60);
  const isWinning = totalOutdoorMinutes >= screenMins;
  const ratioPercent = (totalOutdoorMinutes + screenMins) > 0 
    ? Math.round((totalOutdoorMinutes / (totalOutdoorMinutes + screenMins)) * 100) 
    : 100;

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-slate-900 dark:text-slate-100 flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/90 dark:border-slate-800/80">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-lime-700 dark:text-lime-400 bg-lime-500/15 dark:bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-500/30 dark:border-lime-400/20">
            Telemetry & History
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Your Progress
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href="/today" 
            className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            &larr; Today&apos;s Plan
          </Link>
          <Link
            href="/outside"
            className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-lime-400/20"
          >
            Train Now
          </Link>
        </div>
      </div>

      {/* Hero Dual Dashboard Cards (2 columns on md/lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Momentum Streak Hero Card */}
        <div className="bg-gradient-to-br from-white via-white to-lime-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-lime-950/40 border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-md dark:shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-lime-700 dark:text-lime-400">
                  Momentum Streak
                </h2>
              </div>

              {/* Recovery Shield Badge */}
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                resilient.shieldProtected
                  ? 'bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30'
                  : 'bg-sky-400/15 text-sky-700 dark:text-sky-300 border-sky-400/30'
              }`}>
                <span>{resilient.shieldProtected ? '🛡️ Rest Shield Active' : '🛡️ Shield Ready'}</span>
              </span>
            </div>
            
            <div className="text-6xl sm:text-7xl font-black tracking-tight my-2 text-slate-900 dark:text-white flex items-baseline gap-2">
              <span>{momentum}</span>
              <span className="text-base text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Days</span>
            </div>

            {/* Weekly Target Progress */}
            <div className="flex items-center gap-2 my-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Target:</span>
              <span className="text-lime-700 dark:text-lime-400">{resilient.activeDaysLast7} of {resilient.weeklyTarget} sessions</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-500 dark:text-slate-400">Last 7 Days</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-2">
            {momentum === 0 
              ? 'Start your momentum today. Rest days within smart envelopes keep your streak alive!' 
              : resilient.shieldProtected
                ? 'Your Recovery Shield absorbed your planned rest day! Streak protected.'
                : `${momentum} active days locked in. Consistency built on failure-tolerant planning.`}
          </p>
        </div>

        {/* Screen vs Outdoor Contrast Card */}
        <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-md dark:shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-500 dark:bg-lime-400 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Screen vs Court Volume
                </h2>
              </div>

              <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                isWinning 
                  ? 'bg-lime-500/15 text-lime-800 dark:text-lime-300 border-lime-500/30 dark:border-lime-400/30' 
                  : 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30'
              }`}>
                {isWinning ? 'Court Dominating 🌿' : 'Screen Dominating ⚠️'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-center mb-4">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400">{screenMins}m</div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                  Passive Screen
                </div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-lime-700 dark:text-lime-400">{totalOutdoorMinutes}m</div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
                  Active Court
                </div>
              </div>
            </div>

            {/* Ratio Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-slate-800 mb-2">
              <div 
                className={`h-full transition-all duration-500 ${isWinning ? 'bg-lime-500 dark:bg-lime-400' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, Math.max(5, ratioPercent))}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {isWinning 
              ? 'You are beating passive screen time! Physical court presence exceeds phone idling.' 
              : 'Screen time is ahead. Log a quick 15-minute drill session to reclaim momentum.'}
          </p>
        </div>

      </div>

      {/* Overview Stat Badges (4 columns responsive) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{completedWorkouts.length}</div>
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
            Completed Sessions
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-lime-700 dark:text-lime-400">{totalOutdoorMinutes}m</div>
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
            Total Court Minutes
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {completedWorkouts.length > 0 ? Math.round(totalOutdoorMinutes / completedWorkouts.length) : 0}m
          </div>
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
            Avg Session Length
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {ratioPercent}%
          </div>
          <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
            Court vs Screen Ratio
          </div>
        </div>
      </div>

      {/* Earned Milestones & Badges (Gamification & Retention Engine) */}
      <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-6 rounded-3xl shadow-md dark:shadow-xl backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-lime-700 dark:text-lime-400 block mb-0.5">
              Gamified Motivation
            </span>
            <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
              Earned Milestones & Badges
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {computeAchievements(checkins, momentum).filter(a => a.unlocked).length} of {computeAchievements(checkins, momentum).length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {computeAchievements(checkins, momentum).map(badge => (
            <div 
              key={badge.id}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                badge.unlocked
                  ? 'bg-gradient-to-b from-white to-lime-50/60 dark:from-slate-900 dark:to-lime-950/20 border-lime-500/40 dark:border-lime-400/40 shadow-sm dark:shadow-md'
                  : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className={`font-black text-xs sm:text-sm tracking-tight ${badge.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {badge.title}
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                  {badge.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[10px] font-bold">
                <span className={badge.unlocked ? 'text-lime-700 dark:text-lime-400' : 'text-slate-400 dark:text-slate-500'}>
                  {badge.progressText}
                </span>
                {badge.unlocked && <span className="text-lime-700 dark:text-lime-400 font-black">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive 2-Column Split: History (Left) & Insights/Debrief (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Workout History (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-7 rounded-3xl shadow-md dark:shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
              Workout History
            </h3>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              {completedWorkouts.length} logged
            </span>
          </div>

          <div className="space-y-3">
            {completedWorkouts.map(c => (
              <div 
                key={c.dayKey} 
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex justify-between items-center transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-lime-500/15 dark:bg-lime-400/10 border border-lime-500/30 dark:border-lime-400/20 text-lime-700 dark:text-lime-400 flex items-center justify-center text-sm font-black shadow-sm">
                    ✓
                  </div>
                  <div>
                    <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                      {c.dayKey}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-lime-500/15 dark:bg-lime-400/10 text-lime-700 dark:text-lime-400 font-black px-2 py-0.5 rounded-md border border-lime-500/30 dark:border-lime-400/20">
                        Completed
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Court Drill Session
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm sm:text-base font-black text-lime-700 dark:text-lime-400 bg-lime-500/15 dark:bg-lime-400/10 px-3.5 py-1.5 rounded-xl border border-lime-500/30 dark:border-lime-400/20">
                  {c.minutes} min
                </div>
              </div>
            ))}

            {completedWorkouts.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="text-4xl mb-3">🏸</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">No completed workouts yet.</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Hit &quot;Train Now&quot; to run today&apos;s court session and record your first log.
                </p>
                <Link
                  href="/today"
                  className="inline-block mt-4 bg-lime-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs hover:bg-lime-300 transition-colors shadow-sm"
                >
                  Start Today&apos;s Workout &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Debrief & Retest Cards (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Sunday Review Shortcut Card */}
          <Link 
            href="/week" 
            className="bg-white/90 dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-purple-300/80 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500/50 p-6 rounded-3xl shadow-md dark:shadow-xl transition-all group backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                Weekly Assessment
              </span>
              <span className="text-xl group-hover:scale-110 transition-transform">📋</span>
            </div>
            
            <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight mb-1">
              Sunday Review & Debrief
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              AI coach analyzes your 7-day training consistency against passive phone screen usage to set next week&apos;s focus.
            </p>
            
            <div className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>View Weekly Evaluation</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* 30-Day Retest Benchmark Card */}
          <Link 
            href="/retest" 
            className="bg-white/90 dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-sky-300/80 dark:border-sky-500/30 hover:border-sky-400 dark:hover:border-sky-500/50 p-6 rounded-3xl shadow-md dark:shadow-xl transition-all group backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800/60">
                30-Day Milestone
              </span>
              <span className="text-xl group-hover:scale-110 transition-transform">🎯</span>
            </div>
            
            <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight mb-1">
              Physical Fitness Retest
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Re-evaluate your benchmark drill to recalibrate your baseline and expand your daily envelope.
            </p>
            
            <div className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Test Benchmark Drill</span>
              <span>&rarr;</span>
            </div>
          </Link>

        </div>

      </div>

    </main>
  );
}
