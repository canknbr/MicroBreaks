import { mapEntitlementToCustomerState } from '@/services/entitlements/storeMirror';
import {
  EMPTY_ENTITLEMENT,
  ENTITLEMENT_SCHEMA_VERSION,
  type EntitlementDoc,
} from '@/services/entitlements/types';

function ledger(overrides: Partial<EntitlementDoc> = {}): EntitlementDoc {
  return {
    schemaVersion: ENTITLEMENT_SCHEMA_VERSION,
    tier: 'pro',
    status: 'active',
    productId: 'pro_annual',
    billingPeriod: 'yearly',
    purchasedAt: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z',
    inTrial: false,
    trialEndsAt: null,
    store: 'app_store',
    originalTransactionId: 'tx-1',
    lastEventType: 'INITIAL_PURCHASE',
    lastEventAt: 1_700_000_000_000,
    ...overrides,
  };
}

describe('mapEntitlementToCustomerState', () => {
  it('maps an active ledger to premium store state', () => {
    const result = mapEntitlementToCustomerState(ledger({ status: 'active' }));
    expect(result).toMatchObject({
      status: 'premium',
      activeOfferId: 'pro_annual',
      entitlementId: 'pro_annual',
      purchasedAt: '2026-01-01T00:00:00Z',
      expiresAt: '2027-01-01T00:00:00Z',
    });
    expect(result?.trialEndsAt).toBeNull();
  });

  it('preserves premium status for cancelled-but-paid users', () => {
    const result = mapEntitlementToCustomerState(ledger({ status: 'cancelled' }));
    expect(result?.status).toBe('premium');
    expect(result?.activeOfferId).toBe('pro_annual');
  });

  it('preserves premium status during a billing issue', () => {
    const result = mapEntitlementToCustomerState(ledger({ status: 'billing_issue' }));
    expect(result?.status).toBe('premium');
  });

  it('maps a trial ledger to trial store state with trialEndsAt populated', () => {
    const result = mapEntitlementToCustomerState(
      ledger({ status: 'trial', trialEndsAt: '2026-01-15T00:00:00Z', inTrial: true })
    );
    expect(result).toMatchObject({
      status: 'trial',
      trialEndsAt: '2026-01-15T00:00:00Z',
    });
  });

  it('nulls out offer + entitlement on expired', () => {
    const result = mapEntitlementToCustomerState(ledger({ status: 'expired' }));
    expect(result).toEqual({
      status: 'expired',
      entitlementId: null,
      activeOfferId: null,
      trialEndsAt: null,
      expiresAt: '2027-01-01T00:00:00Z',
    });
  });

  it('treats refunded the same as expired (no active access)', () => {
    const result = mapEntitlementToCustomerState(ledger({ status: 'refunded' }));
    expect(result?.status).toBe('expired');
    expect(result?.entitlementId).toBeNull();
  });

  it('returns null for unknown status (leave local store untouched)', () => {
    expect(mapEntitlementToCustomerState(EMPTY_ENTITLEMENT)).toBeNull();
    expect(
      mapEntitlementToCustomerState(ledger({ status: 'unknown' }))
    ).toBeNull();
  });

  it('does not include the trial end date for non-trial active subscriptions', () => {
    const result = mapEntitlementToCustomerState(
      ledger({ status: 'active', trialEndsAt: '2026-01-15T00:00:00Z' })
    );
    expect(result?.trialEndsAt).toBeNull();
  });
});
