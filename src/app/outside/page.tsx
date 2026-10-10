'use client';

import { useDayEngine } from '../../features/day-engine/useDayEngine';
import { useOutsideEngine } from '../../features/outside-mode/useOutsideEngine';
import { useRouter } from 'next/navigation';
import { getDayKey } from '../../domain/time/day_key';
import { saveCheckin } from '../../data/local/queries';
import { useEffect } from 'react';
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
    return <div className="p-8 text-black">Loading plan...</div>;
  }

  if (state === 'done') {
    return (
      <main className="min-h-screen bg-green-50 flex flex-col items-center justify-center text-black p-4">
        <h1 className="text-4xl font-bold mb-4 text-green-800">Done!</h1>
        <p className="mb-8">You crushed it today.</p>
        <button onClick={finishWorkout} className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-green-700">
          Save & Return
        </button>
      </main>
    );
  }

  const drillMap = new Map(drillsData.drills.map(d => [d.id, d.name]));
  const currentDrillName = currentBlock ? drillMap.get(currentBlock.drill_id) : '';

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col items-center p-4">
      {/* Top info */}
      <div className="w-full max-w-md pt-8 text-center flex-1">
        <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-2">Current Drill</h2>
        <h1 className="text-4xl font-extrabold mb-4">{currentDrillName}</h1>
        <div className="text-gray-300 italic">{currentBlock?.cue}</div>
      </div>

      {/* Timer Circle / Visualizer */}
      <div className="relative w-64 h-64 flex items-center justify-center my-8">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-700" />
          <circle 
            cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" 
            className="text-blue-500 transition-all duration-500 ease-linear"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progressPercent / 100)}
          />
        </svg>
        <div className="flex flex-col items-center z-10">
          <span className="text-5xl font-mono">{remainingFormatted}</span>
          <span className="text-gray-400 text-sm">remaining</span>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md flex flex-col gap-4 pb-12">
        {state === 'idle' && (
          <button onClick={start} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl active:bg-blue-700">
            Start Workout
          </button>
        )}
        
        {state === 'running' && (
          <button onClick={pause} className="w-full bg-yellow-600 text-white py-4 rounded-xl font-bold text-xl active:bg-yellow-700">
            Pause
          </button>
        )}

        {state === 'paused' && (
          <button onClick={resume} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-xl active:bg-green-700">
            Resume
          </button>
        )}

        {['running', 'paused'].includes(state) && (
          <button onClick={handleNext} className="w-full bg-zinc-800 text-gray-300 py-3 rounded-xl font-semibold active:bg-zinc-700">
            Skip to Next
          </button>
        )}
      </div>
    </main>
  );
}
