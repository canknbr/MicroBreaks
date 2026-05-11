/**
 * Notification Service
 * Handles push notifications for break reminders, streak alerts, and goals
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { getTodayBreaks, getStreakData, getUserStats } from './breakHistory';
import { useSettingsStore } from '@/store/settingsStore';
import { ONBOARDING_STORE_PERSIST_KEY } from '@/store/onboardingStore';
import {
  STREAK_REMINDER_HOUR,
  GOAL_REMINDER_HOUR,
} from '@/constants/config';
import { calculateDailyGoal } from '@/utils/validation';
import { getEffectiveReminderInterval } from '@/features/workday/patterns';

// Notification channel IDs
export const NOTIFICATION_CHANNELS = {
  BREAK_REMINDERS: 'break-reminders',
  STREAK_ALERTS: 'streak-alerts',
  GOALS: 'goals',
  GENERAL: 'general',
  TIMER_ALERTS: 'timer-alerts',
} as const;

// Notification identifiers for scheduled notifications
export const NOTIFICATION_IDS = {
  BREAK_REMINDER: 'break-reminder',
  STREAK_PROTECTION: 'streak-protection',
  DAILY_GOAL: 'daily-goal',
  MORNING_MOTIVATION: 'morning-motivation',
  POMODORO_TIMER_END: 'pomodoro-timer-end',
} as const;

// Notification settings interface
export interface NotificationSettings {
  enabled: boolean;
  breakReminders: boolean;
  reminderIntervalMinutes: number;
  streakAlerts: boolean;
  goalNotifications: boolean;
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number; // Hour (0-23)
  quietHoursEnd: number; // Hour (0-23)
  workDaysOnly: boolean;
  workDays: number[]; // 0=Sunday, 1=Monday, etc.
}

// Default notification settings
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  breakReminders: true,
  reminderIntervalMinutes: 25,
  streakAlerts: true,
  goalNotifications: true,
  soundEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: 22, // 10 PM
  quietHoursEnd: 8, // 8 AM
  workDaysOnly: true,
  workDays: [1, 2, 3, 4, 5], // Monday-Friday
};

const SETTINGS_STORE_PERSIST_KEY = 'microbreaks-settings';

interface PersistedOnboardingSnapshot {
  state?: {
    data?: {
      workPattern?: string | null;
    };
  };
}

async function hasGrantedNotificationPermission(): Promise<boolean> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return (
      permissions.status === 'granted' ||
      permissions.granted === true ||
      permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

function mapNotificationSettingsToAppSettings(
  settings: NotificationSettings
): Partial<ReturnType<typeof useSettingsStore.getState>['settings']> {
  return {
    notificationsEnabled: settings.enabled,
    breakReminders: settings.breakReminders,
    reminderIntervalMinutes: settings.reminderIntervalMinutes,
    streakAlerts: settings.streakAlerts,
    goalNotifications: settings.goalNotifications,
    soundEnabled: settings.soundEnabled,
    quietHoursEnabled: settings.quietHoursEnabled,
    quietHoursStart: settings.quietHoursStart,
    quietHoursEnd: settings.quietHoursEnd,
    workDaysOnly: settings.workDaysOnly,
    workDays: settings.workDays,
  };
}

async function getPersistedWorkPattern(): Promise<string | null> {
  const onboardingSnapshot = await getItem<PersistedOnboardingSnapshot>(
    ONBOARDING_STORE_PERSIST_KEY
  );
  return onboardingSnapshot?.state?.data?.workPattern ?? null;
}

// Break reminder messages (rotated)
const BREAK_REMINDER_MESSAGES = [
  {
    title: 'Time for a break! 🧘',
    body: "You've been working hard. Give your body a quick stretch.",
  },
  {
    title: 'Break time! 👁️',
    body: 'Your eyes need rest. Try the 20-20-20 rule.',
  },
  {
    title: 'Stand up and move! 🚶',
    body: 'A short walk can boost your energy and focus.',
  },
  {
    title: 'Breathe deeply 🌬️',
    body: 'Take a moment for some calming breaths.',
  },
  {
    title: 'Stretch break! 💪',
    body: 'Your muscles are waiting for some movement.',
  },
  {
    title: 'Quick break time! ⏰',
    body: 'Even 1 minute can make a difference.',
  },
];

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Initialize notification channels (Android)
export async function initializeNotifications(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.BREAK_REMINDERS, {
      name: 'Break Reminders',
      description: 'Reminders to take breaks during work',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#06FFA5',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.STREAK_ALERTS, {
      name: 'Streak Alerts',
      description: 'Alerts to protect your daily streak',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD166',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.GOALS, {
      name: 'Goal Notifications',
      description: 'Updates about your daily goals',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#00E5FF',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.TIMER_ALERTS, {
      name: 'Timer Alerts',
      description: 'Notifications when a focus or break timer completes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
      sound: 'default',
    });
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to initialize notification channels:', error);
    }
    throw error;
  }
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    // Notifications require a physical device - silently return false in simulator
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    // Permission not granted - silently return false
    return false;
  }

  return true;
}

// Get notification settings
// Reads from both the settingsStore persistence key and the legacy STORAGE_KEYS.SETTINGS,
// preferring the settingsStore data to maintain a single source of truth.
export async function getNotificationSettings(): Promise<NotificationSettings> {
  // Try to read from settingsStore's persistence key first (single source of truth)
  const storeData = await getItem<{ state?: { settings?: Record<string, unknown> } }>(
    SETTINGS_STORE_PERSIST_KEY
  );
  const storeSettings = storeData?.state?.settings;
  if (storeSettings) {
    return {
      enabled: (storeSettings.notificationsEnabled as boolean) ?? DEFAULT_NOTIFICATION_SETTINGS.enabled,
      breakReminders: (storeSettings.breakReminders as boolean) ?? DEFAULT_NOTIFICATION_SETTINGS.breakReminders,
      reminderIntervalMinutes: (storeSettings.reminderIntervalMinutes as number) ?? DEFAULT_NOTIFICATION_SETTINGS.reminderIntervalMinutes,
      streakAlerts: (storeSettings.streakAlerts as boolean) ?? DEFAULT_NOTIFICATION_SETTINGS.streakAlerts,
      goalNotifications: (storeSettings.goalNotifications as boolean) ?? DEFAULT_NOTIFICATION_SETTINGS.goalNotifications,
      soundEnabled: (storeSettings.soundEnabled as boolean) ?? DEFAULT_NOTIFICATION_SETTINGS.soundEnabled,
      quietHoursEnabled: (storeSettings.quietHoursEnabled as boolean) ?? DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnabled,
      quietHoursStart: (storeSettings.quietHoursStart as number) ?? DEFAULT_NOTIFICATION_SETTINGS.quietHoursStart,
      quietHoursEnd: (storeSettings.quietHoursEnd as number) ?? DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnd,
      workDaysOnly: (storeSettings.workDaysOnly as boolean) ?? DEFAULT_NOTIFICATION_SETTINGS.workDaysOnly,
      workDays: (storeSettings.workDays as number[]) ?? DEFAULT_NOTIFICATION_SETTINGS.workDays,
    };
  }

  // Fallback to legacy storage key
  const settings = await getItem<NotificationSettings>(STORAGE_KEYS.SETTINGS);
  return settings || DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Validate quiet hours value (must be 0-23)
 */
