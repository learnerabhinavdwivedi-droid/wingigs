import { z } from 'zod';
import { ZodDailyPlan, DailyPlanSchema } from '../domain/schemas/plan';
import { logAIFailure } from '../data/local/failure_log';

export interface AIModelResponse {
  content: string;
}

export type TierFunction = (prompt: string, signal?: AbortSignal) => Promise<AIModelResponse>;

export interface CallModelOptions<T = ZodDailyPlan> {
  prompt: string;
  tier: 'hosted' | 'ollama' | 'ondevice';
  tierFn: TierFunction;
  promptVersion: string;
  timeoutMs?: number;
  retries?: number;
  schema?: z.ZodType<T>;
}

export async function callModel<T = ZodDailyPlan>(options: CallModelOptions<T>): Promise<T> {
  const timeoutMs = options.timeoutMs || 20000; // 20s timeout by default
  const maxRetries = options.retries ?? 1;
  
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    attempts++;
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await options.tierFn(options.prompt, controller.signal);
      clearTimeout(timeoutId);
      
      // Robust JSON extraction from chatty open-weight model outputs
      let rawJson = response.content;
      
      // 1. Check for markdown code fences
      const fenceMatch = rawJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (fenceMatch) {
        rawJson = fenceMatch[1];
      }

      // 2. Extract outermost object or array bounds
      const firstBrace = rawJson.indexOf('{');
      const lastBrace = rawJson.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        rawJson = rawJson.substring(firstBrace, lastBrace + 1);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawJson.trim());
      } catch {
        throw new Error('parse_error');
      }

      const schema = (options.schema ?? DailyPlanSchema) as z.ZodType<T>;
      const result = schema.safeParse(parsed);
      
      if (!result.success) {
        throw new Error('validation_failed');
      }

      // Success
      return result.data;
      
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      
      let errorType: 'timeout' | 'parse_error' | 'validation_failed' | 'network_error' | 'other' = 'other';
      
      if (err.name === 'AbortError') {
        errorType = 'timeout';
      } else if (err.message === 'parse_error' || err.message === 'validation_failed') {
        errorType = err.message;
      } else if (err.message && err.message.includes('fetch')) {
        errorType = 'network_error';
      }

      // Log failure
      await logAIFailure({
        promptVersion: options.promptVersion,
        tier: options.tier,
        latencyMs,
        repairCount: 0, // In this layer we haven't repaired yet, we just track parsing/validation
        errorType,
        errorMessage: err.message
      });

      if (attempts > maxRetries) {
        throw err;
      }
      // Otherwise loop continues and retries
    }
  }
  
  throw new Error('Unreachable code');
}

