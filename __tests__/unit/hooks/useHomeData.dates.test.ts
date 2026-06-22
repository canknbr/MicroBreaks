/**
 * useHomeData date-keying regression tests.
 *
 * Pinned to a UTC+ timezone (Asia/Istanbul, UTC+3) because the streak-calendar
 * bug only manifests for positive UTC offsets: local midnight maps to the
 * PREVIOUS calendar day in UTC, so a toISOString()-based key landed on the
 * wrong day versus the local-keyed streak history.
 */
process.env.TZ = 'Asia/Istanbul';

import { calculateWeeklyDays } from '@/hooks/useHomeData';

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
