import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createMmkvStorage } from '@/services/storage/zustandMmkv';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import {
  DEFAULT_BILLING_PROVIDER,
  DEFAULT_SUBSCRIPTION_OFFERS,
  PRO_ENTITLEMENT_ID,
} from '@/constants/subscription';
import type {
  BillingDiagnostics,
  BillingHealthStatus,
  BillingOperation,
  BillingProvider,
  EntitlementHealth,
  SubscriptionCustomerState,
  SubscriptionOffer,
} from '@/services/billing/types';

interface SubscriptionState {
  customer: SubscriptionCustomerState;
  offerings: SubscriptionOffer[];
  diagnostics: BillingDiagnostics;
  isLoading: boolean;
  lastError: string | null;
  lastSyncedAt: number | null;
  paywallViews: Record<string, number>;

  setBillingProvider: (provider: BillingProvider) => void;
  setAppUserId: (appUserId: string | null) => void;
  setOfferings: (offerings: SubscriptionOffer[]) => void;
  setDiagnostics: (diagnostics: Partial<BillingDiagnostics>) => void;
  startBillingOperation: (operation: BillingOperation) => void;
  finishBillingOperation: (params: {
    operation: BillingOperation;
    healthStatus?: BillingHealthStatus;
    errorCode?: string | null;
    errorMessage?: string | null;
    isInitialized?: boolean;
    isConfigured?: boolean;
    succeeded?: boolean;
  }) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (message: string | null) => void;
  markPaywallSeen: (placement: string) => void;
  setCustomerState: (customer: Partial<SubscriptionCustomerState>) => void;
  activatePreviewAccess: (offer: SubscriptionOffer) => void;
  expireIfNeeded: () => void;
  resetSubscription: () => void;
}

interface PersistedSubscriptionState {
  customer: SubscriptionCustomerState;
  offerings: SubscriptionOffer[];
  diagnostics: BillingDiagnostics;
  lastSyncedAt: number | null;
  paywallViews: Record<string, number>;
}

const initialCustomer: SubscriptionCustomerState = {
  appUserId: null,
  status: 'free',
  entitlementId: null,
  activeOfferId: null,
  purchasedAt: null,
  expiresAt: null,
  trialEndsAt: null,
  isPreview: DEFAULT_BILLING_PROVIDER === 'preview',
  billingProvider: DEFAULT_BILLING_PROVIDER,
};

const initialDiagnostics: BillingDiagnostics = {
  healthStatus: 'unknown',
  isInitialized: false,
  isConfigured: DEFAULT_BILLING_PROVIDER !== 'none',
  activeOperation: null,
  lastOperation: null,
  lastOperationAt: null,
  lastSuccessAt: null,
  lastErrorCode: null,
  lastErrorMessage: null,
};

const SUBSCRIPTION_STATUSES: SubscriptionCustomerState['status'][] = [
  'free',
  'trial',
  'premium',
  'expired',
];

const BILLING_PROVIDERS: BillingProvider[] = ['none', 'preview', 'revenuecat'];
const BILLING_PERIODS: SubscriptionOffer['billingPeriod'][] = ['monthly', 'yearly'];
const BILLING_OPERATIONS: BillingOperation[] = [
  'initialize',
  'load_offers',
  'refresh_customer',
  'purchase',
  'restore',
];
const BILLING_HEALTH_STATUSES: BillingHealthStatus[] = [
  'unknown',
  'healthy',
  'degraded',
  'offline',
];

function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function sanitizeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return isValidIsoDate(value) ? value : null;
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizePaywallViews(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};

  return Object.entries(value).reduce<Record<string, number>>((acc, [key, count]) => {
    if (typeof key === 'string' && isValidNumber(count) && count >= 0) {
      acc[key] = Math.floor(count);
    }
    return acc;
  }, {});
}

