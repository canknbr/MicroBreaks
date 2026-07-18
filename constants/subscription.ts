import { Platform } from 'react-native';
import type { BillingProvider, SubscriptionOffer } from '@/services/billing/types';

export const PRO_ENTITLEMENT_ID = 'pro';
export const MAIN_PAYWALL_ID = 'main_pro_paywall';

/**
 * Per-tier entitlement identifiers used by RevenueCat. The legacy
 * `PRO_ENTITLEMENT_ID = 'pro'` stays so existing pro purchases keep
 * resolving; the new entitlements are tier-prefixed so the dashboard
 * groups them cleanly.
 */
export const TIER_ENTITLEMENT_IDS = {
  solo: 'solo',
  pro: 'pro',
  family: 'family',
} as const;
export const FREE_EXERCISE_IDS = [
  'eye-rest',
  'deep-breath',
  'neck-roll',
  'upper-body',
  'meditation',
  'walk',
] as const;

/**
 * Always-free movement-library starter set — one gentle move per body zone
 * so free users can feel the GIF-guided experience before the paywall.
 * Ids must exist in data/exerciseLibrary.generated.ts (unit-tested).
 */
export const FREE_LIBRARY_EXERCISE_IDS = [
  'lib-1403', // Neck side stretch
  'lib-1428', // Wrist circles
  'lib-1365', // Upper back stretch
  'lib-0659', // Wall push-up
  'lib-3533', // Bodyweight squat
  'lib-1368', // Ankle circles
  'lib-3147', // Lying pelvic tilt
  'lib-3672', // Back and forth step
] as const;

/**
 * Always-free chained zone circuit — lets free users feel the multi-move
 * session format; the other six circuits are Solo+.
 */
export const FREE_CIRCUIT_IDS = ['circuit-neck'] as const;

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
  // Solo — the entry tier for solo desk workers
  {
    id: 'solo_annual',
    title: 'Solo · Annual',
    subtitle: 'Personal recovery routines',
    description: 'Full break library, weekly recovery story, and daily missions for solo desk workers.',
    price: 29.99,
    priceLabel: '$29.99 / year',
    currency: 'USD',
    billingPeriod: 'yearly',
    trialDays: 7,
    badge: '7-day trial',
  },
  {
    id: 'solo_monthly',
    title: 'Solo · Monthly',
    subtitle: 'Personal recovery routines',
    description: 'Full break library plus weekly story and daily missions.',
    price: 4.99,
    priceLabel: '$4.99 / month',
    currency: 'USD',
    billingPeriod: 'monthly',
    trialDays: 0,
  },

  // Pro — power users with deeper integration
  {
    id: 'pro_annual',
    title: 'Pro · Annual',
    subtitle: 'Best for daily desk-work recovery',
    description: 'Everything in Solo plus Apple Health export, calendar-aware reminders, and unlimited custom routines.',
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
    title: 'Pro · Monthly',
    subtitle: 'Flexible while your routine takes shape',
    description: 'Pro features billed month-to-month.',
    price: 9.99,
    priceLabel: '$9.99 / month',
    currency: 'USD',
    billingPeriod: 'monthly',
    trialDays: 0,
  },

  // Family — up to 6 members, social streak features
  {
    id: 'family_annual',
    title: 'Family · Annual',
    subtitle: 'Up to 6 members, shared accountability',
    description: 'Pro for everyone in your household plus streak buddies and family sharing.',
    price: 99.99,
    priceLabel: '$99.99 / year',
    currency: 'USD',
    billingPeriod: 'yearly',
    trialDays: 14,
    badge: '6 seats · 14-day trial',
  },
  {
    id: 'family_monthly',
    title: 'Family · Monthly',
    subtitle: 'Up to 6 members, billed monthly',
    description: 'Family Pro access without an annual commitment.',
    price: 14.99,
    priceLabel: '$14.99 / month',
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
  'Animated movement library: 100+ desk-friendly moves with guided sessions',
  'Custom routines and zone circuits — chain moves into your own sessions',
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
  library: {
    headline: 'Unlock the full movement library',
    subheadline:
      'Starter moves are free. Pro opens 100+ animated desk-friendly movements with guided sessions for every body zone.',
    primaryFallback: 'Keep the starter moves',
  },
  stats: {
    headline: 'Unlock deeper recovery analytics',
    subheadline:
      'See patterns behind your energy, break mix, and consistency so you can build a routine that actually sticks.',
    primaryFallback: 'Keep using basic stats',
  },
  weekly_story: {
    headline: 'See the story of your recovery',
    subheadline:
      'Weekly insights show what is working, what is slipping, and the best time of day for your reset routine.',
    primaryFallback: 'Skip for now',
  },
  home_missions: {
    headline: 'Three fresh missions every day',
    subheadline:
      'Light variety prompts that keep your routine interesting and award bonus XP — no thinking required.',
    primaryFallback: 'Maybe later',
  },
  free_quota: {
    headline: 'You hit today’s free limit',
    subheadline:
      'Free covers five sessions a day. Upgrade for unlimited breaks plus the full guided library and weekly insights.',
    primaryFallback: 'Come back tomorrow',
  },
  re_engage: {
    headline: 'Welcome back — your subscription lapsed',
    subheadline:
      'Pick up where you left off. Your routines, history, and streak are all still here; just need access to unlock the deeper layer again.',
    primaryFallback: 'Stay on free for now',
  },
} as const;
