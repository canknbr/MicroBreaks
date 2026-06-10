/**
 * Blob storage backed by MMKV with one-time AsyncStorage migration.
 *
 * Mirrors the public surface of `services/storage.ts`'s raw get/set/remove
 * helpers so the service layer (break history, user stats, streak data,
 * analytics outbox) can swap backends without touching its callers.
 *
 * Behavioural contract:
 *
 *   - **Reads** check MMKV first; on miss they perform a one-shot
 *     migration from AsyncStorage (copy → delete legacy) so existing
 *     users transparently roll over on upgrade. Subsequent reads of the
 *     same key skip the slow path forever via an in-process flag.
 *   - **Writes** go to MMKV only. AsyncStorage is never written again.
 *   - **Removes** clear MMKV; the AsyncStorage legacy is also
 *     best-effort-cleared in case it survived a half-migration.
 *
 * The blob bucket lives in its own MMKV id (`microbreaks.blobs`) so a
 * `clearAll` here can't accidentally nuke Zustand persistence — the
 * Zustand adapter uses a separate id (`microbreaks.zustand`).
 *
 * All functions keep the existing async signatures so call sites stay
 * unchanged. Under the hood MMKV is synchronous; the awaits are no-ops
 * but preserve API compatibility.
 */

import { createMMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mmkv = createMMKV({ id: 'microbreaks.blobs' });

// Per-key migration latch so we hit AsyncStorage at most once per
// process lifetime per key.
const migrationAttempted = new Set<string>();

async function migrateFromAsyncStorage(key: string): Promise<string | null> {
  if (migrationAttempted.has(key)) return null;
  migrationAttempted.add(key);
  try {
    const legacy = await AsyncStorage.getItem(key);
    if (legacy !== null) {
      try {
        mmkv.set(key, legacy);
      } catch {
        // MMKV write failed — surface the legacy value anyway so the
        // app keeps working, but don't claim the migration succeeded
        // (we'll retry next launch by clearing the latch on restart).
        migrationAttempted.delete(key);
        return legacy;
      }
      // Best-effort cleanup. A failed delete is harmless — subsequent
      // reads find the key in MMKV first.
      void AsyncStorage.removeItem(key).catch(() => {});
      return legacy;
    }
  } catch {
    // AsyncStorage error — treat as no legacy data. Migration won't
    // retry within this process; that's acceptable.
  }
  return null;
}

export async function blobGetString(key: string): Promise<string | null> {
  try {
    const cached = mmkv.getString(key);
    if (cached !== undefined) {
      return cached;
    }
    return await migrateFromAsyncStorage(key);
  } catch {
    return null;
  }
}

export async function blobSetString(key: string, value: string): Promise<void> {
  // Synchronous in practice; the promise shape keeps the API stable.
  mmkv.set(key, value);
  // If a stale AsyncStorage copy still exists from a partial migration,
  // remove it so future reads don't see two divergent values.
  if (!migrationAttempted.has(key)) {
    migrationAttempted.add(key);
    void AsyncStorage.removeItem(key).catch(() => {});
  }
}

export async function blobRemove(key: string): Promise<void> {
  try {
    mmkv.remove(key);
  } catch {
    // ignore
  }
  // Belt-and-braces: a legacy AsyncStorage copy could still linger if
  // the user hadn't read this key yet since upgrade.
  void AsyncStorage.removeItem(key).catch(() => {});
  migrationAttempted.add(key);
}

export async function blobMultiRemove(keys: ReadonlyArray<string>): Promise<void> {
  for (const key of keys) {
    try {
      mmkv.remove(key);
    } catch {
      // continue on individual failure
    }
  }
  // AsyncStorage's multiRemove is a single round-trip; use it for the
  // legacy sweep.
  try {
    await AsyncStorage.multiRemove([...keys]);
  } catch {
    // ignore
  }
  for (const key of keys) migrationAttempted.add(key);
}

/**
 * Remove every blob whose key matches one of the provided prefixes.
 * Used by `sessionReset.clearAppStorage` to nuke per-user state on
 * "sign out" / "delete account" without touching Zustand persistence.
 *
 * MMKV's `getAllKeys` is synchronous — fine to call on the JS thread.
 */
export async function blobRemoveByPrefixes(
  prefixes: ReadonlyArray<string>,
): Promise<void> {
  try {
    const allKeys = mmkv.getAllKeys();
    const matches = allKeys.filter((k) =>
      prefixes.some((p) => k.startsWith(p)),
    );
    for (const key of matches) {
      try {
        mmkv.remove(key);
      } catch {
        // continue
      }
      migrationAttempted.add(key);
    }
  } catch {
    // ignore — best-effort cleanup
  }
}

/**
 * Test seam — wipes the migration latch so a suite can re-exercise the
 * AsyncStorage → MMKV transfer in successive cases.
 */
export function __resetBlobMigrationStateForTests(): void {
  migrationAttempted.clear();
  try {
    mmkv.clearAll();
  } catch {
    // ignore
  }
}
