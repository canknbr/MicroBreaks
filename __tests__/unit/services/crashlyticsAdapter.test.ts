describe('initializeCrashlytics', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('surfaces native initialization failures', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const crashlyticsModule = require('@react-native-firebase/crashlytics');

    (crashlyticsModule.default().setAttribute as jest.Mock).mockRejectedValueOnce(
      new Error('crashlytics unavailable')
    );

    const { initializeCrashlytics } = require('@/services/firebase/crashlytics-adapter');

    await expect(initializeCrashlytics()).rejects.toThrow('crashlytics unavailable');

    consoleErrorSpy.mockRestore();
  });
});
