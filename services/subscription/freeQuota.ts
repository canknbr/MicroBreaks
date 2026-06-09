/**
 * Free Daily Break Quota
 *
 * Free-tier users can start at most `FREE_DAILY_BREAK_LIMIT` break
 * sessions per local day. Once the cap is hit, `/break-session`
 * redirects to the paywall instead of mounting a session. Paid
 * tiers ignore the cap entirely.
 *
 * The pure helper here only does counting — the caller decides
 * whether to apply it based on tier. This keeps the helper testable
 * without a tier mock and makes the cap reusable for future "free
 * users get N of X per day" surfaces.
 *
 * Counts every `CompletedBreak` whose `completedAt` falls on the
 * caller-provided `now`'s local date — not a rolling 24h window,
 * because users live by calendar days. A break at 23:55 doesn't
 * stop a fresh attempt at 00:05.
 */

import type { CompletedBreak } from '@/services/storage';

/** Default cap for the Free tier. Tuned for conversion + usefulness. */
export const FREE_DAILY_BREAK_LIMIT = 5;

export interface FreeQuotaUsage {
  /** How many breaks the user has logged today. */
  used: number;
  /** Daily cap. */
  limit: number;
  /** `limit - used`, floored at 0. */
  remaining: number;
  /** True iff used >= limit. */
  exhausted: boolean;
}

export interface FreeQuotaOptions {
  /** `Date.now()` injection point so tests can pin the day. */
  now: Date;
  /** Override the cap. Defaults to FREE_DAILY_BREAK_LIMIT. */
  limit?: number;
}

function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Count today's completed breaks and report usage / remaining.
 * Pure — no I/O, no tier check. The caller decides whether to
 * apply the cap based on the user's tier.
 */
export function getFreeBreakUsage(
  history: ReadonlyArray<CompletedBreak>,
  options: FreeQuotaOptions
): FreeQuotaUsage {
  const limit = options.limit ?? FREE_DAILY_BREAK_LIMIT;
  const todayStr = localDateString(options.now);

  let used = 0;
  for (const b of history) {
    const t = new Date(b.completedAt);
    if (!Number.isFinite(t.getTime())) continue;
    if (localDateString(t) !== todayStr) continue;
    used += 1;
  }

  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    exhausted: used >= limit,
  };
}
