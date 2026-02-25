/**
 * Sync Service Orchestrator
 * Coordinates all sync operations between local and cloud storage
 */

import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { generateId } from '@/utils/generateId';
import { getItem, setItem } from '@/services/storage';
import { pushUserProfile, pullUserProfile } from './userSync';
import { pushBreakHistory, pullBreakHistory, pushSingleBreak } from './breakSync';
import { pushSettings, pullSettings } from './settingsSync';
import type { SyncDataType, SyncMetadata } from './types';
import { DEFAULT_SYNC_METADATA } from './types';
import type { CompletedBreak } from '@/services/storage';

const SYNC_METADATA_KEY = '@microbreaks/sync_metadata';
const SETTINGS_DEBOUNCE_MS = 3000;

class SyncService {
  private userId: string | null = null;
  private metadata: SyncMetadata = { ...DEFAULT_SYNC_METADATA };
  private netInfoUnsubscribe: (() => void) | null = null;
  private appStateSubscription: { remove: () => void } | null = null;
  private settingsDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isSyncing = false;
  private pendingQueue: Array<{ type: SyncDataType; data?: unknown }> = [];

  /**
   * Initialize sync service after authentication
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;

    // Load sync metadata
    const stored = await getItem<SyncMetadata>(SYNC_METADATA_KEY);
    if (stored) {
      this.metadata = stored;
    }

    // Generate device ID if not set
    if (!this.metadata.deviceId) {
      this.metadata.deviceId = generateId('device');
      await this.saveMetadata();
    }

    // Setup listeners
    this.netInfoUnsubscribe = NetInfo.addEventListener(this.handleConnectivityChange);
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    // Perform initial full sync if online
    const netState = await NetInfo.fetch();
    if (netState.isConnected) {
      await this.performFullSync();
    }

    if (__DEV__) {
      console.log('[SyncService] Initialized for user:', userId);
    }
  }

  /**
   * Full sync: pull all data then push all data
   */
  async performFullSync(): Promise<void> {
    if (!this.userId || this.isSyncing) return;

    this.isSyncing = true;

    try {
      // Pull first (to get latest remote data)
      await pullUserProfile(this.userId);
      await pullBreakHistory(this.userId, this.metadata.lastPullAt);
      await pullSettings(this.userId);

      this.metadata.lastPullAt = Date.now();

      // Then push local changes
      await pushUserProfile(this.userId);
      await pushBreakHistory(this.userId, this.metadata.lastPushAt);
      await pushSettings(this.userId);

      this.metadata.lastPushAt = Date.now();
      this.metadata.lastSyncedAt = Date.now();

      await this.saveMetadata();

      if (__DEV__) {
        console.log('[SyncService] Full sync completed');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[SyncService] Full sync failed:', error);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Incremental sync: only pull changes since last sync
   */
  async performIncrementalSync(): Promise<void> {
    if (!this.userId || this.isSyncing) return;

    this.isSyncing = true;

    try {
      await pullUserProfile(this.userId);
      await pullBreakHistory(this.userId, this.metadata.lastPullAt);
      await pullSettings(this.userId);

      this.metadata.lastPullAt = Date.now();
      this.metadata.lastSyncedAt = Date.now();

      await this.saveMetadata();

      if (__DEV__) {
        console.log('[SyncService] Incremental sync completed');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[SyncService] Incremental sync failed:', error);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Queue a data change for sync
   * If online, pushes immediately. If offline, queues for later.
   */
  async queueDataChange(dataType: SyncDataType, data?: unknown): Promise<void> {
    if (!this.userId) return;

    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      this.pendingQueue.push({ type: dataType, data });
      return;
    }

    try {
      await this.pushChange(dataType, data);
    } catch (error) {
      // Failed to push - queue for retry
      this.pendingQueue.push({ type: dataType, data });
      if (__DEV__) {
        console.warn('[SyncService] Push failed, queued for retry:', dataType);
      }
    }
  }

  /**
   * Push a specific data change
   */
  private async pushChange(dataType: SyncDataType, data?: unknown): Promise<void> {
    if (!this.userId) return;

    switch (dataType) {
      case 'profile':
      case 'progress':
      case 'preferences':
      case 'achievements':
        await pushUserProfile(this.userId);
        break;
      case 'settings':
        await pushSettings(this.userId);
        break;
      case 'break':
        if (data) {
          await pushSingleBreak(this.userId, data as CompletedBreak);
        }
        break;
    }

    this.metadata.lastPushAt = Date.now();
    this.metadata.lastSyncedAt = Date.now();
    await this.saveMetadata();
  }

  /**
   * Queue settings change with debounce
   */
  queueSettingsChange(): void {
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
    }

    this.settingsDebounceTimer = setTimeout(() => {
      this.settingsDebounceTimer = null;
      this.queueDataChange('settings');
    }, SETTINGS_DEBOUNCE_MS);
  }

  /**
   * Process pending offline queue
   */
  private async processPendingQueue(): Promise<void> {
    if (!this.userId || this.pendingQueue.length === 0) return;

    const queue = [...this.pendingQueue];
    this.pendingQueue = [];

    // Deduplicate by type (only push latest of each type)
    const seen = new Set<SyncDataType>();
    const deduped = queue.reverse().filter((item) => {
      if (seen.has(item.type)) return false;
      seen.add(item.type);
      return true;
    });

    for (const item of deduped) {
      try {
        await this.pushChange(item.type, item.data);
      } catch (error) {
        // Re-queue if still failing
        this.pendingQueue.push(item);
      }
    }
  }

  /**
   * Handle connectivity changes
   */
  private handleConnectivityChange = (state: NetInfoState): void => {
    if (state.isConnected && this.userId && !this.isSyncing) {
      // Process pending queue first, then do incremental sync
      this.processPendingQueue().then(() => {
        this.performIncrementalSync();
      });
    }
  };

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (state: AppStateStatus): void => {
    if (state === 'active' && this.userId && !this.isSyncing) {
      this.performIncrementalSync();
    }
  };

  /**
   * Save sync metadata to local storage
   */
  private async saveMetadata(): Promise<void> {
    await setItem(SYNC_METADATA_KEY, this.metadata);
  }

  /**
   * Shutdown sync service and cleanup listeners
   */
  shutdown(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
      this.settingsDebounceTimer = null;
    }
    this.userId = null;
    this.isSyncing = false;

    if (__DEV__) {
      console.log('[SyncService] Shutdown');
    }
  }
}

export const syncService = new SyncService();
