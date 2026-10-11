import { Reading } from '../schemas/plan';
import { UserProfile } from '../../data/local/db';

export interface WeatherData {
  aqi: number;
  temperature: number;
  precipitation: number;
  visibility: number;
  isFallback?: boolean;
  resolvedCity?: string;
}

export interface Envelope {
  allow_outdoor: boolean;
  max_intensity: 1 | 2 | 3;
  budget_minutes: number;
  best_window: { start: string, end: string } | null;
  mode: 'normal' | 'gentle' | 'rest' | 'comeback';
  reasons: string[];
}

export interface EnvelopeContext {
  reading: Reading;
  weather: WeatherData | null;
  baseline: UserProfile;
  streak: number;
  obstacle?: string;
}

export function buildDayEnvelope(ctx: EnvelopeContext): Envelope {
  const { reading, weather, baseline, streak, obstacle } = ctx;
  const reasons: string[] = [];
  
  let allow_outdoor = true;
  let max_intensity: 1 | 2 | 3 = 3;
  let mode: Envelope['mode'] = 'normal';
  let budget_minutes = Math.min(reading.time, baseline.maxMinutesPerSession);

  // 1. Safety Rules (Never compromised)
  if (reading.soreness === 'pain') {
    mode = 'rest';
    max_intensity = 1;
    budget_minutes = 0;
    reasons.push('Pain reported. Rest is mandatory.');
  } else if (reading.soreness === 'some') {
    mode = 'gentle';
    max_intensity = 2;
    reasons.push('Soreness reported. Cap intensity to 2.');
  }

  if (reading.energy === 1 || reading.sleep === 'poor') {
    mode = 'gentle';
    max_intensity = Math.min(max_intensity, 2) as 1|2;
    budget_minutes = Math.min(budget_minutes, 30);
    reasons.push('Low energy or poor sleep. Shorter, gentler session.');
  }

  // Weather Thresholds
  if (weather) {
    if (weather.aqi > 100 || weather.precipitation > 5) {
      allow_outdoor = false;
      reasons.push(`Weather unsafe for outdoor (AQI: ${weather.aqi}, Precip: ${weather.precipitation}mm).`);
    }
  }

  // Progress/Comeback Rules
  if (streak === 0 && mode !== 'rest') {
    mode = 'comeback';
    max_intensity = Math.min(max_intensity, 2) as 1|2;
    reasons.push('Rebuilding streak. Focus on consistency over intensity.');
  }

  // Obstacle (Plan B) adjustments
  if (obstacle) {
    reasons.push(`Adjusting for obstacle: ${obstacle}`);
    if (obstacle === 'short on time') budget_minutes = Math.min(budget_minutes, 10);
    if (obstacle === 'tired') max_intensity = 1;
    if (obstacle === 'sore') { max_intensity = 1; mode = 'gentle'; }
    if (obstacle === 'fog') allow_outdoor = false;
  }

  // Baseline constraints
  if (baseline.level === 'beginner' && max_intensity === 3) {
    max_intensity = 2;
    reasons.push('Beginner baseline constraint applied.');
  }

  // Location logic
  if (reading.place === 'home' || reading.place === 'gym' || reading.place === 'balcony') {
    allow_outdoor = false;
  }

  return {
    allow_outdoor,
    max_intensity,
    budget_minutes,
    best_window: weather && allow_outdoor ? { start: '17:00', end: '19:00' } : null,
    mode,
    reasons
  };
}
