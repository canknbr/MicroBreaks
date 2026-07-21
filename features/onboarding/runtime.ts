import type { NotificationSettings } from '@/services/notifications';
import type { OnboardingData } from '@/store/onboardingStore';
import { calculateWeeklyGoalFromBreakInterval } from '@/utils/validation';

export function buildOnboardingNotificationSettings(
  data: Pick<OnboardingData, 'notificationsEnabled' | 'breakInterval'>
): Partial<NotificationSettings> {
  const reminderIntervalMinutes = Math.max(
    5,
    Math.min(120, Math.round(data.breakInterval || 25))
  );

  return {
    enabled: data.notificationsEnabled,
    breakReminders: data.notificationsEnabled,
    reminderIntervalMinutes,
  };
}

export interface OnboardingTimerDurations {
  work: number;
  breakMins: number;
  longBreak: number;
  sessions: number;
}

export function buildOnboardingTimerDurations(
  breakInterval: number
): OnboardingTimerDurations {
  const work = Math.max(15, Math.min(60, Math.round(breakInterval || 25)));

  if (work <= 20) {
    return {
      work,
      breakMins: 2,
      longBreak: 5,
      sessions: 6,
    };
  }

  if (work <= 30) {
    return {
      work,
      breakMins: 5,
      longBreak: 15,
      sessions: 4,
    };
  }

  if (work <= 45) {
    return {
      work,
      breakMins: 8,
      longBreak: 18,
      sessions: 4,
    };
  }

  return {
    work,
    breakMins: 10,
    longBreak: 20,
    sessions: 3,
  };
}

export interface OnboardingRuntimeSyncDependencies {
  setWeeklyGoal: (goal: number) => void;
  saveNotificationSettings: (
    settings: Partial<NotificationSettings>
  ) => Promise<void>;
  setCustomDurations: (
    work: number,
    breakMins: number,
    longBreak: number,
    sessions: number
  ) => void;
  updateProfile: (profile: { joinedAt: string }) => void;
  unlockAchievement: (achievementId: string) => void;
  addXP: (amount: number) => void;
  addNotification: (notification: {
    type: 'welcome' | 'achievement';
    title: string;
    message: string;
    icon: string;
    color: string;
    data?: Record<string, unknown>;
  }) => void;
}

export interface OnboardingRuntimeSyncError {
  step: string;
  error: unknown;
}

export interface OnboardingRuntimeSyncResult {
  weeklyGoal: number;
  errors: OnboardingRuntimeSyncError[];
}

export interface OnboardingNotificationChoiceDependencies {
  updateData: (data: Partial<OnboardingData>) => void;
  saveNotificationSettings: (
    settings: Partial<NotificationSettings>
  ) => Promise<void>;
  getCurrentUserId: () => string | null;
  registerForPushNotifications: (userId: string) => Promise<unknown>;
}

export interface OnboardingNotificationChoiceResult {
  granted: boolean;
  errors: OnboardingRuntimeSyncError[];
}

async function runBestEffortStep(
  step: string,
  effect: () => Promise<void> | void,
  errors: OnboardingRuntimeSyncError[]
): Promise<void> {
  try {
    await effect();
  } catch (error) {
    errors.push({ step, error });
  }
}

export async function syncOnboardingRuntimeState(
  data: Pick<OnboardingData, 'breakInterval' | 'notificationsEnabled'>,
  deps: OnboardingRuntimeSyncDependencies,
  options?: {
    joinedAt?: string;
  }
): Promise<OnboardingRuntimeSyncResult> {
  const weeklyGoal = calculateWeeklyGoalFromBreakInterval(data.breakInterval);
  const timerDurations = buildOnboardingTimerDurations(data.breakInterval);
  const joinedAt = options?.joinedAt ?? new Date().toISOString();
  const errors: OnboardingRuntimeSyncError[] = [];

  await runBestEffortStep('weekly_goal', () => {
    deps.setWeeklyGoal(weeklyGoal);
  }, errors);

  await runBestEffortStep('notification_settings', async () => {
    await deps.saveNotificationSettings(buildOnboardingNotificationSettings(data));
  }, errors);

  await runBestEffortStep('timer_durations', () => {
    deps.setCustomDurations(
      timerDurations.work,
      timerDurations.breakMins,
      timerDurations.longBreak,
      timerDurations.sessions
    );
  }, errors);

  await runBestEffortStep('profile_joined_at', () => {
    deps.updateProfile({ joinedAt });
  }, errors);

  await runBestEffortStep('achievement_unlock', () => {
    deps.unlockAchievement('health-pioneer');
  }, errors);

  await runBestEffortStep('completion_xp', () => {
    deps.addXP(25);
  }, errors);

  await runBestEffortStep('welcome_notification', () => {
    deps.addNotification({
      type: 'welcome',
      title: 'Welcome to Unwind!',
      message: 'Your wellness journey starts now. Take your first break to earn XP!',
      icon: '🎉',
      color: '#6CE9CC',
    });
  }, errors);

  await runBestEffortStep('achievement_notification', () => {
    deps.addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'Health Pioneer: Completed your wellness setup. +25 XP',
      icon: '🏆',
      color: '#FAE34B',
      data: { achievementTitle: 'Health Pioneer', xpReward: 25 },
    });
  }, errors);

  return {
    weeklyGoal,
    errors,
  };
}

export async function applyOnboardingNotificationChoice(
  enableReminders: boolean,
  requestPermission: () => Promise<boolean>,
  deps: OnboardingNotificationChoiceDependencies
): Promise<OnboardingNotificationChoiceResult> {
  const errors: OnboardingRuntimeSyncError[] = [];
  let granted = false;

  if (enableReminders) {
    try {
      granted = await requestPermission();
    } catch (error) {
      errors.push({ step: 'request_permission', error });
      granted = false;
    }
  }

  const notificationsEnabled = enableReminders ? granted : false;
  deps.updateData({ notificationsEnabled });

  await runBestEffortStep('notification_settings', async () => {
    await deps.saveNotificationSettings({
      enabled: notificationsEnabled,
      breakReminders: notificationsEnabled,
    });
  }, errors);

  if (notificationsEnabled) {
    const userId = deps.getCurrentUserId();
    if (userId) {
      await runBestEffortStep('push_registration', async () => {
        await deps.registerForPushNotifications(userId);
      }, errors);
    }
  }

  return {
    granted: notificationsEnabled,
    errors,
  };
}