function sanitizeOfferings(value: unknown): SubscriptionOffer[] {
  if (!Array.isArray(value)) return DEFAULT_SUBSCRIPTION_OFFERS;

  const offerings = value.reduce<SubscriptionOffer[]>((acc, item) => {
    if (!isRecord(item)) return acc;

    const id = sanitizeNullableString(item.id);
    const title = sanitizeNullableString(item.title);
    const subtitle = sanitizeNullableString(item.subtitle);
    const description = sanitizeNullableString(item.description);
    const priceLabel = sanitizeNullableString(item.priceLabel);
    const currency = sanitizeNullableString(item.currency);
    const billingPeriod = BILLING_PERIODS.includes(item.billingPeriod as SubscriptionOffer['billingPeriod'])
      ? (item.billingPeriod as SubscriptionOffer['billingPeriod'])
      : null;
    const price = isValidNumber(item.price) ? item.price : null;
    const trialDays = isValidNumber(item.trialDays) && item.trialDays >= 0
      ? Math.floor(item.trialDays)
      : null;

    if (!id || !title || !subtitle || !description || !priceLabel || !currency || billingPeriod == null || price == null || trialDays == null) {
      return acc;
    }

    acc.push({
      id,
      title,
      subtitle,
      description,
      price,
      priceLabel,
      currency,
      billingPeriod,
      trialDays,
      badge: sanitizeNullableString(item.badge) ?? undefined,
      recommended: typeof item.recommended === 'boolean' ? item.recommended : false,
    });
    return acc;
  }, []);

  return offerings.length > 0 ? offerings : DEFAULT_SUBSCRIPTION_OFFERS;
}

function sanitizeCustomerState(value: unknown): SubscriptionCustomerState {
  if (!isRecord(value)) return initialCustomer;

  const status = SUBSCRIPTION_STATUSES.includes(value.status as SubscriptionCustomerState['status'])
    ? (value.status as SubscriptionCustomerState['status'])
    : initialCustomer.status;
  const billingProvider = BILLING_PROVIDERS.includes(value.billingProvider as BillingProvider)
    ? (value.billingProvider as BillingProvider)
    : initialCustomer.billingProvider;

  const nextCustomer: SubscriptionCustomerState = {
    appUserId: sanitizeNullableString(value.appUserId),
    status,
    entitlementId: sanitizeNullableString(value.entitlementId),
    activeOfferId: sanitizeNullableString(value.activeOfferId),
    purchasedAt: sanitizeIsoDate(value.purchasedAt),
    expiresAt: sanitizeIsoDate(value.expiresAt),
    trialEndsAt: sanitizeIsoDate(value.trialEndsAt),
    isPreview: sanitizeBoolean(value.isPreview, billingProvider === 'preview'),
    billingProvider,
  };

  if (nextCustomer.billingProvider === 'none') {
    nextCustomer.isPreview = false;
  }

  if (nextCustomer.status === 'free') {
    nextCustomer.entitlementId = null;
    nextCustomer.activeOfferId = null;
    nextCustomer.purchasedAt = null;
    nextCustomer.expiresAt = null;
    nextCustomer.trialEndsAt = null;
  }

  if (nextCustomer.status === 'premium') {
    nextCustomer.trialEndsAt = null;
  }

  if (nextCustomer.status === 'expired') {
    nextCustomer.entitlementId = null;
    nextCustomer.activeOfferId = null;
    nextCustomer.trialEndsAt = null;
  }

  return nextCustomer;
}

