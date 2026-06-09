/**
 * Subscription Tiers
 *
 * Layers a three-tier model (Solo / Pro / Family) on top of the
 * existing single-entitlement subscription state without changing
 * the persisted customer shape. The active tier is derived from the
 * customer's `activeOfferId` via a prefix convention:
 *
 *   solo_*    → 'solo'
 *   pro_*     → 'pro'
 *   family_*  → 'family'
 *
 * A user with no active subscription resolves to `'free'`. Feature
 * gating goes through `tierIncludes(activeTier, feature)`, which
 * encodes the inheritance: family ⊇ pro ⊇ solo ⊇ free.
 *
 * Keeping this layer separate from the store means we can ship the
 * tier UI + RevenueCat product config independently without
 * migrating persisted state or touching the existing pro_* offer
 * flow.
 */

import type { SubscriptionCustomerState } from '@/services/billing/types';

export type Tier = 'free' | 'solo' | 'pro' | 'family';

/** Feature keys gated by tier. */
export type TierFeature =
  | 'starter_breaks'        // free baseline
  | 'full_break_library'    // solo+
  | 'weekly_recovery_story' // solo+
  | 'daily_missions'        // solo+
  | 'apple_health_export'   // pro+
  | 'calendar_aware'        // pro+
  | 'unlimited_custom'      // pro+
  | 'streak_buddies'        // family+
  | 'family_sharing';       // family+

/**
 * Rank tiers numerically so `tierIncludes` reduces to a >= check.
 * A higher rank is a strict superset of every lower-rank tier.
 */
const TIER_RANK: Record<Tier, number> = {
  free: 0,
  solo: 1,
  pro: 2,
  family: 3,
};

/** Minimum tier required for each feature. */
const FEATURE_MIN_TIER: Record<TierFeature, Tier> = {
  starter_breaks: 'free',
  full_break_library: 'solo',
  weekly_recovery_story: 'solo',
  daily_missions: 'solo',
  apple_health_export: 'pro',
  calendar_aware: 'pro',
  unlimited_custom: 'pro',
  streak_buddies: 'family',
  family_sharing: 'family',
};

/** Maximum entitled seats per tier. Family is the only multi-seat tier. */
export const TIER_SEATS: Record<Tier, number> = {
  free: 1,
  solo: 1,
  pro: 1,
  family: 6,
};

/**
 * Resolve the tier for a given offer id using the documented prefix
 * convention. Unknown ids fall back to 'pro' to keep legacy single-
 * tier purchases working — those offer ids look like `pro_annual` /
 * `pro_monthly` already.
 */
export function getTierForOfferId(offerId: string | null | undefined): Tier {
  if (!offerId) return 'free';
  if (offerId.startsWith('family_')) return 'family';
  if (offerId.startsWith('solo_')) return 'solo';
  if (offerId.startsWith('pro_')) return 'pro';
  return 'pro';
}

/**
 * Returns the active tier from a customer state. Anything other
 * than a paid status ('trial' or 'premium') resolves to 'free'.
 * 'trial' counts as the tier they're trialling — that's the
 * promise of a trial.
 */
export function getActiveTier(customer: SubscriptionCustomerState): Tier {
  if (customer.status !== 'trial' && customer.status !== 'premium') {
    return 'free';
  }
  return getTierForOfferId(customer.activeOfferId);
}

/**
 * Feature gate. Returns true iff the active tier is at or above the
 * feature's minimum tier. Use this anywhere you'd otherwise check
 * `customer.status === 'premium'` — it threads tier-awareness
 * through without rewriting the call sites.
 */
export function tierIncludes(active: Tier, feature: TierFeature): boolean {
  return TIER_RANK[active] >= TIER_RANK[FEATURE_MIN_TIER[feature]];
}

/**
 * Numeric comparison helper, useful when comparing two active tiers
 * (e.g. for upgrade prompts). Returns -1, 0, or 1.
 */
export function compareTiers(a: Tier, b: Tier): number {
  return Math.sign(TIER_RANK[a] - TIER_RANK[b]);
}
