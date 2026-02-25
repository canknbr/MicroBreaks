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
 */
export async function pullSettings(userId: string): Promise<void> {
  const doc = await getUserDoc(userId).get();

  if (!doc.exists) return;

  const data = doc.data();
  const remoteSettings = data?.settings as (SyncableSettings & { updatedAt?: number }) | undefined;

  if (!remoteSettings) return;

  // Only apply syncable keys, preserving local-only settings
  const updates: Partial<AppSettings> = {};
  for (const key of SYNCABLE_SETTINGS_KEYS) {
    if (key in remoteSettings) {
      (updates as Record<string, unknown>)[key] = remoteSettings[key];
    }
  }

  if (Object.keys(updates).length > 0) {
    useSettingsStore.getState().updateSettings(updates);
  }

  if (__DEV__) {
    console.log('[SettingsSync] Pulled and applied remote settings');
  }
}
