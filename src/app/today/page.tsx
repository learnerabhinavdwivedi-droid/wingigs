'use client';

import { useState, useEffect } from 'react';
import { useDayEngine } from '../../features/day-engine/useDayEngine';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Reading } from '../../domain/schemas/plan';
import drillsData from '../../data/drills/badminton.json';

export default function TodayPage() {
  const { state, plan, profile, envelope, submitReading, applyPlanB } = useDayEngine();
  const router = useRouter();
  const [showCheckin, setShowCheckin] = useState(false);
  
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

  if (state === 'loading') {
    return (
      <main className="p-8 max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center text-slate-600">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm">Loading your training envelope...</p>
      </main>
    );
  }
  
  if (state === 'generating') {
    return (
      <main className="p-8 max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center text-slate-800 text-center">
        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl animate-bounce mb-4 shadow-sm">
          🏸
        </div>
        <h2 className="text-xl font-black mb-1">Generating Today's Plan</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          Balancing court volume, intensity cap, and current recovery status...
        </p>
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className="p-8 max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-6">Could not build today's plan.</p>
        <button 
          onClick={() => submitReading(reading)}
          className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
        >
          Try Again
        </button>
      </main>
    );
  }

  const drillMap = new Map(drillsData.drills.map(d => [d.id, d]));

  return (
    <main className="p-4 sm:p-6 max-w-lg mx-auto min-h-screen text-slate-900 flex flex-col">
      {/* Header bar */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
              {profile?.sport || 'Badminton'} • {profile?.level || 'Beginner'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Today's Plan
          </h1>
        </div>

        <button
          onClick={() => setShowCheckin(!showCheckin)}
          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-sm text-slate-700 transition-all flex items-center gap-1.5"
        >
          <span>{showCheckin ? '✕ Close' : '⚡ Check-in'}</span>
        </button>
      </div>

      {/* Weather / Envelope Info Banner */}
      {envelope && (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-base">{envelope.allow_outdoor ? '🌤️' : '🏠'}</span>
            <div>
              <span className="font-bold">{envelope.allow_outdoor ? 'Outdoor Friendly' : 'Indoor Protected'}</span>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="capitalize text-slate-600">{envelope.mode} Mode</span>
            </div>
          </div>
          <div className="font-extrabold text-blue-700 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200/50">
            Max Int. {envelope.max_intensity}/3
          </div>
        </div>
      )}

      {/* Expandable Daily Check-in Form */}
      {showCheckin && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-5 transition-all">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Adjust Today's Inputs
            </h2>
            <span className="text-xs text-slate-400">Updates envelope</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Sleep</label>
              <select
                aria-label="Sleep"
                value={reading.sleep}
                onChange={e => setReading({ ...reading, sleep: e.target.value as any })}
                className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value="poor">🥱 Poor</option>
                <option value="ok">🙂 OK</option>
                <option value="good">⚡ Good</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Energy</label>
              <select
                aria-label="Energy"
                value={reading.energy}
                onChange={e => setReading({ ...reading, energy: Number(e.target.value) as any })}
                className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              >
                <option value="1">1 - Low</option>
                <option value="2">2 - Mid</option>
                <option value="3">3 - High</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Soreness</label>
              <select
                aria-label="Soreness"
                value={reading.soreness}
                onChange={e => setReading({ ...reading, soreness: e.target.value as any })}
                className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
          >
            Recalculate Plan &rarr;
          </button>
        </div>
      )}
      
      {plan && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col flex-1">
          {/* Plan Header */}
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
              {plan.headline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 italic">
              {plan.why_this_plan}
            </p>
          </div>

          {/* Coach Advice Card */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 mb-4 text-xs flex gap-2.5 items-start">
            <span className="text-base leading-none">💡</span>
            <div>
              <strong className="text-amber-900 font-bold block mb-0.5">Coach Cue:</strong>
              <span className="text-amber-800 leading-relaxed">{plan.advice}</span>
            </div>
          </div>

          {/* Drill Blocks List */}
          <div className="flex-1 overflow-y-auto mb-4 pr-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Workout Blocks ({plan.blocks.length})
            </div>

            <ul className="space-y-2.5">
              {plan.blocks.map((block, idx) => {
                const info = drillMap.get(block.drill_id);
                return (
                  <li 
                    key={idx} 
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center font-black text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-800">
                          {info ? info.name : block.drill_id}
                        </div>
                        <div className="text-xs text-slate-500 italic mt-0.5">
                          "{block.cue}"
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-black text-sm text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {block.minutes} min
                      </span>
                      {info && (
                        <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Int. {info.intensity}/3
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Plan B Obstacles */}
          <div className="mb-5 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Plan B (Obstacles)
              </h3>
              <span className="text-[10px] text-slate-400">One-tap adapt</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'tired', label: '🥱 Tired' },
                { id: 'sore', label: '⚡ Sore' },
                { id: 'short on time', label: '⏱️ Low Time' },
                { id: 'rain', label: '🌧️ Bad Weather' }
              ].map(obs => (
                <button 
                  key={obs.id} 
                  onClick={() => applyPlanB(obs.id, reading)} 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  {obs.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Start Workout Primary Action */}
          <button 
            onClick={() => router.push('/outside')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl text-lg shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Start Workout</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}
    </main>
  );
}
