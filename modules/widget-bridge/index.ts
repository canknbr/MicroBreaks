/**
 * widget-bridge — JS bindings for the local iOS WidgetBridge module.
 *
 * Wraps `requireNativeModule('WidgetBridge')` in a feature-detect so the
 * import never throws on platforms where the native side is unavailable:
 *   - Android (no widget extension target)
 *   - Web
 *   - iOS before `expo prebuild` has been run with the @bacons/apple-targets plugin
 *   - Jest, where there is no native module at all
 *
 * When the native module is absent, every API resolves with `false` /
 * `undefined` so callers can fire-and-forget. The `isAvailable` flag
 * lets debug surfaces show whether the bridge is actually live.
 */

import { Platform } from 'react-native';

export interface LiveActivityStartParams {
  breakId: string;
  title: string;
  icon: string;
  /** Hex string `#RRGGBB`. */
  colorHex: string;
  totalSeconds: number;
  timeRemainingSec: number;
  isPaused: boolean;
  /** 0..1 fraction complete. */
  progress: number;
  stepLabel?: string;
}

export interface LiveActivityUpdateParams {
  activityId: string;
  timeRemainingSec: number;
  isPaused: boolean;
  progress: number;
  stepLabel?: string;
}

export interface LiveActivityEndParams {
  activityId: string;
  /** Seconds to show the final frame before the activity disappears. */
  dismissalSeconds?: number;
  timeRemainingSec?: number;
  isPaused?: boolean;
  progress?: number;
  stepLabel?: string;
}

interface WidgetBridgeNative {
  writeSnapshot(key: string, json: string): Promise<boolean>;
  reloadTimelines(): Promise<void>;
  reloadTimelinesForKind(kind: string): Promise<void>;
  startBreakActivity(params: LiveActivityStartParams): Promise<string>;
  updateBreakActivity(params: LiveActivityUpdateParams): Promise<void>;
  endBreakActivity(params: LiveActivityEndParams): Promise<void>;
  areActivitiesEnabled(): boolean;
}

let nativeModule: WidgetBridgeNative | null = null;

if (Platform.OS === 'ios') {
  try {
    // Lazy require so platforms without expo-modules-core don't blow up
    // at import time; the require itself is wrapped in try/catch so a
    // missing native binding before prebuild doesn't crash the JS bundle.
     
    const { requireNativeModule } = require('expo-modules-core') as {
      requireNativeModule: <T>(name: string) => T;
    };
    nativeModule = requireNativeModule<WidgetBridgeNative>('WidgetBridge');
  } catch {
    nativeModule = null;
  }
}

export const widgetBridgeIsAvailable = nativeModule != null;

export async function writeSnapshot(key: string, json: string): Promise<boolean> {
  if (!nativeModule) return false;
  try {
    return await nativeModule.writeSnapshot(key, json);
  } catch {
    return false;
  }
}

export async function reloadTimelines(): Promise<void> {
  if (!nativeModule) return;
  try {
    await nativeModule.reloadTimelines();
  } catch {
    /* swallow — a missed reload is recoverable on the next refresh */
  }
}

export async function reloadTimelinesForKind(kind: string): Promise<void> {
  if (!nativeModule) return;
  try {
    await nativeModule.reloadTimelinesForKind(kind);
  } catch {
    /* swallow */
  }
}

// ===========================================================
// Live Activity bindings (iOS 16.2+; no-op on other platforms)
// ===========================================================

/**
 * True when the user has Live Activities turned on in iOS Settings.
 * Always false on Android / web / pre-prebuild iOS.
 */
export function areActivitiesEnabled(): boolean {
  if (!nativeModule) return false;
  try {
    return nativeModule.areActivitiesEnabled();
  } catch {
    return false;
  }
}

/**
 * Start a Live Activity for an in-progress break. Returns the activity
 * ID on success, an empty string if the system declined (throttling,
 * disabled, iOS < 16.2). Always resolves; never throws.
 */
export async function startBreakActivity(
  params: LiveActivityStartParams
): Promise<string> {
  if (!nativeModule) return '';
  try {
    return await nativeModule.startBreakActivity(params);
  } catch {
    return '';
  }
}

/**
 * Push a new content state into the running activity. A missing
 * activity (already ended, never started) is treated as a no-op so a
 * stale tick from a finished session never throws.
 */
export async function updateBreakActivity(
  params: LiveActivityUpdateParams
): Promise<void> {
  if (!nativeModule) return;
  try {
    await nativeModule.updateBreakActivity(params);
  } catch {
    /* swallow — next tick will retry */
  }
}

/**
 * End the running activity. Pass `dismissalSeconds` to control how long
 * the user sees the final frame (typically 2–4 seconds for a "Done!"
 * pulse); default 0 means tear down immediately.
 */
export async function endBreakActivity(
  params: LiveActivityEndParams
): Promise<void> {
  if (!nativeModule) return;
  try {
    await nativeModule.endBreakActivity(params);
  } catch {
    /* swallow */
  }
}
