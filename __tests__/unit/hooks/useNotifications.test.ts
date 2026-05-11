import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import { useNotifications } from '@/hooks/useNotifications';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getNotificationSettings,
  initializeNotifications,
  requestNotificationPermissions,
  saveNotificationSettings,
  scheduleAllNotifications,
} from '@/services/notifications';
import { registerForPushNotifications } from '@/services/firebase/messaging';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('@/services/firebase/auth', () => ({
  getCurrentUserId: jest.fn(() => 'user-123'),
}));

jest.mock('@/services/firebase/messaging', () => ({
  registerForPushNotifications: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/notifications', () => ({
  DEFAULT_NOTIFICATION_SETTINGS: {
    enabled: true,
    breakReminders: true,
    reminderIntervalMinutes: 25,
    streakAlerts: true,
    goalNotifications: true,
    soundEnabled: true,
    quietHoursEnabled: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    workDaysOnly: true,
    workDays: [1, 2, 3, 4, 5],
  },
  initializeNotifications: jest.fn().mockResolvedValue(undefined),
  requestNotificationPermissions: jest.fn().mockResolvedValue(true),
  getNotificationSettings: jest.fn().mockResolvedValue({
    enabled: true,
    breakReminders: true,
    reminderIntervalMinutes: 25,
    streakAlerts: true,
    goalNotifications: true,
    soundEnabled: true,
    quietHoursEnabled: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    workDaysOnly: true,
    workDays: [1, 2, 3, 4, 5],
  }),
  saveNotificationSettings: jest.fn().mockResolvedValue(undefined),
  scheduleAllNotifications: jest.fn().mockResolvedValue(undefined),
  scheduleBreakReminder: jest.fn().mockResolvedValue(null),
  addNotificationResponseListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

describe('useNotifications hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({
      remove: jest.fn(),
    } as any);
    (getNotificationSettings as jest.Mock).mockResolvedValue(DEFAULT_NOTIFICATION_SETTINGS);
    (initializeNotifications as jest.Mock).mockResolvedValue(undefined);
    (requestNotificationPermissions as jest.Mock).mockResolvedValue(true);
    (saveNotificationSettings as jest.Mock).mockResolvedValue(undefined);
    (scheduleAllNotifications as jest.Mock).mockResolvedValue(undefined);
    (registerForPushNotifications as jest.Mock).mockResolvedValue(undefined);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (addNotificationResponseListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
    (addNotificationReceivedListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('falls back safely when initialization and permission checks fail', async () => {
    (getNotificationSettings as jest.Mock).mockRejectedValueOnce(new Error('settings read failed'));
    (initializeNotifications as jest.Mock).mockRejectedValueOnce(new Error('channel init failed'));
    (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
      new Error('permission check failed')
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
    expect(result.current.hasPermission).toBe(false);
  });

  it('returns false when the permission request throws', async () => {
    (requestNotificationPermissions as jest.Mock).mockRejectedValueOnce(
      new Error('request failed')
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let granted = true;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(granted).toBe(false);
    expect(registerForPushNotifications).not.toHaveBeenCalled();
    expect(scheduleAllNotifications).not.toHaveBeenCalled();
  });

  it('keeps the permission flow alive when push registration fails', async () => {
    (registerForPushNotifications as jest.Mock).mockRejectedValueOnce(
      new Error('push registration failed')
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let granted = false;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(granted).toBe(true);
    expect(registerForPushNotifications).toHaveBeenCalledWith('user-123');
    expect(scheduleAllNotifications).toHaveBeenCalled();
  });

  it('reverts optimistic local state when saving settings fails', async () => {
    (saveNotificationSettings as jest.Mock).mockRejectedValueOnce(
      new Error('persist failed')
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings.breakReminders).toBe(true);

    await act(async () => {
      await result.current.toggleBreakReminders();
    });

    await waitFor(() => {
      expect(result.current.settings.breakReminders).toBe(true);
    });
  });
});
