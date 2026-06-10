/**
 * Timer Service
 * Manages foreground tick interval and background notification scheduling
 */

import * as Notifications from 'expo-notifications';
import { AppState, AppStateStatus } from 'react-native';
import i18n from 'i18next';
import { useTimerStore } from '@/store/timerStore';
import {
  TIMER_TICK_MS,
  TIMER_NOTIFICATION_ID,
  TIMER_NOTIFICATION_CHANNEL,
} from '@/constants/timer';

let tickInterval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;

/**
 * Start the foreground tick interval.
 * Calls timerStore.tick() every second.
 */
export function startTicking(): void {
  stopTicking();
  tickInterval = setInterval(() => {
    useTimerStore.getState().tick();
  }, TIMER_TICK_MS);
}

/**
 * Stop the foreground tick interval.
 */
export function stopTicking(): void {
  if (tickInterval !== null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

/**
 * Schedule a notification for when the current phase ends.
 * Called when the app moves to the background.
 */
export async function schedulePhaseEndNotification(): Promise<void> {
  const { session } = useTimerStore.getState();
  if (!session.isActive || session.isPaused) return;

  // Cancel any existing timer notification
  await cancelPhaseEndNotification();

  const titleKey =
    session.phase === 'work'
      ? 'timer.pushNotifications.workCompleteTitle'
      : 'timer.pushNotifications.breakCompleteTitle';
  const bodyKey =
    session.phase === 'work'
      ? 'timer.pushNotifications.workCompleteBody'
      : 'timer.pushNotifications.breakCompleteBody';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t(titleKey),
      body: i18n.t(bodyKey),
      sound: 'default',
      data: { type: 'timer_phase_end', phase: session.phase },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + session.remainingSeconds * 1000),
      channelId: TIMER_NOTIFICATION_CHANNEL,
    },
    identifier: TIMER_NOTIFICATION_ID,
  });
}

/**
 * Cancel the phase-end notification.
 * Called when the app returns to foreground.
 */
export async function cancelPhaseEndNotification(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(TIMER_NOTIFICATION_ID);
  } catch {
    // Notification may not exist — ignore
  }
}

/**
 * Handle AppState changes for background/foreground transitions.
 */
function handleAppStateChange(nextState: AppStateStatus): void {
  const { session } = useTimerStore.getState();

  if (nextState === 'active') {
    // Returning to foreground. Fire-and-forget cancellation could let a
    // stale "phase complete" notification fire after the timer already
    // resumed; surface its result through the catch instead of dropping it.
    void cancelPhaseEndNotification().catch(() => {
      // Ignore — the notification may have already fired or never been
      // scheduled. We don't want this to block the resume path.
    });
    if (session.isActive && !session.isPaused) {
      useTimerStore.getState().handleForegroundResume();
      startTicking();
    }
  } else if (nextState === 'background' || nextState === 'inactive') {
    // Going to background
    stopTicking();
    if (session.isActive && !session.isPaused) {
      schedulePhaseEndNotification();
    }
  }
}

/**
 * Initialize the timer service.
 * Sets up AppState listener for background handling.
 */
export function initializeTimerService(): void {
  if (appStateSubscription) return;
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // If there's an active session from a previous run, recover
  const { session } = useTimerStore.getState();
  if (session.isActive && !session.isPaused && session.phaseStartedAt) {
    useTimerStore.getState().handleForegroundResume();
    // Only start ticking if still active after recovery
    if (useTimerStore.getState().session.isActive) {
      startTicking();
    }
  }
}

/**
 * Shutdown the timer service.
 * Cleans up interval and listeners.
 */
export function shutdownTimerService(): void {
  stopTicking();
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  cancelPhaseEndNotification();
}
