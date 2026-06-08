/**
 * Daily Missions — Types
 *
 * Three small goals offered each day. Each mission is independently
 * completable and awards a bonus XP nugget when finished. Missions
 * are *additive* to the normal break loop — they reward variety and
 * timing, not replace the streak system.
 *
 * Mission kinds:
 *   - `take_breaks` — complete N breaks today (count target)
 *   - `mindful_break` — complete at least one break in a target
 *     category today (used for diversification)
 *   - `long_break` — complete a single break ≥ N seconds
 *   - `morning_break` — complete a break before a target hour
 *   - `evening_break` — complete a break at/after a target hour
 *
 * Adding a new kind is a three-edit change: kind union, template
 * pool, evaluator branch. Nothing else looks at the kind directly.
 */

export type MissionKind =
  | 'take_breaks'
  | 'mindful_break'
  | 'long_break'
  | 'morning_break'
  | 'evening_break';

export interface Mission {
  /** Stable id used as a React key + for analytics. */
  id: string;
  kind: MissionKind;
  /** Numerical target (count, seconds, or hour boundary). */
  target: number;
  /** Optional category filter for kinds that need one. */
  category?: string;
  /** Current numerical progress toward `target`. */
  progress: number;
  /** Latched once `progress` first hits `target`. */
  completed: boolean;
  /** ISO timestamp set the moment the mission completes. */
  completedAt: string | null;
  /** Bonus XP awarded on completion. */
  bonusXP: number;
  /** Short human-readable description. */
  description: string;
}

export interface MissionsState {
  /** Active mission set for `dayStart`. */
  missions: Mission[];
  /** Local YYYY-MM-DD this mission set was generated for. */
  dayStart: string;
  /** Sum of bonus XP earned from missions completed today. */
  bonusXPEarned: number;
}
