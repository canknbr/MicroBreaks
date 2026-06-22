/**
 * Sync bridge — the seam between the state layer and the sync service.
 *
 * Stores must not import the `syncService` singleton directly: that created a
 * circular dependency (stores → sync → stores) and forced every mutator to
 * repeat an `if (!syncService.isSyncPulling())` guard. Instead stores call the
 * `notify*` functions here, and the sync service registers itself as the
 * handler on initialize. The bridge owns the single "applying remote data"
 * flag so echo-suppression lives in one place rather than at ~20 call sites.
 */

import type { SyncDataType } from '@/services/sync/types';

type DataChangeHandler = (type: SyncDataType, data?: unknown) => unknown;
type SettingsChangeHandler = () => void;

export interface SyncBridgeHandlers {
  onDataChange: DataChangeHandler;
  onSettingsChange: SettingsChangeHandler;
}

let dataChangeHandler: DataChangeHandler | null = null;
let settingsChangeHandler: SettingsChangeHandler | null = null;
let applyingRemoteData = false;

/** Wire the sync service into the bridge. Called from `syncService.initialize`. */
export function registerSyncHandlers(handlers: SyncBridgeHandlers): void {
  dataChangeHandler = handlers.onDataChange;
  settingsChangeHandler = handlers.onSettingsChange;
}

/** Unwire on teardown so post-shutdown mutations don't reach a stale service. */
export function clearSyncHandlers(): void {
  dataChangeHandler = null;
  settingsChangeHandler = null;
}

/**
 * Mark the window during which sync is writing remote data into the stores.
 * Mutations triggered by that write must not echo back as outbound pushes, so
 * `notify*` are suppressed while this is true.
 */
export function setApplyingRemoteData(value: boolean): void {
  applyingRemoteData = value;
}

export function isApplyingRemoteData(): boolean {
  return applyingRemoteData;
}

/**
 * Notify the sync layer that a syncable slice changed locally. Returns the
 * handler's result (a Promise for user-doc pushes) so callers that need to
 * await the push — e.g. the progress side-effects flush — can do so.
 */
export function notifyDataChange(type: SyncDataType, data?: unknown): unknown {
  if (applyingRemoteData || !dataChangeHandler) return undefined;
  return dataChangeHandler(type, data);
}

/** Notify the sync layer that settings changed locally (debounced downstream). */
export function notifySettingsChange(): void {
  if (applyingRemoteData || !settingsChangeHandler) return;
  settingsChangeHandler();
}
