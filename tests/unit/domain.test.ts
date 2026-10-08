import { describe, it, expect } from 'vitest';
import { buildDayEnvelope, EnvelopeContext } from '../../src/domain/rules/envelope';
import { validatePlan, DailyPlan } from '../../src/domain/validator/planValidator';
import { calculateMomentum, Checkin } from '../../src/domain/progress/momentum';

describe('Envelope Builder', () => {
  it('should restrict intensity for beginners', () => {
    const ctx: EnvelopeContext = {
      baseline: { level: 'beginner', maxMinutesPerSession: 60, maxSessionsPerWeek: 3 },
      daysActiveThisWeek: 1,
      consecutiveDays: 0,
      weatherIsBad: false
    };
    const env = buildDayEnvelope(ctx);
    expect(env.maxIntensity).toBe('medium');
    expect(env.budgetMinutes).toBeLessThanOrEqual(45);
  });

  it('should restrict intensity on consecutive days', () => {
    const ctx: EnvelopeContext = {
      baseline: { level: 'advanced', maxMinutesPerSession: 90, maxSessionsPerWeek: 5 },
      daysActiveThisWeek: 2,
      consecutiveDays: 2,
      weatherIsBad: false
    };
    const env = buildDayEnvelope(ctx);
    expect(env.maxIntensity).toBe('low');
    expect(env.budgetMinutes).toBeLessThanOrEqual(30);
  });
});

describe('Plan Validator', () => {
  it('should accept valid plans', () => {
    const plan: DailyPlan = {
      items: [{ id: '1', name: 'Drill 1', minutes: 10, intensity: 'low' }]
    };
    const env = { maxIntensity: 'medium' as const, budgetMinutes: 30, environment: 'any' as const, allowedDrills: [] };
    const result = validatePlan(plan, env);
    expect(result.valid).toBe(true);
  });

  it('should repair plans that exceed budget', () => {
    const plan: DailyPlan = {
      items: [
        { id: '1', name: 'Drill 1', minutes: 20, intensity: 'low' },
        { id: '2', name: 'Drill 2', minutes: 20, intensity: 'low' }
      ]
    };
    const env = { maxIntensity: 'low' as const, budgetMinutes: 30, environment: 'any' as const, allowedDrills: [] };
    const result = validatePlan(plan, env);
    expect(result.valid).toBe(false);
    expect(result.repairedPlan?.items.length).toBe(1);
    expect(result.repairedPlan?.items[0].minutes).toBe(20);
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
