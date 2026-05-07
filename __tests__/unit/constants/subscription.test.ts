describe('subscription constants', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('keeps RevenueCat disabled on web even when native keys exist', () => {
    process.env.EXPO_PUBLIC_BILLING_PROVIDER = 'revenuecat';
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = 'ios-key';
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = 'android-key';

    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'web',
      },
    }));

    const subscription = require('@/constants/subscription');

    expect(subscription.REVENUECAT_API_KEY).toBe('');
    expect(subscription.IS_REVENUECAT_CONFIGURED).toBe(false);
    expect(subscription.DEFAULT_BILLING_PROVIDER).toBe('preview');
  });

  it('enables RevenueCat on iOS when the provider and platform key are configured', () => {
    process.env.EXPO_PUBLIC_BILLING_PROVIDER = 'revenuecat';
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = 'ios-key';
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY = 'android-key';

    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'ios',
      },
    }));

    const subscription = require('@/constants/subscription');

    expect(subscription.REVENUECAT_API_KEY).toBe('ios-key');
    expect(subscription.IS_REVENUECAT_CONFIGURED).toBe(true);
    expect(subscription.DEFAULT_BILLING_PROVIDER).toBe('revenuecat');
  });

  it('falls back to preview in development when no provider env is set', () => {
    delete process.env.EXPO_PUBLIC_BILLING_PROVIDER;
    delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
    delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'android',
      },
    }));

    const subscription = require('@/constants/subscription');

    expect(subscription.DEFAULT_BILLING_PROVIDER).toBe('preview');
    expect(subscription.IS_REVENUECAT_CONFIGURED).toBe(false);
  });
});
