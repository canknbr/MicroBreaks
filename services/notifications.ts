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
import { decideNotificationAction } from './notifications/predictiveDetection';
import { findNextFreeSlot } from './notifications/calendarAwareness';
import { getBusyWindows } from './notifications/calendarSource';
import { recordReminderDecision } from './notifications/diagnostics';
import { i18n } from '@/i18n';

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
  WEEKLY_STORY: 'weekly-story',
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
    return BREAK_REMINDER_MESSAGES[0]!;
  }

  let roll = Math.random() * total;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.message;
    }
  }
  return weighted[weighted.length - 1]!.message;
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

/**
 * Register iOS/Android notification action categories.
 *
 * Categories let the user act on a push without opening the app —
 * "Take a break now", "Snooze 15m", "Skip" on the lock screen.
 * The action's `identifier` lands in the response payload and is
 * routed by `hooks/useNotificationDeepLinks`.
 *
 * Categories are global, idempotent, and survive across launches —
 * registering on every cold start is the documented pattern.
 */
async function registerNotificationCategories(): Promise<void> {
  try {
    await Notifications.setNotificationCategoryAsync('break_reminder', [
      {
        identifier: 'BREAK_NOW',
        buttonTitle: 'Take a break now',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'BREAK_SNOOZE_15',
        buttonTitle: 'Snooze 15 min',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'BREAK_SKIP',
        buttonTitle: 'Skip',
        options: { opensAppToForeground: false, isDestructive: true },
      },
    ]);
  } catch (error) {
    if (__DEV__) {
      console.warn('[notifications] register categories failed', error);
    }
  }
}

