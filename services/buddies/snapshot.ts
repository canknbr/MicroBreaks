/**
 * Buddy Daily Snapshot
 *
 * Pure helpers that produce the per-day snapshot the user publishes
 * to their buddies, and consume a buddy's snapshot to drive UI
 * affordances ("did they break today?", "are they on a longer streak
 * than me?", etc).
 *
 * Identity-light by design: a snapshot never contains the user's
 * Firebase UID, exact break times below hour granularity, or any
 * category / pain-area data.
 */

import type { CompletedBreak, StreakData } from '@/services/storage';
import type { Buddy, BuddyStreakSnapshot } from './types';

function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface BuildSnapshotInput {
  /** `Date.now()` injection point so tests can pin a day. */
  now: Date;
  /** Full break history; we filter to today ourselves. */
  history: ReadonlyArray<CompletedBreak>;
  /** Streak data — we publish currentStreak, never longestStreak. */
  streak: StreakData;
}

/**
 * Build today's snapshot for the current user. Pure — call this
 * after a break completes (and at app launch) before writing to
 * Firestore. Hour rounding is what protects buddy privacy: a buddy
 * sees "they broke around 2pm", not "at 14:07:42".
 */
export function buildBuddySnapshot(input: BuildSnapshotInput): BuddyStreakSnapshot {
  const today = localDateString(input.now);
  const todayBreaks = input.history.filter((b) => {
    const t = new Date(b.completedAt);
    return Number.isFinite(t.getTime()) && localDateString(t) === today;
  });

  let lastBreakHour: number | null = null;
  let lastBreakTime = -1;
  for (const b of todayBreaks) {
    const t = new Date(b.completedAt).getTime();
    if (t > lastBreakTime) {
      lastBreakTime = t;
      lastBreakHour = new Date(t).getHours();
    }
  }

  return {
    date: today,
    currentStreak: input.streak.currentStreak,
    brokeToday: todayBreaks.length > 0,
    lastBreakHour,
    updatedAt: input.now.toISOString(),
  };
}

export interface BuddyWithSnapshot {
  buddy: Buddy;
  snapshot: BuddyStreakSnapshot | null;
}

/**
 * Sort buddies for the home strip. Order:
 *   1. Has snapshot AND broke today (active right now)
 *   2. Has snapshot, hasn't broken today (gentle nudge)
 *   3. Has no snapshot yet (unknown / first-day)
 * Within each tier, longer current streaks come first.
 */
export function sortBuddiesForDisplay(
  entries: ReadonlyArray<BuddyWithSnapshot>
): BuddyWithSnapshot[] {
  const ranked = entries.map((entry) => {
    const snap = entry.snapshot;
    const rank = snap == null ? 2 : snap.brokeToday ? 0 : 1;
    return { entry, rank };
  });

  ranked.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    const sA = a.entry.snapshot?.currentStreak ?? 0;
    const sB = b.entry.snapshot?.currentStreak ?? 0;
    return sB - sA;
  });

  return ranked.map((r) => r.entry);
}

/**
 * Friendly status string for a buddy's most recent snapshot.
 * Returns a short label suitable for a chip/badge. Designed to be
 * gentle, not competitive — "Took a break around 2pm", not "AHEAD".
 */
export function describeBuddyState(snapshot: BuddyStreakSnapshot | null): string {
  if (!snapshot) return 'Just joined';
  if (snapshot.brokeToday) {
    const hour = snapshot.lastBreakHour;
    if (hour == null) return 'Broke today';
    const formatted = hour === 0
      ? '12am'
      : hour < 12
        ? `${hour}am`
        : hour === 12
          ? '12pm'
          : `${hour - 12}pm`;
    return `Broke around ${formatted}`;
  }
  return snapshot.currentStreak > 0
    ? `${snapshot.currentStreak}-day streak — hasn't broken today`
    : 'No streak yet';
}
