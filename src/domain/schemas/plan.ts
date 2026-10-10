import { z } from 'zod';

export const ReadingSchema = z.object({
  sleep: z.enum(['poor', 'ok', 'good']),
  energy: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  soreness: z.enum(['none', 'some', 'pain']),
  time: z.union([z.literal(10), z.literal(30), z.literal(60)]),
  place: z.enum(['gym', 'park', 'balcony', 'home']),
  flags: z.array(z.string())
});

export const PlanBlockSchema = z.object({
  drill_id: z.string(),
  minutes: z.number().int().positive(),
  cue: z.string()
});

export const DailyPlanSchema = z.object({
  headline: z.string(),
  why_this_plan: z.string(),
  advice: z.string(),
  blocks: z.array(PlanBlockSchema)
});

export type Reading = z.infer<typeof ReadingSchema>;
export type PlanBlock = z.infer<typeof PlanBlockSchema>;
export type ZodDailyPlan = z.infer<typeof DailyPlanSchema>;
export type DailyPlan = ZodDailyPlan;
