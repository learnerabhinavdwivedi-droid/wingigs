'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDayEngine } from '../../features/day-engine/useDayEngine';
import { useOutsideEngine } from '../../features/outside-mode/useOutsideEngine';
import { useRouter } from 'next/navigation';
import { getDayKey } from '../../domain/time/day_key';
import { saveCheckin } from '../../data/local/queries';
import Link from 'next/link';
import drillsData from '../../data/drills/badminton.json';

export default function OutsidePage() {
  const router = useRouter();
  const { plan, state: engineState } = useDayEngine();
  const {
    state, currentBlock, elapsedFormatted, remainingFormatted, progressPercent,
    start, pause, resume, handleNext
  } = useOutsideEngine(plan);

  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [showDrillList, setShowDrillList] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (engineState === 'no_profile') {
      router.push('/onboarding');
    }
  }, [engineState, router]);

  // Request WakeLock to prevent screen from turning off during outdoor drills
  useEffect(() => {
    async function requestWakeLock() {
      if ('wakeLock' in navigator && state === 'running') {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
        } catch (err) {
          console.warn('WakeLock could not be acquired:', err);
        }
      }
    }

    if (state === 'running') {
      requestWakeLock();
    } else if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [state]);

  const finishWorkout = async () => {
    if (plan) {
      const totalMin = plan.blocks.reduce((acc, block) => acc + block.minutes, 0);
      await saveCheckin({
        dayKey: getDayKey(),
        completed: true,
        minutes: totalMin
      });
      router.push('/progress');
    }
  };

  if (!plan) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-lime-500/20" />
        <div className="text-slate-400 font-extrabold text-sm tracking-tight">Initializing court session...</div>
      </main>
    );
  }

  if (state === 'done') {
    const totalMinutes = plan.blocks.reduce((acc, b) => acc + b.minutes, 0);
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center text-white p-6 sm:p-10 text-center">
        <div className="w-24 h-24 bg-lime-400/15 text-lime-400 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-2xl shadow-lime-500/30 border border-lime-400/30 animate-bounce">
          🏆
        </div>
        
        <span className="text-xs font-black uppercase tracking-widest text-lime-400 mb-2">
          Session Complete
        </span>
        <h1 className="text-4xl sm:text-6xl font-black mb-3 tracking-tight text-white">
          Done!
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-md leading-relaxed">
          Completed <strong className="text-lime-400 font-black">{totalMinutes} active minutes</strong> across {plan.blocks.length} structured court drills.
        </p>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 w-full max-w-md mb-8 grid grid-cols-3 divide-x divide-slate-800 text-center shadow-xl">
          <div className="px-2">
            <div className="text-2xl sm:text-3xl font-black text-white">{plan.blocks.length}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Drills</div>
          </div>
          <div className="px-2">
            <div className="text-2xl sm:text-3xl font-black text-lime-400">+{totalMinutes}m</div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Court Time</div>
          </div>
          <div className="px-2">
            <div className="text-2xl sm:text-3xl font-black text-sky-400">🔥 +1</div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Momentum</div>
          </div>
        </div>

        <button 
          onClick={finishWorkout} 
          className="w-full max-w-md bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-lg sm:text-xl shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all"
        >
          Save & Return &rarr;
        </button>
      </main>
    );
  }

  const drillMap = new Map(drillsData.drills.map(d => [d.id, d.name]));
  const currentDrillName = currentBlock ? (drillMap.get(currentBlock.drill_id) || currentBlock.drill_id) : '';

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-10 selection:bg-lime-400 selection:text-slate-950">
      
      {/* Top Header / Mode Indicators */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
        <Link 
          href="/today" 
          className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 transition-colors"
        >
          &larr; Exit Session
        </Link>
        
        <div className="flex items-center gap-2">
          {wakeLockActive && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-sky-400 hidden sm:inline">
              ☀️ Screen Awake
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            Audio Coach On
          </span>
          <button
            onClick={() => setShowDrillList(!showDrillList)}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            📋 Circuit ({plan.blocks.length})
          </button>
        </div>
      </div>

      {/* Main Responsive Workout Container */}
      <div className="w-full max-w-4xl mx-auto my-auto py-6 flex flex-col lg:flex-row items-center justify-around gap-8">
        
        {/* Drill Info Card */}
        <div className="w-full max-w-md text-center lg:text-left flex flex-col items-center lg:items-start">
          <span className="text-xs font-black tracking-widest uppercase text-lime-400 bg-lime-400/10 border border-lime-400/20 px-3 py-1 rounded-full">
            Current Drill
          </span>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-4 mb-3">
            {currentDrillName}
          </h1>
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 w-full text-slate-300 text-sm sm:text-base leading-relaxed italic">
            "{currentBlock?.cue}"
          </div>

          <div className="flex items-center gap-3 mt-4 text-xs font-semibold text-slate-400">
            <span>Duration: <strong className="text-white">{currentBlock?.minutes}m</strong></span>
            <span>•</span>
            <span>Elapsed: <strong className="text-lime-400">{elapsedFormatted}</strong></span>
          </div>
        </div>

        {/* High-visibility Responsive Timer Circle */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle 
              cx="50%" cy="50%" r="42%" 
              stroke="currentColor" 
              strokeWidth="10" 
              fill="transparent" 
              className="text-slate-800/80" 
            />
            <circle 
              cx="50%" cy="50%" r="42%" 
              stroke="currentColor" 
              strokeWidth="10" 
              fill="transparent" 
              className="text-lime-400 transition-all duration-500 ease-linear shadow-[0_0_15px_rgba(132,204,22,0.4)]"
              strokeDasharray={2 * Math.PI * 135}
              strokeDashoffset={2 * Math.PI * 135 * (1 - progressPercent / 100)}
              strokeLinecap="round"
            />
          </svg>

          <div className="flex flex-col items-center z-10 text-center select-none">
            <span className="text-6xl sm:text-7xl font-black tracking-tighter font-mono text-white">
              {remainingFormatted}
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">
              Remaining
            </span>
          </div>
        </div>

      </div>

      {/* Controls Container */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-3 pb-6">
        {state === 'idle' && (
          <button 
            onClick={start} 
            className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 py-4 sm:py-5 rounded-2xl font-black text-xl shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all"
          >
            Start Workout &rarr;
          </button>
        )}
        
        {state === 'running' && (
          <button 
            onClick={pause} 
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 py-4 sm:py-5 rounded-2xl font-black text-xl shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all"
          >
            Pause
          </button>
        )}

        {state === 'paused' && (
          <button 
            onClick={resume} 
            className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 py-4 sm:py-5 rounded-2xl font-black text-xl shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all"
          >
            Resume Drill
          </button>
        )}

        {['running', 'paused'].includes(state) && (
          <button 
            onClick={handleNext} 
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.99] transition-all"
          >
            Skip to Next &rarr;
          </button>
        )}
      </div>

      {/* Circuit Drawer / Modal */}
      {showDrillList && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h3 className="font-black text-lg">Today's Circuit Drills</h3>
              <button 
                onClick={() => setShowDrillList(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {plan.blocks.map((b, idx) => {
                const name = drillMap.get(b.drill_id) || b.drill_id;
                const isCurrent = currentBlock?.drill_id === b.drill_id;
                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      isCurrent 
                        ? 'bg-lime-400/10 border-lime-400 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] ${
                        isCurrent ? 'bg-lime-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span>{name}</span>
                    </div>
                    <span className={isCurrent ? 'text-lime-400 font-black' : ''}>{b.minutes}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
