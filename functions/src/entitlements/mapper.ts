/**
 * Map a RevenueCat webhook event to our `EntitlementDoc` shape.
 *
 * Pure function — no I/O, no Firestore. Take a RevenueCat event,
 * return the canonical ledger row. The webhook wrapper handles the
 * HTTP + write side.
 *
 * Reference: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */

import {
  ENTITLEMENT_SCHEMA_VERSION,
  type EntitlementBillingPeriod,
  type EntitlementDoc,
  type EntitlementEventType,
  type EntitlementStatus,
  type EntitlementStore,
  type Tier,
} from './types';

/** RevenueCat event payload (subset we use). */
export interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  product_id?: string;
  period_type?: string;
  purchased_at_ms?: number;
  expiration_at_ms?: number;
  store?: string;
  entitlement_ids?: string[];
  original_transaction_id?: string;
  is_trial_conversion?: boolean;
  // Some RC events nest the event under `event.event`; we accept both.
}

export interface RevenueCatWebhookPayload {
  event?: RevenueCatEvent;
  api_version?: string;
}

function tierForProductId(productId: string | undefined): Tier {
  if (!productId) return 'free';
  if (productId.startsWith('family_')) return 'family';
  if (productId.startsWith('solo_')) return 'solo';
  if (productId.startsWith('pro_')) return 'pro';
  return 'pro'; // legacy fallback
}

function billingPeriodForProductId(productId: string | undefined): EntitlementBillingPeriod {
  if (!productId) return null;
  if (productId.endsWith('_annual') || productId.endsWith('_yearly')) return 'yearly';
  if (productId.endsWith('_monthly')) return 'monthly';
  return null;
}

function mapStore(raw: string | undefined): EntitlementStore {
  switch ((raw ?? '').toUpperCase()) {
    case 'APP_STORE':    return 'app_store';
    case 'MAC_APP_STORE': return 'app_store';
    case 'PLAY_STORE':   return 'play_store';
    case 'AMAZON':       return 'play_store';
    case 'STRIPE':       return 'stripe';
    case 'PROMOTIONAL':  return 'promotional';
    default:             return null;
  }
}

function mapEventType(raw: string | undefined): EntitlementEventType {
  const known: EntitlementEventType[] = [
    'INITIAL_PURCHASE',
    'RENEWAL',
    'PRODUCT_CHANGE',
    'CANCELLATION',
    'UNCANCELLATION',
    'NON_RENEWING_PURCHASE',
    'SUBSCRIPTION_PAUSED',
    'EXPIRATION',
    'BILLING_ISSUE',
    'SUBSCRIBER_ALIAS',
    'REFUND',
    'TEST',
  ];
  const upper = (raw ?? '').toUpperCase();
  return (known as string[]).includes(upper)
    ? (upper as EntitlementEventType)
    : 'UNKNOWN';
}

/**
 * Decide the entitlement `status` from event type + expiration.
 * The mapping is deliberately conservative — when in doubt we
 * mark the row `unknown` rather than guess `active`.
 */
function statusFor(eventType: EntitlementEventType, expiresAtMs: number | undefined, now: number): EntitlementStatus {
  switch (eventType) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'UNCANCELLATION':
    case 'NON_RENEWING_PURCHASE':
      if (expiresAtMs != null && expiresAtMs <= now) return 'expired';
      return 'active';
    case 'CANCELLATION':
      if (expiresAtMs != null && expiresAtMs <= now) return 'expired';
      return 'cancelled';
    case 'EXPIRATION':
      return 'expired';
    case 'BILLING_ISSUE':
      return 'billing_issue';
    case 'REFUND':
      return 'refunded';
    case 'SUBSCRIPTION_PAUSED':
      return 'cancelled';
    case 'TEST':
    case 'SUBSCRIBER_ALIAS':
    case 'UNKNOWN':
      return 'unknown';
  }
}

function toIso(ms: number | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

export interface MapEventOptions {
  /** Test seam — defaults to Date.now(). */
  now?: number;
}

export interface MapEventResult {
  /** Firebase UID to write the doc under (RevenueCat's `app_user_id`). */
  uid: string;
  doc: EntitlementDoc;
}

/**
 * Map a RevenueCat webhook event to a Firebase UID + ledger doc.
 * Returns `null` when the event lacks the fields we need (no
 * app_user_id, no event type) so the webhook can ack-and-drop.
 */
export function mapRevenueCatEvent(
  payload: RevenueCatWebhookPayload,
  options: MapEventOptions = {}
): MapEventResult | null {
  const event = payload.event;
  if (!event) return null;
  const uid = event.app_user_id ?? event.original_app_user_id ?? null;
  if (!uid) return null;

  const now = options.now ?? Date.now();
  const eventType = mapEventType(event.type);
  const expiresAtMs = event.expiration_at_ms;
  const inTrial = (event.period_type ?? '').toUpperCase() === 'TRIAL';
  const productId = event.product_id ?? null;
  const tier = tierForProductId(productId ?? undefined);
  const status = statusFor(eventType, expiresAtMs, now);
  const isPaidStatus =
    status === 'active' || status === 'trial' || status === 'cancelled';

  const doc: EntitlementDoc = {
    schemaVersion: ENTITLEMENT_SCHEMA_VERSION,
    // Lapsed subscriptions collapse to free tier regardless of which
    // tier they were on. UI/security rules should never see a
    // "pro tier but status=expired" row.
    tier: isPaidStatus ? tier : 'free',
    status: inTrial && isPaidStatus ? 'trial' : status,
    productId,
    billingPeriod: billingPeriodForProductId(productId ?? undefined),
    purchasedAt: toIso(event.purchased_at_ms),
    expiresAt: toIso(expiresAtMs),
    inTrial: inTrial && isPaidStatus,
    trialEndsAt: inTrial ? toIso(expiresAtMs) : null,
    store: mapStore(event.store),
    originalTransactionId: event.original_transaction_id ?? null,
    lastEventType: eventType,
    lastEventAt: now,
  };

  return { uid, doc };
}
