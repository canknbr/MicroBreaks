/**
 * useTimerNotifications Hook
 * Sets up the timer-alerts notification channel on Android
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { TIMER_NOTIFICATION_CHANNEL } from '@/constants/timer';

export function useTimerNotifications(): void {
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync(TIMER_NOTIFICATION_CHANNEL, {
        name: 'Timer Alerts',
        description: 'Notifications when your focus or break timer completes',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
        sound: 'default',
      }).catch((error) => {
        if (__DEV__) {
          console.warn('Failed to create timer notification channel:', error);
        }
      });
    }
  }, []);
}
