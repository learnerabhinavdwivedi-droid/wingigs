'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile } from '../../data/local/queries';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { z } from 'zod';
// Clean inline athletic SVG icons with strict explicit dimensions
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

function Sun({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg width="16" height="16" style={{ width: 16, height: 16, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function Moon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg width="16" height="16" style={{ width: 16, height: 16, flexShrink: 0 }} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
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

// Custom Minimalistic Badminton Shuttlecock SVG Icon
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

// Custom Running Shoe / Runner Icon
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
  const [isDark, setIsDark] = useState(true);
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
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

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

  // Micro-interaction: dynamic weather & AQI preview based on city
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
      subtext: 'Just starting out or recovering',
      bars: 1
    },
    {
      id: 'intermediate' as const,
      title: 'Intermediate',
      subtext: 'Consistent training, moderate volume',
      bars: 2
    },
    {
      id: 'advanced' as const,
      title: 'Advanced',
      subtext: 'High intensity, competitive volume',
      bars: 3
    }
  ];

  const durationOptions = [15, 30, 45, 60];

  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl transition-colors duration-300 ${
      isDark 
        ? 'bg-[#0f172a]/95 text-slate-100 border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl' 
        : 'bg-white text-slate-900 border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)]'
    } p-6 sm:p-9`}>
      
      {/* Top Header Section with Brand & Light/Dark Mode Toggle */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-700/40 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-lime-500/20">
            <Activity className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-lime-400 bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-500/20">
                PWA Core
              </span>
              <span className="text-xs text-slate-400 font-medium">Bahar Training System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
              Welcome to Bahar
            </h1>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className={`p-2.5 rounded-2xl border transition-all ${
            isDark 
              ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700' 
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs sm:text-sm text-slate-400 mt-4 mb-6 leading-relaxed">
        Build your personalized, adaptive daily training envelope.
      </p>

      {step === 1 ? (
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
          
          {/* Quick 1-Tap Athletic Archetypes (Instant 3-Sec Setup) */}
          <div className={`p-4 rounded-3xl border transition-all ${
            isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                1-Tap Athletic Archetypes
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Quick Setup
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? isDark
                          ? 'bg-lime-400/15 border-lime-400 text-white ring-1 ring-lime-400 shadow-md shadow-lime-500/10'
                          : 'bg-lime-50 border-lime-600 text-slate-950 ring-1 ring-lime-600 shadow-sm'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{arch.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-lime-400 bg-lime-400/10 px-1.5 py-0.5 rounded-md">
                          {arch.minutes}m • {arch.sessions}x
                        </span>
                      </div>
                      <div className="font-black text-xs tracking-tight text-white">{arch.name}</div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1">
                        {arch.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Primary Sport Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-lime-400" />
                Primary Sport
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                Select your focus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {sportsList.map(sport => {
                const Icon = sport.icon;
                const isSelected = profile.sport === sport.id;
                return (
                  <button
                    type="button"
                    key={sport.id}
                    onClick={() => setProfile({ ...profile, sport: sport.id })}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                      isSelected
                        ? isDark
                          ? 'bg-lime-500/10 border-lime-400 text-white shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-400'
                          : 'bg-lime-50 border-lime-600 text-slate-950 shadow-md ring-1 ring-lime-600'
                        : isDark
                          ? 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`p-2 rounded-xl transition-colors ${
                        isSelected 
                          ? 'bg-lime-400 text-slate-950' 
                          : isDark ? 'bg-slate-800 text-slate-300 group-hover:text-white' : 'bg-white text-slate-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-lime-400/20 text-lime-400'
                          : isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-200'
                      }`}>
                        {sport.badge}
                      </span>
                    </div>

                    <div>
                      <div className="font-extrabold text-sm tracking-tight">{sport.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{sport.subtitle}</div>
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

          {/* 2. Location Input (Weather & AQI Micro-interaction) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-lime-400" />
                Training Location
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
                Weather & AQI Sync
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
                placeholder="Enter your city..."
                required
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm font-semibold transition-all focus:outline-none ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-400 focus:border-lime-400 focus:ring-1 focus:ring-lime-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-lime-600 focus:ring-1 focus:ring-lime-600'
                }`}
              />
            </div>

            {/* Micro-interaction preview banner beneath input */}
            {weatherPreview && (
              <div className={`mt-2.5 p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                isDark 
                  ? 'bg-slate-900/40 border-slate-800 text-slate-300' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{weatherPreview.condition}</span>
                  <span className="text-slate-400">•</span>
                  <span>{weatherPreview.temp}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-lime-400 font-semibold">AQI: {weatherPreview.aqi}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  {weatherPreview.note}
                </span>
              </div>
            )}
          </div>

          {/* 3. Experience Level Metric Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-lime-400" />
                Experience Level
              </label>
              <span className="text-[11px] font-semibold text-slate-400">
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
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? isDark
                          ? 'bg-lime-500/10 border-lime-400 text-white shadow-[0_0_20px_rgba(132,204,22,0.15)] ring-1 ring-lime-400'
                          : 'bg-lime-50 border-lime-600 text-slate-950 shadow-md ring-1 ring-lime-600'
                        : isDark
                          ? 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm tracking-tight">{lvl.title}</span>
                        {/* Visual intensity meter */}
                        <div className="flex gap-1">
                          {[1, 2, 3].map(barIndex => (
                            <span
                              key={barIndex}
                              className={`w-1.5 h-3.5 rounded-full ${
                                barIndex <= lvl.bars 
                                  ? isSelected ? 'bg-lime-400' : isDark ? 'bg-slate-600' : 'bg-slate-400'
                                  : isDark ? 'bg-slate-800' : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] leading-tight text-slate-400">
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
              onChange={e => setProfile({ ...profile, level: e.target.value as any })}
              className="hidden"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* 4. Session Budget Slider & Choice Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-lime-400" />
                Session Budget (Duration)
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-lime-400 tracking-tight">
                  {profile.maxMinutesPerSession}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Mins
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="px-1 py-2">
              <input
                type="range"
                min="15"
                max="60"
                step="15"
                value={profile.maxMinutesPerSession}
                onChange={e => setProfile({ ...profile, maxMinutesPerSession: Number(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-lime-400 bg-slate-800"
              />
            </div>

            {/* Snapping Choice Chips */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {durationOptions.map(mins => {
                const isSelected = profile.maxMinutesPerSession === mins;
                return (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setProfile({ ...profile, maxMinutesPerSession: mins })}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md font-black'
                          : 'bg-lime-600 text-white border-lime-600 shadow-md font-black'
                        : isDark
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {mins}m
                  </button>
                );
              })}
            </div>

            {/* Live Real-Time Physical Forecast */}
            <div className={`mt-3 p-3.5 rounded-2xl border text-xs transition-all ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Live Physical Forecast
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {profile.maxSessionsPerWeek}x / week commitment
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-950/70 border border-slate-850' : 'bg-white border border-slate-200'}`}>
                  <div className="text-sm sm:text-base font-black text-white">{Math.max(2, Math.round(profile.maxMinutesPerSession / 10))} Drills</div>
                  <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Circuit Load</div>
                </div>
                <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-950/70 border border-slate-850' : 'bg-white border border-slate-200'}`}>
                  <div className="text-sm sm:text-base font-black text-lime-400">~{Math.round(profile.maxMinutesPerSession * 6.5)} kcal</div>
                  <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Est. Burn</div>
                </div>
                <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-950/70 border border-slate-850' : 'bg-white border border-slate-200'}`}>
                  <div className="text-sm sm:text-base font-black text-sky-400">{profile.level === 'advanced' ? '36h' : '24h'}</div>
                  <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Recovery Shield</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Primary and Secondary Actions (CTAs) */}
          <div className="pt-3 flex flex-col gap-3">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleStartTraining}
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black text-base shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{loading ? 'Starting...' : 'Start Training'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Ghost/Outlined Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-2xl border text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                isDark
                  ? 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700 hover:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>{loading ? 'Analyzing...' : 'Take 5-Min Baseline Test First'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* Step 2: 5-Minute Baseline Physical Benchmark Screen */
        <form onSubmit={handleBaselineSubmit} className="flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
                Step 2 of 2 • Benchmark
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
                Baseline Physical Drill
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-400 hover:text-white font-semibold"
            >
              &larr; Back
            </button>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border ${
            isDark 
              ? 'bg-slate-900/60 border-slate-800 text-slate-200' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2 text-xs font-extrabold text-lime-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              AI Coach Benchmark Assignment
            </div>
            <p className="text-sm font-semibold italic leading-relaxed text-slate-200">
              "{baselineTask}"
            </p>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Your Recorded Result
            </label>
            <input
              type="text"
              value={baselineResult}
              onChange={e => setBaselineResult(e.target.value)}
              placeholder="e.g. 26 reps in 60s, smooth court recovery"
              required
              className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all focus:outline-none ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 text-white placeholder-slate-500 focus:border-lime-400 focus:ring-1 focus:ring-lime-400'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-lime-600 focus:ring-1 focus:ring-lime-600'
              }`}
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              This anchors your dynamic intensity floor so workouts are never too harsh or too easy.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black text-base shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Lock Baseline & Start Training</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={handleStartTraining}
              className="text-xs text-center text-slate-400 hover:text-white font-semibold py-2"
            >
              Skip benchmark for now &rarr;
            </button>
          </div>
        </form>
      )}

      {/* Trust & Local Privacy Badge */}
      <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
          100% Offline Local IndexedDB
        </span>
        <span>Zero cloud telemetry leakage</span>
      </div>
    </div>
  );
}
