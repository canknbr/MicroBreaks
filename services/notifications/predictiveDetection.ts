/**
 * Predictive Break Detection
 *
 * Pure-JS heuristics that decide whether the user's *current* context
 * justifies suppressing, delaying, or boosting a scheduled break
 * reminder. The composer in `adaptiveCopy.ts` picks the words; this
 * module decides whether to send anything at all.
 *
 * Signals we consider:
 *
 *   - **Recent break density** — if the user took a break in the last
 *     `MIN_GAP_MIN`, suppress (they don't need another one yet).
 *   - **Long silence** — if the user hasn't broken in over
 *     `LONG_SILENCE_MIN`, boost (probably deep in a work session).
 *   - **Today's pacing** — if they're already at goal, lower the
 *     priority; if they're at zero past midday, raise it.
 *   - **Quiet hours** — never fire during the user's configured
 *     downtime window.
 *
 * The output is small and discrete so the caller (notification
 * scheduler) can act without re-analysing.
 */

import type { CompletedBreak } from '@/services/storage';

const MIN_GAP_MIN = 25;          // < this → suppress (just broke)
const LONG_SILENCE_MIN = 120;    // > this → boost (deep session)
const QUIET_HOUR_START = 22;     // 22:00–06:00 → quiet
const QUIET_HOUR_END = 6;

export type PredictiveAction = 'send' | 'boost' | 'suppress' | 'quiet';

export interface PredictiveInput {
  now: Date;
  /** Today's completed breaks (already filtered to today). */
  todayBreaks: CompletedBreak[];
  /** User's daily goal. */
  dailyGoal: number;
  /** Whether the user has Quiet Hours enabled in settings. */
  quietHoursEnabled: boolean;
}

export interface PredictiveResult {
  action: PredictiveAction;
  rationale:
    | 'in_quiet_hours'
    | 'just_broke'
    | 'goal_complete'
    | 'long_silence'
    | 'normal';
  /** Minutes since the last break, or null when there is none today. */
  minutesSinceLastBreak: number | null;
}

function isQuietHour(hour: number): boolean {
  return hour >= QUIET_HOUR_START || hour < QUIET_HOUR_END;
}

function lastBreakTimestamp(breaks: CompletedBreak[]): number | null {
  let latest: number | null = null;
  for (const b of breaks) {
    const t = new Date(b.completedAt).getTime();
    if (Number.isFinite(t) && (latest == null || t > latest)) {
      latest = t;
    }
  }
  return latest;
}

export function decideNotificationAction(input: PredictiveInput): PredictiveResult {
  const lastAt = lastBreakTimestamp(input.todayBreaks);
  const minutesSinceLastBreak =
    lastAt != null ? Math.floor((input.now.getTime() - lastAt) / 60000) : null;

  // Quiet hours always win — the app is meant to be calming, not annoying.
  if (input.quietHoursEnabled && isQuietHour(input.now.getHours())) {
    return { action: 'quiet', rationale: 'in_quiet_hours', minutesSinceLastBreak };
  }

  // Just broke — don't pester.
  if (minutesSinceLastBreak != null && minutesSinceLastBreak < MIN_GAP_MIN) {
    return { action: 'suppress', rationale: 'just_broke', minutesSinceLastBreak };
  }

  // Already at goal — keep it gentle, lower the urgency by suppressing
  // unless something else (streak risk) overrides upstream.
  if (input.dailyGoal > 0 && input.todayBreaks.length >= input.dailyGoal) {
    return { action: 'suppress', rationale: 'goal_complete', minutesSinceLastBreak };
  }

  // Long silence — promote the reminder to "boost" so upstream can
  // pick a stronger title / surface it sooner.
  if (minutesSinceLastBreak != null && minutesSinceLastBreak > LONG_SILENCE_MIN) {
    return { action: 'boost', rationale: 'long_silence', minutesSinceLastBreak };
  }

  // Or no break yet today, past midday, also counts as a long silence.
  if (minutesSinceLastBreak == null && input.now.getHours() >= 14) {
    return { action: 'boost', rationale: 'long_silence', minutesSinceLastBreak };
  }

  return { action: 'send', rationale: 'normal', minutesSinceLastBreak };
}