function sanitizeDiagnostics(
  value: unknown,
  billingProvider: BillingProvider
): BillingDiagnostics {
  if (billingProvider === 'none') {
    return {
      ...initialDiagnostics,
      healthStatus: 'offline',
      isConfigured: false,
      lastOperation:
        isRecord(value) && BILLING_OPERATIONS.includes(value.lastOperation as BillingOperation)
          ? (value.lastOperation as BillingOperation)
          : null,
      lastOperationAt:
        isRecord(value) && isValidNumber(value.lastOperationAt) ? value.lastOperationAt : null,
      lastSuccessAt:
        isRecord(value) && isValidNumber(value.lastSuccessAt) ? value.lastSuccessAt : null,
    };
  }

  if (!isRecord(value)) {
    return {
      ...initialDiagnostics,
      healthStatus: initialDiagnostics.healthStatus,
      isConfigured: true,
    };
  }

  const healthStatus = BILLING_HEALTH_STATUSES.includes(value.healthStatus as BillingHealthStatus)
    ? (value.healthStatus as BillingHealthStatus)
    : 'unknown';

  const lastOperation = BILLING_OPERATIONS.includes(value.lastOperation as BillingOperation)
    ? (value.lastOperation as BillingOperation)
    : null;

  return {
    healthStatus,
    isInitialized: false,
    isConfigured: true,
    activeOperation: null,
    lastOperation,
    lastOperationAt: isValidNumber(value.lastOperationAt) ? value.lastOperationAt : null,
    lastSuccessAt: isValidNumber(value.lastSuccessAt) ? value.lastSuccessAt : null,
    lastErrorCode: null,
    lastErrorMessage: null,
  };
}

function sanitizeLastSyncedAt(value: unknown): number | null {
  return isValidNumber(value) ? value : null;
}

function sanitizePersistedSubscriptionState(value: unknown): PersistedSubscriptionState {
  if (!isRecord(value)) {
    return {
      customer: initialCustomer,
      offerings: DEFAULT_SUBSCRIPTION_OFFERS,
      diagnostics: getPersistedDiagnosticsSnapshot(
        initialDiagnostics,
        initialCustomer.billingProvider
      ),
      lastSyncedAt: null,
      paywallViews: {},
    };
  }

  const customer = sanitizeCustomerState(value.customer);
  const offerings = sanitizeOfferings(value.offerings);
  const diagnostics = sanitizeDiagnostics(value.diagnostics, customer.billingProvider);

  return {
    customer,
    offerings,
    diagnostics,
    lastSyncedAt: sanitizeLastSyncedAt(value.lastSyncedAt),
    paywallViews: sanitizePaywallViews(value.paywallViews),
  };
}

function getPersistedDiagnosticsSnapshot(
  diagnostics: BillingDiagnostics,
  billingProvider: BillingProvider
): BillingDiagnostics {
  return {
    ...diagnostics,
    healthStatus: billingProvider === 'none' ? 'offline' : diagnostics.healthStatus,
    isInitialized: false,
    isConfigured: billingProvider !== 'none',
    activeOperation: null,
    lastErrorCode: null,
    lastErrorMessage: null,
  };
}

function getPersistedSubscriptionSnapshot(state: SubscriptionState): PersistedSubscriptionState {
  return {
    customer: state.customer,
    offerings: state.offerings,
    diagnostics: getPersistedDiagnosticsSnapshot(
      state.diagnostics,
      state.customer.billingProvider
    ),
    lastSyncedAt: state.lastSyncedAt,
    paywallViews: state.paywallViews,
  };
}

export const subscriptionStoreTestUtils = {
  sanitizePersistedSubscriptionState,
  getPersistedSubscriptionSnapshot,
};

function isValidIsoDate(value: string | null): boolean {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return !Number.isNaN(timestamp);
}

