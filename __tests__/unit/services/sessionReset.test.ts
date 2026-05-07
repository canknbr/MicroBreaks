import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useNotificationStore,
  useOnboardingStore,
  useSettingsStore,
  useSubscriptionStore,
  useTimerStore,
  useUserStore,
} from '@/store';
import { replaceWithFreshAnonymousSession } from '@/services/account/sessionReset';
import {
  deleteAuthAccount,
  refreshAnonymousSession,
  signOut,
} from '@/services/firebase/auth';
import { deleteAllUserData } from '@/services/firebase/firestore';
import { unregisterPushNotifications } from '@/services/firebase/messaging';
import { cancelAllNotifications } from '@/services/notifications';
import { syncService } from '@/services/sync';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/services/firebase/auth', () => ({
  getCurrentUserId: jest.fn(() => 'user-1'),
  signOut: jest.fn(() => Promise.resolve()),
  refreshAnonymousSession: jest.fn(() => Promise.resolve({ uid: 'fresh-user' })),
  deleteAuthAccount: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/services/firebase/firestore', () => ({
  deleteAllUserData: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/services/firebase/messaging', () => ({
  unregisterPushNotifications: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/services/notifications', () => ({
  cancelAllNotifications: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/services/sync', () => ({
  syncService: {
    shutdown: jest.fn(),
  },
}));

describe('replaceWithFreshAnonymousSession', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();

    useOnboardingStore.setState({
      isComplete: true,
      currentStep: 7,
      totalSteps: 7,
      data: {
        workRole: 'engineer',
        screenTime: 8,
        painAreas: ['neck'],
        workPattern: 'meetings',
        energyPattern: 'afternoon',
        breakStyle: ['guided'],
        breakInterval: 30,
        notificationsEnabled: true,
        calendarIntegration: true,
      },
    });

    useUserStore.setState({
      profile: {
        name: 'Can',
        avatar: '🙂',
        email: 'can@example.com',
        joinedAt: '2026-01-01T00:00:00.000Z',
      },
      progress: {
        level: 4,
        totalXP: 420,
        totalBreaks: 99,
        currentStreak: 7,
        longestStreak: 12,
        weeklyGoal: 42,
        dailyGoal: 6,
      },
      preferences: {
        favoriteBreaks: ['neck-reset'],
        recentBreaks: ['eye-rescue'],
      },
      achievements: {
        unlockedIds: ['starter'],
        unlockedAt: { starter: '2026-02-01T00:00:00.000Z' },
        categoryBreaks: { mobility: 10 },
        totalMinutes: 120,
      },
      isAuthenticated: true,
    });

    useSettingsStore.setState((state) => ({
      settings: {
        ...state.settings,
        notificationsEnabled: false,
        soundEnabled: false,
        reminderIntervalMinutes: 45,
      },
      settingsUpdatedAt: Date.now(),
    }));

    useNotificationStore.setState({
      notifications: [
        {
          id: 'n1',
          type: 'tip',
          title: 'Tip',
          message: 'Move more',
          icon: 'lightbulb',
          color: '#fff',
          createdAt: new Date().toISOString(),
          read: false,
        },
      ],
    });

    useTimerStore.setState((state) => ({
      session: {
        ...state.session,
        isActive: true,
        remainingSeconds: 123,
      },
      stats: {
        ...state.stats,
        totalFocusMinutes: 50,
      },
      preferences: {
        ...state.preferences,
        soundEnabled: false,
      },
    }));

    useSubscriptionStore.setState((state) => ({
      ...state,
      customer: {
        ...state.customer,
        appUserId: 'user-1',
        status: 'premium',
        entitlementId: 'pro',
      },
    }));

    await AsyncStorage.multiSet([
      ['@microbreaks/break_history', JSON.stringify([{ id: 'b1' }])],
      ['microbreaks-user', JSON.stringify({ state: { profile: { name: 'Can' } } })],
      ['@microbreaks/sync_metadata/user-1', JSON.stringify({ lastSyncedAt: 1 })],
      ['@microbreaks/sync_pending_queue/user-1', JSON.stringify([{ type: 'break' }])],
      ['random-key', JSON.stringify({ keep: true })],
    ]);
  });

  it('clears local app data and starts a fresh anonymous session on sign out', async () => {
    await replaceWithFreshAnonymousSession();

    expect(syncService.shutdown).toHaveBeenCalledTimes(1);
    expect(cancelAllNotifications).toHaveBeenCalledTimes(1);
    expect(unregisterPushNotifications).toHaveBeenCalledWith('user-1');
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(deleteAuthAccount).not.toHaveBeenCalled();
    expect(deleteAllUserData).not.toHaveBeenCalled();
    expect(refreshAnonymousSession).toHaveBeenCalledTimes(1);

    expect(await AsyncStorage.getItem('@microbreaks/break_history')).toBeNull();
    expect(await AsyncStorage.getItem('microbreaks-user')).toBeNull();
    expect(await AsyncStorage.getItem('@microbreaks/sync_metadata/user-1')).toBeNull();
    expect(await AsyncStorage.getItem('@microbreaks/sync_pending_queue/user-1')).toBeNull();
    expect(await AsyncStorage.getItem('random-key')).toBe(JSON.stringify({ keep: true }));

    expect(useOnboardingStore.getState().isComplete).toBe(false);
    expect(useUserStore.getState().profile.name).toBe('User');
    expect(useNotificationStore.getState().notifications).toEqual([]);
    expect(useTimerStore.getState().session.isActive).toBe(false);
    expect(useSubscriptionStore.getState().customer.status).toBe('free');
  });

  it('deletes remote data before rotating into a fresh anonymous session', async () => {
    await replaceWithFreshAnonymousSession({ deleteRemoteUserData: true });

    expect(deleteAllUserData).toHaveBeenCalledWith('user-1');
    expect(deleteAuthAccount).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
    expect(unregisterPushNotifications).not.toHaveBeenCalled();
    expect(refreshAnonymousSession).toHaveBeenCalledTimes(1);

    expect(
      (deleteAllUserData as jest.Mock).mock.invocationCallOrder[0]
    ).toBeLessThan((deleteAuthAccount as jest.Mock).mock.invocationCallOrder[0]);
  });
});
