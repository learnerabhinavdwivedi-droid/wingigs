'use client';

import { useState, useEffect } from 'react';
import { getDayKey } from '../../domain/time/day_key';
import { getProfile, getAllCheckins, getStoredPlan, savePlan, getCompletedHistoricalPlans } from '../../data/local/queries';
import { buildDayEnvelope, Envelope, EnvelopeContext } from '../../domain/rules/envelope';
import { calculateMomentum } from '../../domain/progress/momentum';
import { callModel } from '../../ai/callModel';
import { hostedTier } from '../../ai/tiers/hosted';
import { getFallbackPlan } from '../../data/fallback/bank';
import { validatePlan } from '../../domain/validator/planValidator';
import { UserProfile } from '../../data/local/db';
import { Reading, ZodDailyPlan } from '../../domain/schemas/plan';
import { getRealWeather } from '../weather/getWeather';
import { buildPlanPrompt } from '../../ai/prompts';

export type DayEngineState = 'loading' | 'no_profile' | 'needs_reading' | 'generating' | 'ready' | 'error';

export function useDayEngine() {
  const [state, setState] = useState<DayEngineState>('loading');
  const [plan, setPlan] = useState<ZodDailyPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [envelope, setEnvelope] = useState<Envelope | null>(null); // store envelope for UI reasons

  const generatePlanWithProfile = async (targetProfile: UserProfile, reading: Reading, obstacle?: string) => {
    setState('generating');
    
    try {
      const todayKey = getDayKey();
      const allCheckins = await getAllCheckins();
      const streak = calculateMomentum(allCheckins, todayKey);
      
      // Fetch live open weather and AQI for the athlete's training city
      const weather = await getRealWeather(targetProfile.city);

      const ctx: EnvelopeContext = {
        reading,
        weather,
        baseline: targetProfile,
        streak,
        obstacle
      };

      const env = buildDayEnvelope(ctx);
      setEnvelope(env);
      const pastPlans = await getCompletedHistoricalPlans();
      
      let newPlan: ZodDailyPlan;
      
      try {
        const promptPayload = buildPlanPrompt(env, obstacle);
        const generated = await callModel({
          prompt: promptPayload.userPrompt,
          tier: 'hosted',
          tierFn: hostedTier,
          promptVersion: 'v2.0-openweight'
        });

        const validation = validatePlan(generated, env);
        newPlan = validation.valid ? generated : (validation.repairedPlan || getFallbackPlan(env, pastPlans));
      } catch (error) {
        console.warn("AI generation offline or unconfigured, using vetted fallback plan", error);
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
