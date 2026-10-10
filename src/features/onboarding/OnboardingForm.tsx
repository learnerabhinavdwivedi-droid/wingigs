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
      setBaselineTask("Do as many burpees or shadow footwork reps as you can in 1 minute. Record the count.");
      setStep(2);
    }
    setLoading(false);
  };

  const handleBaselineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile WITH baseline
    await saveProfile({
      ...profile,
      baselineResult: baselineResult || 'Baseline submitted'
    });
    router.push('/today');
  };

  if (step === 1) {
    return (
      <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5 text-slate-800">
        <div className="text-center pb-2">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner">
            🏸
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to Bahar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build your personalized, adaptive daily training envelope.
          </p>
        </div>

        {/* Sport selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Primary Sport
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'badminton', name: 'Badminton', icon: '🏸' },
              { id: 'running', name: 'Running', icon: '🏃' },
            ].map(s => (
              <button
                type="button"
                key={s.id}
                onClick={() => setProfile({ ...profile, sport: s.id })}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  profile.sport === s.id
                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                {s.name}
              </button>
            ))}
          </div>
          {/* Hidden select to preserve standard form semantics */}
          <select 
            aria-label="Sport"
            value={profile.sport} 
            onChange={e => setProfile({...profile, sport: e.target.value})} 
            className="hidden"
          >
            <option value="badminton">Badminton</option>
            <option value="running">Running</option>
          </select>
        </div>

        {/* City / Location */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Your City (for Weather & AQI)
          </label>
          <input 
            type="text" 
            value={profile.city} 
            onChange={e => setProfile({...profile, city: e.target.value})} 
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" 
            placeholder="e.g. Seattle, San Francisco, London" 
            required 
          />
        </div>

        {/* Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Experience Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
              <button
                type="button"
                key={lvl}
                onClick={() => setProfile({ ...profile, level: lvl })}
                className={`py-2 px-2 rounded-xl border text-xs font-bold capitalize transition-all ${
                  profile.level === lvl
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <select 
            aria-label="Level"
            value={profile.level} 
            onChange={e => setProfile({...profile, level: e.target.value as 'beginner' | 'intermediate' | 'advanced'})} 
            className="hidden"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Session Minutes */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Session Budget
            </label>
            <span className="text-xs font-extrabold text-blue-600">
              {profile.maxMinutesPerSession} mins
            </span>
          </div>
          <div className="flex gap-2">
            {[15, 30, 45, 60].map(mins => (
              <button
                type="button"
                key={mins}
                onClick={() => setProfile({ ...profile, maxMinutesPerSession: mins })}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                  profile.maxMinutesPerSession === mins
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button 
            type="button" 
            onClick={handleStartTraining} 
            disabled={loading} 
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 text-base shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Training'}
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-200 transition-colors"
          >
            {loading ? 'Analyzing...' : 'Take 5-Min Baseline Test First &rarr;'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleBaselineSubmit} className="flex flex-col gap-5 text-slate-800">
      <div>
        <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full">
          Step 2 of 2
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
          Baseline Test
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Perform this quick benchmark to dial in your starting envelope.
        </p>
      </div>

      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-slate-800">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
          Coach Task
        </div>
        <p className="text-sm font-medium leading-relaxed italic text-slate-700">
          "{baselineTask}"
        </p>
      </div>
      
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Your Result
        </label>
        <input 
          type="text" 
          value={baselineResult} 
          onChange={e => setBaselineResult(e.target.value)} 
          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-semibold" 
          placeholder="e.g. 24 reps in 1 min, felt solid" 
          required 
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-base shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all"
      >
        Start Training
      </button>
    </form>
  );
}
