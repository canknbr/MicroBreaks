/**
 * Widget Data Bridge
 *
 * Singleton that keeps the native widget's `WidgetSnapshot` in lock-step
 * with whatever the user is doing in the JS layer. Subscribes to the
 * stores the widget cares about (user profile / progress, break history,
 * onboarding inputs for the recommendation engine), rebuilds the
 * snapshot on a debounce, and flushes the result to two places:
 *
 *   1. AsyncStorage at `WIDGET_SNAPSHOT_STORAGE_KEY` — durable, JS-readable
 *      audit trail. Useful for tests, devtools, and rehydrating after a
 *      crash.
 *   2. The native bridge (`writeToNativeAppGroup`) — the App Group
 *      UserDefaults the widget actually reads. Stub today; the Wave 2
 *      Widget Extension wires the real native side.
 *
 * Architecture mirrors `syncService` (initialize / shutdown / queue) so
 * call sites are familiar, and so we never have two services racing for
 * the same store events.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/store/userStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { getBreakHistory } from '@/services/breakHistory';
import { getSuggestedBreak } from '@/services/recommendations/engine';
import { buildWidgetSnapshot } from './snapshot';
import {
  EMPTY_WIDGET_SNAPSHOT,
  type WidgetSnapshot,
} from './types';

export const WIDGET_SNAPSHOT_STORAGE_KEY = '@microbreaks/widget_snapshot';

/** Native module surface — Wave 2 (Widget Extension) provides the real one. */
interface NativeWidgetBridge {
  writeSnapshot(json: string): Promise<void>;
  /** Tells the OS to refresh widget timelines. */
  reloadTimelines(): Promise<void>;
}

/**
 * Default no-op bridge. The real implementation lands when the Widget
 * Extension target ships in Wave 2; it bridges `UserDefaults(suiteName:
 * "group.com.cankanbur.MicroBreaks")` + `WidgetCenter.shared.reloadAllTimelines()`.
 */
const noopNativeBridge: NativeWidgetBridge = {
  async writeSnapshot() {
    /* no-op until the App Group + native module ship */
  },
  async reloadTimelines() {
    /* no-op */
  },
};

let nativeBridge: NativeWidgetBridge = noopNativeBridge;

/**
 * Inject a real native bridge once Wave 2 is wired. Kept exported so
 * tests can swap in a spy. Idempotent.
 */
export function setWidgetNativeBridge(bridge: NativeWidgetBridge | null) {
  nativeBridge = bridge ?? noopNativeBridge;
}

interface WidgetDataBridge {
  initialize(): Promise<void>;
  shutdown(): void;
  /** Force an immediate snapshot rebuild + flush. */
  flushNow(): Promise<WidgetSnapshot>;
  /** Read the most recently flushed snapshot. */
  getCurrent(): WidgetSnapshot;
  /** Subscribe to snapshot updates; returns an unsubscribe. */
  subscribe(listener: (snapshot: WidgetSnapshot) => void): () => void;
}

class WidgetDataBridgeImpl implements WidgetDataBridge {
  private current: WidgetSnapshot = EMPTY_WIDGET_SNAPSHOT;
  private listeners = new Set<(snapshot: WidgetSnapshot) => void>();
  private storeUnsubscribes: Array<() => void> = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  private static readonly DEBOUNCE_MS = 750;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    // Rehydrate from persisted snapshot so the widget has *something* to
    // render before the first store event fires. Failures are non-fatal
    // — we'll just rebuild from live store state in a moment anyway.
    try {
      const cached = await AsyncStorage.getItem(WIDGET_SNAPSHOT_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as WidgetSnapshot;
        if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed) {
          this.current = parsed;
        }
      }
    } catch {
      /* corrupt cache — ignore, the rebuild will overwrite it */
    }

    // Subscribe to the stores. Each fires the same debounced rebuild;
    // we don't care which event triggered it, only that a rebuild is
    // due "soon".
    this.storeUnsubscribes.push(
      useUserStore.subscribe(() => this.scheduleRebuild()),
      useOnboardingStore.subscribe(() => this.scheduleRebuild())
    );

    // First rebuild immediately so the widget gets fresh data on app
    // launch even if the user never touches anything.
    await this.flushNow();
  }

  shutdown(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.storeUnsubscribes.forEach((unsub) => unsub());
    this.storeUnsubscribes = [];
    this.listeners.clear();
    this.initialized = false;
  }

  private scheduleRebuild(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flushNow();
    }, WidgetDataBridgeImpl.DEBOUNCE_MS);
  }

  async flushNow(): Promise<WidgetSnapshot> {
    try {
      const snapshot = await this.compose();
      this.current = snapshot;
      const payload = JSON.stringify(snapshot);

      // Best-effort dual write. A failure on either path must not throw
      // — the widget gracefully shows whatever it had before.
      await Promise.allSettled([
        AsyncStorage.setItem(WIDGET_SNAPSHOT_STORAGE_KEY, payload),
        nativeBridge.writeSnapshot(payload),
      ]);

      await nativeBridge.reloadTimelines().catch(() => {});

      this.notify();
      return snapshot;
    } catch (err) {
      if (__DEV__) {
        console.warn('[widgetDataBridge] flush failed', err);
      }
      return this.current;
    }
  }

  getCurrent(): WidgetSnapshot {
    return this.current;
  }

  subscribe(listener: (snapshot: WidgetSnapshot) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.current);
      } catch (err) {
        if (__DEV__) {
          console.warn('[widgetDataBridge] listener failed', err);
        }
      }
    });
  }

  /**
   * Pulls live state from the JS stores and runs the recommendation
   * engine, then hands everything to the pure `buildWidgetSnapshot`
   * transform.
   */
  private async compose(): Promise<WidgetSnapshot> {
    const userState = useUserStore.getState();
    const onboarding = useOnboardingStore.getState();
    const history = await getBreakHistory().catch(() => []);

    const todayCount = countTodayBreaks(history);

    const suggestion = getSuggestedBreak(
      onboarding.data.painAreas ?? [],
      onboarding.data.painSeverity ?? {},
      onboarding.data.breakStyle ?? [],
      userState.preferences.recentBreaks ?? [],
      todayCount
    );

    const recommendation = suggestion
      ? {
          breakId: suggestion.exercise.id,
          title: suggestion.exercise.title,
          icon: suggestion.exercise.icon,
          color: suggestion.exercise.color,
          durationMin: Math.max(1, Math.round(suggestion.exercise.totalDuration / 60)),
        }
      : null;

    return buildWidgetSnapshot({
      profile: userState.profile,
      progress: userState.progress,
      history,
      recommendation,
    });
  }
}

function countTodayBreaks(history: { completedAt: string }[]): number {
  const today = new Date();
  let count = 0;
  for (const entry of history) {
    const d = new Date(entry.completedAt);
    if (
      !Number.isNaN(d.getTime()) &&
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    ) {
      count += 1;
    }
  }
  return count;
}

export const widgetDataBridge: WidgetDataBridge = new WidgetDataBridgeImpl();
