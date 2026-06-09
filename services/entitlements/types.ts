/**
 * Entitlement Ledger — Shared Types
 *
 * This module defines the canonical "current subscription state"
 * document that the RevenueCat webhook Cloud Function writes to
 * `users/{uid}/entitlements/current`. The client reads it but never
 * writes — Firestore rules enforce server-only write.
 *
 * Why a server ledger at all? RevenueCat is the source of truth for
 * billing events but the client receives them through `Purchases`
 * SDK calls that a hostile or jailbroken device can spoof. By
 * mirroring each event into Firestore via the webhook, the rest of
 * the app (security rules, premium gates, sync service) can trust
 * "what server saw" instead of "what client claims".
 *
 * Mirror this shape in `functions/src/entitlements/types.ts` —
 * Firestore is a contract between the two packages, not a shared
 * library boundary.
 */

import type { Tier } from '@/services/subscription/tiers';

/** Schema version. Bump when we change the doc shape. */
export const ENTITLEMENT_SCHEMA_VERSION = 1;

export type EntitlementStatus =
  | 'active'         // paid + within period
  | 'trial'          // in a free trial
  | 'cancelled'      // cancelled but still within paid period
  | 'expired'        // past expiresAt
  | 'billing_issue'  // payment failed, grace period
  | 'refunded'       // refunded by Apple/Google
  | 'unknown';       // never had a purchase

/** Where this purchase originated. */
export type EntitlementStore = 'app_store' | 'play_store' | 'stripe' | 'promotional' | null;

export type EntitlementBillingPeriod = 'monthly' | 'yearly' | null;

/** Which RevenueCat event most recently shaped this ledger row. */
export type EntitlementEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'PRODUCT_CHANGE'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'NON_RENEWING_PURCHASE'
  | 'SUBSCRIPTION_PAUSED'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'SUBSCRIBER_ALIAS'
  | 'REFUND'
  | 'TEST'
  | 'UNKNOWN';

export interface EntitlementDoc {
  schemaVersion: number;
  /** The user's effective subscription tier, server-confirmed. */
  tier: Tier;
  status: EntitlementStatus;
  /** Product identifier (e.g. `pro_annual`, `family_monthly`). */
  productId: string | null;
  billingPeriod: EntitlementBillingPeriod;
  /** ISO 8601 timestamp of the original purchase. */
  purchasedAt: string | null;
  /** ISO 8601 timestamp when access ends. */
  expiresAt: string | null;
  /** True if the user is in a free trial window. */
  inTrial: boolean;
  /** ISO 8601 timestamp when the trial ends, or null. */
  trialEndsAt: string | null;
  store: EntitlementStore;
  /** Stable identifier RevenueCat uses for the original transaction. */
  originalTransactionId: string | null;
  /** Which event last touched this row. */
  lastEventType: EntitlementEventType;
  /** Server timestamp (ms since epoch) of the last write. */
  lastEventAt: number;
}

/** Empty default — used by the client when the doc hasn't been written yet. */
export const EMPTY_ENTITLEMENT: EntitlementDoc = {
  schemaVersion: ENTITLEMENT_SCHEMA_VERSION,
  tier: 'free',
  status: 'unknown',
  productId: null,
  billingPeriod: null,
  purchasedAt: null,
  expiresAt: null,
  inTrial: false,
  trialEndsAt: null,
  store: null,
  originalTransactionId: null,
  lastEventType: 'UNKNOWN',
  lastEventAt: 0,
};
