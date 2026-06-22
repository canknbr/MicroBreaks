/**
 * App Store Server Notifications V2 → Entitlement Ledger
 *
 * Apple sends notifications as a chain of JWS-signed payloads:
 *
 *   - Outer envelope (`signedPayload`) → notificationType + data
 *   - Inner `signedTransactionInfo` → product + dates + IDs
 *   - Inner `signedRenewalInfo` → auto-renew state + price increase consent
 *
 * This module is the pure mapper that takes a **decoded** payload
 * (caller did the JWS verification) and returns the canonical
 * EntitlementDoc shape. The HTTPS function wrapper handles JWS
 * decoding before calling us.
 *
 * Why a second source on top of RevenueCat?
 *   - RC's webhook is best-effort. If it goes down for an hour we
 *     miss every event in that window. ASSN V2 is a direct line
 *     from Apple's servers.
 *   - RC sometimes lags on edge cases (test sandbox events,
 *     retroactive refunds processed by support).
 *   - ASSN V2 corroborates the RC ledger. The mapper writes the
 *     same `users/{uid}/entitlements/current` doc — last write wins
 *     by `lastEventAt`.
 *
 * Reference: https://developer.apple.com/documentation/appstoreservernotifications
 */

import {
  ENTITLEMENT_SCHEMA_VERSION,
  type EntitlementBillingPeriod,
  type EntitlementDoc,
  type EntitlementEventType,
  type EntitlementStatus,
  type Tier,
} from './types';

/**
 * Decoded App Store Server Notification V2 envelope.
 * After JWS verification, the relevant fields look like this.
 */
export interface DecodedAppStoreNotification {
  notificationType?: string;
  subtype?: string;
  notificationUUID?: string;
  data?: {
    bundleId?: string;
    environment?: 'Production' | 'Sandbox';
    /** Decoded contents of `signedTransactionInfo`. */
    transactionInfo?: DecodedTransactionInfo;
    /** Decoded contents of `signedRenewalInfo`. */
    renewalInfo?: DecodedRenewalInfo;
  };
}

export interface DecodedTransactionInfo {
  transactionId?: string;
  originalTransactionId?: string;
  productId?: string;
  /** ms since epoch. */
  purchaseDate?: number;
  /** ms since epoch. */
  originalPurchaseDate?: number;
  /** ms since epoch. */
  expiresDate?: number;
  /** "PURCHASE" | "RENEWAL". */
  transactionReason?: string;
  /** "Auto-Renewable Subscription" | "Non-Renewing Subscription" | ... */
  type?: string;
  /** Cents — useful for analytics, not used here. */
  price?: number;
  /** ms since epoch — only present on revoke / refund events. */
  revocationDate?: number;
  /** "0" | "1" — refund reason. Optional. */
  revocationReason?: string;
  /** Web order line item id. */
  webOrderLineItemId?: string;
}

export interface DecodedRenewalInfo {
  autoRenewStatus?: 0 | 1;
  /** ms — when current renewal period ends. */
  renewalDate?: number;
  /** Set when Apple disabled the subscription for billing failure. */
  isInBillingRetryPeriod?: boolean;
  /** Set when the user accepted a price increase. */
  priceIncreaseStatus?: 0 | 1;
}

export interface AppStoreMapInput {
  /** Test seam — defaults to Date.now(). */
  now?: number;
  /** Lookup from `originalTransactionId` → Firebase UID. The webhook
   *  wrapper resolves this from a separate `transactions/{tid}` doc
   *  written when the user first signed in. */
  resolveUid: (originalTransactionId: string) => string | null;
}

export interface AppStoreMapResult {
  uid: string;
  doc: EntitlementDoc;
}

function tierForProductId(productId: string | undefined): Tier {
  if (!productId) return 'free';
  if (productId.startsWith('family_')) return 'family';
  if (productId.startsWith('solo_')) return 'solo';
  if (productId.startsWith('pro_')) return 'pro';
  return 'pro';
}

function billingPeriodForProductId(productId: string | undefined): EntitlementBillingPeriod {
  if (!productId) return null;
  if (productId.endsWith('_annual') || productId.endsWith('_yearly')) return 'yearly';
  if (productId.endsWith('_monthly')) return 'monthly';
  return null;
}

