import firebaseAnalytics from '@react-native-firebase/analytics';
import {
  AnalyticsEvent,
  AnalyticsService,
  analyticsTestUtils,
} from '@/services/analytics';
import { getItem, removeItem, setItem } from '@/services/storage';

jest.mock('@/services/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(true)),
  removeItem: jest.fn(() => Promise.resolve(true)),
}));

function createEnabledAnalyticsService(): AnalyticsService {
  const service = new AnalyticsService();
  (service as any).config = {
    enabled: true,
    debugMode: false,
    flushInterval: 30000,
    maxQueueSize: 100,
  };
  return service;
}

describe('AnalyticsService', () => {
  const services: AnalyticsService[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    services.length = 0;
  });

  afterEach(async () => {
    await Promise.all(services.map((service) => service.shutdown()));
  });

  it('persists queued events as they are tracked', async () => {
    const service = createEnabledAnalyticsService();
    services.push(service);

    service.track(AnalyticsEvent.PAYWALL_VIEWED, {
      paywall_id: 'main-paywall',
      paywall_placement: 'onboarding',
    });

    await Promise.resolve();

    expect(setItem).toHaveBeenCalledWith(
      analyticsTestUtils.ANALYTICS_QUEUE_STORAGE_KEY,
      expect.arrayContaining([
        expect.objectContaining({
          event: AnalyticsEvent.PAYWALL_VIEWED,
          properties: expect.objectContaining({
            paywall_id: 'main-paywall',
            paywall_placement: 'onboarding',
          }),
        }),
      ])
    );
  });

  it('keeps events durable until a successful flush clears the queue', async () => {
    const service = createEnabledAnalyticsService();
    services.push(service);

    service.track(AnalyticsEvent.PURCHASE_COMPLETED, {
      offer_id: 'pro_annual',
      entitlement_id: 'pro',
      purchase_platform: 'ios',
    });

    await Promise.resolve();
    expect(setItem).toHaveBeenCalledTimes(1);

    await service.flush();

    expect(firebaseAnalytics().logEvent).toHaveBeenCalledWith(
      AnalyticsEvent.PURCHASE_COMPLETED,
      expect.objectContaining({
        offer_id: 'pro_annual',
        entitlement_id: 'pro',
        purchase_platform: 'ios',
      })
    );
    expect(removeItem).toHaveBeenCalledWith(analyticsTestUtils.ANALYTICS_QUEUE_STORAGE_KEY);
  });

  it('restores persisted events on initialize and keeps them queued if flush fails', async () => {
    (getItem as jest.Mock).mockResolvedValueOnce([
      {
        event: AnalyticsEvent.PAYWALL_VIEWED,
        properties: {
          paywall_id: 'restored-paywall',
        },
      },
      {
        event: null,
        properties: 'broken',
      },
    ]);
    (firebaseAnalytics().logEvent as jest.Mock).mockRejectedValueOnce(new Error('network down'));

    const service = createEnabledAnalyticsService();
    services.push(service);
    await service.initialize();
    await service.flush();

    expect(firebaseAnalytics().logEvent).toHaveBeenCalledWith(
      AnalyticsEvent.PAYWALL_VIEWED,
      expect.objectContaining({
        paywall_id: 'restored-paywall',
      })
    );
    expect(setItem).toHaveBeenCalledWith(
      analyticsTestUtils.ANALYTICS_QUEUE_STORAGE_KEY,
      expect.arrayContaining([
        expect.objectContaining({
          event: AnalyticsEvent.PAYWALL_VIEWED,
        }),
        expect.objectContaining({
          event: AnalyticsEvent.APP_OPENED,
        }),
      ])
    );
  });
});
