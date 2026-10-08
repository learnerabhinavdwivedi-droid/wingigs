import { ZodDailyPlan, DailyPlanSchema } from '../domain/schemas/plan';
import { logAIFailure } from '../data/local/failure_log';

export interface AIModelResponse {
  content: string;
}

export type TierFunction = (prompt: string, signal?: AbortSignal) => Promise<AIModelResponse>;

export interface CallModelOptions {
  prompt: string;
  tier: 'hosted' | 'ollama' | 'ondevice';
  tierFn: TierFunction;
  promptVersion: string;
  timeoutMs?: number;
  retries?: number;
}

export async function callModel(options: CallModelOptions): Promise<ZodDailyPlan> {
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
      
      const latencyMs = Date.now() - startTime;
      
      // Parse JSON (assumes the model returns just JSON or markdown code block)
      let rawJson = response.content;
      // Strip markdown code blocks if present
      const match = rawJson.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (match) {
        rawJson = match[1];
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawJson);
      } catch (e) {
        throw new Error('parse_error');
      }

      const result = DailyPlanSchema.safeParse(parsed);
      
      if (!result.success) {
        throw new Error('validation_failed');
      }

      // Success
      return result.data;
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      
      let errorType: 'timeout' | 'parse_error' | 'validation_failed' | 'network_error' | 'other' = 'other';
      
      if (error.name === 'AbortError') {
        errorType = 'timeout';
      } else if (error.message === 'parse_error' || error.message === 'validation_failed') {
        errorType = error.message;
      } else if (error.message && error.message.includes('fetch')) {
        errorType = 'network_error';
      }

      // Log failure
      await logAIFailure({
        promptVersion: options.promptVersion,
        tier: options.tier,
        latencyMs,
        repairCount: 0, // In this layer we haven't repaired yet, we just track parsing/validation
        errorType,
        errorMessage: error.message
      });

      if (attempts > maxRetries) {
        throw error;
      }
      // Otherwise loop continues and retries
    }
  }
  
  throw new Error('Unreachable code');
}
