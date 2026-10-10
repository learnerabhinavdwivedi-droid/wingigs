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
  
  // Format screen time
  const screenMins = Math.floor(totalScreenSeconds / 60);

  return (
    <main className="min-h-screen bg-gray-50 text-black p-8 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <Link href="/today" className="text-blue-600 font-bold hover:underline">
          &larr; Today
        </Link>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-500 uppercase tracking-wider mb-2">Momentum Streak</h2>
        <div className="text-6xl font-black text-blue-600">{momentum}</div>
        <div className="text-gray-400 mt-2 text-sm">Active days in a row (with free skips)</div>
      </div>

      {/* Screen vs Outdoor Card - REQUIRED BY SPEC */}
      <div className="bg-zinc-900 text-white p-6 rounded shadow mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wider mb-4 text-zinc-400">Screen vs Outdoor</h2>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-3xl font-black text-red-400">{screenMins}</div>
            <div className="text-xs text-zinc-500 mt-1">Screen Mins</div>
          </div>
          <div className="text-2xl font-black text-zinc-700">VS</div>
          <div className="text-center">
            <div className="text-3xl font-black text-green-400">{totalOutdoorMinutes}</div>
            <div className="text-xs text-zinc-500 mt-1">Outdoor Mins</div>
          </div>
        </div>
        {totalOutdoorMinutes > screenMins ? (
          <div className="mt-4 text-center text-sm text-green-300">You are beating the screen!</div>
        ) : (
          <div className="mt-4 text-center text-sm text-red-300">The screen is winning. Get outside!</div>
        )}
      </div>

      <h3 className="font-bold text-xl mb-4">History</h3>
      <div className="space-y-4">
        {checkins.filter(c => c.completed).map(c => (
          <div key={c.dayKey} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-bold">{c.dayKey}</span>
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded">
                Completed
              </span>
            </div>
            <div className="text-blue-600 font-bold">{c.minutes} min</div>
          </div>
        ))}
        {checkins.filter(c => c.completed).length === 0 && (
          <div className="text-gray-500 text-center">No completed workouts yet.</div>
        )}
      </div>
      
      <div className="mt-8">
        <Link href="/week" className="block text-center bg-purple-100 text-purple-700 font-bold py-4 rounded hover:bg-purple-200">
          Sunday Review &rarr;
        </Link>
      </div>
    </main>
  );
}
