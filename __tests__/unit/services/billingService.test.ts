jest.mock('@/services/analytics', () => ({
  analytics: {
    setUserProperties: jest.fn(),
    trackTrialStarted: jest.fn(),
    trackPurchaseCompleted: jest.fn(),
    trackPurchaseRestored: jest.fn(),
    trackTrialConverted: jest.fn(),
  },
}));

jest.mock('@/services/billing/revenuecat', () => ({
  getRevenueCatCustomerState: jest.fn(),
  getRevenueCatOffers: jest.fn(),
  purchaseRevenueCatOffer: jest.fn(),
  restoreRevenueCatCustomerState: jest.fn(),
}));

import { billingService } from '@/services/billing';
import {
  getRevenueCatCustomerState,
  getRevenueCatOffers,
  purchaseRevenueCatOffer,
  restoreRevenueCatCustomerState,
} from '@/services/billing/revenuecat';
import { useSubscriptionStore } from '@/store/subscriptionStore';

const premiumCustomer = {
  appUserId: 'user-1',
  status: 'premium' as const,
  entitlementId: 'pro',
  activeOfferId: 'pro_monthly',
  purchasedAt: '2026-01-01T00:00:00.000Z',
  expiresAt: '2027-01-01T00:00:00.000Z',
  trialEndsAt: null,
  isPreview: false,
  billingProvider: 'revenuecat' as const,
};

describe('billingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.getState().resetSubscription();
    useSubscriptionStore.getState().setBillingProvider('revenuecat');
    useSubscriptionStore.getState().setAppUserId('user-1');
    useSubscriptionStore.getState().setOfferings([
      {
        id: 'pro_monthly',
        title: 'Monthly',
        subtitle: 'Flexible while your routine takes shape',
        description: 'Try the deeper recovery layer without committing to a full year.',
        price: 9.99,
        priceLabel: '$9.99 / month',
        currency: 'USD',
        billingPeriod: 'monthly',
        trialDays: 0,
      },
    ]);
    useSubscriptionStore.getState().setCustomerState({
      appUserId: 'user-1',
      status: 'free',
      isPreview: false,
      billingProvider: 'revenuecat',
    });
  });

  it('treats a cancelled RevenueCat purchase as a non-fatal outcome', async () => {
    (purchaseRevenueCatOffer as jest.Mock).mockRejectedValue({
      userCancelled: true,
      code: '1',
      readableErrorCode: 'PurchaseCancelledError',
    });

    const result = await billingService.purchaseOffer('pro_monthly', 'profile');

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        code: 'cancelled',
        message: 'Purchase cancelled.',
      })
    );

    expect(useSubscriptionStore.getState().diagnostics.lastErrorCode).toBe(
      'purchase_cancelled'
    );
  });

  it('routes a successful purchase through the active provider and stores the new customer', async () => {
    (purchaseRevenueCatOffer as jest.Mock).mockResolvedValue(premiumCustomer);

    const result = await billingService.purchaseOffer('pro_monthly', 'profile');

    expect(purchaseRevenueCatOffer).toHaveBeenCalledWith('user-1', 'pro_monthly');
    expect(result).toEqual(
      expect.objectContaining({ success: true, code: 'success' })
    );
    expect(useSubscriptionStore.getState().customer.status).toBe('premium');
  });

  it('refreshes customer state through the active provider', async () => {
    (getRevenueCatCustomerState as jest.Mock).mockResolvedValue(premiumCustomer);

    const customer = await billingService.refreshCustomerState();

    expect(getRevenueCatCustomerState).toHaveBeenCalledWith('user-1');
    expect(customer.status).toBe('premium');
    expect(useSubscriptionStore.getState().customer.status).toBe('premium');
  });

  it('loads offerings through the active provider', async () => {
    const offers = [
      {
        id: 'pro_yearly',
        title: 'Yearly',
        subtitle: 'Best value',
        description: 'Commit to a full year of recovery.',
        price: 59.99,
        priceLabel: '$59.99 / year',
        currency: 'USD',
        billingPeriod: 'yearly' as const,
        trialDays: 7,
      },
    ];
    (getRevenueCatOffers as jest.Mock).mockResolvedValue(offers);

    const result = await billingService.getOfferings();

    expect(getRevenueCatOffers).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(offers);
    expect(useSubscriptionStore.getState().offerings).toEqual(offers);
  });

  it('restores purchases through the active provider', async () => {
    (restoreRevenueCatCustomerState as jest.Mock).mockResolvedValue(premiumCustomer);

    const result = await billingService.restorePurchases();

    expect(restoreRevenueCatCustomerState).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(
      expect.objectContaining({ success: true, code: 'success' })
    );
  });
});
