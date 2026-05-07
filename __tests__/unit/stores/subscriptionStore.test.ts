/**
 * Subscription Store Unit Tests
 * Focused on crash-safe billing state, entitlement health, and persisted hydration normalization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from '@testing-library/react-native';
import { DEFAULT_SUBSCRIPTION_OFFERS } from '@/constants/subscription';
import {
  getEntitlementHealthSnapshot,
  subscriptionStoreTestUtils,
  useSubscriptionStore,
} from '@/store/subscriptionStore';

describe('SubscriptionStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();

    act(() => {
      useSubscriptionStore.getState().resetSubscription();
    });
  });

  describe('Preview Access', () => {
    it('should activate preview trial access for the annual offer', () => {
      const annualOffer = DEFAULT_SUBSCRIPTION_OFFERS.find((offer) => offer.id === 'pro_annual');

      expect(annualOffer).toBeDefined();

      act(() => {
        useSubscriptionStore.getState().activatePreviewAccess(annualOffer!);
      });

      const { customer } = useSubscriptionStore.getState();
      expect(customer.status).toBe('trial');
      expect(customer.entitlementId).toBe('pro');
      expect(customer.activeOfferId).toBe('pro_annual');
      expect(customer.billingProvider).toBe('preview');
      expect(customer.isPreview).toBe(true);
      expect(customer.trialEndsAt).not.toBeNull();
      expect(customer.expiresAt).not.toBeNull();
    });

    it('should activate preview premium access for the monthly offer', () => {
      const monthlyOffer = DEFAULT_SUBSCRIPTION_OFFERS.find((offer) => offer.id === 'pro_monthly');

      expect(monthlyOffer).toBeDefined();

      act(() => {
        useSubscriptionStore.getState().activatePreviewAccess(monthlyOffer!);
      });

      const { customer } = useSubscriptionStore.getState();
      expect(customer.status).toBe('premium');
      expect(customer.activeOfferId).toBe('pro_monthly');
      expect(customer.trialEndsAt).toBeNull();
      expect(customer.expiresAt).not.toBeNull();
    });
  });

  describe('expireIfNeeded', () => {
    it('should convert an ended trial into premium when access is still active', () => {
      const now = Date.now();

      act(() => {
        useSubscriptionStore.getState().setCustomerState({
          status: 'trial',
          entitlementId: 'pro',
          activeOfferId: 'pro_annual',
          billingProvider: 'preview',
          isPreview: true,
          trialEndsAt: new Date(now - 60_000).toISOString(),
          expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
          purchasedAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        });
        useSubscriptionStore.getState().expireIfNeeded();
      });

      const { customer } = useSubscriptionStore.getState();
      expect(customer.status).toBe('premium');
      expect(customer.trialEndsAt).toBeNull();
      expect(customer.entitlementId).toBe('pro');
    });

    it('should mark access as expired and clear entitlement state after expiration', () => {
      const now = Date.now();

      act(() => {
        useSubscriptionStore.getState().setCustomerState({
          status: 'premium',
          entitlementId: 'pro',
          activeOfferId: 'pro_monthly',
          billingProvider: 'preview',
          isPreview: true,
          expiresAt: new Date(now - 60_000).toISOString(),
          purchasedAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        useSubscriptionStore.getState().expireIfNeeded();
      });

      const { customer } = useSubscriptionStore.getState();
      expect(customer.status).toBe('expired');
      expect(customer.entitlementId).toBeNull();
      expect(customer.activeOfferId).toBeNull();
      expect(customer.trialEndsAt).toBeNull();
    });
  });

  describe('Entitlement Health', () => {
    it('should flag active access without an entitlement id as invalid', () => {
      const customer = {
        ...useSubscriptionStore.getState().customer,
        status: 'premium' as const,
        entitlementId: null,
        activeOfferId: 'pro_monthly',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        billingProvider: 'preview' as const,
        isPreview: true,
      };

      const health = getEntitlementHealthSnapshot(customer, DEFAULT_SUBSCRIPTION_OFFERS);
      expect(health.status).toBe('invalid');
      expect(health.summary).toContain('entitlement');
    });

    it('should flag inactive access that still has a plan attached', () => {
      const customer = {
        ...useSubscriptionStore.getState().customer,
        status: 'free' as const,
        entitlementId: 'pro',
        activeOfferId: 'pro_annual',
      };

      const health = getEntitlementHealthSnapshot(customer, DEFAULT_SUBSCRIPTION_OFFERS);
      expect(health.status).toBe('invalid');
      expect(health.issues.some((issue) => issue.includes('Inactive access'))).toBe(true);
    });
  });

  describe('Persistence Safety', () => {
    it('should sanitize malformed persisted subscription state', () => {
      const snapshot = subscriptionStoreTestUtils.sanitizePersistedSubscriptionState({
        customer: {
          appUserId: 'user-123',
          status: 'free',
          entitlementId: 'pro',
          activeOfferId: 'pro_annual',
          purchasedAt: 'bad-date',
          expiresAt: 'bad-date',
          trialEndsAt: 'bad-date',
          isPreview: true,
          billingProvider: 'none',
        },
        offerings: [
          DEFAULT_SUBSCRIPTION_OFFERS[0],
          {
            id: null,
            title: 'Broken',
          },
        ],
        diagnostics: {
          healthStatus: 'healthy',
          isInitialized: true,
          isConfigured: true,
          activeOperation: 'purchase',
          lastOperation: 'purchase',
          lastOperationAt: 123,
          lastSuccessAt: 456,
          lastErrorCode: 'purchase_failed',
          lastErrorMessage: 'Purchase failed',
        },
        lastSyncedAt: 789,
        paywallViews: {
          profile: 3,
          stats: 'bad-value',
          breaks: -1,
        },
      });

      expect(snapshot.customer.status).toBe('free');
      expect(snapshot.customer.entitlementId).toBeNull();
      expect(snapshot.customer.activeOfferId).toBeNull();
      expect(snapshot.customer.purchasedAt).toBeNull();
      expect(snapshot.customer.expiresAt).toBeNull();
      expect(snapshot.customer.trialEndsAt).toBeNull();
      expect(snapshot.customer.billingProvider).toBe('none');
      expect(snapshot.customer.isPreview).toBe(false);

      expect(snapshot.offerings).toHaveLength(1);
      expect(snapshot.offerings[0].id).toBe(DEFAULT_SUBSCRIPTION_OFFERS[0].id);

      expect(snapshot.diagnostics.healthStatus).toBe('offline');
      expect(snapshot.diagnostics.isInitialized).toBe(false);
      expect(snapshot.diagnostics.isConfigured).toBe(false);
      expect(snapshot.diagnostics.activeOperation).toBeNull();
      expect(snapshot.diagnostics.lastOperation).toBe('purchase');
      expect(snapshot.diagnostics.lastErrorCode).toBeNull();
      expect(snapshot.diagnostics.lastErrorMessage).toBeNull();

      expect(snapshot.lastSyncedAt).toBe(789);
      expect(snapshot.paywallViews).toEqual({ profile: 3 });
    });

    it('should strip volatile diagnostics when building a persisted snapshot', () => {
      act(() => {
        useSubscriptionStore.getState().setCustomerState({
          status: 'premium',
          entitlementId: 'pro',
          activeOfferId: 'pro_monthly',
          billingProvider: 'preview',
          isPreview: true,
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
        });
        useSubscriptionStore.getState().markPaywallSeen('profile');
        useSubscriptionStore.getState().setDiagnostics({
          healthStatus: 'degraded',
          isInitialized: true,
          isConfigured: true,
          activeOperation: 'purchase',
          lastOperation: 'purchase',
          lastOperationAt: 111,
          lastSuccessAt: 222,
          lastErrorCode: 'purchase_failed',
          lastErrorMessage: 'Purchase failed',
        });
        useSubscriptionStore.setState({ lastSyncedAt: 333 });
      });

      const snapshot = subscriptionStoreTestUtils.getPersistedSubscriptionSnapshot(
        useSubscriptionStore.getState()
      );

      expect(snapshot.customer.status).toBe('premium');
      expect(snapshot.diagnostics.healthStatus).toBe('degraded');
      expect(snapshot.diagnostics.isInitialized).toBe(false);
      expect(snapshot.diagnostics.isConfigured).toBe(true);
      expect(snapshot.diagnostics.activeOperation).toBeNull();
      expect(snapshot.diagnostics.lastOperation).toBe('purchase');
      expect(snapshot.diagnostics.lastErrorCode).toBeNull();
      expect(snapshot.diagnostics.lastErrorMessage).toBeNull();
      expect(snapshot.lastSyncedAt).toBe(333);
      expect(snapshot.paywallViews.profile).toBe(1);
    });
  });
});
