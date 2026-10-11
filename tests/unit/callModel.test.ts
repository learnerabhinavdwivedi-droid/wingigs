import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { callModel, TierFunction } from '../../src/ai/callModel';
import * as failureLog from '../../src/data/local/failure_log';

describe('callModel', () => {
  it('should parse valid JSON', async () => {
    const mockTier: TierFunction = async () => ({
      content: JSON.stringify({
        headline: 'Footwork Drills',
        why_this_plan: 'Stamina building',
        advice: 'Keep light on toes',
        blocks: [{ drill_id: 'b1', minutes: 10, cue: 'Shadow footwork' }]
      })
    });
    
    const result = await callModel({
      prompt: 'test',
      tier: 'hosted',
      tierFn: mockTier,
      promptVersion: 'v1'
    });
    
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].drill_id).toBe('b1');
  });

  it('should parse JSON embedded in chatty open-weight model responses', async () => {
    const mockTier: TierFunction = async () => ({
      content: `Here is your badminton training plan for today:
\`\`\`json
{
  "headline": "Dynamic Court Agility",
  "why_this_plan": "Matches high recovery capacity",
  "advice": "Stay light on feet",
  "blocks": [{ "drill_id": "b1", "minutes": 15, "cue": "Quick return to base" }]
}
\`\`\`
Hope you have a productive session on the court!`
    });

    const result = await callModel({
      prompt: 'test',
      tier: 'hosted',
      tierFn: mockTier,
      promptVersion: 'v2'
    });

    expect(result.headline).toBe('Dynamic Court Agility');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].drill_id).toBe('b1');
  });

  it('should parse valid JSON with custom schema', async () => {
    const customSchema = z.object({
      summary: z.string()
    });
    const mockTier: TierFunction = async () => ({
      content: JSON.stringify({ summary: 'Great job' })
    });
    
    const result = await callModel({
      prompt: 'test',
      tier: 'hosted',
      tierFn: mockTier,
      promptVersion: 'v1',
      schema: customSchema
    });
    
    expect(result.summary).toBe('Great job');
  });

  it('should throw and log on malformed JSON', async () => {
    const logSpy = vi.spyOn(failureLog, 'logAIFailure').mockResolvedValue(undefined);
    
    const mockTier: TierFunction = async () => ({
      content: '{ bad json '
    });
    
    await expect(callModel({
      prompt: 'test',
      tier: 'hosted',
      tierFn: mockTier,
      promptVersion: 'v1',
      retries: 0
    })).rejects.toThrow('parse_error');
    
    expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'parse_error' }));
  });

  it('should handle timeout correctly', async () => {
    const logSpy = vi.spyOn(failureLog, 'logAIFailure').mockResolvedValue(undefined);
    
    const mockTier: TierFunction = async (prompt, signal) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => resolve({ content: '{}' }), 500);
        signal?.addEventListener('abort', () => {
          clearTimeout(timeout);
          const err = new Error('AbortError');
          err.name = 'AbortError';
          reject(err);
        });
      });
    };
    
    await expect(callModel({
      prompt: 'test',
      tier: 'hosted',
      tierFn: mockTier,
      promptVersion: 'v1',
      timeoutMs: 100, // Very short timeout
      retries: 0
    })).rejects.toThrow('AbortError');
    
    expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ errorType: 'timeout' }));
  });
});
