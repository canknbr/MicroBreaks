/**
 * Firebase Cloud Messaging Service
 * Handles FCM token registration and push notification permissions
 */

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { generateId } from '@/utils/generateId';
import { getDeviceDoc } from './firestore';

const DEVICE_INSTALLATION_ID_KEY = '@microbreaks/device_installation_id';

async function getInstallationId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_INSTALLATION_ID_KEY);
  if (existing) {
    return existing;
  }

  const installationId = generateId('device');
  await AsyncStorage.setItem(DEVICE_INSTALLATION_ID_KEY, installationId);
  return installationId;
}

async function upsertDeviceRegistration(
  userId: string,
  token: string,
  notificationsEnabled: boolean
): Promise<void> {
  const installationId = await getInstallationId();
  await getDeviceDoc(userId, installationId).set(
    {
      installationId,
      token,
      platform: Platform.OS,
      notificationsEnabled,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

/**
 * Check whether push notification permission is already granted.
 * This is intentionally non-interactive so app startup never triggers a prompt.
 */
export async function hasPushNotificationPermission(): Promise<boolean> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return permissions.granted || permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch (error) {
    if (__DEV__) {
      console.error('[FCM] Failed to read notification permission:', error);
    }
    return false;
  }
}

/**
 * Register for push notifications only when permission is already granted.
 * Saves the FCM token to the user's Firestore document.
 * @returns The FCM token if successful, null otherwise
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  try {
    const enabled = await hasPushNotificationPermission();

    if (!enabled) {
      if (__DEV__) {
        console.log('[FCM] Permission not granted, skipping token registration');
      }
      return null;
    }

    const token = await messaging().getToken();

    await upsertDeviceRegistration(userId, token, true);

    if (__DEV__) {
      console.log('[FCM] Token registered:', token.substring(0, 20) + '...');
    }

    return token;
  } catch (error) {
    if (__DEV__) {
      console.error('[FCM] Failed to register:', error);
    }
    return null;
  }
}

/**
 * Listen for token refresh events and update Firestore
 * @returns Unsubscribe function
 */
export function onTokenRefresh(userId: string): () => void {
  return messaging().onTokenRefresh(async (newToken) => {
    try {
      await upsertDeviceRegistration(userId, newToken, true);

      if (__DEV__) {
        console.log('[FCM] Token refreshed');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[FCM] Failed to update refreshed token:', error);
      }
    }
  });
}

/**
 * Remove this device registration from the current user's document tree.
 * This prevents token leakage when rotating to a fresh anonymous account.
 */
export async function unregisterPushNotifications(userId: string): Promise<void> {
  try {
    const installationId = await AsyncStorage.getItem(DEVICE_INSTALLATION_ID_KEY);
    if (!installationId) {
      return;
    }

    await getDeviceDoc(userId, installationId).delete();

    if (__DEV__) {
      console.log('[FCM] Device registration removed');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[FCM] Failed to unregister device:', error);
    }
  }
}