// Initialize notification channels (Android) and action categories (iOS/Android)
export async function initializeNotifications(): Promise<void> {
  // Categories are platform-agnostic; register on every platform.
  await registerNotificationCategories();

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

function mapAppSettingsToNotificationSettings(
  s: ReturnType<typeof useSettingsStore.getState>['settings']
): NotificationSettings {
  return {
    enabled: s.notificationsEnabled,
    breakReminders: s.breakReminders,
    reminderIntervalMinutes: s.reminderIntervalMinutes,
    streakAlerts: s.streakAlerts,
    goalNotifications: s.goalNotifications,
    soundEnabled: s.soundEnabled,
    quietHoursEnabled: s.quietHoursEnabled,
    quietHoursStart: s.quietHoursStart,
    quietHoursEnd: s.quietHoursEnd,
    workDaysOnly: s.workDaysOnly,
    workDays: s.workDays,
  };
}

// Get notification settings.
//
// The settings store (MMKV-backed) is the authoritative source once the user
// has changed anything. The previous implementation read the persisted blob via
// the AsyncStorage-backed storage service using the store's `microbreaks-settings`
// key — but that key is owned by MMKV, and the MMKV adapter deletes the
// AsyncStorage copy after migrating it. The read therefore always missed the
// user's settings and every scheduler silently fell back to defaults.
//
// Read order: live store (when customized) → legacy `@microbreaks/settings`
// blob (written by onboarding's saveNotificationSettings, correctly an
// AsyncStorage key) → defaults.
export async function getNotificationSettings(): Promise<NotificationSettings> {
  // Guard the rare pre-hydration path (e.g. scheduling during early boot):
  // force a read from MMKV before sampling the store.
  if (!useSettingsStore.persist.hasHydrated()) {
    try {
      await useSettingsStore.persist.rehydrate();
    } catch {
      // Fall back to in-memory state (defaults) if rehydration fails.
    }
  }

  const state = useSettingsStore.getState();
  if (state.settingsUpdatedAt > 0) {
    return mapAppSettingsToNotificationSettings(state.settings);
  }

  // Store untouched on this install — honor any legacy/onboarding-written blob.
  const legacy = await getItem<NotificationSettings>(STORAGE_KEYS.SETTINGS);
  return legacy ?? mapAppSettingsToNotificationSettings(state.settings);
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
  getNextNotificationTime: (settings: NotificationSettings) => getNextNotificationTime(settings),
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
      // Re-anchor to the START of the next day. Carrying the late-night hour
      // forward let a cross-midnight quiet-hours shift push the reminder to
      // the FOLLOWING day, skipping the first work day's entire active window.
      nextTime.setDate(nextTime.getDate() + 1);
      nextTime.setHours(0, 0, 0, 0);
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

  let nextTime = getNextNotificationTime({
    ...settings,
    reminderIntervalMinutes: getEffectiveReminderInterval(
      settings.reminderIntervalMinutes,
      workPattern
    ),
  });

  // Calendar-aware shift: if the proposed reminder lands inside a
  // meeting, push it to the next free slot. Fails open — empty
  // busy windows leave nextTime untouched.
  try {
    const busy = await getBusyWindows(
      new Date(nextTime.getTime() - 5 * 60_000),
      new Date(nextTime.getTime() + 90 * 60_000)
    );
    if (busy.length > 0) {
      const shifted = findNextFreeSlot(nextTime, busy);
      if (shifted == null) {
        addBreadcrumb(
          'Break reminder skipped — no free slot within 90 min of proposed time',
          'notifications',
          'info',
          { proposedHour: nextTime.getHours(), busyCount: busy.length }
        );
        void recordReminderDecision({
          kind: 'suppressed_no_slot',
          summary:
            "We didn't send your last reminder — every slot in the next 90 minutes was booked.",
          details: { busyCount: busy.length, proposedHour: nextTime.getHours() },
        });
        return null;
      }
      if (shifted.getTime() !== nextTime.getTime()) {
        const shiftMinutes = Math.round(
          (shifted.getTime() - nextTime.getTime()) / 60_000,
        );
        addBreadcrumb(
          'Break reminder shifted past a calendar event',
          'notifications',
          'info',
          { shiftMinutes, busyCount: busy.length }
        );
        void recordReminderDecision({
          kind: 'shifted_past_meeting',
          summary: `We moved your reminder ${shiftMinutes} minutes later so it wouldn't land during a meeting.`,
          details: { shiftMinutes, busyCount: busy.length },
        });
        nextTime = shifted;
      }
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[notifications] calendar awareness failed, continuing', err);
    }
  }

  // Resolve adaptive context — these reads are best-effort. If any data
  // source fails we fall back to the legacy pool so the notification
  // still fires with a reasonable string.
  let message: { title: string; body: string } | null = null;
  let painFocusArea: string | undefined;
  try {
    const [todayBreaks, streakData, userStats] = await Promise.all([
      getTodayBreaks(),
      getStreakData(),
      getUserStats(),
    ]);
    const dailyGoal = calculateDailyGoal(userStats.weeklyGoal);

    // Predictive gate: ask whether the reminder still makes sense at
    // the time it would actually fire. The composer chooses the words;
    // this decides whether to send anything at all.
    const decision = decideNotificationAction({
      now: nextTime,
      todayBreaks,
      dailyGoal,
      quietHoursEnabled: settings.quietHoursEnabled,
    });

    if (decision.action === 'suppress' || decision.action === 'quiet') {
      addBreadcrumb(
        'Break reminder suppressed by predictive gate',
        'notifications',
        'info',
        {
          rationale: decision.rationale,
          minutesSinceLastBreak: decision.minutesSinceLastBreak,
        }
      );
      void recordReminderDecision({
        kind: 'suppressed_predictive',
        summary: predictiveRationaleToSummary(decision.rationale),
        details: {
          rationale: decision.rationale,
          minutesSinceLastBreak: decision.minutesSinceLastBreak ?? -1,
        },
      });
      return null;
    }

    const lastBreakAt = todayBreaks
      .map((b) => new Date(b.completedAt).getTime())
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => b - a)[0] ?? null;

    const adaptive = composeAdaptiveCopy(
      {
        now: nextTime,
        currentStreak: streakData.currentStreak,
        todayBreakCount: todayBreaks.length,
        dailyGoal,
        lastBreakAt,
        painAreas: painAreas as AdaptivePainTag[],
      },
      // i18next.t signature is (key, options) where interpolation values
      // live under `options`. Adapt to the (key, params) shape the
      // composer expects so missing keys still fall back to English.
      (key, params) => i18n.t(key, params ?? {}) as string,
    );
    message = { title: adaptive.title, body: adaptive.body };
    painFocusArea = adaptive.painArea;
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
      // `pain` lets the tap deep-link straight into the matching
      // movement-library zone (see hooks/useNotificationDeepLinks.ts).
      data: painFocusArea
        ? { type: 'break_reminder', pain: painFocusArea }
        : { type: 'break_reminder' },
      categoryIdentifier: 'break_reminder',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextTime,
      channelId: NOTIFICATION_CHANNELS.BREAK_REMINDERS,
    },
    identifier: NOTIFICATION_IDS.BREAK_REMINDER,
  });

  // Record success so the Profile debug card can show "next reminder
  // at <time>" instead of stale shift / suppression reasons.
  void recordReminderDecision({
    kind: 'scheduled',
    summary: `Next reminder set for ${nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    details: { hour: nextTime.getHours(), minute: nextTime.getMinutes() },
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
      title: i18n.t('notifications.adaptive.streakAtRisk.title', {
        streak: streakData.currentStreak,
        defaultValue: `Protect your ${streakData.currentStreak}-day streak! 🔥`,
      }) as string,
      body: i18n.t('notifications.adaptive.streakAtRisk.body', {
        defaultValue:
          "You haven't taken a break today. Complete one to keep your streak alive!",
      }) as string,
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

  const percent = Math.round((todayBreaks.length / dailyGoal) * 100);
  // i18next v23 plural rules require `_one` / `_other` suffixes which
  // not every key in this codebase has migrated to yet. Resolve the
  // pluralised key ourselves so the fallback string stays correct
  // when i18n hasn't been initialised (e.g. unit tests).
  const goalTitleKey =
    remaining === 1
      ? 'notifications.dailyGoal.titleSingular'
      : 'notifications.dailyGoal.titlePlural';
  const goalTitleFallback = `${remaining} break${remaining === 1 ? '' : 's'} to go! 🎯`;
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t(goalTitleKey, {
        count: remaining,
        defaultValue: goalTitleFallback,
      }) as string,
      body: i18n.t('notifications.dailyGoal.body', {
        percent,
        defaultValue: `You're ${percent}% to your daily goal. Keep it up!`,
      }) as string,
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

