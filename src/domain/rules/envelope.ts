export interface UserBaseline {
  level: 'beginner' | 'intermediate' | 'advanced';
  maxMinutesPerSession: number;
  maxSessionsPerWeek: number;
}

export interface DayEnvelope {
  maxIntensity: 'low' | 'medium' | 'high';
  allowedDrills: string[]; // generic tags or specific ids
  budgetMinutes: number;
  environment: 'indoor' | 'outdoor' | 'any';
}

export interface EnvelopeContext {
  baseline: UserBaseline;
  daysActiveThisWeek: number;
  consecutiveDays: number;
  weatherIsBad: boolean;
}

export function buildDayEnvelope(ctx: EnvelopeContext): DayEnvelope {
  const { baseline, daysActiveThisWeek, consecutiveDays, weatherIsBad } = ctx;

  let maxIntensity: 'low' | 'medium' | 'high' = 'high';
  let budgetMinutes = baseline.maxMinutesPerSession;
  
  // Rule 1: Limit consecutive high intensity days
  if (consecutiveDays >= 2) {
    maxIntensity = 'low';
    budgetMinutes = Math.min(budgetMinutes, 30);
  }

  // Rule 2: Beginner caps
  if (baseline.level === 'beginner') {
    if (maxIntensity === 'high') maxIntensity = 'medium';
    budgetMinutes = Math.min(budgetMinutes, 45);
  }

  // Rule 3: Weekly limit approaching
  if (daysActiveThisWeek >= baseline.maxSessionsPerWeek) {
    maxIntensity = 'low';
    budgetMinutes = Math.min(budgetMinutes, 15); // Active recovery
  }

  // Rule 4: Weather fallback
  const environment = weatherIsBad ? 'indoor' : 'any';

  return {
    maxIntensity,
    budgetMinutes,
    environment,
    allowedDrills: ['*'], // To be filtered later by validator or AI
  };
}
