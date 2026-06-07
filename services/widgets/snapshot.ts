/**
 * Widget Snapshot Builder
 *
 * Pure function: takes the raw state held by the various JS stores and
 * collapses it into a single tiny `WidgetSnapshot` the native widget can
 * render in milliseconds. Lives outside the widgetDataBridge so it can
 * be unit-tested without a Zustand store, without AsyncStorage, and
 * without any IO at all.
 */

import type { CompletedBreak } from '@/services/storage';
import type { UserProgress, UserProfile } from '@/store/userStore';
import {
  EMPTY_WIDGET_SNAPSHOT,
  WIDGET_SNAPSHOT_SCHEMA_VERSION,
  type WidgetSnapshot,
} from './types';

export interface BuildSnapshotInputs {
  /** Pulled from `useUserStore.getState().profile`. */
  profile: UserProfile;
  /** Pulled from `useUserStore.getState().progress`. */
  progress: UserProgress;
  /** Full break history; the builder filters today/yesterday itself. */
  history: CompletedBreak[];
  /**
   * Optional precomputed recommendation. Bridge resolves this lazily via
   * the recommendation engine so the snapshot stays a pure transform.
   */
  recommendation?: {
    breakId: string;
    title: string;
    icon: string;
    color: string;
    durationMin: number;
  } | null;
  /** Inject `Date.now()` for deterministic tests. */
  now?: number;
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function safeDate(iso: string | undefined | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Build the widget snapshot. Stable, deterministic, no IO.
 */
export function buildWidgetSnapshot({
  profile,
  progress,
  history,
  recommendation = null,
  now = Date.now(),
}: BuildSnapshotInputs): WidgetSnapshot {
  const today = new Date(now);

  // Today's completed breaks
  const todaysBreaks = history.filter((b) => {
    const date = safeDate(b.completedAt);
    return date != null && isSameLocalDay(date, today);
  });

  const todayMinutes = todaysBreaks.reduce(
    (total, b) => total + Math.max(0, Math.round(b.duration / 60)),
    0
  );

  const breaksGoal = Math.max(1, progress.dailyGoal || EMPTY_WIDGET_SNAPSHOT.today.breaksGoal);
  const breaksTaken = todaysBreaks.length;
  const progressPct = clampPct((breaksTaken / breaksGoal) * 100);

  // Last break — most recent completion across the whole history.
  // We sort ourselves rather than trust the storage layer's ordering.
  const lastBreakRecord = history
    .slice()
    .sort((a, b) => {
      const aDate = safeDate(a.completedAt)?.getTime() ?? 0;
      const bDate = safeDate(b.completedAt)?.getTime() ?? 0;
      return bDate - aDate;
    })[0];

  const lastBreak = lastBreakRecord
    ? {
        completedAt: safeDate(lastBreakRecord.completedAt)?.getTime() ?? now,
        title: lastBreakRecord.title,
        icon: lastBreakRecord.icon,
        color: lastBreakRecord.color,
      }
    : null;

  const streakAtRisk = progress.currentStreak > 0 && breaksTaken === 0;

  const nextRecommended = recommendation
    ? {
        breakId: recommendation.breakId,
        title: recommendation.title,
        icon: recommendation.icon,
        color: recommendation.color,
        durationMin: recommendation.durationMin,
        // Deep link the widget tap launches.
        deepLink: `microbreaks://break/${recommendation.breakId}`,
      }
    : null;

  const userName = profile.name && profile.name.trim().length > 0 ? profile.name.trim() : 'Friend';

  return {
    schemaVersion: WIDGET_SNAPSHOT_SCHEMA_VERSION,
    generatedAt: now,
    today: {
      breaksTaken,
      breaksGoal,
      progressPct,
      totalMinutes: todayMinutes,
    },
    streak: {
      current: progress.currentStreak,
      longest: progress.longestStreak,
      atRisk: streakAtRisk,
    },
    lastBreak,
    nextRecommended,
    user: {
      level: progress.level,
      name: userName,
    },
  };
}
