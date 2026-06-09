import {
  compareTiers,
  getActiveTier,
  getTierForOfferId,
  tierIncludes,
  TIER_SEATS,
  type Tier,
} from '@/services/subscription/tiers';
import type { SubscriptionCustomerState } from '@/services/billing/types';

function customer(overrides: Partial<SubscriptionCustomerState> = {}): SubscriptionCustomerState {
  return {
    appUserId: 'user-1',
    status: 'premium',
    entitlementId: 'pro',
    activeOfferId: 'pro_annual',
    purchasedAt: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z',
    trialEndsAt: null,
    isPreview: false,
    billingProvider: 'revenuecat',
    ...overrides,
  };
}

describe('getTierForOfferId', () => {
  it('maps solo_* to solo', () => {
    expect(getTierForOfferId('solo_monthly')).toBe('solo');
    expect(getTierForOfferId('solo_annual')).toBe('solo');
  });

  it('maps pro_* to pro', () => {
    expect(getTierForOfferId('pro_monthly')).toBe('pro');
    expect(getTierForOfferId('pro_annual')).toBe('pro');
  });

  it('maps family_* to family', () => {
    expect(getTierForOfferId('family_monthly')).toBe('family');
    expect(getTierForOfferId('family_annual')).toBe('family');
  });

  it('returns free for null / undefined / empty', () => {
    expect(getTierForOfferId(null)).toBe('free');
    expect(getTierForOfferId(undefined)).toBe('free');
    expect(getTierForOfferId('')).toBe('free');
  });

  it('falls back to pro for unknown prefixes (legacy purchases)', () => {
    expect(getTierForOfferId('legacy_unicorn')).toBe('pro');
  });
});

describe('getActiveTier', () => {
  it('returns the tier matching the active offer when paid', () => {
    expect(getActiveTier(customer({ status: 'premium', activeOfferId: 'family_annual' }))).toBe(
      'family'
    );
    expect(getActiveTier(customer({ status: 'premium', activeOfferId: 'solo_monthly' }))).toBe(
      'solo'
    );
  });

  it('respects the tier during a trial', () => {
    expect(getActiveTier(customer({ status: 'trial', activeOfferId: 'pro_annual' }))).toBe('pro');
  });

  it('returns free for free / expired customers regardless of offer id', () => {
    expect(getActiveTier(customer({ status: 'free' }))).toBe('free');
    expect(getActiveTier(customer({ status: 'expired', activeOfferId: 'pro_annual' }))).toBe(
      'free'
    );
  });
});

describe('tierIncludes — inheritance', () => {
  const cases: [Tier, string, boolean][] = [
    ['free',   'starter_breaks',        true],
    ['free',   'full_break_library',    false],
    ['solo',   'starter_breaks',        true],
    ['solo',   'full_break_library',    true],
    ['solo',   'apple_health_export',   false],
    ['pro',    'full_break_library',    true],
    ['pro',    'apple_health_export',   true],
    ['pro',    'streak_buddies',        false],
    ['family', 'starter_breaks',        true],
    ['family', 'apple_health_export',   true],
    ['family', 'streak_buddies',        true],
    ['family', 'family_sharing',        true],
  ];

  cases.forEach(([tier, feature, expected]) => {
    it(`${tier} ${expected ? 'has' : 'does not have'} ${feature}`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(tierIncludes(tier, feature as any)).toBe(expected);
    });
  });
});

describe('compareTiers', () => {
  it('returns -1 / 0 / 1 by rank', () => {
    expect(compareTiers('free', 'solo')).toBe(-1);
    expect(compareTiers('pro', 'pro')).toBe(0);
    expect(compareTiers('family', 'solo')).toBe(1);
  });
});

describe('TIER_SEATS', () => {
  it('grants 6 seats only on family', () => {
    expect(TIER_SEATS.free).toBe(1);
    expect(TIER_SEATS.solo).toBe(1);
    expect(TIER_SEATS.pro).toBe(1);
    expect(TIER_SEATS.family).toBe(6);
  });
});
