jest.mock('@/services/billing/revenuecat', () => ({
  getRevenueCatOffers: jest.fn(),
  getRevenueCatCustomerState: jest.fn(),
  purchaseRevenueCatOffer: jest.fn(),
  restoreRevenueCatCustomerState: jest.fn(),
}));

import { resolveBillingAdapter } from '@/services/billing/adapters';
import {
  getRevenueCatCustomerState,
  getRevenueCatOffers,
  purchaseRevenueCatOffer,
  restoreRevenueCatCustomerState,
} from '@/services/billing/revenuecat';

describe('resolveBillingAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns no adapter for store-local providers handled inline', () => {
    expect(resolveBillingAdapter('preview')).toBeNull();
    expect(resolveBillingAdapter('none')).toBeNull();
  });

  it('resolves the RevenueCat adapter for the revenuecat provider', () => {
    const adapter = resolveBillingAdapter('revenuecat');
    expect(adapter?.provider).toBe('revenuecat');
  });

  it('delegates RevenueCat adapter operations to the revenuecat service', async () => {
    const offers = [{ id: 'pro_monthly' }] as never;
    const customer = { appUserId: 'u1', status: 'premium' } as never;
    (getRevenueCatOffers as jest.Mock).mockResolvedValue(offers);
    (getRevenueCatCustomerState as jest.Mock).mockResolvedValue(customer);
    (purchaseRevenueCatOffer as jest.Mock).mockResolvedValue(customer);
    (restoreRevenueCatCustomerState as jest.Mock).mockResolvedValue(customer);

    const adapter = resolveBillingAdapter('revenuecat');
    if (!adapter) throw new Error('expected a revenuecat adapter');

    await expect(adapter.getOfferings('u1')).resolves.toBe(offers);
    expect(getRevenueCatOffers).toHaveBeenCalledWith('u1');

    await expect(adapter.getCustomerState('u1')).resolves.toBe(customer);
    expect(getRevenueCatCustomerState).toHaveBeenCalledWith('u1');

    await expect(adapter.purchaseOffer('u1', 'pro_monthly')).resolves.toBe(customer);
    expect(purchaseRevenueCatOffer).toHaveBeenCalledWith('u1', 'pro_monthly');

    await expect(adapter.restorePurchases('u1')).resolves.toBe(customer);
    expect(restoreRevenueCatCustomerState).toHaveBeenCalledWith('u1');
  });
});
