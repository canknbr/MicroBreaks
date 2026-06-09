/**
 * useEffectiveTier
 *
 * Returns the *effective* tier for the current user — the source of
 * truth for any feature-gate check in the app.
 *
 * The resolution combines two signals:
 *
 *   - **Server ledger** (`useServerEntitlement`) — what the RevenueCat
 *     webhook last wrote to `users/{uid}/entitlements/current`.
 *     Trusted: a hostile client can't fake this row.
 *
 *   - **Local subscription store** — what the RevenueCat client SDK
 *     observed at last refresh. Faster (no network), but spoofable.
 *
 * When the server has answered, server wins. Before that, we take
 * the local tier so a user who just bought doesn't see a paywall
 * flash before the webhook has had a chance to fire.
 */

import { useMemo } from 'react';
import { useServerEntitlement } from './useServerEntitlement';
import { useSubscriptionCustomer } from '@/store/subscriptionStore';
import {
  getActiveTier,
  resolveEffectiveTier,
  type Tier,
} from '@/services/subscription/tiers';

export interface EffectiveTierView {
  /** The resolved tier — use this for every gate check. */
  tier: Tier;
  /** True once the server ledger has responded (vs. still optimistic). */
  loaded: boolean;
  /** Server-trusted tier in isolation, for debug/diagnostics. */
  serverTier: Tier;
  /** Local-claimed tier in isolation, for debug/diagnostics. */
  localTier: Tier;
}

export function useEffectiveTier(): EffectiveTierView {
  const { entitlement, loaded } = useServerEntitlement();
  const customer = useSubscriptionCustomer();

  return useMemo(() => {
    const localTier = getActiveTier(customer);
    const serverTier = entitlement.tier;
    return {
      tier: resolveEffectiveTier({ serverLoaded: loaded, serverTier, localTier }),
      loaded,
      serverTier,
      localTier,
    };
  }, [entitlement.tier, loaded, customer]);
}
