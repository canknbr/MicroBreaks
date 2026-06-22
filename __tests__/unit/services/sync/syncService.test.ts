import NetInfo from '@react-native-community/netinfo';
import { syncService } from '@/services/sync';
import { getItem, setItem } from '@/services/storage';
import { captureError } from '@/services/firebase/crashlytics-adapter';
import { pushSettings, pullSettings } from '@/services/sync/settingsSync';
import { pushUserProfile, pullUserProfile } from '@/services/sync/userSync';
import { pushBreakHistory, pullBreakHistory, pushSingleBreak } from '@/services/sync/breakSync';
import { notifyDataChange } from '@/store/syncBridge';

jest.mock('@/services/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@/services/firebase/crashlytics-adapter', () => ({
  captureError: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

jest.mock('@/services/firebase/firestore', () => ({
  getUserDoc: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ exists: false, data: () => null })),
  })),
}));

jest.mock('@/services/sync/settingsSync', () => ({
  pushSettings: jest.fn(() => Promise.resolve()),
  pullSettings: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/services/sync/userSync', () => ({
  pushUserProfile: jest.fn(() => Promise.resolve()),
  pullUserProfile: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/services/sync/breakSync', () => ({
  pushBreakHistory: jest.fn(() => Promise.resolve()),
  pullBreakHistory: jest.fn(() => Promise.resolve()),
  pushSingleBreak: jest.fn(() => Promise.resolve()),
}));

describe('syncService shutdown', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers();
    (NetInfo.fetch as jest.Mock).mockReset();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });

    await syncService.shutdown();
  });

  afterEach(async () => {
    await syncService.shutdown();
  });

  it('flushes a pending debounced settings change before shutdown when online', async () => {
    (NetInfo.fetch as jest.Mock)
      .mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      })
      .mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      });

    await syncService.initialize('user-1');

    syncService.queueSettingsChange();
    await syncService.shutdown();

    expect(pushSettings).toHaveBeenCalledTimes(1);
    expect(pushUserProfile).not.toHaveBeenCalled();
    expect(pushBreakHistory).not.toHaveBeenCalled();
    expect(pushSingleBreak).not.toHaveBeenCalled();
  });

  it('persists a pending debounced settings change to the user queue before shutdown when offline', async () => {
    (NetInfo.fetch as jest.Mock)
      .mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      })
      .mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      });

    await syncService.initialize('user-1');

    syncService.queueSettingsChange();
    await syncService.shutdown();

    expect(pushSettings).not.toHaveBeenCalled();
    expect(setItem).toHaveBeenCalledWith(
      '@microbreaks/sync_pending_queue/user-1',
      expect.arrayContaining([expect.objectContaining({ type: 'settings' })])
    );
  });

  it('flushes pending settings for the previous user before rotating to a new user', async () => {
    (NetInfo.fetch as jest.Mock)
      .mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      })
      .mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      })
      .mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      });

    await syncService.initialize('user-1');
    syncService.queueSettingsChange();

    await syncService.initialize('user-2');

    expect(pushSettings).toHaveBeenCalledTimes(1);
    expect(getItem).toHaveBeenCalledWith('@microbreaks/sync_pending_queue/user-2');
    expect(pullUserProfile).not.toHaveBeenCalled();
    expect(pullBreakHistory).not.toHaveBeenCalled();
    expect(pullSettings).not.toHaveBeenCalled();
  });

  it('coalesces rapid user-doc sync requests into a single push', async () => {
    jest.useFakeTimers();
    (NetInfo.fetch as jest.Mock)
      .mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      })
      .mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
      });

    await syncService.initialize('user-1');

    void syncService.queueDataChange('profile');
    void syncService.queueDataChange('progress');
    void syncService.queueDataChange('preferences');
    void syncService.queueDataChange('achievements');

    jest.advanceTimersByTime(250);
    await Promise.resolve();
    await Promise.resolve();

    expect(pushUserProfile).toHaveBeenCalledTimes(1);
    expect(pushSettings).not.toHaveBeenCalled();
    expect(pushSingleBreak).not.toHaveBeenCalled();
  });

  it('deduplicates queued user-doc changes into a single retry push', async () => {
    (NetInfo.fetch as jest.Mock)
      .mockResolvedValueOnce({
        isConnected: false,
        isInternetReachable: false,
      })
      .mockResolvedValueOnce({
        isConnected: true,
        isInternetReachable: true,
      });

    await syncService.initialize('user-1');
    (syncService as any).pendingQueue = [
      { type: 'profile' },
      { type: 'progress' },
      { type: 'preferences' },
    ];

    await (syncService as any).processPendingQueue();

    expect(pushUserProfile).toHaveBeenCalledTimes(1);
  });
});

