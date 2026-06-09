/**
 * Entitlement Ledger → Subscription Store Mirror
 *
 * Maps a server-trusted `EntitlementDoc` (written by the
 * RevenueCat / App Store webhook into Firestore) into the partial
 * `SubscriptionCustomerState` shape that the local subscription
 * store understands.
 *
 * Why mirror rather than read directly from the ledger everywhere?
 *   - Most call sites already consume `subscriptionStore.customer`
 *     synchronously. Refactoring every one to use the async ledger
 *     reader is a big diff for no real win.
 *   - With this mirror, `subscriptionStore` is the canonical
 *     synchronous read for "what's the user's subscription right
 *     now". Server is the source of truth; the store is the cache.
 *   - Local-optimistic writes (RC client SDK, preview purchases)
 *     still happen — the mirror just overrides them when the
 *     server's word arrives.
 *
 * The mapping is conservative: ledger statuses that mean "access
 * continues" (`active`, `trial`, `cancelled`, `billing_issue`) all
 * resolve to a store status that grants access (premium or trial).
 * Only `expired` and `refunded` flip the store to `expired`.
 * `unknown` returns null so callers leave the store untouched.
 */

import type { SubscriptionCustomerState } from '@/services/billing/types';
import type { EntitlementDoc, EntitlementStatus } from './types';

function storeStatusFor(
  ledger: EntitlementStatus
): SubscriptionCustomerState['status'] | null {
  switch (ledger) {
    case 'active':
    case 'cancelled':
    case 'billing_issue':
      return 'premium';
    case 'trial':
      return 'trial';
    case 'expired':
    case 'refunded':
      return 'expired';
    case 'unknown':
      // Ledger doesn't know — leave the local store alone.
      return null;
  }
}

/**
 * Build the partial customer-state update from a ledger doc. Returns
 * null when the ledger row is `unknown` (no useful signal).
 *
 * Callers should pass the result to `setCustomerState` so the store
 * merges it with existing fields rather than replacing the whole
 * customer record (we want to keep e.g. appUserId across updates).
 */
export function mapEntitlementToCustomerState(
  ledger: EntitlementDoc
): Partial<SubscriptionCustomerState> | null {
  const status = storeStatusFor(ledger.status);
  if (status == null) return null;

  // For expired/refunded we deliberately null out the entitlement +
  // offer ids — these mirror the same shape `sanitizeCustomerState`
  // produces for an inactive customer. Keeping a stale `pro_annual`
  // offerId on an expired user would confuse downstream UI gates.
  if (status === 'expired') {
    return {
      status,
      entitlementId: null,
      activeOfferId: null,
      trialEndsAt: null,
      expiresAt: ledger.expiresAt,
    };
  }

  return {
    status,
    entitlementId: ledger.productId,
    activeOfferId: ledger.productId,
    purchasedAt: ledger.purchasedAt,
    expiresAt: ledger.expiresAt,
    trialEndsAt: status === 'trial' ? ledger.trialEndsAt : null,
  };
}
