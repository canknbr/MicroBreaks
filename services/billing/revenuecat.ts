import {
  DEFAULT_SUBSCRIPTION_OFFERS,
  IS_REVENUECAT_CONFIGURED,
  PRO_ENTITLEMENT_ID,
  REVENUECAT_API_KEY,
} from '@/constants/subscription';
import type { SubscriptionCustomerState, SubscriptionOffer } from './types';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

let configuredAppUserId: string | null = null;
let cachedPackages = new Map<string, PurchasesPackage>();

function getTrialDays(aPackage: PurchasesPackage): number {
  const introPrice = aPackage.product.introPrice;
  if (!introPrice) {
    return 0;
  }

  const daysPerUnit: Record<string, number> = {
    DAY: 1,
    WEEK: 7,
    MONTH: 30,
    YEAR: 365,
  };

  const unitDays = daysPerUnit[introPrice.periodUnit] ?? 0;
  return Math.max(0, introPrice.cycles * introPrice.periodNumberOfUnits * unitDays);
}

function mapPackageToBillingPeriod(aPackage: PurchasesPackage): SubscriptionOffer['billingPeriod'] {
  if (aPackage.packageType === 'ANNUAL') {
    return 'yearly';
  }

  return 'monthly';
}

function mapPackageToOffer(
  aPackage: PurchasesPackage,
  index: number
): SubscriptionOffer {
  const billingPeriod = mapPackageToBillingPeriod(aPackage);

  return {
    id: aPackage.product.identifier,
    title: billingPeriod === 'yearly' ? 'Annual' : 'Monthly',
    subtitle:
      billingPeriod === 'yearly'
        ? 'Best for daily desk-work recovery'
        : 'Flexible while your routine takes shape',
    description:
      billingPeriod === 'yearly'
        ? 'Full recovery library, weekly reports, and better routines for the lowest monthly cost.'
        : 'Try the deeper recovery layer without committing to a full year.',
    price: aPackage.product.price,
    priceLabel: billingPeriod === 'yearly'
      ? `${aPackage.product.priceString} / year`
      : `${aPackage.product.priceString} / month`,
    currency: aPackage.product.currencyCode ?? 'USD',
    billingPeriod,
    trialDays: getTrialDays(aPackage),
    badge: getTrialDays(aPackage) > 0 ? `${getTrialDays(aPackage)}-day trial` : undefined,
    recommended: billingPeriod === 'yearly' || index === 0,
  };
}

function mapRevenueCatOfferingToOffers(offering: PurchasesOffering | null): SubscriptionOffer[] {
  if (!offering) {
    cachedPackages.clear();
    return [];
  }

  const orderedPackages = [
    offering.annual,
    offering.monthly,
    ...offering.availablePackages.filter(
      (aPackage) =>
        aPackage.identifier !== offering.annual?.identifier &&
        aPackage.identifier !== offering.monthly?.identifier
    ),
  ].filter(Boolean) as PurchasesPackage[];

  cachedPackages = new Map(
    orderedPackages.map((aPackage) => [aPackage.product.identifier, aPackage])
  );

  return orderedPackages.map((aPackage, index) => mapPackageToOffer(aPackage, index));
}

function mapRevenueCatCustomerInfo(
  appUserId: string,
  customerInfo: CustomerInfo
): SubscriptionCustomerState {
  const activeEntitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
  const knownEntitlement =
    activeEntitlement ?? customerInfo.entitlements.all[PRO_ENTITLEMENT_ID] ?? null;

  if (activeEntitlement) {
    return {
      appUserId,
      status: activeEntitlement.periodType === 'TRIAL' ? 'trial' : 'premium',
      entitlementId: activeEntitlement.identifier,
      activeOfferId: activeEntitlement.productIdentifier,
      purchasedAt: activeEntitlement.latestPurchaseDate,
      expiresAt: activeEntitlement.expirationDate,
      trialEndsAt:
        activeEntitlement.periodType === 'TRIAL' ? activeEntitlement.expirationDate : null,
      isPreview: false,
      billingProvider: 'revenuecat',
    };
  }

  if (knownEntitlement) {
    return {
      appUserId,
      status: 'expired',
      entitlementId: null,
      activeOfferId: null,
      purchasedAt: knownEntitlement.latestPurchaseDate,
      expiresAt: knownEntitlement.expirationDate,
      trialEndsAt: null,
      isPreview: false,
      billingProvider: 'revenuecat',
    };
  }

  return {
    appUserId,
    status: 'free',
    entitlementId: null,
    activeOfferId: null,
    purchasedAt: null,
    expiresAt: null,
    trialEndsAt: null,
    isPreview: false,
    billingProvider: 'revenuecat',
  };
}

async function getPurchasesModule() {
  const module = await import('react-native-purchases');
  return module.default ?? module;
}

export async function ensureRevenueCatConfigured(appUserId: string): Promise<void> {
  if (!IS_REVENUECAT_CONFIGURED || !REVENUECAT_API_KEY) {
    throw new Error('RevenueCat API key is missing for this platform.');
  }

  const Purchases = await getPurchasesModule();

  if (!configuredAppUserId) {
    Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: appUserId,
      diagnosticsEnabled: __DEV__,
    });
    configuredAppUserId = appUserId;
    return;
  }

  if (configuredAppUserId !== appUserId) {
    await Purchases.logIn(appUserId);
    configuredAppUserId = appUserId;
  }
}

export async function getRevenueCatOffers(appUserId: string): Promise<SubscriptionOffer[]> {
  await ensureRevenueCatConfigured(appUserId);

  const Purchases = await getPurchasesModule();
  const offerings = await Purchases.getOfferings();
  const offers = mapRevenueCatOfferingToOffers(offerings.current);

  return offers.length > 0 ? offers : DEFAULT_SUBSCRIPTION_OFFERS;
}

export async function getRevenueCatCustomerState(
  appUserId: string
): Promise<SubscriptionCustomerState> {
  await ensureRevenueCatConfigured(appUserId);

  const Purchases = await getPurchasesModule();
  const customerInfo = await Purchases.getCustomerInfo();
  return mapRevenueCatCustomerInfo(appUserId, customerInfo);
}

export async function purchaseRevenueCatOffer(
  appUserId: string,
  offerId: string
): Promise<SubscriptionCustomerState> {
  await ensureRevenueCatConfigured(appUserId);

  if (!cachedPackages.has(offerId)) {
    await getRevenueCatOffers(appUserId);
  }

  const aPackage = cachedPackages.get(offerId);
  if (!aPackage) {
    throw new Error('The selected RevenueCat package is unavailable.');
  }

  const Purchases = await getPurchasesModule();
  const result = await Purchases.purchasePackage(aPackage);
  return mapRevenueCatCustomerInfo(appUserId, result.customerInfo);
}

export async function restoreRevenueCatCustomerState(
  appUserId: string
): Promise<SubscriptionCustomerState> {
  await ensureRevenueCatConfigured(appUserId);

  const Purchases = await getPurchasesModule();
  const customerInfo = await Purchases.restorePurchases();
  return mapRevenueCatCustomerInfo(appUserId, customerInfo);
}
