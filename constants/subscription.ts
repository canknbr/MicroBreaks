import { Platform } from 'react-native';
import type { BillingProvider, SubscriptionOffer } from '@/services/billing/types';

export const PRO_ENTITLEMENT_ID = 'pro';
export const MAIN_PAYWALL_ID = 'main_pro_paywall';
export const FREE_EXERCISE_IDS = [
  'eye-rest',
  'deep-breath',
  'neck-roll',
  'upper-body',
  'meditation',
  'walk',
] as const;

const BILLING_PROVIDER_ENV = process.env.EXPO_PUBLIC_BILLING_PROVIDER;
const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() ?? '';
const REVENUECAT_ANDROID_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() ?? '';

const IS_WEB = Platform.OS === 'web';

export const REVENUECAT_API_KEY =
  Platform.OS === 'ios'
    ? REVENUECAT_IOS_API_KEY
    : Platform.OS === 'android'
      ? REVENUECAT_ANDROID_API_KEY
      : '';

export const IS_REVENUECAT_CONFIGURED = !IS_WEB && REVENUECAT_API_KEY.length > 0;

function resolveDefaultBillingProvider(): BillingProvider {
  if (IS_WEB) {
    if (BILLING_PROVIDER_ENV === 'none') {
      return 'none';
    }

    return __DEV__ ? 'preview' : 'none';
  }

  if (BILLING_PROVIDER_ENV === 'revenuecat') {
    return IS_REVENUECAT_CONFIGURED ? 'revenuecat' : 'none';
  }

  if (BILLING_PROVIDER_ENV === 'preview') {
    return 'preview';
  }

  if (BILLING_PROVIDER_ENV === 'none') {
    return 'none';
  }

  return __DEV__ ? 'preview' : 'none';
}

export const DEFAULT_BILLING_PROVIDER: BillingProvider = resolveDefaultBillingProvider();

export const DEFAULT_SUBSCRIPTION_OFFERS: SubscriptionOffer[] = [
  {
    id: 'pro_annual',
    title: 'Annual',
    subtitle: 'Best for daily desk-work recovery',
    description: 'Full recovery library, weekly reports, and better routines for the lowest monthly cost.',
    price: 59.99,
    priceLabel: '$59.99 / year',
    currency: 'USD',
    billingPeriod: 'yearly',
    trialDays: 14,
    badge: '14-day trial',
    recommended: true,
  },
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
];

export const PRO_FEATURES = [
  'Structured desk-reset programs for eyes, neck, posture, and focus',
  'Deeper weekly recovery insights and long-range progress trends',
  'Custom routines and faster access to the sessions you use most',
  'Sync-ready account state across devices as billing is enabled',
] as const;

export const PRO_LIBRARY_HIGHLIGHTS = [
  'Full eye-strain, posture, and desk-reset session library',
  'Longer guided routines for deeper recovery between work blocks',
  'Faster access to favorites, custom routines, and future sync-ready history',
] as const;

export const PRO_STATS_HIGHLIGHTS = [
  'Break trend charts across week, month, and year',
  'Break-type distribution to see what your body needs most',
  'Time-pattern insights to find your best recovery windows',
] as const;

export const PAYWALL_COPY = {
  onboarding: {
    headline: 'Unlock your full desk-recovery plan',
    subheadline:
      'Go beyond starter resets with deeper programs, better timing, and more useful recovery insight.',
    primaryFallback: 'Continue with Free',
  },
  profile: {
    headline: 'Unlock the Pro foundation',
    subheadline:
      'Unlock the full subscription layer for deeper recovery programs, richer insights, and cross-device purchase restore.',
    primaryFallback: 'Close',
  },
  breaks: {
    headline: 'Unlock the full reset library',
    subheadline:
      'Go beyond the starter routines with deeper desk-health programs for eyes, neck, posture, and focus.',
    primaryFallback: 'Keep exploring free breaks',
  },
  stats: {
    headline: 'Unlock deeper recovery analytics',
    subheadline:
      'See patterns behind your energy, break mix, and consistency so you can build a routine that actually sticks.',
    primaryFallback: 'Keep using basic stats',
  },
} as const;