/** Plain-English summary for the predictive gate's rationale. Kept
 *  next to the gate so a future new branch shows up here too. */
function predictiveRationaleToSummary(rationale: string): string {
  switch (rationale) {
    case 'in_quiet_hours':
      return "We held the reminder because you're inside your quiet hours.";
    case 'just_broke':
      return 'We held the reminder because you took a break recently.';
    case 'goal_complete':
      return "We held the reminder because you've already hit today's break goal.";
    default:
      return 'We held the reminder based on your recent break pattern.';
  }
}

/**
 * Snooze the active break reminder by `minutes`. Fired from the
 * notification "Snooze 15 min" action button — the user wants the
 * nudge to come back shortly, not be skipped.
 *
 * Cancels the currently-displayed reminder and queues a one-shot
 * DATE-trigger replacement. We deliberately bypass the predictive
 * gate here because the user just *explicitly* asked for a snooze
 * and gating it would feel broken.
 */
export async function scheduleSnoozedBreakReminder(
  minutes: number,
): Promise<string | null> {
  const settings = await getNotificationSettings();
  const hasPermission = await hasGrantedNotificationPermission();
  if (!hasPermission || !settings.enabled) {
    return null;
  }
  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDS.BREAK_REMINDER,
  );
  const fireAt = new Date(Date.now() + minutes * 60_000);
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('notifications.adaptive.tone.focused.0.title', {
        defaultValue: 'Quick reset before deep work 🎯',
      }) as string,
      body: i18n.t('notifications.adaptive.tone.focused.0.body', {
        defaultValue: 'Clear your head — one minute, then back in.',
      }) as string,
      sound: settings.soundEnabled ? 'default' : undefined,
      data: { type: 'break_reminder', snoozed: true },
      categoryIdentifier: 'break_reminder',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
      channelId: NOTIFICATION_CHANNELS.BREAK_REMINDERS,
    },
    identifier: NOTIFICATION_IDS.BREAK_REMINDER,
  });
  return identifier;
}

/**
 * Schedule a Sunday-evening reminder that nudges the user toward
 * the weekly recovery story. The story engine ships its data on
 * demand from local history — no server hop — so we only need to
 * surface the screen, not deliver new content in the payload.
 *
 * Returns the scheduled identifier, or null if notifications are
 * disabled or unsupported. Cancels any previously-scheduled instance
 * before rescheduling so the cadence stays at one per week.
 */
const WEEKLY_STORY_WEEKDAY = 1; // expo-notifications: 1 = Sunday
const WEEKLY_STORY_HOUR = 19;

export async function scheduleWeeklyStoryReminder(): Promise<string | null> {
  const settings = await getNotificationSettings();

  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDS.WEEKLY_STORY,
  );

  const hasPermission = await hasGrantedNotificationPermission();
  if (!hasPermission || !settings.enabled) {
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t('notifications.weeklyStory.title', {
        defaultValue: 'Your week in focus 📊',
      }) as string,
      body: i18n.t('notifications.weeklyStory.body', {
        defaultValue:
          'See which breaks lifted you most and what to repeat next week.',
      }) as string,
      sound: settings.soundEnabled ? 'default' : undefined,
      data: { type: 'weekly_story', screen: '/weekly-story' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: WEEKLY_STORY_WEEKDAY,
      hour: WEEKLY_STORY_HOUR,
      minute: 0,
      channelId: NOTIFICATION_CHANNELS.GENERAL,
    },
    identifier: NOTIFICATION_IDS.WEEKLY_STORY,
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
  await scheduleWeeklyStoryReminder();
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
