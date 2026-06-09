export type SubscriptionStatus = 'free' | 'trial' | 'premium' | 'expired';

export type BillingProvider = 'none' | 'preview' | 'revenuecat';

export type BillingPeriod = 'monthly' | 'yearly';

export type PaywallPlacement =
  | 'onboarding'
  | 'profile'
  | 'breaks'
  | 'stats'
  | 'weekly_story'    // /weekly-story screen gate
  | 'home_missions'   // home-screen daily missions gate
  | 'free_quota';     // hit the 5/day free break cap

export type BillingOperation =
  | 'initialize'
  | 'load_offers'
  | 'refresh_customer'
  | 'purchase'
  | 'restore';

export type BillingHealthStatus = 'unknown' | 'healthy' | 'degraded' | 'offline';

export type EntitlementHealthStatus = 'healthy' | 'warning' | 'invalid';

export interface SubscriptionOffer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  priceLabel: string;
  currency: string;
  billingPeriod: BillingPeriod;
  trialDays: number;
  badge?: string;
  recommended?: boolean;
}

export interface SubscriptionCustomerState {
  appUserId: string | null;
  status: SubscriptionStatus;
  entitlementId: string | null;
  activeOfferId: string | null;
  purchasedAt: string | null;
  expiresAt: string | null;
  trialEndsAt: string | null;
  isPreview: boolean;
  billingProvider: BillingProvider;
}

export interface BillingDiagnostics {
  healthStatus: BillingHealthStatus;
  isInitialized: boolean;
  isConfigured: boolean;
  activeOperation: BillingOperation | null;
  lastOperation: BillingOperation | null;
  lastOperationAt: number | null;
  lastSuccessAt: number | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
}

export interface EntitlementHealth {
  status: EntitlementHealthStatus;
  summary: string;
  issues: string[];
  checkedAt: number;
}

export interface BillingInitializeOptions {
  appUserId: string;
}

export interface PurchaseResult {
  success: boolean;
  code:
    | 'success'
    | 'cancelled'
    | 'billing_unavailable'
    | 'offer_not_found'
    | 'restore_not_available'
    | 'nothing_to_restore'
    | 'unknown_error';
  message: string;
  customer: SubscriptionCustomerState | null;
}
