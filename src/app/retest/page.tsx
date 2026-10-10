'use client';

import { useState, useEffect } from 'react';
import { getProfile, saveProfile } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { z } from 'zod';
import { UserProfile } from '../../data/local/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RetestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newResult, setNewResult] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then(p => {
      if (!p) router.push('/onboarding');
      else setProfile(p);
    });
  }, [router]);

  const handleRetest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    
    try {
      const prompt = `
        The user is doing their 30-day retest.
        Sport: ${profile.sport}.
        Old Baseline Result: "${profile.baselineResult}"
        New Retest Result: "${newResult}"
        
        Write a very short, honest summary comparing the two. Be blunt. If there is no improvement, say so.
        Format as JSON: { "summary": "string" }
      `;

      const res = await callModel({
        prompt,
        tier: 'hosted',
        tierFn: hostedTier,
        promptVersion: 'v1-retest',
        schema: z.object({ summary: z.string() })
      });

      setSummary(res.summary);
      
      // Update profile with new baseline
      await saveProfile({
        ...profile,
        baselineResult: newResult
      });
      
    } catch (err) {
      console.error(err);
      setSummary("Error comparing results, but your new baseline has been saved.");
    }
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-gray-50 text-black p-8 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Retest</h1>
        <Link href="/progress" className="text-blue-600 font-bold hover:underline">
          &larr; Back
        </Link>
      </div>

      {!summary ? (
        <form onSubmit={handleRetest} className="bg-white p-6 rounded shadow">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase">Old Baseline</h2>
            <div className="mt-2 text-lg italic text-gray-700 bg-gray-100 p-3 rounded">
              "{profile.baselineResult}"
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase">New Result</h2>
            <input 
              type="text" 
              value={newResult} 
              onChange={e => setNewResult(e.target.value)} 
              className="mt-2 border p-3 w-full rounded text-lg" 
              placeholder="e.g. 25 reps, felt great" 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded hover:bg-blue-700">
            {loading ? 'Analyzing...' : 'Submit Retest'}
          </button>
        </form>
      ) : (
        <div className="bg-white p-6 rounded shadow border-t-4 border-blue-600">
          <h2 className="text-xl font-bold mb-4">Coach's Verdict</h2>
          <p className="text-lg leading-relaxed mb-6">{summary}</p>
          <div className="flex gap-4">
             <div className="flex-1 bg-gray-100 p-3 rounded">
               <div className="text-xs text-gray-500 font-bold uppercase mb-1">Before</div>
               <div>{profile.baselineResult}</div>
             </div>
             <div className="flex-1 bg-blue-50 p-3 rounded border border-blue-100">
               <div className="text-xs text-blue-500 font-bold uppercase mb-1">After</div>
               <div>{newResult}</div>
             </div>
          </div>
          <button onClick={() => router.push('/progress')} className="mt-8 w-full bg-gray-200 text-black font-bold py-3 rounded">
            Back to Progress
          </button>
        </div>
      )}
    </main>
  );
}
