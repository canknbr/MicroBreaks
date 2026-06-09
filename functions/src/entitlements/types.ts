/**
 * Entitlement Ledger Types (server side)
 *
 * Mirrors `services/entitlements/types.ts` in the app package.
 * Firestore is the contract — both halves must agree on the shape.
 */

export const ENTITLEMENT_SCHEMA_VERSION = 1;

export type Tier = 'free' | 'solo' | 'pro' | 'family';

export type EntitlementStatus =
  | 'active'
  | 'trial'
  | 'cancelled'
  | 'expired'
  | 'billing_issue'
  | 'refunded'
  | 'unknown';

export type EntitlementStore =
  | 'app_store'
  | 'play_store'
  | 'stripe'
  | 'promotional'
  | null;

export type EntitlementBillingPeriod = 'monthly' | 'yearly' | null;

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
  tier: Tier;
  status: EntitlementStatus;
  productId: string | null;
  billingPeriod: EntitlementBillingPeriod;
  purchasedAt: string | null;
  expiresAt: string | null;
  inTrial: boolean;
  trialEndsAt: string | null;
  store: EntitlementStore;
  originalTransactionId: string | null;
  lastEventType: EntitlementEventType;
  lastEventAt: number;
}
