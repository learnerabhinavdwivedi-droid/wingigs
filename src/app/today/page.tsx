'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDayEngine } from '../../features/day-engine/useDayEngine';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Reading } from '../../domain/schemas/plan';
import drillsData from '../../data/drills/badminton.json';
import { playAudioCue, unlockAudio } from '../../features/outside-mode/audio';

export default function TodayPage() {
  const { state, plan, profile, envelope, submitReading, applyPlanB } = useDayEngine();
  const router = useRouter();
  const [showCheckin, setShowCheckin] = useState(false);
  const [activeDrillModal, setActiveDrillModal] = useState<any>(null);
  const [playingCue, setPlayingCue] = useState(false);
  const [showWarmup, setShowWarmup] = useState(false);
  
  // State for Movement Prep Warmup Checklist
  const [warmupDone, setWarmupDone] = useState<{ [key: string]: boolean }>({
    ankles: false,
    hips: false,
    racket: false
  });
  
  const toggleWarmup = (key: string) => {
    setWarmupDone(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allWarmupDone = warmupDone.ankles && warmupDone.hips && warmupDone.racket;
  
  // State for Reading
  const [reading, setReading] = useState<Reading>({
    sleep: 'ok',
    energy: 2,
    soreness: 'none',
    time: 30,
    place: 'gym',
    flags: []
  });

  // Calculate 0-100% Athletic Readiness & Recovery Capacity
  const readinessScore = useMemo(() => {
    let score = 50;
    if (reading.sleep === 'good') score += 25;
    else if (reading.sleep === 'ok') score += 15;
    else score += 0;

    if (reading.energy === 3) score += 25;
    else if (reading.energy === 2) score += 15;
    else score += 5;

    if (reading.soreness === 'none') score += 0;
    else if (reading.soreness === 'some') score -= 15;
    else if (reading.soreness === 'pain') score -= 30;

    return Math.max(15, Math.min(100, score));
  }, [reading.sleep, reading.energy, reading.soreness]);

  const readinessStatus = useMemo(() => {
    if (readinessScore >= 80) {
      return { 
        label: 'Optimal Capacity', 
        color: 'text-lime-400', 
        bg: 'bg-lime-400/10', 
        border: 'border-lime-400/30', 
        note: 'Envelope unlocked for full anaerobic court speed and maximal intensity.' 
      };
    }
    if (readinessScore >= 55) {
      return { 
        label: 'Balanced Pacing', 
        color: 'text-amber-400', 
        bg: 'bg-amber-400/10', 
        border: 'border-amber-400/30', 
        note: 'Moderate capacity envelope active. Focus on smooth footwork mechanics.' 
      };
    }
    return { 
      label: 'Active Recovery Throttling', 
      color: 'text-rose-400', 
      bg: 'bg-rose-400/10', 
      border: 'border-rose-400/30', 
      note: 'Protective throttling engaged to safeguard joints and prevent soft-tissue strain.' 
    };
  }, [readinessScore]);

  useEffect(() => {
    if (state === 'no_profile') {
      router.push('/onboarding');
    }
  }, [state, router]);

  const handlePlayCue = (text: string) => {
    unlockAudio();
    setPlayingCue(true);
    playAudioCue(text);
    setTimeout(() => setPlayingCue(false), 3000);
  };

  const drillMap = new Map(drillsData.drills.map(d => [d.id, d]));

  if (state === 'loading') {
    return (
      <main className="p-8 max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-lime-500/20" />
        <p className="font-extrabold text-sm tracking-tight text-white">Loading training envelope...</p>
        <span className="text-xs text-slate-500 mt-1">Reading offline IndexedDB</span>
      </main>
    );
  }
  
  if (state === 'generating') {
    return (
      <main className="p-8 max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center text-slate-200 text-center">
        <div className="w-16 h-16 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-3xl flex items-center justify-center text-3xl animate-bounce mb-5 shadow-xl shadow-lime-500/20">
          🏸
        </div>
        <h2 className="text-2xl font-black mb-1 tracking-tight text-white">Calibrating Daily Envelope</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
          Balancing court volume, intensity cap, and current recovery status...
        </p>
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className="p-8 max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center text-2xl mb-4">
          ⚠️
        </div>
        <h2 className="text-lg font-black text-white mb-1">Could not build today's plan</h2>
        <p className="text-xs text-slate-400 mb-6">Local engine hit an unexpected parameter.</p>
        <button 
          onClick={() => submitReading(reading)}
          className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-lg shadow-lime-500/20 active:scale-95"
        >
          Recalculate Envelope
        </button>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen text-slate-100 flex flex-col">
      {/* Top Banner / Breadcrumb on wide screens */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
              {profile?.sport || 'Badminton'} • {profile?.level || 'Beginner'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {profile?.city || 'Seattle'} • {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Today's Plan
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCheckin(!showCheckin)}
            className={`text-xs font-extrabold px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
              showCheckin
                ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md shadow-lime-400/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>⚡</span>
            <span>{showCheckin ? 'Close Check-in' : 'Daily Recovery Check-in'}</span>
          </button>
          
          <button
            onClick={() => router.push('/outside')}
            className="hidden sm:flex bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-lg shadow-lime-500/20 items-center gap-1.5 active:scale-95 transition-all"
          >
            <span>Start</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Main Plan Content - 7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {plan && (
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
              
              {/* Plan Title & Why Banner */}
              <div className="mb-5 pb-4 border-b border-slate-800/80">
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 mb-1 block">
                  Prescribed Daily Session
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  {plan.headline}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{plan.why_this_plan}"
                </p>
              </div>

              {/* Coach Cue Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 mb-6 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <strong className="text-amber-300 font-extrabold text-xs uppercase tracking-wider block mb-0.5">
                      Court Coach Cue:
                    </strong>
                    <span className="text-amber-100/90 text-xs sm:text-sm leading-relaxed">
                      {plan.advice}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayCue(plan.advice)}
                  className="shrink-0 p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                  title="Speak Coach Cue out loud"
                  aria-label="Listen to cue"
                >
                  {playingCue ? '🔊 Speaking...' : '🎙️ Listen'}
                </button>
              </div>

              {/* 3-Minute Movement Prep Warmup Checklist */}
              <div className="mb-6 p-4 rounded-2xl border border-slate-800 bg-slate-950/70 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{allWarmupDone ? '🔥' : '⚡'}</span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 block">
                        Court Warmup
                      </span>
                      <h3 className="text-sm font-black text-white">
                        3-Minute Movement Prep
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWarmup(!showWarmup)}
                    className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
                  >
                    {showWarmup ? 'Collapse' : allWarmupDone ? '✅ Primed (3/3)' : 'Open Routine (3 Drills)'}
                  </button>
                </div>

                {allWarmupDone && !showWarmup && (
                  <div className="p-2.5 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-bold flex items-center gap-2">
                    <span>✨</span>
                    <span>Court Primed! Neuromuscular system ready for high-velocity drills.</span>
                  </div>
                )}

                {showWarmup && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-800/80">
                    {[
                      { id: 'ankles', label: 'Achilles & Ankle Primers', time: '60s', desc: 'Gentle low-amplitude pogo hops & calf spring activation' },
                      { id: 'hips', label: 'Lateral Lunges & Hip Flow', time: '60s', desc: 'Dynamic deep adductor shifts & groin openers' },
                      { id: 'racket', label: 'Shoulder & Racket Shadow Swings', time: '60s', desc: 'Full range scapular rotations & wrist snap acceleration' }
                    ].map(prep => {
                      const isDone = warmupDone[prep.id];
                      return (
                        <div
                          key={prep.id}
                          onClick={() => toggleWarmup(prep.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isDone
                              ? 'bg-lime-400/10 border-lime-400/30 text-white'
                              : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-bold ${
                              isDone ? 'bg-lime-400 border-lime-400 text-slate-950' : 'border-slate-700 bg-slate-950 text-transparent'
                            }`}>
                              ✓
                            </div>
                            <div>
                              <div className={`font-bold text-xs ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                                {prep.label}
                              </div>
                              <div className="text-[10px] text-slate-500">{prep.desc}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-md border border-lime-400/20">
                            {prep.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drill Blocks List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Training Circuit ({plan.blocks.length} Drills)
                  </div>
                  <div className="text-xs font-bold text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
                    {plan.blocks.reduce((a, b) => a + b.minutes, 0)} Min Total
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.blocks.map((block, idx) => {
                    const info = drillMap.get(block.drill_id);
                    return (
                      <li 
                        key={idx}
                        onClick={() => setActiveDrillModal({ ...block, info })}
                        className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 hover:border-slate-700 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400 group-hover:bg-lime-400 group-hover:text-slate-950 flex items-center justify-center font-black text-xs transition-colors">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
                              <span>{info ? info.name : block.drill_id}</span>
                              <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                ℹ️
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 italic mt-0.5">
                              "{block.cue}"
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-black text-sm text-lime-400 bg-lime-400/10 px-3 py-1 rounded-xl border border-lime-400/20">
                            {block.minutes} min
                          </span>
                          {info && (
                            <span className="text-[10px] text-slate-400 mt-1 font-semibold">
                              Intensity {info.intensity}/3
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Mobile Start Workout Primary Action */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <button 
                  onClick={() => router.push('/outside')}
                  className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black py-4 rounded-2xl text-lg shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Workout</span>
                  <span>&rarr;</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Right Column (Controls, Envelope & Check-in - 5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Weather / Envelope Info Banner */}
          {envelope && (
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Dynamic Envelope
                </span>
                <span className="text-xs font-extrabold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-0.5 rounded-full">
                  Cap: {envelope.max_intensity}/3 Int.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
                  <div className="text-slate-400 text-[11px] mb-1">Environment</div>
                  <div className="font-extrabold text-white flex items-center gap-1.5">
                    <span>{envelope.allow_outdoor ? '🌤️ Outdoor Court' : '🏠 Indoor Protected'}</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
                  <div className="text-slate-400 text-[11px] mb-1">Session Envelope</div>
                  <div className="font-extrabold text-white capitalize">
                    {envelope.mode} Mode ({envelope.budget_minutes}m)
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automatically throttles intensity when fatigue or poor weather is reported, protecting consistency over burnout.
              </p>
            </div>
          )}

          {/* Athletic Readiness & Physical Capacity Gauge */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Physical Capacity Gauge
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${readinessStatus.bg} ${readinessStatus.color} ${readinessStatus.border}`}>
                {readinessStatus.label}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                  <circle
                    cx="32" cy="32" r="26"
                    stroke="currentColor" strokeWidth="6" fill="transparent"
                    className={`${readinessScore >= 80 ? 'text-lime-400' : readinessScore >= 55 ? 'text-amber-400' : 'text-rose-400'} transition-all duration-700`}
                    strokeDasharray={2 * Math.PI * 26}
                    strokeDashoffset={2 * Math.PI * 26 * (1 - readinessScore / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute font-mono font-black text-sm text-white">
                  {readinessScore}%
                </span>
              </div>

              <div>
                <div className="text-xs font-extrabold text-white mb-0.5">
                  Readiness: <span className={readinessStatus.color}>{readinessScore}/100</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {readinessStatus.note}
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${readinessScore >= 80 ? 'bg-lime-400' : readinessScore >= 55 ? 'bg-amber-400' : 'bg-rose-400'}`}
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>

          {/* Daily Check-in Form Card (Expandable or always visible on desktop) */}
          {(showCheckin || true) && (
            <div className={`bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-sm transition-all ${
              !showCheckin ? 'hidden lg:block' : 'block'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-lime-400">
                  Daily Recovery Status
                </h3>
                <span className="text-[11px] text-slate-400">Updates envelope</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Sleep</label>
                  <select
                    aria-label="Sleep"
                    value={reading.sleep}
                    onChange={e => setReading({ ...reading, sleep: e.target.value as any })}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:border-lime-400 outline-none"
                  >
                    <option value="poor">🥱 Poor</option>
                    <option value="ok">🙂 OK</option>
                    <option value="good">⚡ Good</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Energy</label>
                  <select
                    aria-label="Energy"
                    value={reading.energy}
                    onChange={e => setReading({ ...reading, energy: Number(e.target.value) as any })}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:border-lime-400 outline-none"
                  >
                    <option value="1">1 - Low</option>
                    <option value="2">2 - Mid</option>
                    <option value="3">3 - High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">Soreness</label>
                  <select
                    aria-label="Soreness"
                    value={reading.soreness}
                    onChange={e => setReading({ ...reading, soreness: e.target.value as any })}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:border-lime-400 outline-none"
                  >
                    <option value="none">None</option>
                    <option value="some">Some</option>
                    <option value="pain">Pain</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  submitReading(reading);
                  setShowCheckin(false);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold py-2.5 rounded-xl text-xs transition-colors border border-slate-700/80 flex items-center justify-center gap-1.5"
              >
                <span>⚡ Recalculate Envelope</span>
              </button>
            </div>
          )}

          {/* Plan B Obstacles Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Plan B (Obstacles)
              </h3>
              <span className="text-[10px] text-slate-400">One-tap adapt</span>
            </div>
            
            <p className="text-[11px] text-slate-400 mb-3">
              Encountered friction? Don't break the streak—pivot your session volume immediately.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'tired', label: '🥱 Tired / Fatigued' },
                { id: 'sore', label: '⚡ Sore Muscles' },
                { id: 'short on time', label: '⏱️ Low Time (15m)' },
                { id: 'rain', label: '🌧️ Bad Weather' }
              ].map(obs => (
                <button 
                  key={obs.id} 
                  onClick={() => applyPlanB(obs.id, reading)} 
                  className="bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left"
                >
                  {obs.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Drill Detail Inspect Modal */}
      {activeDrillModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/20">
                  Drill Guide
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  {activeDrillModal.info?.name || activeDrillModal.drill_id}
                </h3>
              </div>
              <button 
                onClick={() => setActiveDrillModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <span className="text-slate-400 font-bold block mb-1">Focus Cue:</span>
                <span className="text-lime-300 font-semibold text-sm italic">
                  "{activeDrillModal.cue}"
                </span>
              </div>

              {activeDrillModal.info && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <span className="text-slate-500 block mb-0.5">Intensity</span>
                    <span className="font-extrabold text-white text-sm">
                      Level {activeDrillModal.info.intensity}/3
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                    <span className="text-slate-500 block mb-0.5">Duration</span>
                    <span className="font-extrabold text-lime-400 text-sm">
                      {activeDrillModal.minutes} Minutes
                    </span>
                  </div>
                </div>
              )}

              {activeDrillModal.info?.tags && (
                <div>
                  <span className="text-slate-400 block mb-1 font-bold">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDrillModal.info.tags.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveDrillModal(null)}
              className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
