describe('initializeFirebase', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('blocks startup when no Firebase app is available', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const firebaseAppModule = require('@react-native-firebase/app');
    const originalApps = firebaseAppModule.default.apps;

    firebaseAppModule.default.apps = [];

    const { initializeFirebase } = require('@/services/firebase/config');

    await expect(initializeFirebase()).rejects.toThrow(
      'Firebase app is unavailable. Check native Firebase configuration.'
    );

    firebaseAppModule.default.apps = originalApps;
    consoleErrorSpy.mockRestore();
  });

  it('surfaces collection preference failures to bootstrap', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const analyticsModule = require('@react-native-firebase/analytics');
    const crashlyticsModule = require('@react-native-firebase/crashlytics');

    (analyticsModule.default().setAnalyticsCollectionEnabled as jest.Mock).mockRejectedValueOnce(
      new Error('analytics unavailable')
    );
    (crashlyticsModule.default().setCrashlyticsCollectionEnabled as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    const { initializeFirebase } = require('@/services/firebase/config');

    await expect(initializeFirebase()).rejects.toThrow('analytics unavailable');

    consoleErrorSpy.mockRestore();
  });
});
