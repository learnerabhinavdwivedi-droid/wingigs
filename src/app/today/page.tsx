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
    return <div className="p-8">Loading...</div>;
  }
  
  if (state === 'needs_reading') {
    return (
      <main className="p-8 max-w-lg mx-auto bg-gray-50 min-h-screen text-black">
        <h1 className="text-3xl font-bold mb-6">Daily Check-in</h1>
        <div className="space-y-4">
          <div>
            <label className="block font-bold">Sleep</label>
            <select value={reading.sleep} onChange={e => setReading({...reading, sleep: e.target.value as any})} className="border p-2 w-full rounded">
              <option value="poor">Poor</option><option value="ok">OK</option><option value="good">Good</option>
            </select>
          </div>
          <div>
            <label className="block font-bold">Energy (1-3)</label>
            <select value={reading.energy} onChange={e => setReading({...reading, energy: Number(e.target.value) as any})} className="border p-2 w-full rounded">
              <option value="1">1 - Low</option><option value="2">2 - Medium</option><option value="3">3 - High</option>
            </select>
          </div>
          <div>
            <label className="block font-bold">Soreness</label>
            <select value={reading.soreness} onChange={e => setReading({...reading, soreness: e.target.value as any})} className="border p-2 w-full rounded">
              <option value="none">None</option><option value="some">Some</option><option value="pain">Pain</option>
            </select>
          </div>
          <button onClick={() => submitReading(reading)} className="bg-blue-600 text-white w-full py-4 rounded font-bold text-lg">
            Build My Plan
          </button>
        </div>
      </main>
    );
  }

  if (state === 'generating') {
    return <div className="p-8 flex items-center justify-center min-h-screen font-bold text-xl">Generating your plan...</div>;
  }

  if (state === 'error') {
    return <div className="p-8 text-red-500">Something went wrong.</div>;
  }

  const drillMap = new Map(drillsData.drills.map(d => [d.id, d.name]));

  return (
    <main className="p-8 max-w-lg mx-auto bg-gray-50 min-h-screen text-black">
      <div className="flex justify-between items-end mb-4">
        <h1 className="text-3xl font-bold">Today's Plan</h1>
        <Link href="/progress" className="text-blue-600 font-semibold hover:underline text-sm">
          View Progress
        </Link>
      </div>
      
      {plan && (
        <div className="bg-white p-4 rounded shadow flex flex-col h-[65vh]">
          <h2 className="text-2xl font-black">{plan.headline}</h2>
          <p className="text-gray-600 italic mb-4">{plan.why_this_plan}</p>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-sm text-blue-800">
            <strong>Advice:</strong> {plan.advice}
          </div>

          <ul className="space-y-4 mb-6 flex-1 overflow-y-auto pr-2">
            {plan.blocks.map((block, idx) => (
              <li key={idx} className="border-b pb-2 flex justify-between">
                <div>
                  <div className="font-semibold">{drillMap.get(block.drill_id) || block.drill_id}</div>
                  <div className="text-xs text-gray-500">{block.cue}</div>
                </div>
                <div className="font-bold text-blue-600">{block.minutes} min</div>
              </li>
            ))}
          </ul>
          
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Plan B (Obstacles)</h3>
            <div className="flex gap-2 flex-wrap">
              {['tired', 'sore', 'short on time', 'rain'].map(obs => (
                <button key={obs} onClick={() => applyPlanB(obs, reading)} className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">
                  {obs}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/outside')}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-blue-700 mt-auto"
          >
            Start Workout &rarr;
          </button>
        </div>
      )}
    </main>
  );
}
