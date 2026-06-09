/**
 * useFreeQuotaCheck
 *
 * Fetches today's break history once on mount and reports the
 * current free-quota state. Use it from `/break-session` to bounce
 * a free user who's already hit the daily cap.
 *
 * Paid users never see the cap — pass `enabled: false` (or just
 * skip the hook) and it's a no-op.
 */

import { useEffect, useState } from 'react';
import { getTodayBreaks } from '@/services/breakHistory';
import {
  FREE_DAILY_BREAK_LIMIT,
  getFreeBreakUsage,
  type FreeQuotaUsage,
} from '@/services/subscription/freeQuota';

export interface FreeQuotaCheck {
  /** Computed usage; null until the history fetch lands. */
  usage: FreeQuotaUsage | null;
  /** True iff the cap has been reached AND `enabled` is true. */
  exhausted: boolean;
  /** Loading flag for UI that wants to wait. */
  loading: boolean;
}

interface UseFreeQuotaCheckOptions {
  /** When false, the hook is a no-op (useful for paid tiers). */
  enabled: boolean;
  /** Override the cap. Defaults to FREE_DAILY_BREAK_LIMIT. */
  limit?: number;
}

export function useFreeQuotaCheck(
  options: UseFreeQuotaCheckOptions
): FreeQuotaCheck {
  const [usage, setUsage] = useState<FreeQuotaUsage | null>(null);
  const [loading, setLoading] = useState(options.enabled);

  useEffect(() => {
    if (!options.enabled) {
      setLoading(false);
      setUsage(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const today = await getTodayBreaks();
        if (cancelled) return;
        setUsage(
          getFreeBreakUsage(today, {
            now: new Date(),
            limit: options.limit ?? FREE_DAILY_BREAK_LIMIT,
          })
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [options.enabled, options.limit]);

  return {
    usage,
    exhausted: options.enabled && usage?.exhausted === true,
    loading,
  };
}
