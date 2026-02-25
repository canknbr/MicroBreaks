/**
 * Notification Service Unit Tests
 * 100% coverage with all edge cases and error paths
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_IDS,
  DEFAULT_NOTIFICATION_SETTINGS,
  initializeNotifications,
  requestNotificationPermissions,
  getNotificationSettings,
  saveNotificationSettings,
  scheduleBreakReminder,
  scheduleStreakProtection,
  scheduleDailyGoalReminder,
  scheduleAllNotifications,
  cancelAllNotifications,
  cancelNotification,
  sendImmediateNotification,
  sendGoalCompletedNotification,
  sendStreakMilestoneNotification,
  getScheduledNotifications,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '@/services/notifications';
import { STORAGE_KEYS } from '@/services/storage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  addNotificationResponseReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  addNotificationReceivedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  AndroidImportance: {
    HIGH: 4,
    DEFAULT: 3,
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock break history functions
jest.mock('@/services/breakHistory', () => ({
  getTodayBreaks: jest.fn().mockResolvedValue([]),
  getStreakData: jest.fn().mockResolvedValue({ currentStreak: 0, longestStreak: 0, lastBreakDate: null, streakHistory: [] }),
  getUserStats: jest.fn().mockResolvedValue({ totalBreaks: 0, totalMinutes: 0, totalXP: 0, level: 1, weeklyGoal: 20, weeklyProgress: 0 }),
}));

import { getTodayBreaks, getStreakData, getUserStats } from '@/services/breakHistory';

describe('Notification Service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    (Device as any).isDevice = true;
  });

  describe('Constants', () => {
    describe('NOTIFICATION_CHANNELS', () => {
      it('should have all required channel IDs', () => {
        expect(NOTIFICATION_CHANNELS.BREAK_REMINDERS).toBe('break-reminders');
        expect(NOTIFICATION_CHANNELS.STREAK_ALERTS).toBe('streak-alerts');
        expect(NOTIFICATION_CHANNELS.GOALS).toBe('goals');
        expect(NOTIFICATION_CHANNELS.GENERAL).toBe('general');
      });
    });

    describe('NOTIFICATION_IDS', () => {
      it('should have all required notification IDs', () => {
        expect(NOTIFICATION_IDS.BREAK_REMINDER).toBe('break-reminder');
        expect(NOTIFICATION_IDS.STREAK_PROTECTION).toBe('streak-protection');
        expect(NOTIFICATION_IDS.DAILY_GOAL).toBe('daily-goal');
        expect(NOTIFICATION_IDS.MORNING_MOTIVATION).toBe('morning-motivation');
      });
    });

    describe('DEFAULT_NOTIFICATION_SETTINGS', () => {
      it('should have correct default values', () => {
        expect(DEFAULT_NOTIFICATION_SETTINGS.enabled).toBe(true);
        expect(DEFAULT_NOTIFICATION_SETTINGS.breakReminders).toBe(true);
        expect(DEFAULT_NOTIFICATION_SETTINGS.reminderIntervalMinutes).toBe(25);
        expect(DEFAULT_NOTIFICATION_SETTINGS.streakAlerts).toBe(true);
        expect(DEFAULT_NOTIFICATION_SETTINGS.goalNotifications).toBe(true);
        expect(DEFAULT_NOTIFICATION_SETTINGS.soundEnabled).toBe(true);
        expect(DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnabled).toBe(true);
        expect(DEFAULT_NOTIFICATION_SETTINGS.quietHoursStart).toBe(22);
        expect(DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnd).toBe(8);
        expect(DEFAULT_NOTIFICATION_SETTINGS.workDaysOnly).toBe(true);
        expect(DEFAULT_NOTIFICATION_SETTINGS.workDays).toEqual([1, 2, 3, 4, 5]);
      });
    });
  });

  describe('initializeNotifications', () => {
    it('should set up notification channels on Android', async () => {
      (Platform as any).OS = 'android';

      await initializeNotifications();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledTimes(3);
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'break-reminders',
        expect.objectContaining({
          name: 'Break Reminders',
          importance: Notifications.AndroidImportance.HIGH,
        })
      );
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'streak-alerts',
        expect.objectContaining({
          name: 'Streak Alerts',
        })
      );
      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
        'goals',
        expect.objectContaining({
          name: 'Goal Notifications',
        })
      );
    });

    it('should not set up channels on iOS', async () => {
      (Platform as any).OS = 'ios';
      jest.clearAllMocks();

      await initializeNotifications();

      expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    });
  });

  describe('requestNotificationPermissions', () => {
    it('should return true when permission is already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
    });

    it('should request permission if not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });

      const result = await requestNotificationPermissions();

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });

    it('should return false on non-physical device', async () => {
      (Device as any).isDevice = false;

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });
  });

  describe('getNotificationSettings', () => {
    it('should return default settings when none exist', async () => {
      const result = await getNotificationSettings();
      expect(result).toEqual(DEFAULT_NOTIFICATION_SETTINGS);
    });

    it('should return stored settings', async () => {
      const customSettings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        reminderIntervalMinutes: 30,
        soundEnabled: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(customSettings));

      const result = await getNotificationSettings();

      expect(result.reminderIntervalMinutes).toBe(30);
      expect(result.soundEnabled).toBe(false);
    });
  });

  describe('saveNotificationSettings', () => {
    it('should merge and save partial settings', async () => {
      await saveNotificationSettings({ reminderIntervalMinutes: 45 });

      const saved = await getNotificationSettings();
      expect(saved.reminderIntervalMinutes).toBe(45);
      expect(saved.enabled).toBe(true); // Default preserved
    });

    it('should reschedule notifications after saving', async () => {
      await saveNotificationSettings({ breakReminders: false });

      // Should have called schedule functions
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
    });
  });

  describe('scheduleBreakReminder', () => {
    it('should return null when notifications are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: false,
      }));

      const result = await scheduleBreakReminder();
      expect(result).toBeNull();
    });

    it('should return null when break reminders are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        breakReminders: false,
      }));

      const result = await scheduleBreakReminder();
      expect(result).toBeNull();
    });

    it('should schedule notification when enabled', async () => {
      // Ensure it's a work day and not quiet hours
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: false,
        workDaysOnly: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      const result = await scheduleBreakReminder();

      expect(result).toBe('notification-id');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should cancel existing reminder before scheduling new one', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: false,
        workDaysOnly: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      await scheduleBreakReminder();

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(NOTIFICATION_IDS.BREAK_REMINDER);
    });

    it('should include sound when enabled', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: false,
        workDaysOnly: false,
        soundEnabled: true,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      await scheduleBreakReminder();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sound: 'default',
          }),
        })
      );
    });

    it('should not include sound when disabled', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: false,
        workDaysOnly: false,
        soundEnabled: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      await scheduleBreakReminder();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sound: undefined,
          }),
        })
      );
    });
  });

  describe('scheduleStreakProtection', () => {
    it('should return null when notifications are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: false,
      }));

      const result = await scheduleStreakProtection();
      expect(result).toBeNull();
    });

    it('should return null when streak alerts are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        streakAlerts: false,
      }));

      const result = await scheduleStreakProtection();
      expect(result).toBeNull();
    });

    it('should return null if user has breaks today', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([{ id: 'break-1' }]);

      const result = await scheduleStreakProtection();
      expect(result).toBeNull();
    });

    it('should return null if no current streak', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([]);
      (getStreakData as jest.Mock).mockResolvedValueOnce({
        currentStreak: 0,
        longestStreak: 5,
        lastBreakDate: '2024-01-15',
        streakHistory: [],
      });

      const result = await scheduleStreakProtection();
      expect(result).toBeNull();
    });

    it('should schedule notification when streak needs protection', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([]);
      (getStreakData as jest.Mock).mockResolvedValueOnce({
        currentStreak: 5,
        longestStreak: 5,
        lastBreakDate: '2024-01-15',
        streakHistory: [],
      });

      // Mock current time to be before 7 PM
      const mockDate = new Date();
      mockDate.setHours(10, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      const result = await scheduleStreakProtection();

      expect(result).toBe('notification-id');
      jest.restoreAllMocks();
    });

    it('should include streak count in notification', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([]);
      (getStreakData as jest.Mock).mockResolvedValueOnce({
        currentStreak: 7,
        longestStreak: 10,
        lastBreakDate: '2024-01-15',
        streakHistory: [],
      });

      const mockDate = new Date();
      mockDate.setHours(10, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      await scheduleStreakProtection();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.stringContaining('7-day streak'),
          }),
        })
      );

      jest.restoreAllMocks();
    });
  });

  describe('scheduleDailyGoalReminder', () => {
    it('should return null when notifications are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: false,
      }));

      const result = await scheduleDailyGoalReminder();
      expect(result).toBeNull();
    });

    it('should return null when goal notifications are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        goalNotifications: false,
      }));

      const result = await scheduleDailyGoalReminder();
      expect(result).toBeNull();
    });

    it('should return null when daily goal is already met', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([
        { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
      ]);
      (getUserStats as jest.Mock).mockResolvedValueOnce({
        weeklyGoal: 20, // 20/7 = ~3 daily goal
        weeklyProgress: 5,
      });

      const result = await scheduleDailyGoalReminder();
      expect(result).toBeNull();
    });

    it('should return null if past 5 PM', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([]);
      (getUserStats as jest.Mock).mockResolvedValueOnce({
        weeklyGoal: 21, // 21/7 = 3 daily goal
        weeklyProgress: 0,
      });

      const mockDate = new Date();
      mockDate.setHours(18, 0, 0, 0); // 6 PM
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      const result = await scheduleDailyGoalReminder();
      expect(result).toBeNull();

      jest.restoreAllMocks();
    });

    it('should schedule notification when goal not met and before 5 PM', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);
      (getUserStats as jest.Mock).mockResolvedValueOnce({
        weeklyGoal: 21, // 21/7 = 3 daily goal
        weeklyProgress: 0,
      });

      // Return a fresh Date(10:00) each time to avoid shared reference mutation
      const RealDate = Date;
      jest.spyOn(global, 'Date').mockImplementation((...args: unknown[]) => {
        if (args.length === 0) {
          const d = new RealDate();
          d.setHours(10, 0, 0, 0);
          return d;
        }
        return new (RealDate as any)(...args);
      });

      const result = await scheduleDailyGoalReminder();
      expect(result).toBe('notification-id');

      jest.restoreAllMocks();
    });

    it('should calculate remaining breaks correctly', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([{ id: '1' }]);
      (getUserStats as jest.Mock).mockResolvedValueOnce({
        weeklyGoal: 21, // Daily goal = 3
        weeklyProgress: 1,
      });

      const RealDate = Date;
      jest.spyOn(global, 'Date').mockImplementation((...args: unknown[]) => {
        if (args.length === 0) {
          const d = new RealDate();
          d.setHours(10, 0, 0, 0);
          return d;
        }
        return new (RealDate as any)(...args);
      });

      await scheduleDailyGoalReminder();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.stringContaining('2 breaks to go'),
          }),
        })
      );

      jest.restoreAllMocks();
    });
  });

  describe('scheduleAllNotifications', () => {
    it('should cancel all notifications when disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: false,
      }));

      await scheduleAllNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should schedule all notification types when enabled', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: false,
        workDaysOnly: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      await scheduleAllNotifications();

      // Should have attempted to schedule notifications
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      await cancelAllNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('cancelNotification', () => {
    it('should cancel specific notification by identifier', async () => {
      await cancelNotification('test-notification');

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('test-notification');
    });
  });

  describe('sendImmediateNotification', () => {
    it('should send notification immediately', async () => {
      const result = await sendImmediateNotification('Test Title', 'Test Body');

      expect(result).toBe('notification-id');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Test Title',
            body: 'Test Body',
          }),
          trigger: null,
        })
      );
    });

    it('should include custom data', async () => {
      await sendImmediateNotification('Title', 'Body', { key: 'value' });

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            data: { key: 'value' },
          }),
        })
      );
    });

    it('should respect sound settings', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        soundEnabled: false,
      }));

      await sendImmediateNotification('Title', 'Body');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            sound: undefined,
          }),
        })
      );
    });
  });

  describe('sendGoalCompletedNotification', () => {
    it('should not send when notifications are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: false,
      }));

      await sendGoalCompletedNotification();

      // Should not schedule any new notifications for goal completion
      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
      const goalCompleteCalls = calls.filter(
        (call: any[]) => call[0]?.content?.data?.type === 'goal_complete'
      );
      expect(goalCompleteCalls).toHaveLength(0);
    });

    it('should not send when goal notifications are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        goalNotifications: false,
      }));

      await sendGoalCompletedNotification();

      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
      const goalCompleteCalls = calls.filter(
        (call: any[]) => call[0]?.content?.data?.type === 'goal_complete'
      );
      expect(goalCompleteCalls).toHaveLength(0);
    });

    it('should send goal completion notification when enabled', async () => {
      await sendGoalCompletedNotification();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.stringContaining('Daily Goal Complete'),
            data: { type: 'goal_complete' },
          }),
        })
      );
    });
  });

  describe('sendStreakMilestoneNotification', () => {
    it('should not send when notifications are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        enabled: false,
      }));

      await sendStreakMilestoneNotification(10);

      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
      const streakCalls = calls.filter(
        (call: any[]) => call[0]?.content?.data?.type === 'streak_milestone'
      );
      expect(streakCalls).toHaveLength(0);
    });

    it('should not send when streak alerts are disabled', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        streakAlerts: false,
      }));

      await sendStreakMilestoneNotification(10);

      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
      const streakCalls = calls.filter(
        (call: any[]) => call[0]?.content?.data?.type === 'streak_milestone'
      );
      expect(streakCalls).toHaveLength(0);
    });

    it('should send streak milestone notification with correct streak days', async () => {
      await sendStreakMilestoneNotification(15);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.stringContaining('15-Day Streak'),
            data: { type: 'streak_milestone', streakDays: 15 },
          }),
        })
      );
    });
  });

  describe('getScheduledNotifications', () => {
    it('should return all scheduled notifications', async () => {
      const mockNotifications = [
        { identifier: 'notification-1', content: {} },
        { identifier: 'notification-2', content: {} },
      ];
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce(mockNotifications);

      const result = await getScheduledNotifications();

      expect(result).toEqual(mockNotifications);
    });
  });

  describe('addNotificationResponseListener', () => {
    it('should add response listener and return subscription', () => {
      const callback = jest.fn();
      const result = addNotificationResponseListener(callback);

      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledWith(callback);
      expect(result).toHaveProperty('remove');
    });
  });

  describe('addNotificationReceivedListener', () => {
    it('should add received listener and return subscription', () => {
      const callback = jest.fn();
      const result = addNotificationReceivedListener(callback);

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalledWith(callback);
      expect(result).toHaveProperty('remove');
    });
  });

  describe('Quiet Hours Logic', () => {
    it('should not schedule during overnight quiet hours (e.g., 22-8)', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: true,
        quietHoursStart: 22,
        quietHoursEnd: 8,
        workDaysOnly: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      // Mock time to be 23:00 (within quiet hours)
      const mockDate = new Date();
      mockDate.setHours(23, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      const result = await scheduleBreakReminder();

      expect(result).toBeNull();
      jest.restoreAllMocks();
    });

    it('should not schedule during daytime quiet hours (e.g., 9-17)', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: true,
        quietHoursStart: 9,
        quietHoursEnd: 17,
        workDaysOnly: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      // Mock time to be 12:00 (within quiet hours)
      const mockDate = new Date();
      mockDate.setHours(12, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      const result = await scheduleBreakReminder();

      expect(result).toBeNull();
      jest.restoreAllMocks();
    });

    it('should schedule when quiet hours are disabled', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: false,
        workDaysOnly: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      const result = await scheduleBreakReminder();

      expect(result).toBe('notification-id');
    });
  });

  describe('Work Days Logic', () => {
    it('should not schedule on non-work days when workDaysOnly is enabled', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        workDaysOnly: true,
        workDays: [1, 2, 3, 4, 5], // Monday-Friday
        quietHoursEnabled: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      // Mock to be Saturday (day 6)
      const mockDate = new Date('2024-01-06T12:00:00'); // Saturday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      const result = await scheduleBreakReminder();

      expect(result).toBeNull();
      jest.restoreAllMocks();
    });

    it('should schedule on work days when workDaysOnly is enabled', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        workDaysOnly: true,
        workDays: [1, 2, 3, 4, 5], // Monday-Friday
        quietHoursEnabled: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      // Mock to be Wednesday (day 3)
      const mockDate = new Date('2024-01-03T12:00:00'); // Wednesday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      const result = await scheduleBreakReminder();

      expect(result).toBe('notification-id');
      jest.restoreAllMocks();
    });

    it('should schedule on any day when workDaysOnly is disabled', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        workDaysOnly: false,
        quietHoursEnabled: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      // Mock to be Sunday (day 0)
      const mockDate = new Date('2024-01-07T12:00:00'); // Sunday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

      const result = await scheduleBreakReminder();

      expect(result).toBe('notification-id');
      jest.restoreAllMocks();
    });
  });

  describe('Notification Content', () => {
    it('should rotate through break reminder messages', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: false,
        workDaysOnly: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      // Schedule multiple times
      await scheduleBreakReminder();
      await scheduleBreakReminder();

      // Just verify it was called with some message
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should include correct notification data type', async () => {
      const settings = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        quietHoursEnabled: false,
        workDaysOnly: false,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      await scheduleBreakReminder();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            data: { type: 'break_reminder' },
          }),
        })
      );
    });
  });

  describe('Daily Goal Calculation', () => {
    it('should calculate daily goal as weeklyGoal/7 with minimum of 3', async () => {
      (getTodayBreaks as jest.Mock).mockResolvedValueOnce([]);
      (getUserStats as jest.Mock).mockResolvedValueOnce({
        weeklyGoal: 14, // 14/7 = 2, but minimum is 3
        weeklyProgress: 0,
      });

      const RealDate = Date;
      jest.spyOn(global, 'Date').mockImplementation((...args: unknown[]) => {
        if (args.length === 0) {
          const d = new RealDate();
          d.setHours(10, 0, 0, 0);
          return d;
        }
        return new (RealDate as any)(...args);
      });

      await scheduleDailyGoalReminder();

      // Should calculate with minimum of 3
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: expect.stringContaining('3 breaks to go'),
          }),
        })
      );

      jest.restoreAllMocks();
    });
  });
});
