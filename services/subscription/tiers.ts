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

import type {
  SubscriptionCustomerState,
  SubscriptionOffer,
} from '@/services/billing/types';

export type Tier = 'free' | 'solo' | 'pro' | 'family';

/** Tiers offered for purchase, in display order. */
export const PURCHASABLE_TIERS: readonly Exclude<Tier, 'free'>[] = [
  'solo',
  'pro',
  'family',
] as const;

/** Human display labels for each tier (used in tabs + access labels). */
export const TIER_LABELS: Record<Tier, string> = {
  free: 'Free',
  solo: 'Solo',
  pro: 'Pro',
  family: 'Family',
};

/** Short tagline that sits under each tier tab. */
export const TIER_TAGLINES: Record<Exclude<Tier, 'free'>, string> = {
  solo: 'For one focused desk',
  pro: 'For deeper recovery',
  family: 'For up to 6 people',
};

/**
 * What's-in-this-tier copy. Display lists — these are *additive* to
 * the previous tier, so the paywall can render Solo's three lines
 * plus a "Everything in Solo, plus…" header for Pro and Family.
 */
export const TIER_HIGHLIGHTS: Record<Exclude<Tier, 'free'>, readonly string[]> = {
  solo: [
    'Full break library — every guided reset, not just the starter set',
    'Weekly recovery story showing your trends and best break times',
    'Daily missions with bonus XP for variety and timing',
  ],
  pro: [
    'Apple Health export — every mindful break logged as a session',
    'Calendar-aware reminders that dodge your meetings',
    'Unlimited custom routines and favorites',
  ],
  family: [
    'Up to 6 family members on one plan',
    'Streak buddies — quiet shared accountability with people you trust',
    'Family sharing for purchases and progress',
  ],
};

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

export interface TierOfferPair {
  /** Monthly offer for the tier, or null if not available. */
  monthly: SubscriptionOffer | null;
  /** Yearly/annual offer for the tier, or null if not available. */
  annual: SubscriptionOffer | null;
}

/**
 * Pick the {monthly, annual} offer pair for a tier from the live
 * offerings list. Either slot can be null if the dashboard hasn't
 * configured both periods yet — the paywall should handle that
 * gracefully (e.g. hide the toggle).
 */
export function getOffersForTier(
  tier: Exclude<Tier, 'free'>,
  offers: SubscriptionOffer[]
): TierOfferPair {
  const tierOffers = offers.filter((o) => getTierForOfferId(o.id) === tier);
  return {
    monthly: tierOffers.find((o) => o.billingPeriod === 'monthly') ?? null,
    annual: tierOffers.find((o) => o.billingPeriod === 'yearly') ?? null,
  };
}
