/**
 * Calendar Source
 *
 * Adapter around `expo-calendar` that returns busy windows for a
 * time range. Fails open: if the package isn't installed, the user
 * hasn't granted calendar permission, or any read throws, we return
 * an empty array so the rest of the notification pipeline behaves
 * exactly as it did before calendar awareness existed.
 *
 * The lazy require pattern means this module is safe to import in
 * the test environment and on platforms where expo-calendar hasn't
 * been linked yet. Once the user runs `npx expo install
 * expo-calendar` and prebuilds, the adapter activates without any
 * other code changes.
 */

import type { BusyWindow } from './calendarAwareness';

// Loose type for the dynamically-required `expo-calendar` module. We
// only touch a few well-known surface methods and the catch in
// `getBusyWindows` swallows any shape mismatch at runtime.
interface CalendarModuleLike {
  getCalendarPermissionsAsync: () => Promise<{ status: string }>;
  getCalendarsAsync: (type: string) => Promise<{ id: string }[]>;
  getEventsAsync: (
    calendarIds: string[],
    start: Date,
    end: Date
  ) => Promise<
    { startDate: string | Date; endDate: string | Date; title?: string; allDay?: boolean; availability?: string }[]
  >;
  EntityTypes?: { EVENT?: string };
}

let cached: CalendarModuleLike | null = null;
let resolved = false;

function getCalendar(): CalendarModuleLike | null {
  if (resolved) return cached;
  resolved = true;
  try {
    // Lazy require so the bundler does not crash on platforms where
    // expo-calendar isn't linked. The catch below handles both
    // "module not found" and "native module not registered".
    cached = require('expo-calendar') as CalendarModuleLike;
  } catch {
    cached = null;
  }
  return cached;
}

/** Test seam: pretend calendar isn't installed. */
export function __resetCalendarSourceForTests(): void {
  cached = null;
  resolved = false;
}

/** Test seam: inject a mock calendar module. */
export function __setCalendarModuleForTests(mod: CalendarModuleLike | null): void {
  cached = mod;
  resolved = true;
}

/**
 * Fetch busy windows from the user's calendars between two times.
 * Returns an empty array if anything goes wrong — see module header.
 */
export async function getBusyWindows(
  rangeStart: Date,
  rangeEnd: Date
): Promise<BusyWindow[]> {
  const Calendar = getCalendar();
  if (!Calendar) return [];

  try {
    const perm = await Calendar.getCalendarPermissionsAsync();
    if (perm?.status !== 'granted') return [];

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes?.EVENT ?? 'event'
    );
    if (!Array.isArray(calendars) || calendars.length === 0) return [];

    const ids = calendars.map((c) => c.id);
    const events = await Calendar.getEventsAsync(ids, rangeStart, rangeEnd);
    if (!Array.isArray(events)) return [];

    return events
      .filter((e) => !e.allDay && e.availability !== 'free')
      .map<BusyWindow>((e) => ({
        startMs: new Date(e.startDate).getTime(),
        endMs: new Date(e.endDate).getTime(),
        title: e.title,
      }))
      .filter((w) => Number.isFinite(w.startMs) && Number.isFinite(w.endMs));
  } catch {
    return [];
  }
}
