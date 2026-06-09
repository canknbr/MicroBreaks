import { Platform } from 'react-native';
import {
  __resetAppCheckForTests,
  __setAppCheckModuleForTests,
  getAppCheckToken,
  initializeAppCheck,
} from '@/services/firebase/appCheck';

describe('App Check adapter', () => {
  beforeEach(() => {
    __resetAppCheckForTests();
    (Platform as { OS: string }).OS = 'ios';
  });

  it('initializeAppCheck returns false when the package is not installed', async () => {
    __setAppCheckModuleForTests(null);
    const ok = await initializeAppCheck();
    expect(ok).toBe(false);
  });

  it('initializeAppCheck is a no-op on web', async () => {
    (Platform as { OS: string }).OS = 'web';
    __setAppCheckModuleForTests(null);
    const ok = await initializeAppCheck();
    expect(ok).toBe(false);
  });

  it('getAppCheckToken returns null when the package is not installed', async () => {
    __setAppCheckModuleForTests(null);
    const token = await getAppCheckToken();
    expect(token).toBeNull();
  });

  it('initializeAppCheck configures providers and resolves true on success', async () => {
    const configure = jest.fn();
    const newReactNativeFirebaseAppCheckProvider = jest.fn(() => ({ configure }));
    const initializeAppCheckCall = jest.fn().mockResolvedValue(undefined);
    const mockModule = Object.assign(
      jest.fn(() => ({
        initializeAppCheck: initializeAppCheckCall,
        getToken: jest.fn(),
      })),
      { newReactNativeFirebaseAppCheckProvider }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __setAppCheckModuleForTests(mockModule as any);

    const ok = await initializeAppCheck();
    expect(ok).toBe(true);
    expect(newReactNativeFirebaseAppCheckProvider).toHaveBeenCalledTimes(1);
    expect(configure).toHaveBeenCalledTimes(1);
    expect(initializeAppCheckCall).toHaveBeenCalledTimes(1);
  });

  it('initializeAppCheck is idempotent — second call is a no-op', async () => {
    const initializeAppCheckCall = jest.fn().mockResolvedValue(undefined);
    const mockModule = Object.assign(
      jest.fn(() => ({
        initializeAppCheck: initializeAppCheckCall,
        getToken: jest.fn(),
      })),
      {
        newReactNativeFirebaseAppCheckProvider: () => ({ configure: jest.fn() }),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __setAppCheckModuleForTests(mockModule as any);

    await initializeAppCheck();
    await initializeAppCheck();
    expect(initializeAppCheckCall).toHaveBeenCalledTimes(1);
  });

  it('initializeAppCheck resolves false when the native call throws', async () => {
    const mockModule = Object.assign(
      jest.fn(() => ({
        initializeAppCheck: jest.fn().mockRejectedValue(new Error('boom')),
        getToken: jest.fn(),
      })),
      {
        newReactNativeFirebaseAppCheckProvider: () => ({ configure: jest.fn() }),
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __setAppCheckModuleForTests(mockModule as any);

    const ok = await initializeAppCheck();
    expect(ok).toBe(false);
  });
});
