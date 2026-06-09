import {
  mapRevenueCatEvent,
  type RevenueCatEvent,
  type RevenueCatWebhookPayload,
} from '../mapper';

const NOW = 1_750_000_000_000;
const FUTURE = NOW + 90 * 86_400_000; // 90 days from "now"
const PAST = NOW - 1; // strictly before now

function evt(overrides: Partial<RevenueCatEvent> = {}): RevenueCatEvent {
  return {
    type: 'INITIAL_PURCHASE',
    app_user_id: 'uid-1',
    product_id: 'pro_annual',
    period_type: 'NORMAL',
    purchased_at_ms: NOW - 1000,
    expiration_at_ms: FUTURE,
    store: 'APP_STORE',
    original_transaction_id: 'tx-123',
    ...overrides,
  };
}

function payload(event: Partial<RevenueCatEvent>): RevenueCatWebhookPayload {
  return { event: evt(event) };
}

describe('mapRevenueCatEvent — discrimination', () => {
  it('returns null when the payload has no event block', () => {
    expect(mapRevenueCatEvent({}, { now: NOW })).toBeNull();
  });

  it('returns null when the event has no app_user_id (and no original)', () => {
    expect(
      mapRevenueCatEvent({ event: { type: 'RENEWAL' } }, { now: NOW })
    ).toBeNull();
  });

  it('falls back to original_app_user_id when app_user_id is missing', () => {
    const result = mapRevenueCatEvent(
      {
        event: {
          type: 'INITIAL_PURCHASE',
          original_app_user_id: 'orig-uid',
          product_id: 'pro_annual',
          purchased_at_ms: NOW,
          expiration_at_ms: FUTURE,
        },
      },
      { now: NOW }
    );
    expect(result?.uid).toBe('orig-uid');
  });
});

describe('mapRevenueCatEvent — tier inference', () => {
  it('maps solo_* product IDs to the solo tier', () => {
    const result = mapRevenueCatEvent(payload({ product_id: 'solo_monthly' }), { now: NOW });
    expect(result?.doc.tier).toBe('solo');
  });

  it('maps pro_* to pro', () => {
    const result = mapRevenueCatEvent(payload({ product_id: 'pro_annual' }), { now: NOW });
    expect(result?.doc.tier).toBe('pro');
  });

  it('maps family_* to family', () => {
    const result = mapRevenueCatEvent(payload({ product_id: 'family_annual' }), { now: NOW });
    expect(result?.doc.tier).toBe('family');
  });

  it('legacy unknown-prefix products fall back to pro', () => {
    const result = mapRevenueCatEvent(payload({ product_id: 'legacy_unicorn' }), { now: NOW });
    expect(result?.doc.tier).toBe('pro');
  });

  it('collapses lapsed subscriptions to free regardless of original tier', () => {
    const result = mapRevenueCatEvent(
      payload({ type: 'EXPIRATION', product_id: 'family_annual' }),
      { now: NOW }
    );
    expect(result?.doc.tier).toBe('free');
    expect(result?.doc.status).toBe('expired');
  });
});

describe('mapRevenueCatEvent — billing period inference', () => {
  it('flags _annual as yearly', () => {
    const result = mapRevenueCatEvent(payload({ product_id: 'pro_annual' }), { now: NOW });
    expect(result?.doc.billingPeriod).toBe('yearly');
  });

  it('flags _yearly (alt suffix) as yearly', () => {
    const result = mapRevenueCatEvent(payload({ product_id: 'pro_yearly' }), { now: NOW });
    expect(result?.doc.billingPeriod).toBe('yearly');
  });

  it('flags _monthly as monthly', () => {
    const result = mapRevenueCatEvent(payload({ product_id: 'pro_monthly' }), { now: NOW });
    expect(result?.doc.billingPeriod).toBe('monthly');
  });

  it('null when the product id doesnt encode a period', () => {
    const result = mapRevenueCatEvent(payload({ product_id: 'pro_lifetime' }), { now: NOW });
    expect(result?.doc.billingPeriod).toBeNull();
  });
});

