'use client';

import { useDayEngine } from '../../features/day-engine/useDayEngine';
import { useOutsideEngine } from '../../features/outside-mode/useOutsideEngine';
import { useRouter } from 'next/navigation';
import { getDayKey } from '../../domain/time/day_key';
import { saveCheckin } from '../../data/local/queries';
import { useEffect } from 'react';
import Link from 'next/link';
import drillsData from '../../data/drills/badminton.json';

export default function OutsidePage() {
  const router = useRouter();
  const { plan, state: engineState } = useDayEngine();
  const {
    state, currentBlock, elapsedFormatted, remainingFormatted, progressPercent,
    start, pause, resume, handleNext
  } = useOutsideEngine(plan);

  useEffect(() => {
    if (engineState === 'no_profile') {
      router.push('/onboarding');
    }
  }, [engineState, router]);

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
      <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-zinc-400 font-semibold text-sm">Loading plan...</div>
      </main>
    );
  }

  if (state === 'done') {
    const totalMinutes = plan.blocks.reduce((acc, b) => acc + b.minutes, 0);
    return (
      <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-emerald-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-emerald-500/30 border border-emerald-500/30 animate-bounce">
          🏆
        </div>
        
        <h1 className="text-5xl font-black mb-3 tracking-tight text-white">Done!</h1>
        <p className="text-lg text-emerald-200/90 mb-8 max-w-xs leading-relaxed">
          You crushed it today. Total time: <strong className="text-white">{totalMinutes} minutes</strong> across {plan.blocks.length} drills.
        </p>

        <div className="bg-zinc-800/80 border border-zinc-700/80 rounded-2xl p-4 w-full max-w-xs mb-8 flex justify-around text-center">
          <div>
            <div className="text-2xl font-black text-white">{plan.blocks.length}</div>
            <div className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Drills</div>
          </div>
          <div className="w-px bg-zinc-700" />
          <div>
            <div className="text-2xl font-black text-emerald-400">+{totalMinutes}m</div>
            <div className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Court Time</div>
          </div>
          <div className="w-px bg-zinc-700" />
          <div>
            <div className="text-2xl font-black text-blue-400">🔥 +1</div>
            <div className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">Streak</div>
          </div>
        </div>

        <button 
          onClick={finishWorkout} 
          className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-8 py-4 rounded-2xl text-xl shadow-xl shadow-emerald-500/25 active:scale-[0.99] transition-all"
        >
          Save & Return
        </button>
      </main>
    );
  }

  const drillMap = new Map(drillsData.drills.map(d => [d.id, d.name]));
  const currentDrillName = currentBlock ? (drillMap.get(currentBlock.drill_id) || currentBlock.drill_id) : '';

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-between p-6 selection:bg-blue-600">
      {/* Top Header / Mode Indicators */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <Link 
          href="/today" 
          className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800"
        >
          &larr; Exit
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Audio Coach On
          </span>
        </div>
      </div>

      {/* Drill Info */}
      <div className="w-full max-w-md text-center py-6">
        <span className="text-xs font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
          Current Drill
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-4 mb-2">
          {currentDrillName}
        </h1>
        <p className="text-sm text-zinc-400 italic max-w-xs mx-auto">
          "{currentBlock?.cue}"
        </p>
      </div>

      {/* High-visibility Timer Circle */}
      <div className="relative w-72 h-72 flex items-center justify-center my-4">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle 
            cx="144" cy="144" r="130" 
            stroke="currentColor" 
            strokeWidth="10" 
            fill="transparent" 
            className="text-zinc-800" 
          />
          <circle 
            cx="144" cy="144" r="130" 
            stroke="currentColor" 
            strokeWidth="10" 
            fill="transparent" 
            className="text-blue-500 transition-all duration-500 ease-linear"
            strokeDasharray={2 * Math.PI * 130}
            strokeDashoffset={2 * Math.PI * 130 * (1 - progressPercent / 100)}
            strokeLinecap="round"
          />
        </svg>

        <div className="flex flex-col items-center z-10 text-center select-none">
          <span className="text-6xl font-black tracking-tighter font-mono text-white">
            {remainingFormatted}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">
            remaining
          </span>
          <span className="text-[11px] text-zinc-500 font-medium mt-1">
            Elapsed: {elapsedFormatted}
          </span>
        </div>
      </div>

      {/* Controls Container */}
      <div className="w-full max-w-md flex flex-col gap-3 pb-6">
        {state === 'idle' && (
          <button 
            onClick={start} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xl shadow-xl shadow-blue-600/30 active:scale-[0.99] transition-all"
          >
            Start Workout
          </button>
        )}
        
        {state === 'running' && (
          <button 
            onClick={pause} 
            className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-4 rounded-2xl font-black text-xl shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all"
          >
            Pause
          </button>
        )}

        {state === 'paused' && (
          <button 
            onClick={resume} 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 py-4 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/20 active:scale-[0.99] transition-all"
          >
            Resume
          </button>
        )}

        {['running', 'paused'].includes(state) && (
          <button 
            onClick={handleNext} 
            className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-200 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.99] transition-all"
          >
            Skip to Next &rarr;
          </button>
        )}
      </div>
    </main>
  );
}
