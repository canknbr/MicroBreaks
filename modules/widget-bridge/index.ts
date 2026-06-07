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

interface WidgetBridgeNative {
  writeSnapshot(key: string, json: string): Promise<boolean>;
  reloadTimelines(): Promise<void>;
  reloadTimelinesForKind(kind: string): Promise<void>;
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