describe('syncService foreground resync', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers();
    (NetInfo.fetch as jest.Mock).mockReset();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });
    await syncService.shutdown();
  });

  afterEach(async () => {
    await syncService.shutdown();
  });

  it('flushes pending offline changes on foreground, not just an incremental pull', async () => {
    // Initialize offline so initialize() does not run a full sync.
    await syncService.initialize('user-1');
    jest.clearAllMocks();

    // An edit was made while offline and is sitting in the pending queue.
    (syncService as any).pendingQueue = [{ type: 'settings' }];

    // App returns to foreground.
    (syncService as any).handleAppStateChange('active');
    // handleAppStateChange kicks off async work fire-and-forget — let it settle.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await Promise.resolve();

    // The queued offline change must be pushed (was previously stranded)...
    expect(pushSettings).toHaveBeenCalledTimes(1);
    // ...and an incremental pull still runs to reconcile remote state.
    expect(pullSettings).toHaveBeenCalled();
  });
});

describe('syncService failure reporting', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers();
    (NetInfo.fetch as jest.Mock).mockReset();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });

    await syncService.shutdown();
  });

  afterEach(async () => {
    await syncService.shutdown();
  });

  it('reports a full sync failure to Crashlytics so silent sync breakage is observable', async () => {
    // Online → initialize() kicks off a full sync. A failing pull must not
    // be swallowed into a dev-only console.error; it has to reach Crashlytics.
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
    const boom = new Error('firestore unavailable');
    (pullUserProfile as jest.Mock).mockRejectedValueOnce(boom);

    await syncService.initialize('user-1');

    expect(captureError).toHaveBeenCalledWith(
      boom,
      expect.objectContaining({ component: 'SyncService', action: 'performFullSync' })
    );
  });

  it('reports an incremental sync failure to Crashlytics', async () => {
    // Initialize offline (no full sync), then run an incremental sync whose
    // pull rejects.
    await syncService.initialize('user-1');

    const boom = new Error('network blip mid-pull');
    (pullBreakHistory as jest.Mock).mockRejectedValueOnce(boom);

    await syncService.performIncrementalSync();

    expect(captureError).toHaveBeenCalledWith(
      boom,
      expect.objectContaining({ component: 'SyncService', action: 'performIncrementalSync' })
    );
  });
});

describe('syncService ↔ store sync bridge wiring', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useRealTimers();
    (NetInfo.fetch as jest.Mock).mockReset();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });
    await syncService.shutdown();
  });

  afterEach(async () => {
    await syncService.shutdown();
  });

  it('registers sync handlers on initialize so store notifications route to the queue', async () => {
    await syncService.initialize('user-1');

    // A registered handler returns queueDataChange's promise; an unregistered
    // bridge returns undefined.
    expect(notifyDataChange('profile')).toBeInstanceOf(Promise);
  });

  it('clears sync handlers on shutdown so store notifications no longer route', async () => {
    await syncService.initialize('user-1');
    await syncService.shutdown();

    expect(notifyDataChange('profile')).toBeUndefined();
  });
});
