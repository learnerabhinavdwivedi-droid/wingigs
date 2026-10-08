import { describe, it, expect, vi } from 'vitest';
import { callModel, TierFunction } from '../../src/ai/callModel';
import * as failureLog from '../../src/data/local/failure_log';

describe('callModel', () => {
  it('should parse valid JSON', async () => {
    const mockTier: TierFunction = async () => ({
      content: JSON.stringify({
        items: [{ id: '1', name: 'Drill', minutes: 10, intensity: 'low' }]
      })
    });
    
    const result = await callModel({
      prompt: 'test',
      tier: 'hosted',
      tierFn: mockTier,
      promptVersion: 'v1'
    });
    
    expect(result.items.length).toBe(1);
    expect(result.items[0].name).toBe('Drill');
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
