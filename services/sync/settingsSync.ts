/**
 * Settings Sync Service
 * Syncs only syncable settings keys (not device-specific ones)
 */

import { getUserDoc } from '@/services/firebase/firestore';
import { useSettingsStore } from '@/store/settingsStore';
import type { AppSettings } from '@/store/settingsStore';
import { SYNCABLE_SETTINGS_KEYS, type SyncableSettingsKey } from './types';

type SyncableSettings = Pick<AppSettings, SyncableSettingsKey>;

/**
 * Extract only the syncable settings from full settings object
 */
export function extractSyncableSettings(settings: AppSettings): SyncableSettings {
  const syncable: Partial<SyncableSettings> = {};
  for (const key of SYNCABLE_SETTINGS_KEYS) {
    (syncable as Record<string, unknown>)[key] = settings[key];
  }
  return syncable as SyncableSettings;
}

/**
 * Push syncable settings to Firestore
 */
export async function pushSettings(userId: string): Promise<void> {
  const { settings } = useSettingsStore.getState();
  const syncable = extractSyncableSettings(settings);

  await getUserDoc(userId).set(
    { settings: { ...syncable, updatedAt: Date.now() } },
    { merge: true }
  );

  if (__DEV__) {
    console.log('[SettingsSync] Pushed settings');
  }
}

/**
 * Pull settings from Firestore and merge only syncable keys
 * Accepts an optional pre-fetched document to avoid redundant Firestore reads
 */
export async function pullSettings(userId: string, prefetchedDoc?: any): Promise<void> {
  const doc = prefetchedDoc ?? await getUserDoc(userId).get();

  if (!doc.exists) return;

  const data = doc.data();
  const remoteSettings = data?.settings as (SyncableSettings & { updatedAt?: number }) | undefined;

  if (!remoteSettings) return;

  // Compare timestamps: only apply remote if newer than local
  const localUpdatedAt = useSettingsStore.getState().settingsUpdatedAt ?? 0;
  const remoteUpdatedAt = remoteSettings.updatedAt ?? 0;

  if (remoteUpdatedAt <= localUpdatedAt) return;

  // Only apply syncable keys, preserving local-only settings
  const updates: Partial<AppSettings> = {};
  for (const key of SYNCABLE_SETTINGS_KEYS) {
    if (key in remoteSettings) {
      (updates as Record<string, unknown>)[key] = remoteSettings[key];
    }
  }

  if (Object.keys(updates).length > 0) {
    // Use setState directly to avoid triggering sync hooks
    useSettingsStore.setState((state) => ({
      settings: { ...state.settings, ...updates },
      settingsUpdatedAt: remoteUpdatedAt,
    }));
  }

  if (__DEV__) {
    console.log('[SettingsSync] Pulled and applied remote settings');
  }
}