export function getEntitlementHealthSnapshot(
  customer: SubscriptionCustomerState,
  offerings: SubscriptionOffer[]
): EntitlementHealth {
  const issues: string[] = [];

  if ((customer.status === 'trial' || customer.status === 'premium') && !customer.entitlementId) {
    issues.push('Active access is missing an entitlement identifier.');
  }

  if ((customer.status === 'trial' || customer.status === 'premium') && !customer.activeOfferId) {
    issues.push('Active access is missing the source plan identifier.');
  }

  if (
    customer.activeOfferId &&
    !offerings.some((offer) => offer.id === customer.activeOfferId)
  ) {
    issues.push('The active plan no longer matches the available offerings.');
  }

  if ((customer.status === 'trial' || customer.status === 'premium' || customer.status === 'expired') && !isValidIsoDate(customer.expiresAt)) {
    issues.push('Subscription state is missing a valid expiration date.');
  }

  if (customer.status === 'trial' && !isValidIsoDate(customer.trialEndsAt)) {
    issues.push('Trial access is missing a valid trial end date.');
  }

  if ((customer.status === 'trial' || customer.status === 'premium') && customer.purchasedAt && !isValidIsoDate(customer.purchasedAt)) {
    issues.push('Purchase state contains an invalid purchase date.');
  }

  if ((customer.status === 'free' || customer.status === 'expired') && customer.entitlementId) {
    issues.push('Inactive access still has an entitlement attached.');
  }

  if ((customer.status === 'free' || customer.status === 'expired') && customer.activeOfferId) {
    issues.push('Inactive access still has an active plan attached.');
  }

  const status =
    issues.length === 0
      ? 'healthy'
      : issues.some(
          (issue) =>
            issue.includes('missing') ||
            issue.includes('invalid') ||
            issue.includes('Inactive access')
        )
        ? 'invalid'
        : 'warning';

  return {
    status,
    summary:
      issues.length === 0
        ? 'Entitlement state looks consistent.'
        : issues[0],
    issues,
    checkedAt: Date.now(),
  };
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      customer: initialCustomer,
      offerings: DEFAULT_SUBSCRIPTION_OFFERS,
      diagnostics: initialDiagnostics,
      isLoading: false,
      lastError: null,
      lastSyncedAt: null,
      paywallViews: {},

      setBillingProvider: (provider) =>
        set((state) => ({
          customer: {
            ...state.customer,
            billingProvider: provider,
            isPreview: provider === 'preview',
          },
          diagnostics: {
            ...state.diagnostics,
            isConfigured: provider !== 'none',
          },
        })),

      setAppUserId: (appUserId) =>
        set((state) => ({
          customer: {
            ...state.customer,
            appUserId,
          },
        })),

      setOfferings: (offerings) => set({ offerings }),

      setDiagnostics: (diagnostics) =>
        set((state) => ({
          diagnostics: {
            ...state.diagnostics,
            ...diagnostics,
          },
        })),

      startBillingOperation: (operation) =>
        set((state) => ({
          isLoading: true,
          lastError: null,
          diagnostics: {
            ...state.diagnostics,
            activeOperation: operation,
            lastOperation: operation,
            lastOperationAt: Date.now(),
            lastErrorCode: null,
            lastErrorMessage: null,
          },
        })),

      finishBillingOperation: ({
        operation,
        healthStatus,
        errorCode = null,
        errorMessage = null,
        isInitialized,
        isConfigured,
        succeeded = false,
      }) =>
        set((state) => ({
          isLoading: false,
          lastError: succeeded ? null : errorMessage,
          diagnostics: {
            ...state.diagnostics,
            healthStatus: healthStatus ?? state.diagnostics.healthStatus,
            isInitialized: isInitialized ?? state.diagnostics.isInitialized,
            isConfigured: isConfigured ?? state.diagnostics.isConfigured,
            activeOperation:
              state.diagnostics.activeOperation === operation
                ? null
                : state.diagnostics.activeOperation,
            lastOperation: operation,
            lastOperationAt: Date.now(),
            lastSuccessAt: succeeded ? Date.now() : state.diagnostics.lastSuccessAt,
            lastErrorCode: errorCode,
            lastErrorMessage: errorMessage,
          },
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (message) =>
        set((state) => ({
          lastError: message,
          diagnostics: {
            ...state.diagnostics,
            lastErrorMessage: message,
          },
        })),

      markPaywallSeen: (placement) =>
        set((state) => ({
          paywallViews: {
            ...state.paywallViews,
            [placement]: (state.paywallViews[placement] ?? 0) + 1,
          },
        })),

      setCustomerState: (customer) =>
        set((state) => ({
          customer: {
            ...state.customer,
            ...customer,
          },
          lastSyncedAt: Date.now(),
        })),

      activatePreviewAccess: (offer) => {
        const now = new Date();
        const isTrial = offer.trialDays > 0;

        set((state) => ({
          customer: {
            ...state.customer,
            status: isTrial ? 'trial' : 'premium',
            entitlementId: PRO_ENTITLEMENT_ID,
            activeOfferId: offer.id,
            purchasedAt: now.toISOString(),
            trialEndsAt: isTrial ? addDays(now, offer.trialDays) : null,
            expiresAt: addDays(now, offer.billingPeriod === 'yearly' ? 365 : 30),
            isPreview: true,
            billingProvider: 'preview',
          },
          lastError: null,
          lastSyncedAt: Date.now(),
        }));
      },

      expireIfNeeded: () => {
        const { customer } = get();
        if (!customer.expiresAt) return;

        const now = Date.now();
        const expiresAt = new Date(customer.expiresAt).getTime();
        const trialEndsAt = customer.trialEndsAt ? new Date(customer.trialEndsAt).getTime() : null;

        // Trial → premium transition (C-BUG5).
        // We compare with `>= now` so the boundary case where trialEndsAt
        // and expiresAt are the same instant (a trial that converts to a
        // paid subscription with no gap) still flips the status. The
        // previous strict `>` left the user stuck on "Trial" forever.
        if (
          customer.status === 'trial' &&
          trialEndsAt != null &&
          !Number.isNaN(trialEndsAt) &&
          trialEndsAt <= now &&
          !Number.isNaN(expiresAt) &&
          expiresAt >= now
        ) {
          set((state) => ({
            customer: {
              ...state.customer,
              status: 'premium',
              trialEndsAt: null,
            },
            lastSyncedAt: now,
          }));
          return;
        }

        if (Number.isNaN(expiresAt) || expiresAt > now) return;

        set((state) => ({
          customer: {
            ...state.customer,
            status: 'expired',
            entitlementId: null,
            activeOfferId: null,
            trialEndsAt: null,
          },
          lastSyncedAt: now,
        }));
      },

      resetSubscription: () =>
        set({
          customer: initialCustomer,
          offerings: DEFAULT_SUBSCRIPTION_OFFERS,
          diagnostics: initialDiagnostics,
          isLoading: false,
          lastError: null,
          lastSyncedAt: null,
          paywallViews: {},
        }),
    }),
    {
      name: ZUSTAND_PERSIST_KEYS.SUBSCRIPTION,
      storage: createMmkvStorage(),
      version: 1,
      partialize: (state) => getPersistedSubscriptionSnapshot(state),
      merge: (persistedState, currentState) => {
        const snapshot = sanitizePersistedSubscriptionState(persistedState);

        return {
          ...currentState,
          customer: snapshot.customer,
          offerings: snapshot.offerings,
          diagnostics: snapshot.diagnostics,
          isLoading: false,
          lastError: null,
          lastSyncedAt: snapshot.lastSyncedAt,
          paywallViews: snapshot.paywallViews,
        };
      },
    }
  )
);

export const useSubscriptionCustomer = () => useSubscriptionStore((state) => state.customer);
export const useSubscriptionOffers = () => useSubscriptionStore((state) => state.offerings);
export const useSubscriptionStatus = () => useSubscriptionStore((state) => state.customer.status);
export const useBillingProvider = () => useSubscriptionStore((state) => state.customer.billingProvider);
export const useBillingDiagnostics = () => useSubscriptionStore((state) => state.diagnostics);
export const useEntitlementHealth = () => {
  const customer = useSubscriptionCustomer();
  const offerings = useSubscriptionOffers();

  return useMemo(
    () => getEntitlementHealthSnapshot(customer, offerings),
    [customer, offerings]
  );
};
export const useHasActiveSubscription = () =>
  useSubscriptionStore((state) =>
    state.customer.status === 'trial' || state.customer.status === 'premium'
  );
