'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDayEngine } from '../../features/day-engine/useDayEngine';
import { useOutsideEngine } from '../../features/outside-mode/useOutsideEngine';
import { useRouter } from 'next/navigation';
import { getDayKey } from '../../domain/time/day_key';
import { saveCheckin } from '../../data/local/queries';
import Link from 'next/link';
import drillsData from '../../data/drills/badminton.json';
import { ConfettiCelebration } from '../../components/ConfettiCelebration';

export default function OutsidePage() {
  const router = useRouter();
  const { plan, state: engineState } = useDayEngine();
  const {
    state, blockIndex, currentBlock, elapsedFormatted, remainingFormatted, progressPercent,
    start, pause, resume, handleNext
  } = useOutsideEngine(plan);

  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [showDrillList, setShowDrillList] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [audioCoachEnabled, setAudioCoachEnabled] = useState(true);
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
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-lime-500 dark:border-lime-400 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-lime-500/20" />
        <div className="font-jersey text-slate-600 dark:text-slate-400 text-sm tracking-wide">Initializing court session...</div>
      </main>
    );
  }

  if (state === 'done') {
    const totalMinutes = plan.blocks.reduce((acc, b) => acc + b.minutes, 0);

    const handleShareWorkout = () => {
      const text = `🏸 Crushed today's session on Bahar! ${totalMinutes} active court minutes logged across ${plan.blocks.length} drills. Building unstoppable momentum! 🔥`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    };

    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 flex flex-col items-center justify-center text-slate-900 dark:text-white p-6 sm:p-10 text-center relative overflow-hidden">
        <ConfettiCelebration />

        <div className="w-24 h-24 bg-lime-500/15 dark:bg-lime-400/15 text-lime-600 dark:text-lime-400 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-2xl shadow-lime-500/30 border border-lime-500/30 dark:border-lime-400/30 animate-bounce relative z-10">
          🏆
        </div>
        
        <span className="font-jersey text-xs tracking-wider uppercase text-lime-600 dark:text-lime-400 mb-2 relative z-10">
          Session Complete
        </span>
        <h1 className="font-jersey text-4xl sm:text-6xl mb-3 tracking-wide text-slate-900 dark:text-white relative z-10">
          Done!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-8 max-w-md leading-relaxed relative z-10 font-medium">
          Completed <strong className="text-lime-600 dark:text-lime-400 font-bold">{totalMinutes} active minutes</strong> across {plan.blocks.length} structured court drills.
        </p>

        <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 w-full max-w-md mb-6 grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 text-center shadow-lg dark:shadow-xl relative z-10">
          <div className="px-2">
            <div className="font-jersey text-2xl sm:text-3xl text-slate-900 dark:text-white">{plan.blocks.length}</div>
            <div className="font-jersey text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 tracking-wider mt-1">Drills</div>
          </div>
          <div className="px-2">
            <div className="font-jersey text-2xl sm:text-3xl text-lime-600 dark:text-lime-400">+{totalMinutes}m</div>
            <div className="font-jersey text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 tracking-wider mt-1">Court Time</div>
          </div>
          <div className="px-2">
            <div className="font-jersey text-2xl sm:text-3xl text-sky-600 dark:text-sky-400">🔥 +1</div>
            <div className="font-jersey text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 tracking-wider mt-1">Momentum</div>
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col gap-3 relative z-10">
          <button 
            onClick={finishWorkout} 
            className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-jersey text-xl sm:text-2xl px-8 py-4 rounded-2xl shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all"
          >
            Save & Return &rarr;
          </button>

          <button
            type="button"
            onClick={handleShareWorkout}
            className="w-full bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-jersey py-3 px-6 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span>{copiedShare ? '✅ Copied to Clipboard!' : '📤 Share Workout Accomplishment'}</span>
          </button>
        </div>
      </main>
    );
  }

  const drillMap = new Map(drillsData.drills.map(d => [d.id, d.name]));
  const currentDrillName = currentBlock ? (drillMap.get(currentBlock.drill_id) || currentBlock.drill_id) : '';

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between p-4 sm:p-6 lg:p-10 selection:bg-lime-400 selection:text-slate-950">
      
      {/* Top Header / Mode Indicators */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-2">
        <Link 
          href="/today" 
          className="font-jersey text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
        >
          &larr; Exit Session
        </Link>
        
        <div className="flex items-center gap-2">
          {wakeLockActive && (
            <span className="font-jersey text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 hidden sm:inline shadow-sm">
              ☀️ Screen Awake
            </span>
          )}
          <button
            type="button"
            onClick={() => setAudioCoachEnabled(!audioCoachEnabled)}
            className={`flex items-center gap-1.5 font-jersey text-xs px-3 py-1.5 rounded-full transition-all border shadow-sm ${
              audioCoachEnabled
                ? 'bg-lime-500/10 dark:bg-lime-400/10 border-lime-500/30 dark:border-lime-400/20 text-lime-600 dark:text-lime-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Toggle Audio Cues & Whistle"
          >
            <span className={`w-2 h-2 rounded-full ${audioCoachEnabled ? 'bg-lime-500 dark:bg-lime-400 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
            <span>{audioCoachEnabled ? 'Audio Coach On' : 'Audio Muted'}</span>
          </button>
          <button
            onClick={() => setShowDrillList(!showDrillList)}
            className="font-jersey text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          >
            📋 Circuit ({plan.blocks.length})
          </button>
        </div>
      </div>

      {/* Main Responsive Workout Container */}
      <div className="w-full max-w-4xl mx-auto my-auto py-6 flex flex-col lg:flex-row items-center justify-around gap-8">
        
        {/* Drill Info Card */}
        <div className="w-full max-w-md text-center lg:text-left flex flex-col items-center lg:items-start">
          
          {/* Circuit Stepper Track */}
          <div className="flex items-center gap-2 mb-3 bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 px-3.5 py-1.5 rounded-full shadow-sm">
            <div className="flex items-center gap-1.5">
              {plan.blocks.map((_, idx) => {
                const isPast = (blockIndex ?? 0) > idx;
                const isCurrent = (blockIndex ?? 0) === idx;
                return (
                  <span
                    key={idx}
                    className={`transition-all rounded-full ${
                      isCurrent
                        ? 'w-5 h-2 bg-lime-500 dark:bg-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.9)]'
                        : isPast
                          ? 'w-2 h-2 bg-lime-600/60 dark:bg-lime-500/60'
                          : 'w-2 h-2 bg-slate-300 dark:bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            <span className="font-jersey text-[11px] tracking-wider text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-2">
              Drill {(blockIndex ?? 0) + 1} of {plan.blocks.length}
            </span>
          </div>

          <span className="font-jersey text-xs tracking-wider uppercase text-lime-600 dark:text-lime-400 bg-lime-500/10 dark:bg-lime-400/10 border border-lime-500/20 dark:border-lime-400/20 px-3 py-1 rounded-full">
            Current Drill
          </span>
          
          <h1 className="font-jersey text-3xl sm:text-5xl tracking-wide text-slate-900 dark:text-white mt-4 mb-3">
            {currentDrillName}
          </h1>
          
          <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 w-full text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed italic shadow-sm">
            "{currentBlock?.cue}"
          </div>

          <div className="font-jersey flex items-center gap-3 mt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Duration: <strong className="text-slate-900 dark:text-white font-bold">{currentBlock?.minutes}m</strong></span>
            <span>•</span>
            <span>Elapsed: <strong className="text-lime-600 dark:text-lime-400 font-bold">{elapsedFormatted}</strong></span>
          </div>
        </div>

        {/* High-visibility Responsive Timer Circle */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center shrink-0">
          {/* Ambient Breathing Neon Halo Glow */}
          {state === 'running' && (
            <div className="absolute inset-2 rounded-full bg-lime-400/15 blur-2xl animate-pulse pointer-events-none" />
          )}

          <svg className={`absolute inset-0 w-full h-full transform -rotate-90 ${state === 'running' ? 'filter drop-shadow-[0_0_20px_rgba(132,204,22,0.35)]' : ''}`}>
            <circle 
              cx="50%" cy="50%" r="42%" 
              stroke="currentColor" 
              strokeWidth="10" 
              fill="transparent" 
              className="text-slate-200 dark:text-slate-800/80" 
            />
            <circle 
              cx="50%" cy="50%" r="42%" 
              stroke="currentColor" 
              strokeWidth="10" 
              fill="transparent" 
              className="text-lime-500 dark:text-lime-400 transition-all duration-500 ease-linear shadow-[0_0_15px_rgba(132,204,22,0.4)]"
              strokeDasharray={2 * Math.PI * 135}
              strokeDashoffset={2 * Math.PI * 135 * (1 - progressPercent / 100)}
              strokeLinecap="round"
            />
          </svg>

          <div className="flex flex-col items-center z-10 text-center select-none">
            <span className="font-jersey text-6xl sm:text-7xl font-bold tracking-wider text-slate-900 dark:text-white">
              {remainingFormatted}
            </span>
            <span className="font-jersey text-xs tracking-widest text-slate-500 dark:text-slate-400 mt-2">
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
            className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 py-4 sm:py-5 rounded-2xl font-jersey text-2xl shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all"
          >
            Start Workout &rarr;
          </button>
        )}
        
        {state === 'running' && (
          <button 
            onClick={pause} 
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 py-4 sm:py-5 rounded-2xl font-jersey text-2xl shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all"
          >
            Pause
          </button>
        )}

        {state === 'paused' && (
          <button 
            onClick={resume} 
            className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 py-4 sm:py-5 rounded-2xl font-jersey text-2xl shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all"
          >
            Resume Drill
          </button>
        )}

        {['running', 'paused'].includes(state) && (
          <button 
            onClick={handleNext} 
            className="w-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-3.5 rounded-2xl font-jersey text-base active:scale-[0.99] transition-all shadow-sm"
          >
            Skip to Next &rarr;
          </button>
        )}
      </div>

      {/* Circuit Drawer / Modal */}
      {showDrillList && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-900 dark:text-white shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-jersey text-xl tracking-wide">Today's Circuit Drills</h3>
              <button 
                onClick={() => setShowDrillList(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white flex items-center justify-center font-bold"
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
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-jersey ${
                      isCurrent 
                        ? 'bg-lime-500/10 dark:bg-lime-400/10 border-lime-500 dark:border-lime-400 text-slate-900 dark:text-white font-bold'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                        isCurrent ? 'bg-lime-500 dark:bg-lime-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span>{name}</span>
                    </div>
                    <span className={isCurrent ? 'text-lime-600 dark:text-lime-400 font-bold' : ''}>{b.minutes}m</span>
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
