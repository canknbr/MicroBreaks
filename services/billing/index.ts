import {
  DEFAULT_BILLING_PROVIDER,
  DEFAULT_SUBSCRIPTION_OFFERS,
  IS_REVENUECAT_CONFIGURED,
  MAIN_PAYWALL_ID,
  PRO_ENTITLEMENT_ID,
} from '@/constants/subscription';
import { analytics } from '@/services/analytics';
import {
  getEntitlementHealthSnapshot,
  useSubscriptionStore,
} from '@/store/subscriptionStore';
import type {
  BillingInitializeOptions,
  BillingOperation,
  BillingHealthStatus,
  PurchaseResult,
  PaywallPlacement,
  SubscriptionCustomerState,
  SubscriptionOffer,
} from './types';
import { resolveBillingAdapter } from './adapters';

class BillingService {
  private isInitialized = false;

  private isUserCancelledPurchase(error: unknown): boolean {
    if (typeof error !== 'object' || error == null) {
      return false;
    }

    const candidate = error as {
      userCancelled?: unknown;
      readableErrorCode?: unknown;
      readable_error_code?: unknown;
      code?: unknown;
    };

    if (candidate.userCancelled === true) {
      return true;
    }

    const readableErrorCode =
      typeof candidate.readableErrorCode === 'string'
        ? candidate.readableErrorCode
        : typeof candidate.readable_error_code === 'string'
          ? candidate.readable_error_code
          : null;

    if (readableErrorCode === 'PurchaseCancelledError') {
      return true;
    }

    return candidate.code === '1' || candidate.code === 1;
  }

  async initialize(options: BillingInitializeOptions): Promise<void> {
    const store = useSubscriptionStore.getState();
    const previousCustomer = store.customer;
    const previousAppUserId = previousCustomer.appUserId;
    const shouldClearPreviewAccess =
      DEFAULT_BILLING_PROVIDER !== 'preview' && previousCustomer.isPreview;

    if (previousAppUserId && previousAppUserId !== options.appUserId) {
      store.resetSubscription();
    }

    const nextState = useSubscriptionStore.getState();
    nextState.startBillingOperation('initialize');

    try {
      if (shouldClearPreviewAccess) {
        nextState.setCustomerState({
          status: 'free',
          entitlementId: null,
          activeOfferId: null,
          purchasedAt: null,
          expiresAt: null,
          trialEndsAt: null,
          isPreview: false,
        });
      }

      nextState.setBillingProvider(DEFAULT_BILLING_PROVIDER);
      nextState.setAppUserId(options.appUserId);
      nextState.setOfferings(DEFAULT_SUBSCRIPTION_OFFERS);

      const initAdapter = resolveBillingAdapter(DEFAULT_BILLING_PROVIDER);
      if (initAdapter && IS_REVENUECAT_CONFIGURED) {
        const [offerings, customer] = await Promise.all([
          initAdapter.getOfferings(options.appUserId),
          initAdapter.getCustomerState(options.appUserId),
        ]);

        nextState.setOfferings(offerings);
        nextState.setCustomerState(customer);
      } else {
        nextState.expireIfNeeded();
      }

      const customer = useSubscriptionStore.getState().customer;
      this.trackCustomerStateTransitions(previousCustomer, customer);
      this.syncAnalyticsState(customer);
      this.isInitialized = true;
      this.finishOperation('initialize', customer, {
        succeeded: true,
        isInitialized: true,
      });
    } catch (error) {
      this.isInitialized = false;
      const customer = useSubscriptionStore.getState().customer;
      this.finishOperation('initialize', customer, {
        succeeded: false,
        isInitialized: false,
        healthStatus: this.getHealthStatus(customer),
        errorCode: 'initialize_failed',
        errorMessage: this.getErrorMessage(
          error,
          'Billing state could not be initialized for this app session.'
        ),
      });
      if (__DEV__) {
        console.error('[Billing] Initialize failed:', error);
      }
    }
  }

