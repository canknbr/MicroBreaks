/**
 * HealthKit Source
 *
 * Adapter around `react-native-health` for writing Mindful Session
 * samples. Like `calendarSource`, this module fails open in every
 * direction:
 *
 *   - Module not installed → no-op write.
 *   - User has not granted Mindful Session permission → no-op write.
 *   - Native call throws → swallow, log breadcrumb, continue.
 *
 * The premise: a missed Health write is far less harmful than a
 * crashed break-completion flow. Breaks are user-visible work; Health
 * mirroring is a quiet courtesy.
 *
 * Activation:
 *   1. `npx expo install react-native-health`
 *   2. Add NSHealthShareUsageDescription / NSHealthUpdateUsageDescription
 *      to `app.json -> ios.infoPlist`.
 *   3. Add HealthKit capability via @bacons/apple-targets or a small
 *      config plugin.
 *   4. Prebuild.
 *   5. Call `requestMindfulSessionPermission()` from onboarding once.
 *
 * Until those steps are done the lazy require returns null and every
 * function below is a graceful no-op.
 */

import { Platform } from 'react-native';
import { addBreadcrumb } from '@/services/firebase/crashlytics-adapter';
import type { MindfulSample } from './mindfulMinutes';

interface HealthPermissions {
  permissions: {
    read?: string[];
    write?: string[];
  };
}

interface HealthValue {
  Permissions?: {
    MindfulSession?: string;
  };
  Constants?: {
    Permissions?: {
      MindfulSession?: string;
    };
  };
}

interface HealthKitLike {
  Constants?: HealthValue['Constants'];
  initHealthKit: (
    permissions: HealthPermissions,
    callback: (err: string | null) => void
  ) => void;
  saveMindfulSession: (
    options: { startDate: string; endDate: string },
    callback: (err: string | null, result?: unknown) => void
  ) => void;
}

let cached: HealthKitLike | null = null;
let resolved = false;
let initialized = false;

function getHealthKit(): HealthKitLike | null {
  if (Platform.OS !== 'ios') return null;
  if (resolved) return cached;
  resolved = true;
  try {
    const mod = require('react-native-health');
    cached = (mod?.default ?? mod) as HealthKitLike;
  } catch {
    cached = null;
  }
  return cached;
}

/** Test seam — pretend HealthKit is unavailable. */
export function __resetHealthKitSourceForTests(): void {
  cached = null;
  resolved = false;
  initialized = false;
}

/** Test seam — inject a mock HealthKit module. */
export function __setHealthKitModuleForTests(mod: HealthKitLike | null): void {
  cached = mod;
  resolved = true;
  initialized = false;
}

/**
 * One-time permission request for write-access to Mindful Sessions.
 * Idempotent — subsequent calls hit the cached `initialized` flag and
 * resolve immediately. Returns `true` if HealthKit accepted the
 * permission grant (or was already initialized), `false` if anything
 * went wrong.
 */
export async function requestMindfulSessionPermission(): Promise<boolean> {
  const Health = getHealthKit();
  if (!Health) return false;
  if (initialized) return true;

  const mindfulPerm =
    Health.Constants?.Permissions?.MindfulSession ?? 'MindfulSession';

  return new Promise<boolean>((resolve) => {
    try {
      Health.initHealthKit(
        { permissions: { write: [mindfulPerm] } },
        (err) => {
          if (err) {
            addBreadcrumb('HealthKit init failed', 'health', 'warning', { err });
            resolve(false);
            return;
          }
          initialized = true;
          resolve(true);
        }
      );
    } catch (e) {
      addBreadcrumb('HealthKit init threw', 'health', 'error', {
        message: String(e),
      });
      resolve(false);
    }
  });
}

/**
 * Write a single Mindful Session. Always resolves — never rejects.
 * The boolean indicates success only for observability.
 */
export async function writeMindfulSession(sample: MindfulSample): Promise<boolean> {
  const Health = getHealthKit();
  if (!Health) return false;

  return new Promise<boolean>((resolve) => {
    try {
      Health.saveMindfulSession(
        {
          startDate: new Date(sample.startMs).toISOString(),
          endDate: new Date(sample.endMs).toISOString(),
        },
        (err) => {
          if (err) {
            addBreadcrumb('HealthKit write failed', 'health', 'warning', { err });
            resolve(false);
            return;
          }
          resolve(true);
        }
      );
    } catch (e) {
      addBreadcrumb('HealthKit write threw', 'health', 'error', {
        message: String(e),
      });
      resolve(false);
    }
  });
}
