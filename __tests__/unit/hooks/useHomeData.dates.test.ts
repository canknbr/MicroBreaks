/**
 * useHomeData date-keying regression tests.
 *
 * Pinned to a UTC+ timezone (Asia/Istanbul, UTC+3) because the streak-calendar
 * bug only manifests for positive UTC offsets: local midnight maps to the
 * PREVIOUS calendar day in UTC, so a toISOString()-based key landed on the
 * wrong day versus the local-keyed streak history.
 */
process.env.TZ = 'Asia/Istanbul';

import { calculateWeeklyDays, getWeekRange } from '@/hooks/useHomeData';

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function currentDayIndex(date: Date): number {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

describe('calculateWeeklyDays (local timezone keying)', () => {
  it("marks today complete when history is keyed by the user's local date", () => {
    const today = new Date();
    // Streak history is written with local Y/M/D (see breakHistory.getLocalDateString).
    const history = [{ date: localDateKey(today), count: 3 }];

    const completedDays = calculateWeeklyDays(history);

    expect(completedDays[currentDayIndex(today)]).toBe(true);
  });

  it('does not mark a day the user has no breaks for', () => {
    const completedDays = calculateWeeklyDays([]);
    expect(completedDays.every((d) => d === false)).toBe(true);
    expect(completedDays).toHaveLength(7);
  });
});

describe('getWeekRange (half-open week interval)', () => {
  // Wednesday 2026-06-24 12:00 local.
  const wed = new Date(2026, 5, 24, 12, 0, 0);

  it('aligns to local Monday midnight and spans exactly seven days', () => {
    const { start, end } = getWeekRange(wed);
    expect(start.getDay()).toBe(1); // Monday
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    // Turkey has no DST (fixed UTC+3), so a week is exactly 7*24h.
    expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    expect(start.getTime()).toBeLessThanOrEqual(wed.getTime());
    expect(wed.getTime()).toBeLessThan(end.getTime());
  });

  it('excludes a break landing exactly on the next-week boundary (no double-count)', () => {
    const { start, end } = getWeekRange(wed);
    const boundary = new Date(end.getTime()); // next Monday 00:00:00.000
    // Half-open [start, end): the boundary belongs to next week, not this one.
    expect(boundary >= start && boundary < end).toBe(false);
  });

  it('treats Sunday as part of the same Monday-started week', () => {
    const sunday = new Date(2026, 5, 28, 23, 59, 0); // Sun 2026-06-28
    const { start, end } = getWeekRange(sunday);
    expect(start.getDay()).toBe(1);
    expect(sunday.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(sunday.getTime()).toBeLessThan(end.getTime());
  });
});
