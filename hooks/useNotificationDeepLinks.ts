/**
 * Notification Deep Links Hook
 *
 * Registers the global notification response listener so taps from any app
 * state (foreground, background, cold start) route to the right screen.
 *
 * Mount once at the root (app/_layout.tsx) — never inside individual screens,
 * because the cold-start handler must run before any screen mounts.
 */

import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  scheduleSnoozedBreakReminder,
} from '@/services/notifications';
import { zoneForPainArea } from '@/features/exercise-library/suggestions';

export type NotificationData = Record<string, unknown> | null | undefined;

export function routeForNotification(data: NotificationData): string | null {
  const type = typeof data?.type === 'string' ? (data.type as string) : null;

  switch (type) {
    case 'break_reminder': {
      // Pain-focused reminders land directly on the matching library
      // shelf so the promised relief is one tap away.
      const pain = typeof data?.pain === 'string' ? (data.pain as string) : null;
      const zone = pain ? zoneForPainArea(pain) : null;
      return zone ? `/exercise-library?initialZone=${zone}` : '/breaks';
    }
    case 'streak_protection':
      return '/breaks';
    case 'daily_goal':
      return '/stats';
    case 'weekly_story':
      return '/weekly-story';
    default:
      return null;
  }
}

function navigateForResponse(response: Notifications.NotificationResponse | null) {
  if (!response) {
    return;
  }
  const actionIdentifier = response.actionIdentifier;
  // Background action buttons (snooze / skip) finish without ever
  // pulling the user into the app. Handle them silently before the
  // default routing kicks in.
  if (
    actionIdentifier === 'BREAK_SNOOZE_15' ||
    actionIdentifier === 'BREAK_SKIP'
  ) {
    if (actionIdentifier === 'BREAK_SNOOZE_15') {
      void scheduleSnoozedBreakReminder(15).catch((err) => {
        if (__DEV__) console.warn('[Notifications] snooze failed', err);
      });
    }
    return;
  }
  const target = routeForNotification(response.notification.request.content.data);
  if (!target) {
    return;
  }
  try {
    router.push(target as never);
  } catch (error) {
    if (__DEV__) {
      console.warn('[Notifications] Failed to route deep link:', error);
    }
  }
}

export function useNotificationDeepLinks(): void {
  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (isMounted) {
          navigateForResponse(lastResponse);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[Notifications] Failed to read cold-start response:', error);
        }
      }
    })();

    const responseSubscription = addNotificationResponseListener((response) => {
      navigateForResponse(response);
    });

    const receivedSubscription = addNotificationReceivedListener(() => {
      // Foreground receipt — handled silently for now.
    });

    return () => {
      isMounted = false;
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);
}

export default useNotificationDeepLinks;