function validateQuietHour(hour: number | undefined, defaultValue: number): number {
  if (hour === undefined) return defaultValue;
  if (typeof hour !== 'number' || isNaN(hour)) return defaultValue;
  return Math.max(0, Math.min(23, Math.round(hour)));
}

/**
 * Validate notification settings before saving
 */
function validateNotificationSettings(settings: Partial<NotificationSettings>): Partial<NotificationSettings> {
  const validated = { ...settings };

  // Validate quiet hours (0-23)
  if (validated.quietHoursStart !== undefined) {
    validated.quietHoursStart = validateQuietHour(validated.quietHoursStart, DEFAULT_NOTIFICATION_SETTINGS.quietHoursStart);
  }
  if (validated.quietHoursEnd !== undefined) {
    validated.quietHoursEnd = validateQuietHour(validated.quietHoursEnd, DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnd);
  }

  // Validate reminder interval (minimum 5 minutes, maximum 120 minutes)
  if (validated.reminderIntervalMinutes !== undefined) {
    validated.reminderIntervalMinutes = Math.max(5, Math.min(120, Math.round(validated.reminderIntervalMinutes)));
  }

  // Validate work days array
  if (validated.workDays !== undefined) {
    validated.workDays = validated.workDays.filter(day => day >= 0 && day <= 6);
    if (validated.workDays.length === 0) {
      validated.workDays = DEFAULT_NOTIFICATION_SETTINGS.workDays;
    }
  }

  return validated;
}