  async getOfferings(): Promise<SubscriptionOffer[]> {
    const state = useSubscriptionStore.getState();
    state.startBillingOperation('load_offers');

    try {
      const adapter = resolveBillingAdapter(state.customer.billingProvider);
      if (adapter && state.customer.appUserId) {
        const offerings = await adapter.getOfferings(state.customer.appUserId);
        state.setOfferings(offerings);
        const customer = useSubscriptionStore.getState().customer;
        this.finishOperation('load_offers', customer, {
          succeeded: true,
          isInitialized: this.isInitialized,
        });
        return offerings;
      }

      state.setOfferings(DEFAULT_SUBSCRIPTION_OFFERS);
      const customer = useSubscriptionStore.getState().customer;
      this.finishOperation('load_offers', customer, {
        succeeded: true,
        isInitialized: this.isInitialized,
      });
      return DEFAULT_SUBSCRIPTION_OFFERS;
    } catch (error) {
      const customer = useSubscriptionStore.getState().customer;
      this.finishOperation('load_offers', customer, {
        succeeded: false,
        isInitialized: this.isInitialized,
        healthStatus: this.getHealthStatus(customer),
        errorCode: 'offer_fetch_failed',
        errorMessage: this.getErrorMessage(
          error,
          'Could not load subscription offers.'
        ),
      });
      if (__DEV__) {
        console.warn('[Billing] Failed to load offers:', error);
      }
      return state.offerings;
    }
  }

  async refreshCustomerState(): Promise<SubscriptionCustomerState> {
    const state = useSubscriptionStore.getState();
    const previousCustomer = state.customer;
    state.startBillingOperation('refresh_customer');

    try {
      let customer: SubscriptionCustomerState;

      const adapter = resolveBillingAdapter(state.customer.billingProvider);
      if (adapter && state.customer.appUserId) {
        customer = await adapter.getCustomerState(state.customer.appUserId);
        state.setCustomerState(customer);
      } else {
        state.expireIfNeeded();
        customer = useSubscriptionStore.getState().customer;
      }

      this.trackCustomerStateTransitions(previousCustomer, customer);
      this.syncAnalyticsState(customer);
      this.finishOperation('refresh_customer', customer, {
        succeeded: true,
        isInitialized: this.isInitialized,
      });
      return customer;
    } catch (error) {
      const customer = useSubscriptionStore.getState().customer;
      this.finishOperation('refresh_customer', customer, {
        succeeded: false,
        isInitialized: this.isInitialized,
        healthStatus: this.getHealthStatus(customer),
        errorCode: 'refresh_failed',
        errorMessage: this.getErrorMessage(
          error,
          'Subscription state could not be refreshed.'
        ),
      });
      if (__DEV__) {
        console.error('[Billing] Refresh failed:', error);
      }
      return customer;
    }
  }

