/**
 * Smoke coverage for the deep-link routing helper that ships in
 * `hooks/useNotificationDeepLinks.ts`. The hook itself wires into the
 * root layout and binds to expo-notifications callbacks — we exercise
 * the pure routing path here so it cannot regress when notification
 * types are added or renamed.
 *
 * Audit task C-TEST1.
 */

import { routeForNotification } from '@/hooks/useNotificationDeepLinks';

describe('routeForNotification', () => {
  it.each([
    ['break_reminder', '/breaks'],
    ['streak_protection', '/breaks'],
    ['daily_goal', '/stats'],
  ])('routes "%s" notifications to %s', (type, target) => {
    expect(routeForNotification({ type })).toBe(target);
  });

  it('routes pain-focused break reminders into the matching library zone', () => {
    expect(routeForNotification({ type: 'break_reminder', pain: 'neck' })).toBe(
      '/exercise-library?initialZone=neck'
    );
    expect(routeForNotification({ type: 'break_reminder', pain: 'shoulders' })).toBe(
      '/exercise-library?initialZone=neck'
    );
    expect(routeForNotification({ type: 'break_reminder', pain: 'lower_back' })).toBe(
      '/exercise-library?initialZone=back'
    );
    expect(routeForNotification({ type: 'break_reminder', pain: 'wrists' })).toBe(
      '/exercise-library?initialZone=arms'
    );
    // Eyes has no movement zone — fall back to the breaks tab.
    expect(routeForNotification({ type: 'break_reminder', pain: 'eyes' })).toBe('/breaks');
    // Defensive: unknown or non-string pain values keep legacy routing.
    expect(routeForNotification({ type: 'break_reminder', pain: 'unknown_area' })).toBe('/breaks');
    expect(routeForNotification({ type: 'break_reminder', pain: 42 })).toBe('/breaks');
  });

  it('returns null for unknown notification types', () => {
    expect(routeForNotification({ type: 'this_is_not_a_real_notification' })).toBeNull();
  });

  it('returns null when there is no data payload', () => {
    expect(routeForNotification(undefined)).toBeNull();
    expect(routeForNotification(null)).toBeNull();
    expect(routeForNotification({})).toBeNull();
  });

  it('ignores non-string type fields defensively', () => {
    expect(routeForNotification({ type: 42 as unknown as string })).toBeNull();
    expect(routeForNotification({ type: { kind: 'break_reminder' } as unknown as string })).toBeNull();
  });
});
