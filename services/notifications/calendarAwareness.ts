/**
 * Calendar Awareness
 *
 * Pure-JS helpers that reason about whether a proposed reminder time
 * lands inside the user's busy windows and, if so, shift it to the
 * next free slot.
 *
 * The actual EventKit / expo-calendar plumbing lives in
 * `calendarSource.ts`; this module is platform-agnostic and trivial
 * to unit test.
 *
 * Design goals:
 *   - **Fail open** — if we cannot determine busy state, we treat the
 *     time as free. A missed reminder is worse than a slightly
 *     misplaced one.
 *   - **Bounded lookahead** — we never push a reminder further than
 *     ~90 minutes from its requested time. Past that, the user is
 *     better off with a clean miss than a stale reminder.
 *   - **Buffer after meetings** — when we shift past a busy window we
 *     add a small grace period so the reminder doesn't land the
 *     instant the meeting ends; people need a beat.
 */

export interface BusyWindow {
  /** Window start, ms since epoch. */
  startMs: number;
  /** Window end, ms since epoch (exclusive). */
  endMs: number;
  /** Optional human label (kept for breadcrumbs only). */
  title?: string;
}

export interface FreeSlotOptions {
  /** Pad past the end of a meeting before firing. */
  bufferAfterMin: number;
  /** Stop searching past this many minutes from the original time. */
  maxLookaheadMin: number;
}

const DEFAULT_OPTIONS: FreeSlotOptions = {
  bufferAfterMin: 3,
  maxLookaheadMin: 90,
};

/** True if `at` falls strictly inside any of the given busy windows. */
export function isInBusyWindow(at: Date, windows: BusyWindow[]): boolean {
  const t = at.getTime();
  return windows.some((w) => t >= w.startMs && t < w.endMs);
}

/**
 * Walk forward from `proposed` until we find a moment outside every
 * busy window. Returns null if no such moment exists within the
 * lookahead budget.
 */
export function findNextFreeSlot(
  proposed: Date,
  windows: BusyWindow[],
  options: FreeSlotOptions = DEFAULT_OPTIONS
): Date | null {
  if (windows.length === 0) {
    return proposed;
  }

  const maxMs = proposed.getTime() + options.maxLookaheadMin * 60_000;
  const bufferMs = options.bufferAfterMin * 60_000;

  // Sort defensively — callers may pass unsorted events.
  const sorted = [...windows].sort((a, b) => a.startMs - b.startMs);

  let candidate = proposed.getTime();

  // Hard cap iteration so a pathological calendar can't loop forever.
  for (let i = 0; i < 32; i += 1) {
    const hit = sorted.find((w) => candidate >= w.startMs && candidate < w.endMs);
    if (!hit) {
      return new Date(candidate);
    }
    candidate = hit.endMs + bufferMs;
    if (candidate > maxMs) {
      return null;
    }
  }

  return null;
}
