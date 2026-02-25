/**
 * Sync Types
 * Type definitions for cloud sync service
 */

export interface SyncMetadata {
  lastSyncedAt: number;
  lastPullAt: number | null;
  lastPushAt: number | null;
  deviceId: string;
}

export type SyncDataType = 'profile' | 'progress' | 'preferences' | 'achievements' | 'settings' | 'break';

/**
 * Settings keys that should be synced across devices.
 * Device-specific settings (sound, haptics, notification permissions) are NOT synced.
 */
export const SYNCABLE_SETTINGS_KEYS = [
  'theme',
  'accentColor',
  'voiceGuidanceEnabled',
  'quietHoursEnabled',
  'quietHoursStart',
  'quietHoursEnd',
  'workDaysOnly',
  'workDays',
  'defaultBreakDuration',
  'autoStartNextStep',
  'showStepPreview',
] as const;

export type SyncableSettingsKey = typeof SYNCABLE_SETTINGS_KEYS[number];

export const DEFAULT_SYNC_METADATA: SyncMetadata = {
  lastSyncedAt: 0,
  lastPullAt: null,
  lastPushAt: null,
  deviceId: '',
};
