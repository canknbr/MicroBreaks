/**
 * Notification Service
 * Handles push notifications for break reminders, streak alerts, and goals
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { getTodayBreaks, getStreakData, getUserStats } from './breakHistory';

// Notification channel IDs
export const NOTIFICATION_CHANNELS = {
  BREAK_REMINDERS: 'break-reminders',
  STREAK_ALERTS: 'streak-alerts',
  GOALS: 'goals',
  GENERAL: 'general',
} as const;

// Notification identifiers for scheduled notifications
export const NOTIFICATION_IDS = {
  BREAK_REMINDER: 'break-reminder',
  STREAK_PROTECTION: 'streak-protection',
  DAILY_GOAL: 'daily-goal',
  MORNING_MOTIVATION: 'morning-motivation',
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
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Initialize notification channels (Android)
export async function initializeNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
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
  }
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  return true;
}

// Get notification settings
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const settings = await getItem<NotificationSettings>(STORAGE_KEYS.SETTINGS);
  return settings || DEFAULT_NOTIFICATION_SETTINGS;
}

// Save notification settings
export async function saveNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  const currentSettings = await getNotificationSettings();
  const newSettings = { ...currentSettings, ...settings };
  await setItem(STORAGE_KEYS.SETTINGS, newSettings);

  // Reschedule notifications based on new settings
  await scheduleAllNotifications();
}

// Check if current time is within quiet hours
function isQuietHours(settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) return false;

  const now = new Date();
  const currentHour = now.getHours();

  // Handle overnight quiet hours (e.g., 22-8)
  if (settings.quietHoursStart > settings.quietHoursEnd) {
    return currentHour >= settings.quietHoursStart || currentHour < settings.quietHoursEnd;
  }

  return currentHour >= settings.quietHoursStart && currentHour < settings.quietHoursEnd;
}

// Check if today is a work day
function isWorkDay(settings: NotificationSettings): boolean {
  if (!settings.workDaysOnly) return true;
  const today = new Date().getDay();
  return settings.workDays.includes(today);
}

// Get next valid notification time
function getNextNotificationTime(settings: NotificationSettings): Date {
  const now = new Date();
  let nextTime = new Date(now.getTime() + settings.reminderIntervalMinutes * 60 * 1000);

  // If in quiet hours, schedule for end of quiet hours
  if (settings.quietHoursEnabled) {
    const quietEnd = new Date(now);
    quietEnd.setHours(settings.quietHoursEnd, 0, 0, 0);

    // If quiet hours end is tomorrow
    if (quietEnd <= now) {
      quietEnd.setDate(quietEnd.getDate() + 1);
    }

    // If next notification would be in quiet hours
    const nextTimeHour = nextTime.getHours();
    const inQuietPeriod =
      settings.quietHoursStart > settings.quietHoursEnd
        ? nextTimeHour >= settings.quietHoursStart || nextTimeHour < settings.quietHoursEnd
        : nextTimeHour >= settings.quietHoursStart && nextTimeHour < settings.quietHoursEnd;

    if (inQuietPeriod) {
      nextTime = quietEnd;
    }
  }

  return nextTime;
}

// Schedule break reminder notification
export async function scheduleBreakReminder(): Promise<string | null> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.breakReminders) {
    return null;
  }

  // Cancel existing break reminder
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.BREAK_REMINDER);

  // Don't schedule if in quiet hours or not a work day
  if (isQuietHours(settings) || !isWorkDay(settings)) {
    return null;
  }

  const nextTime = getNextNotificationTime(settings);
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

  if (!settings.enabled || !settings.streakAlerts) {
    return null;
  }

  // Cancel existing streak notification
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.STREAK_PROTECTION);

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

  // Schedule for 7 PM if no breaks taken
  const now = new Date();
  const reminderTime = new Date(now);
  reminderTime.setHours(19, 0, 0, 0); // 7 PM

  // If it's already past 7 PM, schedule for tomorrow
  if (now >= reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
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

  if (!settings.enabled || !settings.goalNotifications) {
    return null;
  }

  // Cancel existing goal notification
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.DAILY_GOAL);

  const todayBreaks = await getTodayBreaks();
  const userStats = await getUserStats();
  const dailyGoal = Math.max(Math.round(userStats.weeklyGoal / 7), 3);

  // If already met goal, don't remind
  if (todayBreaks.length >= dailyGoal) {
    return null;
  }

  // Calculate remaining breaks
  const remaining = dailyGoal - todayBreaks.length;

  // Schedule for 5 PM
  const now = new Date();
  const reminderTime = new Date(now);
  reminderTime.setHours(17, 0, 0, 0);

  // If past 5 PM, don't schedule
  if (now >= reminderTime) {
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

  if (!settings.enabled) {
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
