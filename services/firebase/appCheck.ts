/**
 * Firebase App Check
 *
 * Adds a bot-resistance layer in front of every Firebase product the
 * app calls (Firestore reads/writes, Functions, Storage). With App
 * Check enforcing, a request that doesn't carry a valid attestation
 * token from a real device gets dropped *before* it reaches Firestore
 * — which means the quota stays clean and the security rules never
 * see synthetic traffic.
 *
 * **Activation flow:**
 *   1. `npx expo install @react-native-firebase/app-check`
 *   2. Add the iOS DeviceCheck capability in Xcode signing & capabilities
 *      (or App Attest on iOS 14+).
 *   3. Add the Android Play Integrity provider in the Firebase Console.
 *   4. Enable App Check on each product (Firestore, Functions, etc) in
 *      the Console — start with "monitor mode" for 24h before flipping
 *      to "enforce mode" so you can see legitimate clients that fail
 *      attestation.
 *   5. The lazy-require below picks up the module automatically the
 *      next time prebuild runs.
 *
 * Until step 1, every function below is a graceful no-op — the
 * lazy require fails, the catch swallows it, and the app continues
 * without App Check enforcement. This makes the wiring safe to
 * land before the dashboard side is ready.
 */

import { Platform } from 'react-native';
import { addBreadcrumb } from '@/services/firebase/crashlytics-adapter';

interface AppCheckTokenResult {
  token: string;
}

// Opaque — the providerFactory value returned by
// `firebase.appCheck.AppCheckProviderFactory`. We never inspect it
// directly; we just hand it back to `initializeAppCheck`.
type AppCheckProvider = unknown;

interface AppCheckModuleLike {
  // The shape of the default export from `@react-native-firebase/app-check`.
  // The runtime call signature is `appCheck().initializeAppCheck({...})`.
  (): {
    initializeAppCheck: (options: {
      provider: AppCheckProvider;
      isTokenAutoRefreshEnabled?: boolean;
    }) => Promise<void>;
    getToken: (forceRefresh?: boolean) => Promise<AppCheckTokenResult>;
  };
  newReactNativeFirebaseAppCheckProvider: () => {
    configure: (config: {
      apple?: { provider: 'deviceCheck' | 'appAttest' | 'appAttestWithDeviceCheckFallback'; debugToken?: string };
      android?: { provider: 'playIntegrity' | 'safetyNet' | 'debug'; debugToken?: string };
      web?: { provider: 'reCaptchaV3' | 'reCaptchaEnterprise'; siteKey: string };
    }) => AppCheckProvider;
  };
}

let cached: AppCheckModuleLike | null = null;
let resolved = false;
let initialized = false;

function getAppCheck(): AppCheckModuleLike | null {
  if (resolved) return cached;
  resolved = true;
  try {
    const mod = require('@react-native-firebase/app-check');
    cached = (mod?.default ?? mod) as AppCheckModuleLike;
  } catch {
    cached = null;
  }
  return cached;
}

/** Test seam — pretend App Check isn't installed. */
export function __resetAppCheckForTests(): void {
  cached = null;
  resolved = false;
  initialized = false;
}

/** Test seam — inject a mock App Check module. */
export function __setAppCheckModuleForTests(mod: AppCheckModuleLike | null): void {
  cached = mod;
  resolved = true;
  initialized = false;
}

/**
 * Initialize Firebase App Check with platform-appropriate providers.
 *
 * - iOS uses **App Attest** (iOS 14+) with a DeviceCheck fallback for
 *   older devices. Apple has been deprecating DeviceCheck-only flows.
 * - Android uses **Play Integrity** — the modern replacement for
 *   SafetyNet which was deprecated in 2024.
 * - In dev builds, you'll want to register a debug token in the
 *   Firebase Console; pass it through `EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN`.
 *
 * Safe to call multiple times — the second call is a no-op.
 */
export async function initializeAppCheck(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const mod = getAppCheck();
  if (!mod) return false;
  if (initialized) return true;

  const debugToken = process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN?.trim();

  try {
    const provider = mod.newReactNativeFirebaseAppCheckProvider();
    provider.configure({
      apple: {
        provider: 'appAttestWithDeviceCheckFallback',
        debugToken,
      },
      android: {
        provider: __DEV__ && debugToken ? 'debug' : 'playIntegrity',
        debugToken,
      },
    });

    await mod().initializeAppCheck({
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    initialized = true;
    addBreadcrumb('App Check initialized', 'app-check', 'info', {
      platform: Platform.OS,
      mode: __DEV__ ? 'debug' : 'production',
    });
    return true;
  } catch (e) {
    addBreadcrumb('App Check init failed', 'app-check', 'warning', {
      message: String(e),
    });
    return false;
  }
}

/**
 * Fetch the current App Check token. Useful from a Cloud Function
 * caller that wants to attach the token to an outbound HTTP request.
 * Returns null on any failure so callers can degrade gracefully.
 */
export async function getAppCheckToken(): Promise<string | null> {
  const mod = getAppCheck();
  if (!mod) return null;
  try {
    const result = await mod().getToken(false);
    return result?.token ?? null;
  } catch {
    return null;
  }
}
