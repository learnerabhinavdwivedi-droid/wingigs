'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { buildBaselinePrompt } from '../../ai/prompts';
import { z } from 'zod';

function MapPin({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg width="16" height="16" style={{ width: 16, height: 16, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowRight({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function Activity({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg width="20" height="20" style={{ width: 20, height: 20, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function Flame({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg width="14" height="14" style={{ width: 14, height: 14, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function CheckCircle2({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg width="14" height="14" style={{ width: 14, height: 14, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Clock({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg width="14" height="14" style={{ width: 14, height: 14, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function Gauge({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg width="14" height="14" style={{ width: 14, height: 14, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

function Sparkles({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg width="14" height="14" style={{ width: 14, height: 14, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function ShieldCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg width="16" height="16" style={{ width: 16, height: 16, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Dumbbell({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg width="16" height="16" style={{ width: 16, height: 16, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  );
}

function ShuttlecockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg width="18" height="18" style={{ width: 18, height: 18, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M9.5 14.5L5 4l6 2 1-3 1 3 6-2-4.5 10.5" />
      <path d="M7 8h10" />
      <path d="M8.5 11h7" />
    </svg>
  );
}

function RunnerIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg width="18" height="18" style={{ width: 18, height: 18, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="4" r="2" />
      <path d="M18 19l-4-4 2-5-4 1-2-2-4 2" />
      <path d="M9 13l2 4 4 1" />
      <path d="M6 7l3 3" />
    </svg>
  );
}

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
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>('grinder');

  const archetypes = [
    {
      id: 'grinder',
      name: 'Daily Grinder',
      icon: '⚡',
      badge: 'Stamina & Agility',
      sport: 'badminton',
      level: 'intermediate' as const,
      minutes: 30,
      sessions: 4,
      city: 'Seattle',
      tagline: 'High-frequency court footwork & rally reaction'
    },
    {
      id: 'explorer',
      name: 'Court Explorer',
      icon: '🏸',
      badge: 'Fast Start',
      sport: 'badminton',
      level: 'beginner' as const,
      minutes: 15,
      sessions: 3,
      city: 'Seattle',
      tagline: 'Low-friction habit building with basic court positioning'
    },
    {
      id: 'comeback',
      name: 'Comeback / Reset',
      icon: '🛡️',
      badge: 'Low Impact',
      sport: 'calisthenics',
      level: 'beginner' as const,
      minutes: 15,
      sessions: 2,
      city: 'Seattle',
      tagline: 'Joint restoration, dynamic mobility & tendon prep'
    }
  ];

  const weatherPreview = useMemo(() => {
    const cityClean = profile.city.trim().toLowerCase();
    if (!cityClean) return null;

    if (cityClean.includes('seattle')) {
      return { temp: "54°F", aqi: "28 (Good)", condition: "🌦️ Light Drizzle", note: "Indoor or sheltered court recommended" };
    }
    if (cityClean.includes('francisco') || cityClean.includes('sf')) {
      return { temp: "62°F", aqi: "32 (Good)", condition: "🌤️ Mild & Breezy", note: "Great outdoor court conditions" };
    }
    if (cityClean.includes('london')) {
      return { temp: "50°F", aqi: "22 (Good)", condition: "☁️ Overcast", note: "Solid pavement grip" };
    }
    if (cityClean.includes('new york') || cityClean.includes('nyc')) {
      return { temp: "68°F", aqi: "40 (Moderate)", condition: "☀️ Clear Skies", note: "Optimal for high pace footwork" };
    }
    if (cityClean.includes('austin')) {
      return { temp: "78°F", aqi: "35 (Good)", condition: "☀️ Warm & Dry", note: "Stay hydrated during rallies" };
    }
    return { temp: "64°F", aqi: "32 (Good)", condition: "🌤️ Favorable Training Window", note: "Envelope primed for outdoor volume" };
  }, [profile.city]);

  const handleStartTraining = async () => {
    setLoading(true);
    try {
      await saveProfile({
        level: profile.level,
        maxMinutesPerSession: profile.maxMinutesPerSession,
        maxSessionsPerWeek: profile.maxSessionsPerWeek,
        sport: profile.sport,
        city: profile.city || 'Seattle',
        baselineResult: baselineResult || 'Initial baseline completed'
      });
      router.push('/today');
    } catch (err) {
      console.error('Failed to save profile:', err);
      router.push('/today');
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = buildBaselinePrompt(profile.sport, profile.level);
      const res = await callModel({
        prompt: payload.userPrompt,
        tier: 'hosted',
        tierFn: hostedTier,
        promptVersion: 'v2.0-baseline',
        schema: z.object({ test: z.string() })
      });
      setBaselineTask(res.test);
      setStep(2);
    } catch {
      setBaselineTask("Do as many rapid 6-corner shadow footwork reps or burpees as you can in 1 minute. Record your count.");
      setStep(2);
    }
    setLoading(false);
  };

  const handleBaselineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile({
      ...profile,
      baselineResult: baselineResult || 'Initial benchmark completed'
    });
    router.push('/today');
  };

  const sportsList = [
    {
      id: 'badminton',
      title: 'Badminton',
      subtitle: 'Footwork & Reaction',
      icon: ShuttlecockIcon,
      badge: 'Speed & Agility'
    },
    {
      id: 'running',
      title: 'Running',
      subtitle: 'Aerobic & Cadence',
      icon: RunnerIcon,
      badge: 'Stamina'
    },
    {
      id: 'calisthenics',
      title: 'Bodyweight',
      subtitle: 'Core & Power',
      icon: Dumbbell,
      badge: 'Conditioning'
    }
  ];

  const levels = [
    {
      id: 'beginner' as const,
      title: 'Beginner',
      subtext: 'Starting out or returning from break',
      bars: 1
    },
    {
      id: 'intermediate' as const,
      title: 'Intermediate',
      subtext: 'Consistent baseline, moderate load',
      bars: 2
    },
    {
      id: 'advanced' as const,
      title: 'Advanced',
      subtext: 'High intensity, competitive envelope',
      bars: 3
    }
  ];

  const durationOptions = [15, 30, 45, 60];

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Top Header Section - Unified with /today and /progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/90 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-lime-700 dark:text-lime-400 bg-lime-500/15 dark:bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-500/30 dark:border-lime-400/20">
              Profile Setup
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Personalized Training Envelope
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5 font-jersey">
            Welcome to Bahar
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
          Configure your athletic baseline and parameters. Bahar dynamically calibrates your volume and intensity envelope each day to protect streak momentum.
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN (7 cols on desktop): Archetypes, Sport Selection, Location */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. 1-Tap Athletic Archetypes (Quick Setup) */}
            <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-lime-700 dark:text-lime-400 flex items-center gap-1.5 font-jersey">
                  <Sparkles className="w-3.5 h-3.5" />
                  1-Tap Athletic Archetypes
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Instant Setup
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {archetypes.map(arch => {
                  const isSelected = selectedArchetype === arch.id;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => {
                        setProfile({
                          sport: arch.sport,
                          level: arch.level,
                          maxMinutesPerSession: arch.minutes,
                          maxSessionsPerWeek: arch.sessions,
                          city: arch.city
                        });
                        setSelectedArchetype(arch.id);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-lime-500/15 dark:bg-lime-400/10 border-lime-500 dark:border-lime-400 text-slate-900 dark:text-white ring-1 ring-lime-500 dark:ring-lime-400 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl">{arch.icon}</span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-lime-400 text-slate-950 font-bold' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {arch.minutes}m • {arch.sessions}x
                          </span>
                        </div>
                        <div className="font-black text-sm tracking-tight text-slate-900 dark:text-white mb-1 font-jersey">
                          {arch.name}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                          {arch.tagline}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Primary Sport Selection */}
            <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-jersey">
                  <Flame className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
                  Primary Sport Focus
                </label>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Select discipline
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sportsList.map(sport => {
                  const Icon = sport.icon;
                  const isSelected = profile.sport === sport.id;
                  return (
                    <button
                      type="button"
                      key={sport.id}
                      onClick={() => setProfile({ ...profile, sport: sport.id })}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-lime-500/15 dark:bg-lime-400/10 border-lime-500 dark:border-lime-400 text-slate-900 dark:text-white ring-1 ring-lime-500 dark:ring-lime-400 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <div className={`p-2.5 rounded-xl transition-colors ${
                          isSelected ? 'bg-lime-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-lime-400/20 text-lime-700 dark:text-lime-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {sport.badge}
                        </span>
                      </div>

                      <div>
                        <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white font-jersey">{sport.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sport.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hidden semantic select for accessibility */}
              <select
                aria-label="Sport"
                value={profile.sport}
                onChange={e => setProfile({ ...profile, sport: e.target.value })}
                className="hidden"
              >
                <option value="badminton">Badminton</option>
                <option value="running">Running</option>
                <option value="calisthenics">Bodyweight</option>
              </select>
            </div>

            {/* 3. Training Location (Weather & AQI Sync) */}
            <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-jersey">
                  <MapPin className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
                  Training Location
                </label>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Environmental Envelope Sync
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={profile.city}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Enter your home city..."
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold focus:border-lime-500 dark:focus:border-lime-400 focus:ring-1 focus:ring-lime-400 outline-none transition-all"
                />
              </div>

              {weatherPreview && (
                <div className="mt-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{weatherPreview.condition}</span>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span>{weatherPreview.temp}</span>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-lime-700 dark:text-lime-400 font-semibold">AQI: {weatherPreview.aqi}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                    {weatherPreview.note}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN (5 cols on desktop): Level, Duration Budget, Forecast, CTAs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 4. Experience Level */}
            <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-jersey">
                  <Gauge className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
                  Experience Level
                </label>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Controls intensity cap
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {levels.map(lvl => {
                  const isSelected = profile.level === lvl.id;
                  return (
                    <button
                      type="button"
                      key={lvl.id}
                      onClick={() => setProfile({ ...profile, level: lvl.id })}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-lime-500/15 dark:bg-lime-400/10 border-lime-500 dark:border-lime-400 text-slate-900 dark:text-white ring-1 ring-lime-500 dark:ring-lime-400 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white font-jersey">{lvl.title}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map(barIndex => (
                              <span
                                key={barIndex}
                                className={`w-1.5 h-3.5 rounded-full ${
                                  barIndex <= lvl.bars ? (isSelected ? 'bg-lime-500 dark:bg-lime-400' : 'bg-slate-400 dark:bg-slate-600') : 'bg-slate-200 dark:bg-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                          {lvl.subtext}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <select
                aria-label="Level"
                value={profile.level}
                onChange={e => setProfile({ ...profile, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                className="hidden"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* 5. Session Budget Duration */}
            <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-jersey">
                  <Clock className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
                  Session Budget (Duration)
                </label>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-lime-700 dark:text-lime-400 tracking-tight font-jersey">
                    {profile.maxMinutesPerSession}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Mins
                  </span>
                </div>
              </div>

              {/* Slider */}
              <div className="py-2">
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="15"
                  value={profile.maxMinutesPerSession}
                  onChange={e => setProfile({ ...profile, maxMinutesPerSession: Number(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-lime-500 dark:accent-lime-400 bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                />
              </div>

              {/* Choice Chips */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {durationOptions.map(mins => {
                  const isSelected = profile.maxMinutesPerSession === mins;
                  return (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setProfile({ ...profile, maxMinutesPerSession: mins })}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all font-jersey ${
                        isSelected
                          ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md font-black'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {mins}m
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Live Real-Time Physical Envelope Forecast */}
            <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 shadow-md dark:shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-lime-700 dark:text-lime-400 flex items-center gap-1.5 font-jersey">
                  <Activity className="w-3.5 h-3.5" />
                  Live Physical Forecast
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {profile.maxSessionsPerWeek}x / week commitment
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                  <div className="text-lg font-black text-slate-900 dark:text-white font-jersey">{Math.max(2, Math.round(profile.maxMinutesPerSession / 10))}</div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Circuit Load</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                  <div className="text-lg font-black text-lime-700 dark:text-lime-400 font-jersey">~{Math.round(profile.maxMinutesPerSession * 6.5)}</div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Est. Burn</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
                  <div className="text-lg font-black text-sky-700 dark:text-sky-400 font-jersey">{profile.level === 'advanced' ? '36h' : '24h'}</div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Recovery Shield</div>
                </div>
              </div>
            </div>

            {/* 7. Action CTAs & Privacy Badge */}
            <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-xl backdrop-blur-sm flex flex-col gap-3">
              <button
                type="button"
                onClick={handleStartTraining}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black text-base shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 font-jersey"
              >
                <span>{loading ? 'Starting...' : 'Start Training'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 font-jersey"
              >
                <Sparkles className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
                <span>{loading ? 'Analyzing...' : 'Take 5-Min Baseline Test First'}</span>
              </button>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-500 dark:text-lime-400" />
                  100% Offline Local IndexedDB
                </span>
                <span>Zero cloud telemetry</span>
              </div>
            </div>

          </div>

        </form>
      ) : (
        /* STEP 2: Baseline Benchmark Drill Screen */
        <div className="max-w-2xl mx-auto w-full bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-md dark:shadow-xl backdrop-blur-sm flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-lime-700 dark:text-lime-400 bg-lime-500/15 dark:bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-500/30 dark:border-lime-400/20">
                Step 2 of 2 • Benchmark
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 font-jersey">
                Baseline Physical Drill
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-jersey"
            >
              &larr; Back
            </button>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80">
            <div className="flex items-center gap-2 text-xs font-extrabold text-lime-700 dark:text-lime-400 uppercase tracking-wider mb-2 font-jersey">
              <ShieldCheck className="w-4 h-4" />
              AI Coach Benchmark Assignment
            </div>
            <p className="text-sm font-semibold italic leading-relaxed text-slate-700 dark:text-slate-200">
              &ldquo;{baselineTask}&rdquo;
            </p>
          </div>

          <form onSubmit={handleBaselineSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 font-jersey">
                Your Recorded Result
              </label>
              <input
                type="text"
                value={baselineResult}
                onChange={e => setBaselineResult(e.target.value)}
                placeholder="e.g. 26 reps in 60s, smooth court recovery"
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold focus:border-lime-500 dark:focus:border-lime-400 focus:ring-1 focus:ring-lime-400 outline-none"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                This anchors your dynamic intensity floor so workouts are never too harsh or too easy.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black text-base shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group font-jersey"
              >
                <span>Lock Baseline & Start Training</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                onClick={handleStartTraining}
                className="text-xs text-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold py-2 font-jersey"
              >
                Skip benchmark for now &rarr;
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
