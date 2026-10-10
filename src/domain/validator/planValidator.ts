import { Envelope } from '../rules/envelope';
import { ZodDailyPlan, DailyPlan } from '../schemas/plan';
import drillsData from '../../data/drills/badminton.json';

export type { DailyPlan };

export interface ValidationResult {
  valid: boolean;
  reasons: string[];
  repairedPlan?: ZodDailyPlan;
}

export function validatePlan(plan: ZodDailyPlan, envelope: Envelope): ValidationResult {
  const reasons: string[] = [];
  let totalMinutes = 0;
  let hasTooHighIntensity = false;
  let hasInvalidDrills = false;

  const validDrillIds = new Set(drillsData.drills.map(d => d.id));
  const drillMap = new Map(drillsData.drills.map(d => [d.id, d]));

  for (const block of plan.blocks) {
    if (!validDrillIds.has(block.drill_id)) {
      hasInvalidDrills = true;
      reasons.push(`Unknown drill_id: ${block.drill_id}`);
      continue;
    }

    const drillInfo = drillMap.get(block.drill_id)!;
    
    totalMinutes += block.minutes;
    if (drillInfo.intensity > envelope.max_intensity) {
      hasTooHighIntensity = true;
    }
  }

  if (totalMinutes > envelope.budget_minutes) {
    reasons.push(`Total minutes (${totalMinutes}) exceeds budget (${envelope.budget_minutes})`);
  }

  if (hasTooHighIntensity) {
    reasons.push(`Plan contains intensity higher than allowed (${envelope.max_intensity})`);
  }

  if (reasons.length > 0) {
    // Basic repair
    const repairedBlocks = plan.blocks
      .filter(b => validDrillIds.has(b.drill_id))
      .filter(b => drillMap.get(b.drill_id)!.intensity <= envelope.max_intensity);
      
    let currentMinutes = repairedBlocks.reduce((acc, b) => acc + b.minutes, 0);
    while (currentMinutes > envelope.budget_minutes && repairedBlocks.length > 0) {
      const removed = repairedBlocks.pop();
      if (removed) {
        currentMinutes -= removed.minutes;
      }
    }

    return {
      valid: false,
      reasons,
      repairedPlan: { 
        ...plan, 
        blocks: repairedBlocks 
      }
    };
  }

  return { valid: true, reasons: [] };
}
