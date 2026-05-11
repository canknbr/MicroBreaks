/**
 * Notifications Hook
 * Manages notification state, permissions, and settings
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  initializeNotifications,
  requestNotificationPermissions,
  getNotificationSettings,
  saveNotificationSettings,
  scheduleAllNotifications,
  scheduleBreakReminder,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '@/services/notifications';
import * as Notifications from 'expo-notifications';
import { getCurrentUserId } from '@/services/firebase/auth';
import { registerForPushNotifications } from '@/services/firebase/messaging';

interface UseNotificationsReturn {
  // State
  settings: NotificationSettings;
  isLoading: boolean;
  hasPermission: boolean | null;

  // Actions
  requestPermission: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleBreakReminders: () => Promise<void>;
  toggleStreakAlerts: () => Promise<void>;
  toggleGoalNotifications: () => Promise<void>;
  setReminderInterval: (minutes: number) => Promise<void>;
  toggleQuietHours: () => Promise<void>;
  setQuietHours: (start: number, end: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const appState = useRef(AppState.currentState);

  const logNonFatalNotificationError = useCallback((message: string, error: unknown) => {
    if (__DEV__) {
      console.warn(message, error);
    }
  }, []);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to foreground, reschedule break reminder
      // Using void to explicitly handle the promise without await in event handler
      void scheduleBreakReminder().catch((error) => {
        if (__DEV__) {
          console.warn('Failed to reschedule break reminder:', error);
        }
      });
    }
    appState.current = nextAppState;
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedSettings = await getNotificationSettings();
      setSettings(savedSettings);
    } catch (error) {
      setSettings(DEFAULT_NOTIFICATION_SETTINGS);
      logNonFatalNotificationError('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [logNonFatalNotificationError]);

  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      setHasPermission(false);
      logNonFatalNotificationError('Failed to check notification permissions:', error);
    }
  }, [logNonFatalNotificationError]);

  // Load settings on mount
  useEffect(() => {
    void loadSettings();
    void initializeNotifications().catch((error) => {
      logNonFatalNotificationError('Failed to initialize notifications:', error);
    });
    void checkPermission();

    // Set up notification response listener
    const responseSubscription = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;

      // Navigate based on notification type
      if (data?.type === 'break_reminder') {
        router.push('/breaks');
      } else if (data?.type === 'streak_protection') {
        router.push('/breaks');
      } else if (data?.type === 'daily_goal') {
        router.push('/stats');
      }
    });

    // Set up foreground notification listener
    const receivedSubscription = addNotificationReceivedListener((_notification) => {
      // Notification received in foreground - handled silently
    });

    // Handle app state changes to reschedule notifications
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
      subscription.remove();
    };
  }, [checkPermission, handleAppStateChange, loadSettings, logNonFatalNotificationError]);

  const requestPermission = useCallback(async () => {
    try {
      const granted = await requestNotificationPermissions();
      setHasPermission(granted);

      if (!granted) {
        return false;
      }

      const userId = getCurrentUserId();
      if (userId) {
        try {
          await registerForPushNotifications(userId);
        } catch (error) {
          logNonFatalNotificationError('Failed to register for push notifications:', error);
        }
      }

      try {
        await scheduleAllNotifications();
      } catch (error) {
        logNonFatalNotificationError('Failed to schedule notifications after permission grant:', error);
      }

      return true;
    } catch (error) {
      setHasPermission(false);
      logNonFatalNotificationError('Failed to request notification permission:', error);
      return false;
    }
  }, [logNonFatalNotificationError]);

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const previousSettings = settings;
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await saveNotificationSettings(updatedSettings);
    } catch (error) {
      setSettings(previousSettings);
      logNonFatalNotificationError('Failed to save notification settings:', error);
    }
  }, [logNonFatalNotificationError, settings]);

  const toggleNotifications = useCallback(async () => {
    const newEnabled = !settings.enabled;

    if (newEnabled && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    await updateSettings({ enabled: newEnabled });
  }, [settings.enabled, hasPermission, requestPermission, updateSettings]);

  const toggleBreakReminders = useCallback(async () => {
    await updateSettings({ breakReminders: !settings.breakReminders });
  }, [settings.breakReminders, updateSettings]);

  const toggleStreakAlerts = useCallback(async () => {
    await updateSettings({ streakAlerts: !settings.streakAlerts });
  }, [settings.streakAlerts, updateSettings]);

  const toggleGoalNotifications = useCallback(async () => {
    await updateSettings({ goalNotifications: !settings.goalNotifications });
  }, [settings.goalNotifications, updateSettings]);

  const setReminderInterval = useCallback(async (minutes: number) => {
    await updateSettings({ reminderIntervalMinutes: minutes });
  }, [updateSettings]);

  const toggleQuietHours = useCallback(async () => {
    await updateSettings({ quietHoursEnabled: !settings.quietHoursEnabled });
  }, [settings.quietHoursEnabled, updateSettings]);

  const setQuietHours = useCallback(async (start: number, end: number) => {
    await updateSettings({
      quietHoursStart: start,
      quietHoursEnd: end,
    });
  }, [updateSettings]);

  const refresh = useCallback(async () => {
    await loadSettings();
    await checkPermission();
  }, [loadSettings, checkPermission]);

  return {
    settings,
    isLoading,
    hasPermission,
    requestPermission,
    updateSettings,
    toggleNotifications,
    toggleBreakReminders,
    toggleStreakAlerts,
    toggleGoalNotifications,
    setReminderInterval,
    toggleQuietHours,
    setQuietHours,
    refresh,
  };
}

export default useNotifications;
