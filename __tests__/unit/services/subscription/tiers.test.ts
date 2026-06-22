import {
  compareTiers,
  getActiveTier,
  getOffersForTier,
  getRequiredTier,
  getTierForOfferId,
  PURCHASABLE_TIERS,
  resolveEffectiveTier,
  tierIncludes,
  TIER_HIGHLIGHTS,
  TIER_LABELS,
  TIER_SEATS,
  TIER_TAGLINES,
  type Tier,
  type TierFeature,
} from '@/services/subscription/tiers';
import type {
  SubscriptionCustomerState,
  SubscriptionOffer,
} from '@/services/billing/types';

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

  it('fails closed to free for unknown prefixes (never grant access on a typo/misconfig)', () => {
    expect(getTierForOfferId('legacy_unicorn')).toBe('free');
    expect(getTierForOfferId('garbage')).toBe('free');
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

describe('getRequiredTier', () => {
  it('returns the minimum tier that unlocks each feature', () => {
    expect(getRequiredTier('starter_breaks')).toBe('free');
    expect(getRequiredTier('full_break_library')).toBe('solo');
    expect(getRequiredTier('weekly_recovery_story')).toBe('solo');
    expect(getRequiredTier('daily_missions')).toBe('solo');
    expect(getRequiredTier('advanced_stats')).toBe('solo');
    expect(getRequiredTier('apple_health_export')).toBe('pro');
    expect(getRequiredTier('calendar_aware')).toBe('pro');
    expect(getRequiredTier('unlimited_custom')).toBe('pro');
    expect(getRequiredTier('streak_buddies')).toBe('family');
    expect(getRequiredTier('family_sharing')).toBe('family');
  });

  it('agrees with tierIncludes — the required tier is exactly the threshold that unlocks it', () => {
    const features: TierFeature[] = [
      'starter_breaks',
      'full_break_library',
      'apple_health_export',
      'streak_buddies',
    ];
    for (const feature of features) {
      const required = getRequiredTier(feature);
      expect(tierIncludes(required, feature)).toBe(true);
    }
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

describe('display catalogs', () => {
  it('exposes purchasable tiers in display order', () => {
    expect(PURCHASABLE_TIERS).toEqual(['solo', 'pro', 'family']);
  });

  it('has labels for every tier including free', () => {
    expect(TIER_LABELS.free).toBe('Free');
    expect(TIER_LABELS.solo).toBe('Solo');
    expect(TIER_LABELS.pro).toBe('Pro');
    expect(TIER_LABELS.family).toBe('Family');
  });

  it('has a tagline for every purchasable tier', () => {
    for (const tier of PURCHASABLE_TIERS) {
      expect(TIER_TAGLINES[tier]).toBeTruthy();
    }
  });

  it('has highlight bullets for every purchasable tier', () => {
    for (const tier of PURCHASABLE_TIERS) {
      expect(TIER_HIGHLIGHTS[tier].length).toBeGreaterThan(0);
    }
  });
});

describe('getOffersForTier', () => {
  function offer(overrides: Partial<SubscriptionOffer>): SubscriptionOffer {
    return {
      id: 'pro_annual',
      title: 'Pro',
      subtitle: 's',
      description: 'd',
      price: 1,
      priceLabel: '$1',
      currency: 'USD',
      billingPeriod: 'yearly',
      trialDays: 0,
      ...overrides,
    };
  }

  const sampleOffers: SubscriptionOffer[] = [
    offer({ id: 'solo_monthly', billingPeriod: 'monthly' }),
    offer({ id: 'solo_annual',  billingPeriod: 'yearly'  }),
    offer({ id: 'pro_monthly',  billingPeriod: 'monthly' }),
    offer({ id: 'pro_annual',   billingPeriod: 'yearly'  }),
    offer({ id: 'family_monthly', billingPeriod: 'monthly' }),
  ];

  it('picks the {monthly, annual} pair for a tier', () => {
    const pair = getOffersForTier('pro', sampleOffers);
    expect(pair.monthly?.id).toBe('pro_monthly');
    expect(pair.annual?.id).toBe('pro_annual');
  });

  it('returns null for a missing period (partial dashboard config)', () => {
    const pair = getOffersForTier('family', sampleOffers);
    expect(pair.monthly?.id).toBe('family_monthly');
    expect(pair.annual).toBeNull();
  });

  it('returns both null when the tier has no offers', () => {
    const pair = getOffersForTier('solo', [
      offer({ id: 'pro_monthly', billingPeriod: 'monthly' }),
    ]);
    expect(pair.monthly).toBeNull();
    expect(pair.annual).toBeNull();
  });
});

describe('resolveEffectiveTier', () => {
  it('uses the server tier the moment it has loaded', () => {
    expect(
      resolveEffectiveTier({ serverLoaded: true, serverTier: 'pro', localTier: 'free' })
    ).toBe('pro');
  });

  it('respects a paid local tier while server is still loading (optimistic)', () => {
    // Just-purchased user: client SDK flipped to pro, webhook hasn't
    // landed yet — we don't want to flash a paywall.
    expect(
      resolveEffectiveTier({ serverLoaded: false, serverTier: 'free', localTier: 'pro' })
    ).toBe('pro');
  });

  it('falls back to free when server hasnt loaded and local is also free', () => {
    expect(
      resolveEffectiveTier({ serverLoaded: false, serverTier: 'free', localTier: 'free' })
    ).toBe('free');
  });

  it('downgrades to free when the server says free, even if local still claims paid', () => {
    // Refund or churn: server is authoritative — downgrade immediately
    // even if the client SDK hasn't seen the update.
    expect(
      resolveEffectiveTier({ serverLoaded: true, serverTier: 'free', localTier: 'pro' })
    ).toBe('free');
  });
});
