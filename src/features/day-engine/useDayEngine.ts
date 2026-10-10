'use client';

import { useState, useEffect } from 'react';
import { getDayKey } from '../../domain/time/day_key';
import { getProfile, getAllCheckins, getStoredPlan, savePlan, getCompletedHistoricalPlans } from '../../data/local/queries';
import { buildDayEnvelope, EnvelopeContext } from '../../domain/rules/envelope';
import { calculateMomentum } from '../../domain/progress/momentum';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { getFallbackPlan } from '../../data/fallback/bank';
import { validatePlan } from '../../domain/validator/planValidator';
import { UserProfile } from '../../data/local/db';
import { Reading, ZodDailyPlan } from '../../domain/schemas/plan';

export type DayEngineState = 'loading' | 'no_profile' | 'needs_reading' | 'generating' | 'ready' | 'error';

export function useDayEngine() {
  const [state, setState] = useState<DayEngineState>('loading');
  const [plan, setPlan] = useState<ZodDailyPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [envelope, setEnvelope] = useState<any>(null); // store envelope for UI reasons

  const generatePlanWithProfile = async (targetProfile: UserProfile, reading: Reading, obstacle?: string) => {
    setState('generating');
    
    try {
      const todayKey = getDayKey();
      const allCheckins = await getAllCheckins();
      const streak = calculateMomentum(allCheckins, todayKey);
      
      const ctx: EnvelopeContext = {
        reading,
        weather: { aqi: 45, temperature: 20, precipitation: 0, visibility: 10 }, // mock
        baseline: targetProfile,
        streak,
        obstacle
      };

      const env = buildDayEnvelope(ctx);
      setEnvelope(env);
      const pastPlans = await getCompletedHistoricalPlans();
      
      let newPlan: ZodDailyPlan;
      
      try {
        const generated = await callModel({
          prompt: `Generate a badminton plan. Mode: ${env.mode}. Max intensity: ${env.max_intensity}, max minutes: ${env.budget_minutes}`,
          tier: 'hosted',
          tierFn: hostedTier,
          promptVersion: 'v1.1'
        });

        const validation = validatePlan(generated, env);
        newPlan = validation.valid ? generated : (validation.repairedPlan || getFallbackPlan(env, pastPlans));
      } catch (error) {
        console.error("AI failed, using fallback", error);
        newPlan = getFallbackPlan(env, pastPlans);
      }

      // Store plan
      await savePlan({ dayKey: todayKey, plan: newPlan });
      setPlan(newPlan);
      setState('ready');
    } catch (err) {
      console.error(err);
      setState('error');
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const p = await getProfile();
        if (!p) {
          setState('no_profile');
          return;
        }
        setProfile(p);

        const todayKey = getDayKey();
        const stored = await getStoredPlan(todayKey);
        
        if (stored) {
          setPlan(stored.plan);
          setState('ready');
          return;
        }

        // Auto-generate plan with default reading so Today is ready immediately
        const defaultReading: Reading = {
          sleep: 'ok',
          energy: 2,
          soreness: 'none',
          time: 30,
          place: 'gym',
          flags: []
        };
        await generatePlanWithProfile(p, defaultReading);
      } catch (err) {
        console.error(err);
        setState('error');
      }
    }
    init();
  }, []);

  const submitReading = async (reading: Reading, obstacle?: string) => {
    if (!profile) return;
    await generatePlanWithProfile(profile, reading, obstacle);
  };

  const applyPlanB = async (obstacle: string, reading: Reading) => {
    // Re-run the engine with an obstacle
    await submitReading(reading, obstacle);
  };

  return { state, plan, profile, envelope, submitReading, applyPlanB };
}
