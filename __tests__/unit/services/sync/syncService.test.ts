import NetInfo from '@react-native-community/netinfo';
import { syncService } from '@/services/sync';
import { getItem, setItem } from '@/services/storage';
import { pushSettings, pullSettings } from '@/services/sync/settingsSync';
import { pushUserProfile, pullUserProfile } from '@/services/sync/userSync';
import { pushBreakHistory, pullBreakHistory, pushSingleBreak } from '@/services/sync/breakSync';

jest.mock('@/services/storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(true)),
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
