/**
 * Regression: getNextNotificationTime must not skip an entire valid work day
 * when "now" is on a non-work day late at night with cross-midnight quiet
 * hours. Previously the non-work-day branch advanced the date but kept the
 * late hour, which the quiet-hours shift then pushed to the FOLLOWING day.
 */
import { __notificationsTestUtils, DEFAULT_NOTIFICATION_SETTINGS } from '@/services/notifications';

const { getNextNotificationTime } = __notificationsTestUtils;

describe('getNextNotificationTime work-day + cross-midnight quiet hours', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules the first reminder on the next work day, not the day after', () => {
    // Sunday 2026-06-21 23:30 local (Sunday is not a work day).
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 21, 23, 30, 0, 0));

    const settings = {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      enabled: true,
      breakReminders: true,
      reminderIntervalMinutes: 25,
      quietHoursEnabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
      workDaysOnly: true,
      workDays: [1, 2, 3, 4, 5],
    };

    const next = getNextNotificationTime(settings);

    // Expected: Monday 2026-06-22 08:00 (quiet-hours end on the first work day).
    expect(next.getDay()).toBe(1); // Monday, not Tuesday
    expect(next.getDate()).toBe(22);
    expect(next.getHours()).toBe(8);
  });
});
