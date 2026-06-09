/**
 * Exercise Access Gate
 *
 * Single pure helper that decides whether a given exercise is
 * playable for a given tier. Used by:
 *
 *   - `app/break-session.tsx` — defense-in-depth screen gate
 *   - `app/(tabs)/breaks.tsx` — tab-level lock badge
 *   - `services/shortcuts/handler.ts` — Siri / App Intent entrypoint
 *   - `hooks/useTimer.ts` — Pomodoro break auto-launch
 *
 * The free catalog is six exercises from `FREE_EXERCISE_IDS`.
 * Anything outside that list requires `full_break_library` (Solo+).
 * Unknown ids are treated as locked — we won't accidentally hand a
 * free pass to an exercise we don't recognise.
 */

import { FREE_EXERCISE_IDS } from '@/constants/subscription';
import { tierIncludes, type Tier } from './tiers';

const FREE_SET = new Set<string>(FREE_EXERCISE_IDS);

/** True if the exercise is part of the always-free starter set. */
export function isFreeExercise(exerciseId: string | null | undefined): boolean {
  if (!exerciseId) return false;
  return FREE_SET.has(exerciseId);
}

/**
 * True if the user needs to upgrade to start this exercise.
 * Returns false for free exercises and for paid exercises when the
 * tier already includes the full library.
 */
export function requiresUpgradeForExercise(
  exerciseId: string | null | undefined,
  tier: Tier
): boolean {
  if (!exerciseId) return false; // unknown id — let the screen handle
  if (isFreeExercise(exerciseId)) return false;
  return !tierIncludes(tier, 'full_break_library');
}
