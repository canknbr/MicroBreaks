/**
 * Mission Evaluator
 *
 * Given the current mission set and a freshly completed break,
 * returns the updated mission set plus the list of missions that
 * transitioned from incomplete to complete this call. The caller
 * uses that delta to award bonus XP, fire haptics, queue analytics,
 * etc.
 *
 * Pure: no I/O, no stores, no globals. Same inputs → same outputs.
 */

import type { CompletedBreak } from '@/services/storage';
import type { Mission, MissionKind } from './types';

export interface EvaluateInput {
  missions: Mission[];
  /** The break the user just completed. */
  newBreak: CompletedBreak;
  /**
   * Today's full break history including `newBreak`. Used by count
   * missions so the result is idempotent across re-evaluations.
   */
  todayBreaks: CompletedBreak[];
}

export interface EvaluateResult {
  missions: Mission[];
  /** Missions that just transitioned from `completed=false` to `true`. */
  newlyCompleted: Mission[];
}

function breakHour(b: CompletedBreak): number {
  return new Date(b.completedAt).getHours();
}

function recomputeProgress(
  m: Mission,
  _newBreak: CompletedBreak,
  todayBreaks: CompletedBreak[]
): number {
  switch (m.kind as MissionKind) {
    case 'take_breaks':
      return Math.min(todayBreaks.length, m.target);

    case 'mindful_break':
      // Any break matching the category counts; we use min(matches, target)
      // so future multi-target variants slot in cleanly.
      return Math.min(
        todayBreaks.filter((b) => b.category === m.category).length,
        m.target
      );

    case 'long_break': {
      const longest = Math.max(
        0,
        ...todayBreaks.map((b) => b.duration ?? 0)
      );
      return longest >= m.target ? m.target : longest;
    }

    case 'morning_break':
      return todayBreaks.some((b) => breakHour(b) < m.target) ? m.target : 0;

    case 'evening_break':
      return todayBreaks.some((b) => breakHour(b) >= m.target) ? m.target : 0;
  }
}

export function evaluateMissions(input: EvaluateInput): EvaluateResult {
  const completedNow: Mission[] = [];
  const next = input.missions.map((m) => {
    if (m.completed) return m;
    const progress = recomputeProgress(m, input.newBreak, input.todayBreaks);
    const completed = progress >= m.target;
    if (completed) {
      const updated: Mission = {
        ...m,
        progress,
        completed: true,
        completedAt: input.newBreak.completedAt,
      };
      completedNow.push(updated);
      return updated;
    }
    return { ...m, progress };
  });
  return { missions: next, newlyCompleted: completedNow };
}
