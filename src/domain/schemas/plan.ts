import { z } from 'zod';

export const PlanItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  minutes: z.number().int().positive(),
  intensity: z.enum(['low', 'medium', 'high']),
  cue: z.string().optional()
});

export const DailyPlanSchema = z.object({
  items: z.array(PlanItemSchema)
});

export type ZodPlanItem = z.infer<typeof PlanItemSchema>;
export type ZodDailyPlan = z.infer<typeof DailyPlanSchema>;
