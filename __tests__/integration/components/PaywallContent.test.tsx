import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from '@testing-library/react-native';
import { render, screen } from '@/__tests__/utils/test-utils';
import { DEFAULT_SUBSCRIPTION_OFFERS } from '@/constants/subscription';
import PaywallContent from '@/components/subscription/PaywallContent';
import { billingService } from '@/services/billing';
import { useSubscriptionStore } from '@/store/subscriptionStore';

describe('PaywallContent', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();

    act(() => {
      useSubscriptionStore.getState().resetSubscription();
    });

    jest
      .spyOn(billingService, 'getOfferings')
      .mockResolvedValue(DEFAULT_SUBSCRIPTION_OFFERS);
    jest
      .spyOn(billingService, 'refreshCustomerState')
      .mockImplementation(async () => useSubscriptionStore.getState().customer);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders offline billing health safely', () => {
    act(() => {
      useSubscriptionStore.setState((state) => ({
        ...state,
        customer: {
          ...state.customer,
          billingProvider: 'none',
          isPreview: false,
        },
        diagnostics: {
          ...state.diagnostics,
          healthStatus: 'offline',
          isInitialized: false,
          isConfigured: false,
        },
        lastSyncedAt: null,
      }));
    });

    render(
      <PaywallContent
        placement="profile"
        onContinueFree={jest.fn()}
      />
    );

    expect(screen.getByText('Billing Health')).toBeTruthy();
    expect(screen.getByText('Provider: none')).toBeTruthy();
    expect(screen.getByText('Offline')).toBeTruthy();
    expect(
      screen.getByText('Billing has not completed initialization in this session yet.')
    ).toBeTruthy();
  });

  it('renders entitlement warnings when the stored access state is inconsistent', () => {
    act(() => {
      useSubscriptionStore.setState((state) => ({
        ...state,
        customer: {
          ...state.customer,
          status: 'free',
          entitlementId: 'pro',
          activeOfferId: 'pro_annual',
          billingProvider: 'preview',
          isPreview: true,
        },
        diagnostics: {
          ...state.diagnostics,
          healthStatus: 'degraded',
          isInitialized: true,
          isConfigured: true,
          lastErrorMessage: 'Subscription state needs review.',
        },
      }));
    });

    render(
      <PaywallContent
        placement="stats"
        onContinueFree={jest.fn()}
      />
    );

    expect(screen.getByText('Entitlement Check')).toBeTruthy();
    expect(
      screen.getByText('Inactive access still has an entitlement attached.')
    ).toBeTruthy();
    expect(
      screen.getByText('• Inactive access still has an active plan attached.')
    ).toBeTruthy();
    expect(
      screen.getByText('Last billing message: Subscription state needs review.')
    ).toBeTruthy();
  });

  it('renders active preview access with a ready health badge', () => {
    act(() => {
      useSubscriptionStore.setState((state) => ({
        ...state,
        customer: {
          ...state.customer,
          status: 'premium',
          entitlementId: 'pro',
          activeOfferId: 'pro_annual',
          billingProvider: 'preview',
          isPreview: true,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        diagnostics: {
          ...state.diagnostics,
          healthStatus: 'healthy',
          isInitialized: true,
          isConfigured: true,
          lastSuccessAt: Date.now(),
        },
        lastSyncedAt: Date.now(),
      }));
    });

    render(
      <PaywallContent
        placement="profile"
        onContinueFree={jest.fn()}
      />
    );

    expect(screen.getByText('Preview Annual Pro')).toBeTruthy();
    expect(screen.getByText('Ready')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.getByText(/Current access valid through/i)).toBeTruthy();
  });
});
