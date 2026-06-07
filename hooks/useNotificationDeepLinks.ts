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
} from '@/services/notifications';

export type NotificationData = Record<string, unknown> | null | undefined;

export function routeForNotification(data: NotificationData): string | null {
  const type = typeof data?.type === 'string' ? (data.type as string) : null;

  switch (type) {
    case 'break_reminder':
    case 'streak_protection':
      return '/breaks';
    case 'daily_goal':
      return '/stats';
    default:
      return null;
  }
}

function navigateForResponse(response: Notifications.NotificationResponse | null) {
  if (!response) {
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
