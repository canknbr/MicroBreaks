/**
 * useTierFeature
 *
 * Per-feature gate. Returns whether the current effective tier
 * includes the requested feature, plus the minimum tier required
 * to unlock it (useful for the "Upgrade to Pro" copy on a paywall
 * card).
 *
 * Usage:
 *   const gate = useTierFeature('weekly_recovery_story');
 *   if (gate.loading) return <Spinner />;
 *   if (!gate.hasFeature) return <UpgradeCard requires={gate.requiredTier} />;
 *   return <FeatureBody />;
 */

import { useMemo } from 'react';
import { useEffectiveTier } from './useEffectiveTier';
import {
  getRequiredTier,
  tierIncludes,
  type Tier,
  type TierFeature,
} from '@/services/subscription/tiers';

export interface TierFeatureGate {
  /** True iff the current effective tier unlocks this feature. */
  hasFeature: boolean;
  /** The user's effective tier — handy for analytics on blocked attempts. */
  tier: Tier;
  /** Min tier required to unlock — drive the upgrade copy with this. */
  requiredTier: Tier;
  /** True while the server ledger hasn't answered yet. */
  loading: boolean;
}

export function useTierFeature(feature: TierFeature): TierFeatureGate {
  const { tier, loaded } = useEffectiveTier();

  return useMemo(
    () => ({
      hasFeature: tierIncludes(tier, feature),
      tier,
      requiredTier: getRequiredTier(feature),
      loading: !loaded,
    }),
    [tier, loaded, feature]
  );
}