describe('mapRevenueCatEvent — status mapping by event type', () => {
  const cases: [string, string][] = [
    ['INITIAL_PURCHASE', 'active'],
    ['RENEWAL',          'active'],
    ['PRODUCT_CHANGE',   'active'],
    ['UNCANCELLATION',   'active'],
    ['NON_RENEWING_PURCHASE', 'active'],
    ['CANCELLATION',     'cancelled'],
    ['SUBSCRIPTION_PAUSED', 'cancelled'],
    ['EXPIRATION',       'expired'],
    ['BILLING_ISSUE',    'billing_issue'],
    ['REFUND',           'refunded'],
    ['TEST',             'unknown'],
    ['SUBSCRIBER_ALIAS', 'unknown'],
  ];

  cases.forEach(([eventType, expectedStatus]) => {
    it(`${eventType} → ${expectedStatus}`, () => {
      const result = mapRevenueCatEvent(payload({ type: eventType }), { now: NOW });
      expect(result?.doc.status).toBe(expectedStatus);
    });
  });

  it('marks INITIAL_PURCHASE as expired if expiration is already past', () => {
    const result = mapRevenueCatEvent(
      payload({ type: 'INITIAL_PURCHASE', expiration_at_ms: PAST }),
      { now: NOW }
    );
    expect(result?.doc.status).toBe('expired');
    expect(result?.doc.tier).toBe('free');
  });

  it('marks a CANCELLATION still inside paid window as cancelled', () => {
    const result = mapRevenueCatEvent(
      payload({ type: 'CANCELLATION', expiration_at_ms: FUTURE }),
      { now: NOW }
    );
    expect(result?.doc.status).toBe('cancelled');
    // Cancelled-but-paid still keeps tier so the user can keep using
    // the paid features through to expiry.
    expect(result?.doc.tier).toBe('pro');
  });
});

describe('mapRevenueCatEvent — trial flagging', () => {
  it('flips status to trial when period_type=TRIAL on an active event', () => {
    const result = mapRevenueCatEvent(
      payload({ type: 'INITIAL_PURCHASE', period_type: 'TRIAL' }),
      { now: NOW }
    );
    expect(result?.doc.status).toBe('trial');
    expect(result?.doc.inTrial).toBe(true);
    expect(result?.doc.trialEndsAt).toBe(new Date(FUTURE).toISOString());
  });

  it('does not flag trial when the event is expired', () => {
    const result = mapRevenueCatEvent(
      payload({ type: 'EXPIRATION', period_type: 'TRIAL' }),
      { now: NOW }
    );
    expect(result?.doc.inTrial).toBe(false);
    expect(result?.doc.status).toBe('expired');
  });
});

describe('mapRevenueCatEvent — store mapping', () => {
  it.each([
    ['APP_STORE', 'app_store'],
    ['MAC_APP_STORE', 'app_store'],
    ['PLAY_STORE', 'play_store'],
    ['AMAZON', 'play_store'],
    ['STRIPE', 'stripe'],
    ['PROMOTIONAL', 'promotional'],
  ])('%s → %s', (raw, mapped) => {
    const result = mapRevenueCatEvent(payload({ store: raw }), { now: NOW });
    expect(result?.doc.store).toBe(mapped);
  });

  it('returns null for unknown stores', () => {
    const result = mapRevenueCatEvent(payload({ store: 'WHO_KNOWS' }), { now: NOW });
    expect(result?.doc.store).toBeNull();
  });
});

describe('mapRevenueCatEvent — ISO timestamp conversion', () => {
  it('converts purchased_at_ms / expiration_at_ms to ISO', () => {
    const result = mapRevenueCatEvent(payload({}), { now: NOW });
    expect(result?.doc.purchasedAt).toBe(new Date(NOW - 1000).toISOString());
    expect(result?.doc.expiresAt).toBe(new Date(FUTURE).toISOString());
  });

  it('returns nulls for missing or non-finite timestamps', () => {
    const result = mapRevenueCatEvent(
      payload({ purchased_at_ms: undefined, expiration_at_ms: Number.NaN }),
      { now: NOW }
    );
    expect(result?.doc.purchasedAt).toBeNull();
    expect(result?.doc.expiresAt).toBeNull();
  });

  it('stamps lastEventAt with the injected `now`', () => {
    const result = mapRevenueCatEvent(payload({}), { now: 1_800_000_000_000 });
    expect(result?.doc.lastEventAt).toBe(1_800_000_000_000);
  });
});

describe('mapRevenueCatEvent — schema version + event echo', () => {
  it('always emits the current schema version', () => {
    const result = mapRevenueCatEvent(payload({}), { now: NOW });
    expect(result?.doc.schemaVersion).toBe(1);
  });

  it('echoes the originating event type back into the doc', () => {
    const result = mapRevenueCatEvent(payload({ type: 'RENEWAL' }), { now: NOW });
    expect(result?.doc.lastEventType).toBe('RENEWAL');
  });

  it('coerces unknown event types to UNKNOWN', () => {
    const result = mapRevenueCatEvent(payload({ type: 'NEWLY_INTRODUCED' }), {
      now: NOW,
    });
    expect(result?.doc.lastEventType).toBe('UNKNOWN');
    expect(result?.doc.status).toBe('unknown');
  });
});
