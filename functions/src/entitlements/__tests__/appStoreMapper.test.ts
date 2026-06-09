import {
  mapAppStoreNotification,
  type DecodedAppStoreNotification,
  type DecodedTransactionInfo,
} from '../appStoreMapper';

const NOW = 1_750_000_000_000;
const FUTURE = NOW + 90 * 86_400_000;
const PAST = NOW - 1;

function txn(overrides: Partial<DecodedTransactionInfo> = {}): DecodedTransactionInfo {
  return {
    transactionId: 't-1',
    originalTransactionId: 'orig-1',
    productId: 'pro_annual',
    purchaseDate: NOW - 1000,
    originalPurchaseDate: NOW - 365 * 86_400_000,
    expiresDate: FUTURE,
    transactionReason: 'PURCHASE',
    type: 'Auto-Renewable Subscription',
    ...overrides,
  };
}

function notification(
  overrides: Partial<DecodedAppStoreNotification> = {},
  txnOverrides: Partial<DecodedTransactionInfo> = {}
): DecodedAppStoreNotification {
  return {
    notificationType: 'SUBSCRIBED',
    subtype: 'INITIAL_BUY',
    notificationUUID: 'uuid-1',
    data: {
      bundleId: 'com.cankanbur.MicroBreaks',
      environment: 'Production',
      transactionInfo: txn(txnOverrides),
    },
    ...overrides,
  };
}

const RESOLVE_BY_TID = (tid: string) =>
  tid === 'orig-1' ? 'firebase-uid-1' : null;

describe('mapAppStoreNotification — discrimination', () => {
  it('returns null when there is no transaction info', () => {
    expect(
      mapAppStoreNotification({ notificationType: 'TEST' }, {
        now: NOW,
        resolveUid: () => 'uid',
      })
    ).toBeNull();
  });

  it('returns null when the originalTransactionId is missing', () => {
    expect(
      mapAppStoreNotification(
        notification({}, { originalTransactionId: undefined }),
        { now: NOW, resolveUid: () => 'uid' }
      )
    ).toBeNull();
  });

  it('returns null when resolveUid cannot find a Firebase user', () => {
    expect(
      mapAppStoreNotification(notification(), {
        now: NOW,
        resolveUid: () => null,
      })
    ).toBeNull();
  });

  it('returns a result when both lookup and transaction info exist', () => {
    const result = mapAppStoreNotification(notification(), {
      now: NOW,
      resolveUid: RESOLVE_BY_TID,
    });
    expect(result?.uid).toBe('firebase-uid-1');
  });
});

describe('mapAppStoreNotification — tier inference', () => {
  it('maps solo_* product IDs to the solo tier', () => {
    const r = mapAppStoreNotification(notification({}, { productId: 'solo_monthly' }), {
      now: NOW,
      resolveUid: RESOLVE_BY_TID,
    });
    expect(r?.doc.tier).toBe('solo');
  });

  it('maps family_* to family', () => {
    const r = mapAppStoreNotification(notification({}, { productId: 'family_annual' }), {
      now: NOW,
      resolveUid: RESOLVE_BY_TID,
    });
    expect(r?.doc.tier).toBe('family');
  });

  it('collapses an EXPIRED notification to free tier regardless of product', () => {
    const r = mapAppStoreNotification(
      notification({ notificationType: 'EXPIRED' }, { productId: 'family_annual' }),
      { now: NOW, resolveUid: RESOLVE_BY_TID }
    );
    expect(r?.doc.tier).toBe('free');
    expect(r?.doc.status).toBe('expired');
  });
});

