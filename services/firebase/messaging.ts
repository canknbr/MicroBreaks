/**
 * Firebase Cloud Messaging Service
 * Handles FCM token registration and push notification permissions
 */

import messaging from '@react-native-firebase/messaging';
import { getUserDoc } from './firestore';

/**
 * Request permission and register for push notifications.
 * Saves the FCM token to the user's Firestore document.
 * @returns The FCM token if successful, null otherwise
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      if (__DEV__) {
        console.log('[FCM] Permission not granted');
      }
      return null;
    }

    const token = await messaging().getToken();

    // Save token to Firestore
    await getUserDoc(userId).set(
      { fcmToken: token, fcmTokenUpdatedAt: Date.now() },
      { merge: true }
    );

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
      await getUserDoc(userId).set(
        { fcmToken: newToken, fcmTokenUpdatedAt: Date.now() },
        { merge: true }
      );

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