function toIso(ms: number | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

/**
 * Map ASSN V2 notificationType + subtype to one of our canonical
 * statuses. Apple has ~16 notification types and ~20 subtypes; the
 * cases below condense them to seven outcomes.
 *
 * Reference: https://developer.apple.com/documentation/appstoreservernotifications/notificationtype
 */
function statusFor(
  notificationType: string | undefined,
  subtype: string | undefined,
  transactionInfo: DecodedTransactionInfo | undefined,
  now: number
): EntitlementStatus {
  const expires = transactionInfo?.expiresDate;
  const revoked = transactionInfo?.revocationDate != null;

  switch (notificationType) {
    case 'SUBSCRIBED':
      return expires != null && expires <= now ? 'expired' : 'active';

    case 'DID_RENEW':
      return 'active';

    case 'DID_CHANGE_RENEWAL_STATUS':
      return subtype === 'AUTO_RENEW_DISABLED' ? 'cancelled' : 'active';

    case 'DID_CHANGE_RENEWAL_PREF':
      // Plan change inside the same group — still active.
      return 'active';

    case 'OFFER_REDEEMED':
      return 'active';

    case 'EXPIRED':
    case 'GRACE_PERIOD_EXPIRED':
      return 'expired';

    case 'DID_FAIL_TO_RENEW':
      // GRACE_PERIOD subtype means access continues; otherwise we treat
      // it as a billing issue so the UI can surface a recovery hint.
      return subtype === 'GRACE_PERIOD' ? 'billing_issue' : 'billing_issue';

    case 'REFUND':
    case 'REVOKE':
      return 'refunded';

    case 'REFUND_REVERSED':
      // The refund was undone — access is restored.
      return expires != null && expires <= now ? 'expired' : 'active';

    case 'REFUND_DECLINED':
    case 'CONSUMPTION_REQUEST':
    case 'PRICE_INCREASE':
    case 'RENEWAL_EXTENSION':
    case 'RENEWAL_EXTENDED':
      // None of these change subscription state. The caller can ignore
      // them or re-check via REST; for the ledger we mark unknown so the
      // row stays last-status-of-record.
      return 'unknown';

    case 'TEST':
      return 'unknown';

    default:
      return revoked ? 'refunded' : 'unknown';
  }
}

function mapEventType(notificationType: string | undefined): EntitlementEventType {
  // We reuse the existing RC event-type union — same shape semantically,
  // different names. Map ASSN → RC vocabulary so the doc stays consistent.
  switch (notificationType) {
    case 'SUBSCRIBED':                return 'INITIAL_PURCHASE';
    case 'DID_RENEW':                 return 'RENEWAL';
    case 'DID_CHANGE_RENEWAL_PREF':   return 'PRODUCT_CHANGE';
    case 'DID_CHANGE_RENEWAL_STATUS': return 'CANCELLATION';
    case 'OFFER_REDEEMED':            return 'INITIAL_PURCHASE';
    case 'EXPIRED':                   return 'EXPIRATION';
    case 'GRACE_PERIOD_EXPIRED':      return 'EXPIRATION';
    case 'DID_FAIL_TO_RENEW':         return 'BILLING_ISSUE';
    case 'REFUND':                    return 'REFUND';
    case 'REVOKE':                    return 'REFUND';
    case 'REFUND_REVERSED':           return 'UNCANCELLATION';
    case 'TEST':                      return 'TEST';
    default:                          return 'UNKNOWN';
  }
}

/**
 * Map a decoded ASSN V2 notification to a `{uid, doc}` pair the
 * webhook can write straight into Firestore.
 *
 * Returns null when:
 *   - The transaction info is missing the original transaction id
 *     (we can't resolve a uid).
 *   - The `resolveUid` callback returns null (the user hasn't been
 *     onboarded to this device yet — we'd write an orphan doc).
 *
 * Mirrors `mapRevenueCatEvent` in shape so the webhook can write the
 * same canonical ledger row regardless of which source produced it.
 */
export function mapAppStoreNotification(
  notification: DecodedAppStoreNotification,
  input: AppStoreMapInput
): AppStoreMapResult | null {
  const data = notification.data;
  const txn = data?.transactionInfo;
  const originalTransactionId = txn?.originalTransactionId ?? null;
  if (!originalTransactionId) return null;

  const uid = input.resolveUid(originalTransactionId);
  if (!uid) return null;

  const now = input.now ?? Date.now();
  const eventType = mapEventType(notification.notificationType);
  const status = statusFor(notification.notificationType, notification.subtype, txn, now);
  const productId = txn?.productId ?? null;
  const tier = tierForProductId(productId ?? undefined);
  // `billing_issue` is a grace period (access continues while payment is
  // retried), so it must keep the paid tier. Excluding it collapsed paying
  // grace-period users to `free`. Terminal states still drop to free.
  const grantsAccess =
    status === 'active' ||
    status === 'trial' ||
    status === 'cancelled' ||
    status === 'billing_issue';

  // Apple doesn't have a "trial" status separate from "active" — the
  // transaction's `offerType=1` flags an intro trial, but we'd need
  // the renewal info. For now we don't promote anything to trial via
  // ASSN; RC does that better.
  const inTrial = false;

  const doc: EntitlementDoc = {
    schemaVersion: ENTITLEMENT_SCHEMA_VERSION,
    tier: grantsAccess ? tier : 'free',
    status,
    productId,
    billingPeriod: billingPeriodForProductId(productId ?? undefined),
    purchasedAt: toIso(txn?.originalPurchaseDate ?? txn?.purchaseDate),
    expiresAt: toIso(txn?.expiresDate),
    inTrial,
    trialEndsAt: null,
    store: 'app_store',
    originalTransactionId,
    lastEventType: eventType,
    lastEventAt: now,
  };

  return { uid, doc };
}
