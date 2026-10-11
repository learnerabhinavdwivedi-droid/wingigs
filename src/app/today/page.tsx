'use client';

import React, { useState, useEffect } from 'react';
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
  
  // State for Reading
  const [reading, setReading] = useState<Reading>({
    sleep: 'ok',
    energy: 2,
    soreness: 'none',
    time: 30,
    place: 'gym',
    flags: []
  });

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
