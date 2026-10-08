import { DailyPlan } from '../../domain/validator/planValidator';
import { DayEnvelope } from '../../domain/rules/envelope';

const indoorBeginnerFallback: DailyPlan = {
  items: [
    { id: 'f1', name: 'Shadow Swings', minutes: 10, intensity: 'low' },
    { id: 'f2', name: 'Footwork Drills', minutes: 15, intensity: 'medium' }
  ]
};

const outdoorGeneralFallback: DailyPlan = {
  items: [
    { id: 'f3', name: 'Jogging', minutes: 20, intensity: 'medium' },
    { id: 'f4', name: 'Sprints', minutes: 10, intensity: 'high' }
  ]
};

export function getFallbackPlan(envelope: DayEnvelope): DailyPlan {
  // Return a safe, pre-vetted plan based on the envelope
  if (envelope.environment === 'indoor' || envelope.maxIntensity === 'low') {
    return indoorBeginnerFallback;
  }
  return outdoorGeneralFallback;
}
