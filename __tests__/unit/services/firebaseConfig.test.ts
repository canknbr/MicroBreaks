import AsyncStorage from '@react-native-async-storage/async-storage';
import firebaseAnalytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  getStoredFirebaseCollectionPreferences,
  setFirebaseCollectionPreferences,
} from '@/services/firebase/config';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('Firebase config privacy preferences', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('reads persisted analytics and crash reporting preferences from settings storage', async () => {
    await AsyncStorage.setItem(
      'microbreaks-settings',
      JSON.stringify({
        state: {
          settings: {
            analyticsEnabled: false,
            crashReportingEnabled: true,
          },
        },
      })
    );

    const preferences = await getStoredFirebaseCollectionPreferences();

    expect(preferences).toEqual({
      analyticsEnabled: false,
      crashReportingEnabled: true,
    });
  });

  it('applies Firebase collection preferences with dev-mode guardrails', async () => {
    await setFirebaseCollectionPreferences({
      analyticsEnabled: true,
      crashReportingEnabled: true,
    });

    expect(firebaseAnalytics().setAnalyticsCollectionEnabled).toHaveBeenCalledWith(!__DEV__);
    expect(crashlytics().setCrashlyticsCollectionEnabled).toHaveBeenCalledWith(!__DEV__);
  });
});
