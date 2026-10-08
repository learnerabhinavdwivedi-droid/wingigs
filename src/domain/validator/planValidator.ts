import { DayEnvelope } from '../rules/envelope';

export interface PlanItem {
  id: string;
  name: string;
  minutes: number;
  intensity: 'low' | 'medium' | 'high';
}

export interface DailyPlan {
  items: PlanItem[];
}

export interface ValidationResult {
  valid: boolean;
  reasons: string[];
  repairedPlan?: DailyPlan;
}

const intensityWeight = {
  low: 1,
  medium: 2,
  high: 3,
};

export function validatePlan(plan: DailyPlan, envelope: DayEnvelope): ValidationResult {
  const reasons: string[] = [];
  let totalMinutes = 0;
  let hasTooHighIntensity = false;

  for (const item of plan.items) {
    totalMinutes += item.minutes;
    if (intensityWeight[item.intensity] > intensityWeight[envelope.maxIntensity]) {
      hasTooHighIntensity = true;
    }
  }

  if (totalMinutes > envelope.budgetMinutes) {
    reasons.push(`Total minutes (${totalMinutes}) exceeds budget (${envelope.budgetMinutes})`);
  }

  if (hasTooHighIntensity) {
    reasons.push(`Plan contains intensity higher than allowed (${envelope.maxIntensity})`);
  }

  if (reasons.length > 0) {
    // Attempt repair:
    // Simple repair: cut items until within budget, downgrade intensity
    let repairedItems = plan.items.map(item => {
      let newIntensity = item.intensity;
      if (intensityWeight[item.intensity] > intensityWeight[envelope.maxIntensity]) {
        newIntensity = envelope.maxIntensity;
      }
      return { ...item, intensity: newIntensity };
    });

    let currentMinutes = repairedItems.reduce((acc, item) => acc + item.minutes, 0);
    while (currentMinutes > envelope.budgetMinutes && repairedItems.length > 0) {
      const removed = repairedItems.pop();
      if (removed) {
        currentMinutes -= removed.minutes;
      }
    }

    return {
      valid: false,
      reasons,
      repairedPlan: { items: repairedItems }
    };
  }

  return { valid: true, reasons: [] };
}
