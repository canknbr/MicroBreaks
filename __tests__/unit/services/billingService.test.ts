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
import { purchaseRevenueCatOffer } from '@/services/billing/revenuecat';
import { useSubscriptionStore } from '@/store/subscriptionStore';

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
});
