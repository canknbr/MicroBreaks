/**
 * Notification Service
 * Handles push notifications for break reminders, streak alerts, and goals
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { getTodayBreaks, getStreakData, getUserStats } from './breakHistory';
import { addBreadcrumb } from '@/services/firebase/crashlytics-adapter';
import { useSettingsStore } from '@/store/settingsStore';
import { ONBOARDING_STORE_PERSIST_KEY } from '@/store/onboardingStore';
import {
  STREAK_REMINDER_HOUR,
  GOAL_REMINDER_HOUR,
} from '@/constants/config';
import { calculateDailyGoal } from '@/utils/validation';
import { getEffectiveReminderInterval } from '@/features/workday/patterns';
import { composeAdaptiveCopy, type PainTag as AdaptivePainTag } from './notifications/adaptiveCopy';

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
      painAreas?: string[];
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

// Break reminder messages. Each message is tagged with the body area it
// addresses so we can prefer messages relevant to the user's onboarding
// painAreas. `tags: []` means a generic message that fits any user.
type PainTag = 'eyes' | 'neck' | 'shoulders' | 'upper_back' | 'lower_back' | 'wrists';

interface BreakReminderMessage {
  title: string;
  body: string;
  tags: PainTag[];
}

const BREAK_REMINDER_MESSAGES: BreakReminderMessage[] = [
  // Generic — always candidates
  { title: 'Time for a reset 🧘', body: "You've been at it a while. Give your body a quick stretch.", tags: [] },
  { title: 'Quick break time ⏰', body: 'Even 60 seconds resets your focus.', tags: [] },
  { title: 'Breathe deeply 🌬️', body: 'Three slow breaths — that is all you need right now.', tags: [] },
  { title: 'Step away for a moment 🌿', body: 'A short pause now keeps you sharp later.', tags: [] },
  { title: 'Pause and notice 🪷', body: 'Drop your shoulders. Unclench your jaw. Breathe.', tags: [] },
  { title: 'Hydrate + reset 💧', body: 'Grab some water and stretch your arms overhead.', tags: [] },

  // Eye strain
  { title: '20-20-20 time 👁️', body: 'Look at something 20 feet away for 20 seconds.', tags: ['eyes'] },
  { title: 'Eye reset 👀', body: 'Soften your gaze and blink fully a few times.', tags: ['eyes'] },
  { title: 'Screen break 📵', body: 'Close your eyes and rest your palms over them for 30 seconds.', tags: ['eyes'] },

  // Neck and shoulders
  { title: 'Roll your shoulders 🤸', body: 'Roll back 5 times, then forward 5 — release that tension.', tags: ['neck', 'shoulders'] },
  { title: 'Neck reset 🧘', body: 'Slow chin tucks for 30 seconds — your neck will thank you.', tags: ['neck'] },
  { title: 'Stand tall 💪', body: 'Pull your shoulders back, open your chest, breathe.', tags: ['shoulders', 'upper_back'] },

  // Back
  { title: 'Posture check 🪑', body: 'Sit up tall — crown of your head reaching for the ceiling.', tags: ['upper_back', 'lower_back'] },
  { title: 'Cat-cow at your chair 🐈', body: 'Arch and round your spine 5 times — instant relief.', tags: ['upper_back', 'lower_back'] },

  // Wrists
  { title: 'Wrist circles 🤲', body: 'Roll your wrists 10 times each direction — easy reset.', tags: ['wrists'] },
];

/**
 * Pick a break reminder message with a soft bias toward the user's pain
 * areas. Each matching tag gives the message a weight of 2; untagged
 * generic messages always count as weight 1. This keeps the rotation
 * fresh (no infinite repetition of one message) while making it feel
 * personally relevant.
 */
function pickBreakReminderMessage(painAreas: string[]): BreakReminderMessage {
  const knownAreas: PainTag[] = (painAreas as PainTag[]).filter((area) =>
    ['eyes', 'neck', 'shoulders', 'upper_back', 'lower_back', 'wrists'].includes(area)
  );

  const weighted = BREAK_REMINDER_MESSAGES.map((message) => {
    if (message.tags.length === 0) {
      return { message, weight: 1 };
    }
    const matches = message.tags.filter((tag) => knownAreas.includes(tag)).length;
    return { message, weight: matches > 0 ? 2 + matches : 0.5 };
  });

  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) {
    return BREAK_REMINDER_MESSAGES[0];
  }

  let roll = Math.random() * total;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.message;
    }
  }
  return weighted[weighted.length - 1].message;
}

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

/**
 * Test-only export so suites can exercise the cross-midnight branches of
 * the quiet-hours check without going through the full scheduler stack
 * (audit task C-TEST5).
 */
export const __notificationsTestUtils = {
  isWithinQuietHoursForDate,
};

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
  scheduleLabel?: string;
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

  // C-BUG6: 14 sliding-day attempts exhausted without finding a slot —
  // typically because of a quiet-hours config that swallows the entire
  // working day. Surface this to Crashlytics so we notice when users get
  // silently dropped, and bubble up null to the caller (which already
  // handles "no scheduled reminder").
  addBreadcrumb(
    `Quiet hours exhausted scheduling attempts for ${options.scheduleLabel ?? 'reminder'}`,
    'notifications',
    'warning',
    {
      quietHoursStart: settings.quietHoursStart,
      quietHoursEnd: settings.quietHoursEnd,
      workDaysOnly: settings.workDaysOnly,
    }
  );
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

  addBreadcrumb(
    'Quiet hours exhausted scheduling attempts for break reminder',
    'notifications',
    'warning',
    {
      quietHoursStart: settings.quietHoursStart,
      quietHoursEnd: settings.quietHoursEnd,
      workDaysOnly: settings.workDaysOnly,
      reminderIntervalMinutes: settings.reminderIntervalMinutes,
    }
  );

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

  const onboarding = await getItem<PersistedOnboardingSnapshot>(ONBOARDING_STORE_PERSIST_KEY);
  const workPattern = onboarding?.state?.data?.workPattern ?? null;
  const painAreas = onboarding?.state?.data?.painAreas ?? [];

  const nextTime = getNextNotificationTime({
    ...settings,
    reminderIntervalMinutes: getEffectiveReminderInterval(
      settings.reminderIntervalMinutes,
      workPattern
    ),
  });

  // Resolve adaptive context — these reads are best-effort. If any data
  // source fails we fall back to the legacy pool so the notification
  // still fires with a reasonable string.
  let message: { title: string; body: string } | null = null;
  try {
    const [todayBreaks, streakData, userStats] = await Promise.all([
      getTodayBreaks(),
      getStreakData(),
      getUserStats(),
    ]);
    const dailyGoal = calculateDailyGoal(userStats.weeklyGoal);
    const lastBreakAt = todayBreaks
      .map((b) => new Date(b.completedAt).getTime())
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => b - a)[0] ?? null;

    const adaptive = composeAdaptiveCopy({
      now: nextTime,
      currentStreak: streakData.currentStreak,
      todayBreakCount: todayBreaks.length,
      dailyGoal,
      lastBreakAt,
      painAreas: painAreas as AdaptivePainTag[],
    });
    message = { title: adaptive.title, body: adaptive.body };
  } catch (err) {
    if (__DEV__) {
      console.warn('[notifications] adaptive copy failed, falling back', err);
    }
  }
  if (!message) {
    message = pickBreakReminderMessage(painAreas);
  }

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