describe('mapAppStoreNotification — status mapping', () => {
  const cases: [string, string | undefined, string][] = [
    ['SUBSCRIBED', 'INITIAL_BUY', 'active'],
    ['SUBSCRIBED', 'RESUBSCRIBE', 'active'],
    ['DID_RENEW', undefined, 'active'],
    ['DID_CHANGE_RENEWAL_STATUS', 'AUTO_RENEW_DISABLED', 'cancelled'],
    ['DID_CHANGE_RENEWAL_STATUS', 'AUTO_RENEW_ENABLED', 'active'],
    ['DID_CHANGE_RENEWAL_PREF', 'DOWNGRADE', 'active'],
    ['OFFER_REDEEMED', undefined, 'active'],
    ['EXPIRED', 'VOLUNTARY', 'expired'],
    ['GRACE_PERIOD_EXPIRED', undefined, 'expired'],
    ['DID_FAIL_TO_RENEW', 'GRACE_PERIOD', 'billing_issue'],
    ['DID_FAIL_TO_RENEW', undefined, 'billing_issue'],
    ['REFUND', undefined, 'refunded'],
    ['REVOKE', undefined, 'refunded'],
    ['TEST', undefined, 'unknown'],
    ['PRICE_INCREASE', 'PENDING', 'unknown'],
    ['RENEWAL_EXTENSION', undefined, 'unknown'],
  ];

  cases.forEach(([type, subtype, expectedStatus]) => {
    it(`${type}${subtype ? `/${subtype}` : ''} → ${expectedStatus}`, () => {
      const r = mapAppStoreNotification(
        notification({ notificationType: type, subtype }),
        { now: NOW, resolveUid: RESOLVE_BY_TID }
      );
      expect(r?.doc.status).toBe(expectedStatus);
    });
  });

  it('REFUND_REVERSED restores access (active) when not yet expired', () => {
    const r = mapAppStoreNotification(
      notification({ notificationType: 'REFUND_REVERSED' }, { expiresDate: FUTURE }),
      { now: NOW, resolveUid: RESOLVE_BY_TID }
    );
    expect(r?.doc.status).toBe('active');
    expect(r?.doc.tier).toBe('pro');
  });

  it('REFUND_REVERSED collapses to expired when the period already lapsed', () => {
    const r = mapAppStoreNotification(
      notification({ notificationType: 'REFUND_REVERSED' }, { expiresDate: PAST }),
      { now: NOW, resolveUid: RESOLVE_BY_TID }
    );
    expect(r?.doc.status).toBe('expired');
    expect(r?.doc.tier).toBe('free');
  });

  it('SUBSCRIBED with already-past expires collapses to expired', () => {
    const r = mapAppStoreNotification(
      notification({ notificationType: 'SUBSCRIBED' }, { expiresDate: PAST }),
      { now: NOW, resolveUid: RESOLVE_BY_TID }
    );
    expect(r?.doc.status).toBe('expired');
    expect(r?.doc.tier).toBe('free');
  });
});

describe('mapAppStoreNotification — doc shape echo', () => {
  it('records app_store as the source store always', () => {
    const r = mapAppStoreNotification(notification(), {
      now: NOW,
      resolveUid: RESOLVE_BY_TID,
    });
    expect(r?.doc.store).toBe('app_store');
  });

  it('echoes the originalTransactionId for later reconciliation', () => {
    const r = mapAppStoreNotification(notification(), {
      now: NOW,
      resolveUid: RESOLVE_BY_TID,
    });
    expect(r?.doc.originalTransactionId).toBe('orig-1');
  });

  it('stamps lastEventAt with the injected `now`', () => {
    const r = mapAppStoreNotification(notification(), {
      now: 1_800_000_000_000,
      resolveUid: RESOLVE_BY_TID,
    });
    expect(r?.doc.lastEventAt).toBe(1_800_000_000_000);
  });

  it('converts purchase + expires to ISO timestamps', () => {
    const r = mapAppStoreNotification(notification(), {
      now: NOW,
      resolveUid: RESOLVE_BY_TID,
    });
    expect(r?.doc.purchasedAt).toBe(
      new Date(NOW - 365 * 86_400_000).toISOString()
    );
    expect(r?.doc.expiresAt).toBe(new Date(FUTURE).toISOString());
  });

  it('falls back to purchaseDate when originalPurchaseDate is missing', () => {
    const r = mapAppStoreNotification(
      notification({}, { originalPurchaseDate: undefined }),
      { now: NOW, resolveUid: RESOLVE_BY_TID }
    );
    expect(r?.doc.purchasedAt).toBe(new Date(NOW - 1000).toISOString());
  });

  it('maps event types into the RC-compatible vocabulary', () => {
    const cases: [string, string][] = [
      ['SUBSCRIBED', 'INITIAL_PURCHASE'],
      ['DID_RENEW', 'RENEWAL'],
      ['DID_CHANGE_RENEWAL_PREF', 'PRODUCT_CHANGE'],
      ['DID_CHANGE_RENEWAL_STATUS', 'CANCELLATION'],
      ['EXPIRED', 'EXPIRATION'],
      ['REFUND', 'REFUND'],
      ['TEST', 'TEST'],
    ];
    for (const [type, expected] of cases) {
      const r = mapAppStoreNotification(
        notification({ notificationType: type }),
        { now: NOW, resolveUid: RESOLVE_BY_TID }
      );
      expect(r?.doc.lastEventType).toBe(expected);
    }
  });
});
