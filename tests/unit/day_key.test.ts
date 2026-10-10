import { describe, it, expect } from 'vitest';
import { getDayKey } from '../../src/domain/time/day_key';

describe('getDayKey', () => {
  it('should return YYYY-MM-DD for a given date with 4 AM boundary', () => {
    // 2026-10-09 01:00 UTC -> Subtract 4 hours -> 2026-10-08 21:00 UTC -> day key 2026-10-08
    const d = new Date('2026-10-09T01:00:00Z');
    const key = getDayKey(d, 'UTC');
    expect(key).toBe('2026-10-08');
  });

  it('should treat 5 AM as the new day', () => {
    // 2026-10-09 05:00 UTC -> Subtract 4 hours -> 2026-10-09 01:00 UTC -> day key 2026-10-09
    const d = new Date('2026-10-09T05:00:00Z');
    const key = getDayKey(d, 'UTC');
    expect(key).toBe('2026-10-09');
  });

  it('should handle time zones correctly', () => {
    // 2026-10-09 02:00 in New York
    // Subtract 4 hours -> 2026-10-08 22:00 in NY -> day key 2026-10-08
    const d = new Date('2026-10-09T06:00:00Z'); // 02:00 NY time
    const keyNY = getDayKey(d, 'America/New_York');
    expect(keyNY).toBe('2026-10-08');
  });
});
