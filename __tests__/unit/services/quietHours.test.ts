/**
 * Quiet-hours table-driven tests (audit task C-TEST5).
 * Covers the cross-midnight branches and disabled state of
 * `isWithinQuietHoursForDate` so future refactors do not silently regress
 * the "do not nudge me at 3am" guarantee.
 */

import { __notificationsTestUtils, DEFAULT_NOTIFICATION_SETTINGS } from '@/services/notifications';

const { isWithinQuietHoursForDate } = __notificationsTestUtils;

function settings(overrides: Partial<typeof DEFAULT_NOTIFICATION_SETTINGS>) {
  return { ...DEFAULT_NOTIFICATION_SETTINGS, ...overrides };
}

function dateAt(hour: number, minute = 0): Date {
  const d = new Date(2026, 5, 5, hour, minute, 0, 0);
  return d;
}

describe('isWithinQuietHoursForDate', () => {
  describe('when quiet hours are disabled', () => {
    it('always returns false', () => {
      const s = settings({ quietHoursEnabled: false, quietHoursStart: 22, quietHoursEnd: 8 });
      expect(isWithinQuietHoursForDate(dateAt(23), s)).toBe(false);
      expect(isWithinQuietHoursForDate(dateAt(3), s)).toBe(false);
      expect(isWithinQuietHoursForDate(dateAt(12), s)).toBe(false);
    });
  });

  describe('cross-midnight window (22:00 → 08:00)', () => {
    const s = settings({ quietHoursEnabled: true, quietHoursStart: 22, quietHoursEnd: 8 });

    it.each([
      [22, true, 'right at start hour'],
      [23, true, 'one hour after start'],
      [0, true, 'midnight'],
      [3, true, 'middle of the night'],
      [7, true, 'one hour before end'],
      [8, false, 'right at end hour'],
      [9, false, 'one hour after end'],
      [12, false, 'noon — middle of allowed window'],
      [21, false, 'one hour before start'],
    ])('hour %i (%s)', (hour, expected) => {
      expect(isWithinQuietHoursForDate(dateAt(hour), s)).toBe(expected);
    });
  });

  describe('same-day window (12:00 → 14:00)', () => {
    const s = settings({ quietHoursEnabled: true, quietHoursStart: 12, quietHoursEnd: 14 });

    it.each([
      [11, false, 'one hour before'],
      [12, true, 'right at start'],
      [13, true, 'middle'],
      [14, false, 'right at end'],
      [15, false, 'after end'],
      [0, false, 'midnight is outside'],
    ])('hour %i (%s)', (hour, expected) => {
      expect(isWithinQuietHoursForDate(dateAt(hour), s)).toBe(expected);
    });
  });

  describe('degenerate window where start == end', () => {
    const s = settings({ quietHoursEnabled: true, quietHoursStart: 22, quietHoursEnd: 22 });

    it('returns false because the inclusive-exclusive bounds collapse', () => {
      // The implementation uses `currentHour >= start && currentHour < end`.
      // With start == end this collapses to "never". That matches the spirit
      // of "no quiet hours configured" and prevents the 14-attempt scheduler
      // loop from spinning forever.
      expect(isWithinQuietHoursForDate(dateAt(22), s)).toBe(false);
      expect(isWithinQuietHoursForDate(dateAt(23), s)).toBe(false);
      expect(isWithinQuietHoursForDate(dateAt(3), s)).toBe(false);
    });
  });
});
