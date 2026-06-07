/**
 * Zustand persistence adapter backed by MMKV.
 *
 * MMKV is ~10x faster than AsyncStorage and persists synchronously, which
 * removes a class of race conditions during cold start. We still keep an
 * AsyncStorage fallback for the first read of any key so existing users
 * transparently migrate without losing their state on upgrade.
 *
 * Migration semantics (per key):
 *   1. If MMKV already has the key, return it.
 *   2. Else, if AsyncStorage has the key, copy it into MMKV, remove the
 *      legacy entry, return it.
 *   3. Else, return null.
 *
 * Writes always go to MMKV only. The adapter implementation lives behind a
 * `try/catch` per call so a broken storage layer does not break app startup.
 */

import { createMMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

const mmkv = createMMKV({ id: 'microbreaks.zustand' });

// Per-key flag: have we already attempted to migrate this key from
// AsyncStorage? Once set, the slow path is skipped for the rest of the
// process lifetime.
const migrationAttempted = new Set<string>();

function safeParse<T>(raw: string): StorageValue<T> | null {
  try {
    return JSON.parse(raw) as StorageValue<T>;
  } catch {
    return null;
  }
}

export function createMmkvStorage<T>(): PersistStorage<T> {
  return {
    getItem: async (name: string): Promise<StorageValue<T> | null> => {
      try {
        const mmkvValue = mmkv.getString(name);
        if (mmkvValue !== undefined) {
          return safeParse<T>(mmkvValue);
        }

        if (!migrationAttempted.has(name)) {
          migrationAttempted.add(name);
          try {
            const legacy = await AsyncStorage.getItem(name);
            if (legacy !== null) {
              mmkv.set(name, legacy);
              // Best-effort cleanup so the duplicate does not linger.
              void AsyncStorage.removeItem(name).catch(() => {});
              return safeParse<T>(legacy);
            }
          } catch {
            // Ignore — proceed without migration; next launch will retry.
          }
        }

        return null;
      } catch {
        return null;
      }
    },

    setItem: (name: string, value: StorageValue<T>): void => {
      try {
        mmkv.set(name, JSON.stringify(value));
      } catch {
        // Swallow — losing one write is better than crashing the app.
      }
    },

    removeItem: (name: string): void => {
      try {
        mmkv.remove(name);
      } catch {
        // ignore
      }
    },
  };
}

/**
 * Test helper — clears the in-memory migration flag set so test suites can
 * exercise the legacy-migration branch repeatedly.
 */
export function __resetMigrationStateForTests(): void {
  migrationAttempted.clear();
}
