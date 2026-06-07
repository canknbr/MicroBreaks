/**
 * Unit tests for RevenueCat mapping branches that were previously
 * uncovered. Targets the mapPackageToOffer / mapRevenueCatCustomerInfo
 * branch paths called out in audit task C-TEST2.
 */

import { __internals } from '@/services/billing/revenuecat';

const {
  mapPackageToOffer,
  mapRevenueCatCustomerInfo,
  mapRevenueCatOfferingToOffers,
  getTrialDays,
  mapPackageToBillingPeriod,
} = __internals;

function buildPackage(overrides: {
  identifier: string;
  packageType?: 'ANNUAL' | 'MONTHLY' | string;
  productIdentifier?: string;
  price?: number;
  priceString?: string;
  currencyCode?: string | null;
  introCycles?: number;
  introPeriodUnit?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  introPeriodNumberOfUnits?: number;
}) {
  const introPrice = overrides.introCycles
    ? {
        cycles: overrides.introCycles,
        periodUnit: overrides.introPeriodUnit ?? 'WEEK',
        periodNumberOfUnits: overrides.introPeriodNumberOfUnits ?? 1,
      }
    : undefined;

  return {
    identifier: overrides.identifier,
    packageType: overrides.packageType ?? 'MONTHLY',
    product: {
      identifier: overrides.productIdentifier ?? overrides.identifier,
      price: overrides.price ?? 9.99,
      priceString: overrides.priceString ?? '$9.99',
      currencyCode: overrides.currencyCode === null ? undefined : overrides.currencyCode ?? 'USD',
      introPrice,
    },
  } as unknown as Parameters<typeof mapPackageToOffer>[0];
}

describe('mapPackageToBillingPeriod', () => {
  it('classifies ANNUAL packages as yearly', () => {
    expect(mapPackageToBillingPeriod(buildPackage({ identifier: 'a', packageType: 'ANNUAL' })))
      .toBe('yearly');
  });

  it('classifies non-ANNUAL packages as monthly', () => {
    expect(mapPackageToBillingPeriod(buildPackage({ identifier: 'm', packageType: 'MONTHLY' })))
      .toBe('monthly');
    expect(mapPackageToBillingPeriod(buildPackage({ identifier: 'w', packageType: 'WEEKLY' })))
      .toBe('monthly');
  });
});

describe('getTrialDays', () => {
  it('returns zero when there is no intro price', () => {
    expect(getTrialDays(buildPackage({ identifier: 'p' }))).toBe(0);
  });

  it.each([
    { unit: 'DAY' as const, cycles: 7, units: 1, expected: 7 },
    { unit: 'WEEK' as const, cycles: 1, units: 1, expected: 7 },
    { unit: 'MONTH' as const, cycles: 1, units: 1, expected: 30 },
    { unit: 'YEAR' as const, cycles: 1, units: 1, expected: 365 },
  ])(
    'maps $unit intro prices to the right day count',
    ({ unit, cycles, units, expected }) => {
      const result = getTrialDays(
        buildPackage({
          identifier: 'p',
          introCycles: cycles,
          introPeriodUnit: unit,
          introPeriodNumberOfUnits: units,
        })
      );
      expect(result).toBe(expected);
    }
  );

  it('floors negative product configurations to zero', () => {
    const result = getTrialDays(
      buildPackage({
        identifier: 'p',
        introCycles: 0,
        introPeriodUnit: 'WEEK',
        introPeriodNumberOfUnits: 1,
      })
    );
    expect(result).toBe(0);
  });
});

describe('mapPackageToOffer', () => {
  it('builds an annual offer with yearly price label and recommended flag', () => {
    const offer = mapPackageToOffer(
      buildPackage({
        identifier: 'pro_annual',
        packageType: 'ANNUAL',
        priceString: '$59.99',
        price: 59.99,
      }),
      3
    );
    expect(offer.billingPeriod).toBe('yearly');
    expect(offer.title).toBe('Annual');
    expect(offer.priceLabel).toBe('$59.99 / year');
    expect(offer.recommended).toBe(true);
    expect(offer.badge).toBeUndefined();
  });

  it('marks the first listed package as recommended even when monthly', () => {
    const offer = mapPackageToOffer(
      buildPackage({
        identifier: 'pro_monthly',
        packageType: 'MONTHLY',
        priceString: '$5.99',
        price: 5.99,
      }),
      0
    );
    expect(offer.billingPeriod).toBe('monthly');
    expect(offer.title).toBe('Monthly');
    expect(offer.priceLabel).toBe('$5.99 / month');
    expect(offer.recommended).toBe(true);
  });

  it('attaches a trial badge when an intro price is present', () => {
    const offer = mapPackageToOffer(
      buildPackage({
        identifier: 'pro_monthly',
        introCycles: 1,
        introPeriodUnit: 'WEEK',
        introPeriodNumberOfUnits: 1,
      }),
      1
    );
    expect(offer.trialDays).toBe(7);
    expect(offer.badge).toBe('7-day trial');
  });

  it('falls back to USD when currency code is missing', () => {
    const offer = mapPackageToOffer(
      buildPackage({ identifier: 'p', currencyCode: null }),
      1
    );
    expect(offer.currency).toBe('USD');
  });
});