// Save notification settings
export async function saveNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  const currentSettings = await getNotificationSettings();
  const validatedSettings = validateNotificationSettings(settings);
  const newSettings = { ...currentSettings, ...validatedSettings };
  const appSettings = mapNotificationSettingsToAppSettings(newSettings);
  const persistedStoreSnapshot = await getItem<{
    state?: {
      settings?: Record<string, unknown>;
      settingsUpdatedAt?: number;
    };
    version?: number;
  }>(SETTINGS_STORE_PERSIST_KEY);

  await setItem(SETTINGS_STORE_PERSIST_KEY, {
    ...(persistedStoreSnapshot ?? {}),
    state: {
      ...(persistedStoreSnapshot?.state ?? {}),
      settings: {
        ...(persistedStoreSnapshot?.state?.settings ?? {}),
        ...appSettings,
      },
      settingsUpdatedAt: Date.now(),
    },
  });

  useSettingsStore.getState().updateSettings(appSettings);
  await setItem(STORAGE_KEYS.SETTINGS, newSettings);

  // Reschedule notifications based on new settings
  await scheduleAllNotifications();
}

function isWorkDayForDate(date: Date, settings: NotificationSettings): boolean {
  if (!settings.workDaysOnly) return true;
  return settings.workDays.includes(date.getDay());
}

function isWithinQuietHoursForDate(date: Date, settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) return false;

  const currentHour = date.getHours();

  if (settings.quietHoursStart > settings.quietHoursEnd) {
    return currentHour >= settings.quietHoursStart || currentHour < settings.quietHoursEnd;
  }

  return currentHour >= settings.quietHoursStart && currentHour < settings.quietHoursEnd;
}

function moveToQuietHoursEnd(date: Date, settings: NotificationSettings): Date {
  const quietEnd = new Date(date);
  quietEnd.setHours(settings.quietHoursEnd, 0, 0, 0);

  if (settings.quietHoursStart > settings.quietHoursEnd && date.getHours() >= settings.quietHoursStart) {
    quietEnd.setDate(quietEnd.getDate() + 1);
  } else if (settings.quietHoursStart <= settings.quietHoursEnd && quietEnd <= date) {
    quietEnd.setDate(quietEnd.getDate() + 1);
  }

  return quietEnd;
}

function isSameLocalDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

interface ScheduledHourOptions {
  allowNextDayIfPast: boolean;
  allowCrossDayQuietHoursShift: boolean;
}

function getNextScheduledTimeForHour(
  settings: NotificationSettings,
  targetHour: number,
  options: ScheduledHourOptions
): Date | null {
  const now = new Date();
  let candidate = new Date(now);
  candidate.setHours(targetHour, 0, 0, 0);

  if (candidate <= now) {
    if (!options.allowNextDayIfPast) {
      return null;
    }

    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(targetHour, 0, 0, 0);
  }

  for (let attempts = 0; attempts < 14; attempts += 1) {
    if (!isWorkDayForDate(candidate, settings)) {
      if (!options.allowNextDayIfPast) {
        return null;
      }

      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(targetHour, 0, 0, 0);
      continue;
    }

    if (isWithinQuietHoursForDate(candidate, settings)) {
      const adjusted = moveToQuietHoursEnd(candidate, settings);
      if (!options.allowCrossDayQuietHoursShift && !isSameLocalDay(adjusted, candidate)) {
        return null;
      }

      candidate = adjusted;
      if (candidate <= now) {
        if (!options.allowNextDayIfPast) {
          return null;
        }

        candidate.setDate(candidate.getDate() + 1);
        candidate.setHours(targetHour, 0, 0, 0);
        continue;
      }

      if (!isWorkDayForDate(candidate, settings)) {
        if (!options.allowNextDayIfPast) {
          return null;
        }

        candidate.setDate(candidate.getDate() + 1);
        candidate.setHours(targetHour, 0, 0, 0);
        continue;
      }
    }

    return candidate;
  }

  return null;
}

// Get next valid notification time
function getNextNotificationTime(settings: NotificationSettings): Date {
  const now = new Date();
  let nextTime = new Date(now.getTime() + settings.reminderIntervalMinutes * 60 * 1000);

  for (let attempts = 0; attempts < 14; attempts += 1) {
    if (!isWorkDayForDate(nextTime, settings)) {
      nextTime.setDate(nextTime.getDate() + 1);
      continue;
    }

    if (isWithinQuietHoursForDate(nextTime, settings)) {
      nextTime = moveToQuietHoursEnd(nextTime, settings);
      continue;
    }

    return nextTime;
  }

  return nextTime;
}

// Schedule break reminder notification
export async function scheduleBreakReminder(): Promise<string | null> {
  const settings = await getNotificationSettings();

  // Cancel existing break reminder first so disabled settings do not leave stale reminders behind
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BREAK_REMINDER);

  const hasPermission = await hasGrantedNotificationPermission();
  if (!hasPermission || !settings.enabled || !settings.breakReminders) {
    return null;
  }

  const workPattern = await getPersistedWorkPattern();
  const nextTime = getNextNotificationTime({
    ...settings,
    reminderIntervalMinutes: getEffectiveReminderInterval(
      settings.reminderIntervalMinutes,
      workPattern
    ),
  });
  const message = BREAK_REMINDER_MESSAGES[Math.floor(Math.random() * BREAK_REMINDER_MESSAGES.length)];

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: settings.soundEnabled ? 'default' : undefined,
      data: { type: 'break_reminder' },
      categoryIdentifier: 'break_reminder',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextTime,
      channelId: NOTIFICATION_CHANNELS.BREAK_REMINDERS,
    },
    identifier: NOTIFICATION_IDS.BREAK_REMINDER,
  });

  return identifier;
}

