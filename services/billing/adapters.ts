import {
  getRevenueCatCustomerState,
  getRevenueCatOffers,
  purchaseRevenueCatOffer,
  restoreRevenueCatCustomerState,
} from './revenuecat';
import type { BillingProvider, BillingProviderAdapter } from './types';

const revenueCatBillingAdapter: BillingProviderAdapter = {
  provider: 'revenuecat',
  getOfferings: (appUserId) => getRevenueCatOffers(appUserId),
  getCustomerState: (appUserId) => getRevenueCatCustomerState(appUserId),
  purchaseOffer: (appUserId, offerId) => purchaseRevenueCatOffer(appUserId, offerId),
  restorePurchases: (appUserId) => restoreRevenueCatCustomerState(appUserId),
};

/**
 * Resolves the remote billing adapter for a provider, or null for store-local
 * providers (`preview`, `none`) that the billing service handles inline.
 *
 * Register new remote providers (StoreKit, Google Play, Stripe, ...) by adding
 * their adapter here — no other billing-service branch needs to change.
 */
export function resolveBillingAdapter(
  provider: BillingProvider
): BillingProviderAdapter | null {
  switch (provider) {
    case 'revenuecat':
      return revenueCatBillingAdapter;
    case 'preview':
    case 'none':
      return null;
    default:
      return null;
  }
}