describe('mapRevenueCatOfferingToOffers', () => {
  it('returns an empty list and clears caches when offering is null', () => {
    expect(mapRevenueCatOfferingToOffers(null)).toEqual([]);
  });

  it('orders annual first, monthly second, and any extras after', () => {
    const annual = buildPackage({ identifier: 'a', packageType: 'ANNUAL' });
    const monthly = buildPackage({ identifier: 'm', packageType: 'MONTHLY' });
    const lifetime = buildPackage({ identifier: 'l', packageType: 'LIFETIME' });

    const offers = mapRevenueCatOfferingToOffers({
      identifier: 'default',
      serverDescription: 'default',
      metadata: {},
      annual,
      monthly,
      sixMonth: null,
      threeMonth: null,
      twoMonth: null,
      weekly: null,
      lifetime: null,
      availablePackages: [annual, monthly, lifetime],
    } as unknown as Parameters<typeof mapRevenueCatOfferingToOffers>[0]);

    expect(offers.map((offer) => offer.id)).toEqual(['a', 'm', 'l']);
  });
});

describe('mapRevenueCatCustomerInfo', () => {
  const baseCustomerInfo = {
    entitlements: { active: {}, all: {} },
  } as unknown as Parameters<typeof mapRevenueCatCustomerInfo>[1];

  it('returns a free profile when no entitlement is present', () => {
    const state = mapRevenueCatCustomerInfo('user-1', baseCustomerInfo);
    expect(state).toMatchObject({
      appUserId: 'user-1',
      status: 'free',
      entitlementId: null,
      activeOfferId: null,
      isPreview: false,
      billingProvider: 'revenuecat',
    });
  });

  it('classifies an active trial entitlement', () => {
    const state = mapRevenueCatCustomerInfo('user-1', {
      entitlements: {
        active: {
          pro: {
            identifier: 'pro',
            productIdentifier: 'pro_annual',
            latestPurchaseDate: '2026-01-01T00:00:00.000Z',
            expirationDate: '2026-01-08T00:00:00.000Z',
            periodType: 'TRIAL',
          },
        },
        all: {},
      },
    } as unknown as Parameters<typeof mapRevenueCatCustomerInfo>[1]);

    expect(state.status).toBe('trial');
    expect(state.trialEndsAt).toBe('2026-01-08T00:00:00.000Z');
    expect(state.activeOfferId).toBe('pro_annual');
  });

  it('classifies an active non-trial entitlement as premium without a trial end', () => {
    const state = mapRevenueCatCustomerInfo('user-1', {
      entitlements: {
        active: {
          pro: {
            identifier: 'pro',
            productIdentifier: 'pro_annual',
            latestPurchaseDate: '2026-01-01T00:00:00.000Z',
            expirationDate: '2027-01-01T00:00:00.000Z',
            periodType: 'NORMAL',
          },
        },
        all: {},
      },
    } as unknown as Parameters<typeof mapRevenueCatCustomerInfo>[1]);

    expect(state.status).toBe('premium');
    expect(state.trialEndsAt).toBeNull();
    expect(state.expiresAt).toBe('2027-01-01T00:00:00.000Z');
  });

  it('returns an expired profile when only a historical entitlement exists', () => {
    const state = mapRevenueCatCustomerInfo('user-1', {
      entitlements: {
        active: {},
        all: {
          pro: {
            identifier: 'pro',
            productIdentifier: 'pro_annual',
            latestPurchaseDate: '2025-01-01T00:00:00.000Z',
            expirationDate: '2025-12-31T00:00:00.000Z',
            periodType: 'NORMAL',
          },
        },
      },
    } as unknown as Parameters<typeof mapRevenueCatCustomerInfo>[1]);

    expect(state.status).toBe('expired');
    expect(state.entitlementId).toBeNull();
    expect(state.expiresAt).toBe('2025-12-31T00:00:00.000Z');
  });
});
