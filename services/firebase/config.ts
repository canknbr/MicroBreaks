/**
 * Firebase Configuration & Initialization
 * Central point for Firebase app setup
 */

import firebase from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

let isInitialized = false;

/**
 * Initialize Firebase services.
 * Firebase auto-initializes from google-services.json / GoogleService-Info.plist,
 * but we use this to configure additional settings.
 */
export async function initializeFirebase(): Promise<void> {
  if (isInitialized) return;

  try {
    // Firebase auto-initializes from native config files.
    // Verify it's available:
    if (!firebase.apps.length) {
      console.warn('[Firebase] No Firebase app initialized. Check native config files.');
      return;
    }

    // Enable Crashlytics collection (can be disabled for opt-out)
    await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);

    // Enable Analytics collection
    await analytics().setAnalyticsCollectionEnabled(!__DEV__);

    isInitialized = true;

    if (__DEV__) {
      console.log('[Firebase] Initialized successfully');
    }
  } catch (error) {
    console.error('[Firebase] Failed to initialize:', error);
  }
}

export { firebase, analytics, crashlytics };
