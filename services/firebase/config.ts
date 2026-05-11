/**
 * Firebase Configuration & Initialization
 * Central point for Firebase app setup
 */

import firebase from '@react-native-firebase/app';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

let isInitialized = false;
const SETTINGS_STORE_PERSIST_KEY = 'microbreaks-settings';

export interface FirebaseCollectionPreferences {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

function getDefaultCollectionPreferences(): FirebaseCollectionPreferences {
  return {
    analyticsEnabled: true,
    crashReportingEnabled: true,
  };
}

export async function getStoredFirebaseCollectionPreferences(): Promise<FirebaseCollectionPreferences> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORE_PERSIST_KEY);
    if (!raw) {
      return getDefaultCollectionPreferences();
    }

    const parsed = JSON.parse(raw) as {
      state?: {
        settings?: {
          analyticsEnabled?: boolean;
          crashReportingEnabled?: boolean;
        };
      };
    };

    const settings = parsed.state?.settings;
    return {
      analyticsEnabled:
        typeof settings?.analyticsEnabled === 'boolean'
          ? settings.analyticsEnabled
          : true,
      crashReportingEnabled:
        typeof settings?.crashReportingEnabled === 'boolean'
          ? settings.crashReportingEnabled
          : true,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[Firebase] Failed to read privacy preferences:', error);
    }
    return getDefaultCollectionPreferences();
  }
}

export async function setFirebaseCollectionPreferences(
  preferences: FirebaseCollectionPreferences
): Promise<void> {
  const analyticsCollectionEnabled = !__DEV__ && preferences.analyticsEnabled;
  const crashReportingCollectionEnabled = !__DEV__ && preferences.crashReportingEnabled;

  await Promise.all([
    analytics().setAnalyticsCollectionEnabled(analyticsCollectionEnabled),
    crashlytics().setCrashlyticsCollectionEnabled(crashReportingCollectionEnabled),
  ]);
}

/**
 * Initialize Firebase services.
 * Firebase auto-initializes from google-services.json / GoogleService-Info.plist,
 * but we use this to configure additional settings.
 */
export async function initializeFirebase(): Promise<void> {
  if (isInitialized) return;

  // Firebase auto-initializes from native config files.
  // Verify it's available so bootstrap can block instead of silently continuing.
  if (!firebase.apps.length) {
    throw new Error('Firebase app is unavailable. Check native Firebase configuration.');
  }

  try {
    const preferences = await getStoredFirebaseCollectionPreferences();
    await setFirebaseCollectionPreferences(preferences);
  } catch (error) {
    if (__DEV__) {
      console.error('[Firebase] Failed to initialize:', error);
    }
    throw error;
  }

  isInitialized = true;

  if (__DEV__) {
    console.log('[Firebase] Initialized successfully');
  }
}

export { firebase, analytics, crashlytics };
