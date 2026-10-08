import { describe, it, expect } from 'vitest';
import { getDayKey } from '../../src/domain/time/day_key';

describe('getDayKey', () => {
  it('should return YYYY-MM-DD for a given date in UTC', () => {
    // Note: We're testing a specific date in a specific timezone to avoid flakiness
    const d = new Date('2026-10-08T23:59:00Z');
    // For UTC time zone
    const key = getDayKey(d, 'UTC');
    expect(key).toBe('2026-10-08');
  });

  it('should handle time zones correctly', () => {
    // 2026-10-08 23:00 in New York is 2026-10-09 03:00 UTC
    const d = new Date('2026-10-09T03:00:00Z');
    
    const keyNY = getDayKey(d, 'America/New_York');
    expect(keyNY).toBe('2026-10-08');
    
    const keyTokyo = getDayKey(d, 'Asia/Tokyo');
    expect(keyTokyo).toBe('2026-10-09');
  });

  it('should fallback to local time without errors', () => {
    const d = new Date('2026-10-08T12:00:00'); // Local time
    const key = getDayKey(d);
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    expect(key).toBe(`${year}-${month}-${day}`);
  });
});