// Schedule streak protection notification
export async function scheduleStreakProtection(): Promise<string | null> {
  const settings = await getNotificationSettings();

  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.STREAK_PROTECTION);

  const hasPermission = await hasGrantedNotificationPermission();
  if (!hasPermission || !settings.enabled || !settings.streakAlerts) {
    return null;
  }

  // Check if user has taken breaks today
  const todayBreaks = await getTodayBreaks();
  if (todayBreaks.length > 0) {
    return null; // Already have breaks today, no need to remind
  }

  // Check current streak
  const streakData = await getStreakData();
  if (streakData.currentStreak === 0) {
    return null; // No streak to protect
  }

  const reminderTime = getNextScheduledTimeForHour(settings, STREAK_REMINDER_HOUR, {
    allowNextDayIfPast: true,
    allowCrossDayQuietHoursShift: true,
  });

  if (!reminderTime) {
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Protect your ${streakData.currentStreak}-day streak! 🔥`,
      body: "You haven't taken a break today. Complete one to keep your streak alive!",
      sound: settings.soundEnabled ? 'default' : undefined,
      data: { type: 'streak_protection' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderTime,
      channelId: NOTIFICATION_CHANNELS.STREAK_ALERTS,
    },
    identifier: NOTIFICATION_IDS.STREAK_PROTECTION,
  });

  return identifier;
}

// Schedule daily goal notification
export async function scheduleDailyGoalReminder(): Promise<string | null> {
  const settings = await getNotificationSettings();

  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.DAILY_GOAL);

  const hasPermission = await hasGrantedNotificationPermission();
  if (!hasPermission || !settings.enabled || !settings.goalNotifications) {
    return null;
  }

  const todayBreaks = await getTodayBreaks();
  const userStats = await getUserStats();
  const dailyGoal = calculateDailyGoal(userStats.weeklyGoal);

  // If already met goal, don't remind
  if (todayBreaks.length >= dailyGoal) {
    return null;
  }

  // Calculate remaining breaks
  const remaining = dailyGoal - todayBreaks.length;

  const reminderTime = getNextScheduledTimeForHour(settings, GOAL_REMINDER_HOUR, {
    allowNextDayIfPast: false,
    allowCrossDayQuietHoursShift: false,
  });

  if (!reminderTime) {
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${remaining} break${remaining > 1 ? 's' : ''} to go! 🎯`,
      body: `You're ${Math.round((todayBreaks.length / dailyGoal) * 100)}% to your daily goal. Keep it up!`,
      sound: settings.soundEnabled ? 'default' : undefined,
      data: { type: 'daily_goal' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderTime,
      channelId: NOTIFICATION_CHANNELS.GOALS,
    },
    identifier: NOTIFICATION_IDS.DAILY_GOAL,
  });

  return identifier;
}

// Schedule all notifications
export async function scheduleAllNotifications(): Promise<void> {
  const settings = await getNotificationSettings();
  const hasPermission = await hasGrantedNotificationPermission();

  if (!settings.enabled || !hasPermission) {
    await cancelAllNotifications();
    return;
  }

  await scheduleBreakReminder();
  await scheduleStreakProtection();
  await scheduleDailyGoalReminder();
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cancel specific notification
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Send immediate notification (for testing or one-time alerts)
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string> {
  const settings = await getNotificationSettings();

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: settings.soundEnabled ? 'default' : undefined,
      data,
    },
    trigger: null, // Immediate
  });

  return identifier;
}

// Send goal completion notification
export async function sendGoalCompletedNotification(): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.goalNotifications) {
    return;
  }

  await sendImmediateNotification(
    '🎉 Daily Goal Complete!',
    "Amazing work! You've reached your wellness goal for today.",
    { type: 'goal_complete' }
  );
}

// Send streak milestone notification
export async function sendStreakMilestoneNotification(streakDays: number): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.streakAlerts) {
    return;
  }

  await sendImmediateNotification(
    `🔥 ${streakDays}-Day Streak!`,
    `Incredible! You've maintained your wellness streak for ${streakDays} days!`,
    { type: 'streak_milestone', streakDays }
  );
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Add notification response listener
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Add notification received listener (foreground)
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