  async purchaseOffer(
    offerId: string,
    placement: PaywallPlacement
  ): Promise<PurchaseResult> {
    const state = useSubscriptionStore.getState();
    const billingProvider = state.customer.billingProvider;
    const adapter = resolveBillingAdapter(billingProvider);
    const offer = state.offerings.find((item) => item.id === offerId);
    state.startBillingOperation('purchase');

    if (!offer) {
      this.finishOperation('purchase', state.customer, {
        succeeded: false,
        isInitialized: this.isInitialized,
        healthStatus: this.getHealthStatus(state.customer),
        errorCode: 'offer_not_found',
        errorMessage: 'The selected plan is no longer available.',
      });
      return {
        success: false,
        code: 'offer_not_found',
        message: 'The selected plan is no longer available.',
        customer: state.customer,
      };
    }

    try {
      if (adapter && state.customer.appUserId) {
        const customer = await adapter.purchaseOffer(state.customer.appUserId, offer.id);
        state.setCustomerState(customer);
        this.syncAnalyticsState(customer);

        if (customer.status === 'trial') {
          analytics.trackTrialStarted({
            paywallId: MAIN_PAYWALL_ID,
            placement,
            offerId: offer.id,
            offerType: 'subscription',
            billingPeriod: offer.billingPeriod,
            price: offer.price,
            currency: offer.currency,
            trialDays: offer.trialDays,
          });
        } else if (customer.status === 'premium' && customer.entitlementId) {
          analytics.trackPurchaseCompleted({
            paywallId: MAIN_PAYWALL_ID,
            placement,
            offerId: offer.id,
            offerType: 'subscription',
            billingPeriod: offer.billingPeriod,
            price: offer.price,
            currency: offer.currency,
            entitlementId: customer.entitlementId,
            purchasePlatform: 'revenuecat',
            checkoutSurface: 'app',
          });
        }

        this.finishOperation('purchase', customer, {
          succeeded: true,
          isInitialized: this.isInitialized,
        });

        return {
          success: true,
          code: 'success',
          message:
            customer.status === 'trial'
              ? 'Your trial has started successfully.'
              : 'Your Pro subscription is now active.',
          customer,
        };
      }

      if (billingProvider === 'preview') {
        if (offer.trialDays > 0) {
          analytics.trackTrialStarted({
            paywallId: MAIN_PAYWALL_ID,
            placement,
            offerId: offer.id,
            offerType: 'subscription',
            billingPeriod: offer.billingPeriod,
            price: offer.price,
            currency: offer.currency,
            trialDays: offer.trialDays,
          });
        } else {
          analytics.trackPurchaseCompleted({
            paywallId: MAIN_PAYWALL_ID,
            placement,
            offerId: offer.id,
            offerType: 'subscription',
            billingPeriod: offer.billingPeriod,
            price: offer.price,
            currency: offer.currency,
            entitlementId: PRO_ENTITLEMENT_ID,
            purchasePlatform: 'preview',
            checkoutSurface: 'app',
          });
        }

        state.activatePreviewAccess(offer);
        const customer = useSubscriptionStore.getState().customer;
        this.syncAnalyticsState(customer);
        this.finishOperation('purchase', customer, {
          succeeded: true,
          isInitialized: this.isInitialized,
        });

        return {
          success: true,
          code: 'success',
          message:
            offer.trialDays > 0
              ? 'Preview trial access has been enabled for this development build.'
              : 'Preview Pro access has been enabled for this development build.',
          customer,
        };
      }

      this.finishOperation('purchase', state.customer, {
        succeeded: false,
        isInitialized: this.isInitialized,
        healthStatus: 'offline',
        errorCode: 'billing_unavailable',
        errorMessage:
          'Purchases are not enabled in this build yet. The paywall flow is ready, but the billing provider is still offline.',
      });
      return {
        success: false,
        code: 'billing_unavailable',
        message:
          'Purchases are not enabled in this build yet. The paywall flow is ready, but the billing provider is still offline.',
        customer: state.customer,
      };
    } catch (error) {
      if (this.isUserCancelledPurchase(error)) {
        this.finishOperation('purchase', state.customer, {
          succeeded: false,
          isInitialized: this.isInitialized,
          healthStatus: this.getHealthStatus(state.customer),
          errorCode: 'purchase_cancelled',
          errorMessage: 'The purchase flow was cancelled before completion.',
        });
        return {
          success: false,
          code: 'cancelled',
          message: 'Purchase cancelled.',
          customer: state.customer,
        };
      }

      this.finishOperation('purchase', state.customer, {
        succeeded: false,
        isInitialized: this.isInitialized,
        healthStatus: this.getHealthStatus(state.customer),
        errorCode: 'unknown_error',
        errorMessage: this.getErrorMessage(
          error,
          'Something went wrong while preparing the purchase flow.'
        ),
      });
      if (__DEV__) {
        console.error('[Billing] Purchase failed:', error);
      }
      return {
        success: false,
        code: 'unknown_error',
        message: 'Something went wrong while preparing the purchase flow.',
        customer: state.customer,
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    const state = useSubscriptionStore.getState();
    state.startBillingOperation('restore');

    try {
      const adapter = resolveBillingAdapter(state.customer.billingProvider);
      if (adapter && state.customer.appUserId) {
        const customer = await adapter.restorePurchases(state.customer.appUserId);
        state.setCustomerState(customer);
        const hasAccess =
          customer.status === 'trial' || customer.status === 'premium';

        if (!hasAccess || !customer.entitlementId) {
          this.finishOperation('restore', customer, {
            succeeded: false,
            isInitialized: this.isInitialized,
            healthStatus: this.getHealthStatus(customer),
            errorCode: 'nothing_to_restore',
            errorMessage: 'No active purchase could be restored for this store account.',
          });
          return {
            success: false,
            code: 'nothing_to_restore',
            message: 'No active purchase could be restored for this store account.',
            customer,
          };
        }

        analytics.trackPurchaseRestored(customer.entitlementId, 'revenuecat');
        this.syncAnalyticsState(customer);
        this.finishOperation('restore', customer, {
          succeeded: true,
          isInitialized: this.isInitialized,
        });

        return {
          success: true,
          code: 'success',
          message: 'Purchases restored successfully.',
          customer,
        };
      }

      if (state.customer.billingProvider !== 'preview') {
        this.finishOperation('restore', state.customer, {
          succeeded: false,
          isInitialized: this.isInitialized,
          healthStatus: 'offline',
          errorCode: 'restore_not_available',
          errorMessage:
            'Restore purchases is not available until the billing provider is enabled.',
        });
        return {
          success: false,
          code: 'restore_not_available',
          message:
            'Restore purchases is not available until the billing provider is enabled.',
          customer: state.customer,
        };
      }

      const customer = await this.refreshCustomerState();
      const hasAccess =
        customer.status === 'trial' || customer.status === 'premium';

      if (!hasAccess || !customer.entitlementId) {
        this.finishOperation('restore', customer, {
          succeeded: false,
          isInitialized: this.isInitialized,
          healthStatus: this.getHealthStatus(customer),
          errorCode: 'nothing_to_restore',
          errorMessage: 'No active preview purchase could be restored on this device.',
        });
        return {
          success: false,
          code: 'nothing_to_restore',
          message: 'No active preview purchase could be restored on this device.',
          customer,
        };
      }

      analytics.trackPurchaseRestored(customer.entitlementId, 'preview');
      this.finishOperation('restore', customer, {
        succeeded: true,
        isInitialized: this.isInitialized,
      });

      return {
        success: true,
        code: 'success',
        message: 'Preview purchase restored successfully.',
        customer,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('[Billing] Restore failed:', error);
      }
      this.finishOperation('restore', state.customer, {
        succeeded: false,
        isInitialized: this.isInitialized,
        healthStatus: this.getHealthStatus(state.customer),
        errorCode: 'unknown_error',
        errorMessage: this.getErrorMessage(
          error,
          'Something went wrong while restoring purchases.'
        ),
      });
      return {
        success: false,
        code: 'unknown_error',
        message: 'Something went wrong while restoring purchases.',
        customer: state.customer,
      };
    }
  }

  private finishOperation(
    operation: BillingOperation,
    customer: SubscriptionCustomerState,
    options: {
      succeeded: boolean;
      isInitialized: boolean;
      healthStatus?: BillingHealthStatus;
      errorCode?: string | null;
      errorMessage?: string | null;
    }
  ): void {
    const store = useSubscriptionStore.getState();
    const entitlementHealth = getEntitlementHealthSnapshot(customer, store.offerings);
    const derivedHealthStatus =
      options.healthStatus ?? this.getHealthStatus(customer, entitlementHealth.status);
    const derivedErrorCode =
      options.errorCode ??
      (entitlementHealth.status === 'healthy' ? null : 'entitlement_inconsistent');
    const derivedErrorMessage =
      options.errorMessage ??
      (entitlementHealth.status === 'healthy' ? null : entitlementHealth.summary);

    store.finishBillingOperation({
      operation,
      healthStatus: derivedHealthStatus,
      errorCode: derivedErrorCode,
      errorMessage: derivedErrorMessage,
      isInitialized: options.isInitialized,
      isConfigured: customer.billingProvider !== 'none',
      succeeded: options.succeeded,
    });
  }

  private getHealthStatus(
    customer: SubscriptionCustomerState,
    entitlementStatus?: 'healthy' | 'warning' | 'invalid'
  ): BillingHealthStatus {
    if (customer.billingProvider === 'none') {
      return 'offline';
    }

    if ((entitlementStatus ?? 'healthy') !== 'healthy') {
      return 'degraded';
    }

    return 'healthy';
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }
    return fallback;
  }

  private syncAnalyticsState(customer: SubscriptionCustomerState): void {
    analytics.setUserProperties({
      subscription_status: customer.status,
      subscription_offer_id: customer.activeOfferId,
      subscription_entitlement: customer.entitlementId,
      billing_provider: customer.billingProvider,
      has_pro_access:
        customer.status === 'trial' || customer.status === 'premium',
      billing_preview_mode: customer.isPreview,
    });
  }

  private trackCustomerStateTransitions(
    previousCustomer: SubscriptionCustomerState,
    nextCustomer: SubscriptionCustomerState
  ): void {
    if (previousCustomer.status !== 'trial' || nextCustomer.status !== 'premium') {
      return;
    }

    if (!nextCustomer.entitlementId || !nextCustomer.activeOfferId) {
      return;
    }

    const offer = useSubscriptionStore
      .getState()
      .offerings.find((item) => item.id === nextCustomer.activeOfferId);

    if (!offer) {
      return;
    }

    analytics.trackTrialConverted({
      paywallId: MAIN_PAYWALL_ID,
      placement: 'lifecycle',
      offerId: offer.id,
      offerType: 'subscription',
      billingPeriod: offer.billingPeriod,
      price: offer.price,
      currency: offer.currency,
      entitlementId: nextCustomer.entitlementId,
      purchasePlatform: nextCustomer.billingProvider,
      checkoutSurface: 'app',
    });
  }

  get isReady(): boolean {
    return this.isInitialized;
  }
}

export const billingService = new BillingService();

export type {
  BillingDiagnostics,
  BillingHealthStatus,
  BillingOperation,
  BillingProvider,
  BillingPeriod,
  EntitlementHealth,
  PaywallPlacement,
  PurchaseResult,
  SubscriptionCustomerState,
  SubscriptionOffer,
  SubscriptionStatus,
} from './types';
