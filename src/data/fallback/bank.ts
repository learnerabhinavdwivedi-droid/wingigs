import { Envelope } from '../../domain/rules/envelope';
import { ZodDailyPlan } from '../../domain/schemas/plan';
import drillsData from '../drills/badminton.json';

const indoorBeginnerFallback: ZodDailyPlan = {
  headline: 'Gentle Indoor Routine',
  why_this_plan: 'A safe, vetted fallback for indoor or low-intensity days.',
  advice: 'Focus on form and balance.',
  blocks: [
    { drill_id: 'b1', minutes: 10, cue: 'Smooth movements.' },
    { drill_id: 'b2', minutes: 15, cue: 'Keep it steady against the wall.' }
  ]
};

const outdoorGeneralFallback: ZodDailyPlan = {
  headline: 'Outdoor Push',
  why_this_plan: 'Standard fallback for outdoor intensity.',
  advice: 'Push yourself, but stay aware of your surroundings.',
  blocks: [
    { drill_id: 'b3', minutes: 15, cue: 'Reach high and follow through.' },
    { drill_id: 'b4', minutes: 10, cue: 'Fast feet on the ladder.' }
  ]
};

export function getFallbackPlan(envelope: Envelope, historicalPlans?: ZodDailyPlan[]): ZodDailyPlan {
  const drillMap = new Map(drillsData.drills.map(d => [d.id, d]));

  if (historicalPlans && historicalPlans.length > 0) {
    for (const pastPlan of historicalPlans) {
      let totalMin = 0;
      let hasTooHigh = false;
      for (const block of pastPlan.blocks) {
        totalMin += block.minutes;
        const drill = drillMap.get(block.drill_id);
        if (drill && drill.intensity > envelope.max_intensity) {
          hasTooHigh = true;
        }
      }
      
      if (!hasTooHigh && totalMin <= envelope.budget_minutes) {
        return pastPlan;
      }
    }
  }

  if (!envelope.allow_outdoor || envelope.max_intensity === 1) {
    return indoorBeginnerFallback;
  }
  return outdoorGeneralFallback;
}
