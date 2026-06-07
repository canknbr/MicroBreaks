/**
 * Pending Shortcut Handler
 *
 * Bridges the iOS App Intent layer (Siri / Spotlight / Action Button)
 * into the React Native routing layer. App Intents cannot safely call
 * into the JS bridge from their `perform()` method, so they instead
 * write a small descriptor to the App Group, and this service reads
 * + consumes it whenever the app comes to the foreground (or boots).
 *
 * Wiring:
 *   `initializeShortcutHandler()` is called once during the app
 *   bootstrap. It registers a listener on `AppState` and reads the
 *   pending descriptor on every active transition.
 *
 * Routing decisions live here, not in the native side, so the same
 * routing logic also runs on Android (where there is no App Intent —
 * the descriptor stays null and nothing happens) and in tests.
 */

import { AppState, type AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import {
  clearPendingShortcut,
  readPendingShortcut,
  type PendingShortcut,
} from '../../modules/widget-bridge';

/** Ignore descriptors older than this — they're probably stale wakeups. */
const SHORTCUT_FRESHNESS_MS = 5 * 60 * 1000;

let appStateSubscription: { remove: () => void } | null = null;
let isProcessing = false;

async function consumePendingShortcut(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;
  try {
    const pending = await readPendingShortcut();
    if (!pending) return;
    if (!isFresh(pending)) {
      // Stale — clear without acting so a long-ago intent doesn't
      // hijack the current foreground.
      await clearPendingShortcut();
      return;
    }
    await route(pending);
    await clearPendingShortcut();
  } catch (err) {
    if (__DEV__) {
      console.warn('[shortcutHandler] failed to consume pending shortcut', err);
    }
  } finally {
    isProcessing = false;
  }
}

function isFresh(pending: PendingShortcut): boolean {
  const age = Date.now() - pending.requestedAt;
  return age >= 0 && age < SHORTCUT_FRESHNESS_MS;
}

async function route(pending: PendingShortcut): Promise<void> {
  switch (pending.action) {
    case 'start-break': {
      const breakId = pending.payload ?? 'recommended';
      router.push({
        pathname: '/break-session',
        params: { breakId },
      });
      return;
    }
    case 'open-stats': {
      router.push('/(tabs)/stats');
      return;
    }
    default:
      // Unknown action — ignore. Future native versions may emit new
      // action names; the old JS bundle should not crash on them.
      if (__DEV__) {
        console.log(`[shortcutHandler] ignoring unknown action "${pending.action}"`);
      }
  }
}

function handleAppStateChange(next: AppStateStatus): void {
  if (next === 'active') {
    void consumePendingShortcut();
  }
}

export function initializeShortcutHandler(): void {
  if (appStateSubscription) return;
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  // Consume on initial boot too — the user may have launched the app
  // *because* an App Intent fired, in which case AppState is already
  // 'active' and we'd miss the first transition.
  void consumePendingShortcut();
}

export function shutdownShortcutHandler(): void {
  appStateSubscription?.remove();
  appStateSubscription = null;
}
