describe('initializeFirestore', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('tolerates already-applied Firestore settings errors', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const firestoreModule = require('@react-native-firebase/firestore');

    (firestoreModule.default().settings as jest.Mock).mockRejectedValueOnce({
      code: 'failed-precondition',
      message: 'Firestore settings can only be set before any other Firestore call.',
    });

    const { initializeFirestore } = require('@/services/firebase/firestore');

    await expect(initializeFirestore()).resolves.toBeUndefined();

    consoleWarnSpy.mockRestore();
  });

  it('surfaces unexpected Firestore initialization failures', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const firestoreModule = require('@react-native-firebase/firestore');

    (firestoreModule.default().settings as jest.Mock).mockRejectedValueOnce(
      new Error('disk full')
    );

    const { initializeFirestore } = require('@/services/firebase/firestore');

    await expect(initializeFirestore()).rejects.toThrow('disk full');

    consoleErrorSpy.mockRestore();
  });
});
