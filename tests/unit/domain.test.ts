import { describe, it, expect } from 'vitest';
import { buildDayEnvelope, EnvelopeContext } from '../../src/domain/rules/envelope';
import { validatePlan, DailyPlan } from '../../src/domain/validator/planValidator';
import { calculateMomentum, Checkin } from '../../src/domain/progress/momentum';

describe('Envelope Builder', () => {
  it('should restrict intensity for beginners', () => {
    const ctx: EnvelopeContext = {
      reading: { sleep: 'ok', energy: 2, soreness: 'none', time: 60, place: 'gym', flags: [] },
      weather: null,
      baseline: { id: 1, sport: 'badminton', city: 'Seattle', level: 'beginner', maxMinutesPerSession: 45, maxSessionsPerWeek: 3 },
      streak: 1
    };
    const env = buildDayEnvelope(ctx);
    expect(env.max_intensity).toBe(2);
    expect(env.budget_minutes).toBeLessThanOrEqual(45);
  });

  it('should restrict intensity on soreness or fatigue', () => {
    const ctx: EnvelopeContext = {
      reading: { sleep: 'poor', energy: 1, soreness: 'some', time: 60, place: 'gym', flags: [] },
      weather: null,
      baseline: { id: 1, sport: 'badminton', city: 'Seattle', level: 'advanced', maxMinutesPerSession: 90, maxSessionsPerWeek: 5 },
      streak: 2
    };
    const env = buildDayEnvelope(ctx);
    expect(env.max_intensity).toBeLessThanOrEqual(2);
    expect(env.budget_minutes).toBeLessThanOrEqual(30);
    expect(env.mode).toBe('gentle');
  });
});

describe('Plan Validator', () => {
  it('should accept valid plans', () => {
    const plan: DailyPlan = {
      headline: 'Drill Day',
      why_this_plan: 'Consistent work',
      advice: 'Stay relaxed',
      blocks: [{ drill_id: 'b1', minutes: 10, cue: 'Clean footwork' }]
    };
    const env = {
      allow_outdoor: true,
      max_intensity: 2 as const,
      budget_minutes: 30,
      best_window: null,
      mode: 'normal' as const,
      reasons: []
    };
    const result = validatePlan(plan, env);
    expect(result.valid).toBe(true);
  });

  it('should repair plans that exceed budget', () => {
    const plan: DailyPlan = {
      headline: 'Over-budget plan',
      why_this_plan: 'Exceeds budget test',
      advice: 'Cut back',
      blocks: [
        { drill_id: 'b1', minutes: 20, cue: 'Shadow footwork' },
        { drill_id: 'b2', minutes: 20, cue: 'Wall rally' }
      ]
    };
    const env = {
      allow_outdoor: true,
      max_intensity: 2 as const,
      budget_minutes: 30,
      best_window: null,
      mode: 'normal' as const,
      reasons: []
    };
    const result = validatePlan(plan, env);
    expect(result.valid).toBe(false);
    expect(result.repairedPlan?.blocks.length).toBe(1);
    expect(result.repairedPlan?.blocks[0].minutes).toBe(20);
  });
});

describe('Momentum', () => {
  it('should calculate current streak', () => {
    const checkins: Checkin[] = [
      { dayKey: '2026-10-06', completed: true },
      { dayKey: '2026-10-07', completed: true },
    ];
    // Yesterday completed, today not yet
    expect(calculateMomentum(checkins, '2026-10-08')).toBe(2);
    
    // Today completed
    checkins.push({ dayKey: '2026-10-08', completed: true });
    expect(calculateMomentum(checkins, '2026-10-08')).toBe(3);
  });

  it('should return 0 if yesterday was missed', () => {
    const checkins: Checkin[] = [
      { dayKey: '2026-10-05', completed: true },
    ];
    expect(calculateMomentum(checkins, '2026-10-08')).toBe(0);
  });
});
