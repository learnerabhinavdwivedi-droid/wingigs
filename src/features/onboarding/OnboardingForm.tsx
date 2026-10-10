'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { z } from 'zod';

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<{
    level: 'beginner' | 'intermediate' | 'advanced';
    maxMinutesPerSession: number;
    maxSessionsPerWeek: number;
    sport: string;
    city: string;
  }>({
    level: 'beginner',
    maxMinutesPerSession: 30,
    maxSessionsPerWeek: 3,
    sport: 'badminton',
    city: 'Seattle'
  });
  
  const [baselineTask, setBaselineTask] = useState<string | null>(null);
  const [baselineResult, setBaselineResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartTraining = async () => {
    setLoading(true);
    await saveProfile({
      level: profile.level,
      maxMinutesPerSession: profile.maxMinutesPerSession,
      maxSessionsPerWeek: profile.maxSessionsPerWeek,
      sport: profile.sport,
      city: profile.city || 'Seattle',
      baselineResult: baselineResult || 'Initial baseline completed'
    });
    router.push('/today');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Model picks a baseline test
      const res = await callModel({
        prompt: `The user is a ${profile.level} at ${profile.sport} in ${profile.city}. Give them ONE simple 5-minute baseline physical test to do right now to gauge their fitness. Format as JSON: { "test": "description" }`,
        tier: 'hosted',
        tierFn: hostedTier,
        promptVersion: 'v1-baseline',
        schema: z.object({ test: z.string() })
      });
      setBaselineTask(res.test);
      setStep(2);
    } catch (err) {
      // Fallback
      setBaselineTask("Do as many burpees as you can in 1 minute. Write down the number.");
      setStep(2);
    }
    setLoading(false);
  };

  const handleBaselineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile WITH baseline
    await saveProfile({
      ...profile,
      baselineResult
    });
    router.push('/today');
  };

  if (step === 1) {
    return (
      <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4 max-w-sm mx-auto p-4 bg-white rounded shadow text-black">
        <h1 className="text-2xl font-bold mb-4">Welcome to Bahar</h1>
        
        <label>Sport</label>
        <select value={profile.sport} onChange={e => setProfile({...profile, sport: e.target.value})} className="border p-2 rounded">
          <option value="badminton">Badminton</option>
          <option value="running">Running</option>
        </select>
        
        <label>City</label>
        <input type="text" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} className="border p-2 rounded" placeholder="e.g. Seattle" required />

        <label>Level</label>
        <select value={profile.level} onChange={e => setProfile({...profile, level: e.target.value as 'beginner' | 'intermediate' | 'advanced'})} className="border p-2 rounded">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <label>Max minutes per session</label>
        <input type="number" value={profile.maxMinutesPerSession} onChange={e => setProfile({...profile, maxMinutesPerSession: Number(e.target.value)})} className="border p-2 rounded" />

        <button 
          type="button" 
          onClick={handleStartTraining} 
          disabled={loading} 
          className="bg-green-600 text-white font-bold py-3 rounded mt-4 hover:bg-green-700 text-lg"
        >
          {loading ? 'Starting...' : 'Start Training'}
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-gray-100 text-gray-700 font-semibold py-2 rounded text-sm hover:bg-gray-200"
        >
          {loading ? 'Thinking...' : 'Take Baseline Test First'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleBaselineSubmit} className="flex flex-col gap-4 max-w-sm mx-auto p-4 bg-white rounded shadow text-black">
      <h1 className="text-2xl font-bold mb-4">Baseline Test</h1>
      <p className="text-gray-700 italic border-l-4 border-blue-500 pl-4">{baselineTask}</p>
      
      <label className="font-bold mt-4">Your Result</label>
      <input 
        type="text" 
        value={baselineResult} 
        onChange={e => setBaselineResult(e.target.value)} 
        className="border p-2 rounded" 
        placeholder="e.g. 15 reps, felt easy" 
        required 
      />

      <button type="submit" className="bg-green-600 text-white font-bold py-3 rounded mt-4 hover:bg-green-700 text-lg">
        Start Training
      </button>
    </form>
  );
}
