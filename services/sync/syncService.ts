/**
 * Sync Service Orchestrator
 * Coordinates all sync operations between local and cloud storage
 */

import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { generateId } from '@/utils/generateId';
import { getItem, setItem } from '@/services/storage';
import { getUserDoc } from '@/services/firebase/firestore';
import { addBreadcrumb, captureError } from '@/services/firebase/crashlytics-adapter';
import { pushUserProfile, pullUserProfile } from './userSync';
import { pushBreakHistory, pullBreakHistory, pushSingleBreak } from './breakSync';
import { pushSettings, pullSettings } from './settingsSync';
import type { SyncDataType, SyncMetadata } from './types';
import { DEFAULT_SYNC_METADATA } from './types';
import type { CompletedBreak } from '@/services/storage';
import {
  clearSyncHandlers,
  registerSyncHandlers,
  setApplyingRemoteData,
} from '@/store/syncBridge';

const LEGACY_SYNC_METADATA_KEY = '@microbreaks/sync_metadata';
const LEGACY_PENDING_QUEUE_KEY = '@microbreaks/sync_pending_queue';
const SYNC_METADATA_KEY_PREFIX = '@microbreaks/sync_metadata/';
const PENDING_QUEUE_KEY_PREFIX = '@microbreaks/sync_pending_queue/';
const SETTINGS_DEBOUNCE_MS = 3000;
const USER_DOC_DEBOUNCE_MS = 250;
const MAX_SYNCS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_BACKOFF_MS = 30000;
const INITIAL_BACKOFF_MS = 1000;
const MAX_PENDING_QUEUE_SIZE = 100;

type UserDocSyncType = 'profile' | 'progress' | 'preferences' | 'achievements';

function isUserDocSyncType(type: SyncDataType): type is UserDocSyncType {
  return (
    type === 'profile' ||
    type === 'progress' ||
    type === 'preferences' ||
    type === 'achievements'
  );
}

function getSyncMetadataKey(userId: string): string {
  return `${SYNC_METADATA_KEY_PREFIX}${userId}`;
}

function getPendingQueueKey(userId: string): string {
  return `${PENDING_QUEUE_KEY_PREFIX}${userId}`;
}

class SyncService {
  private userId: string | null = null;
  private metadata: SyncMetadata = { ...DEFAULT_SYNC_METADATA };
  private netInfoUnsubscribe: (() => void) | null = null;
  private appStateSubscription: { remove: () => void } | null = null;
  private settingsDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private userDocDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isSyncing = false;
  private isInitialized = false;
  private pendingQueue: Array<{ type: SyncDataType; data?: unknown }> = [];
  private syncTimestamps: number[] = [];
  private consecutiveFailures = 0;

  private getMetadataStorageKey(): string | null {
    return this.userId ? getSyncMetadataKey(this.userId) : null;
  }

  private getPendingQueueStorageKey(): string | null {
    return this.userId ? getPendingQueueKey(this.userId) : null;
  }

  /**
   * Check if we're within rate limits
   */
  private isRateLimited(): boolean {
    const now = Date.now();
    // Remove timestamps older than the window
    this.syncTimestamps = this.syncTimestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    return this.syncTimestamps.length >= MAX_SYNCS_PER_MINUTE;
  }

  /**
   * Record a sync attempt for rate limiting
   */
  private recordSyncAttempt(): void {
    this.syncTimestamps.push(Date.now());
  }

  /**
   * Get exponential backoff delay based on consecutive failures
   */
  private getBackoffDelay(): number {
    if (this.consecutiveFailures === 0) return 0;
    return Math.min(INITIAL_BACKOFF_MS * Math.pow(2, this.consecutiveFailures - 1), MAX_BACKOFF_MS);
  }

  /**
   * Load pending queue from persistent storage
   */
  private async loadPendingQueue(): Promise<void> {
    const storageKey = this.getPendingQueueStorageKey();
    this.pendingQueue = [];

    if (!storageKey) {
      return;
    }

    const stored = await getItem<Array<{ type: SyncDataType; data?: unknown }>>(storageKey);
    if (stored && Array.isArray(stored)) {
      this.pendingQueue = stored;
    }
  }

  /**
   * Save pending queue to persistent storage
   */
  private async savePendingQueue(): Promise<void> {
    const storageKey = this.getPendingQueueStorageKey();
    if (!storageKey) {
      return;
    }

    await setItem(storageKey, this.pendingQueue);
  }

  private async pushQueuedUserDocChange(): Promise<void> {
    if (!this.userId) {
      return;
    }

    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      this.enqueuePending({ type: 'profile' });
      await this.savePendingQueue();
      return;
    }

    try {
      await this.pushChange('profile');
    } catch (error) {
      this.enqueuePending({ type: 'profile' });
      await this.savePendingQueue();
      if (__DEV__) {
        console.warn('[SyncService] User doc push failed, queued for retry');
      }
    }
  }

  private async flushPendingUserDocChange(): Promise<void> {
    if (!this.userDocDebounceTimer) {
      return;
    }

    clearTimeout(this.userDocDebounceTimer);
    this.userDocDebounceTimer = null;

    await this.pushQueuedUserDocChange();
  }

  /**
   * Initialize sync service after authentication
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized && this.userId === userId) return;
    if (this.isInitialized && this.userId !== userId) {
      await this.shutdown();
    }

    this.userId = userId;
    this.isInitialized = true;

    // Wire store mutations to the queue through the bridge so stores never
    // import this singleton directly (breaks the store ↔ sync import cycle).
    registerSyncHandlers({
      onDataChange: (type, data) => this.queueDataChange(type, data),
      onSettingsChange: () => this.queueSettingsChange(),
    });

    // Load pending queue from storage
    await this.loadPendingQueue();

    // Load sync metadata
    this.metadata = { ...DEFAULT_SYNC_METADATA };
    const metadataKey = this.getMetadataStorageKey();
    if (metadataKey) {
      const stored = await getItem<SyncMetadata>(metadataKey);
      if (stored) {
        this.metadata = { ...DEFAULT_SYNC_METADATA, ...stored };
      }
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
    if (this.isRateLimited()) {
      if (__DEV__) console.log('[SyncService] Rate limited, skipping full sync');
      return;
    }

    const backoff = this.getBackoffDelay();
    if (backoff > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }

    this.isSyncing = true;
    this.recordSyncAttempt();

    try {
      // Pull first (to get latest remote data)
      // Fetch user doc once and share with both pull functions to avoid duplicate reads
      const userDoc = await getUserDoc(this.userId).get();
      setApplyingRemoteData(true);
      try {
        await pullUserProfile(this.userId, userDoc);
        await pullBreakHistory(this.userId, this.metadata.lastPullAt);
        await pullSettings(this.userId, userDoc);
      } finally {
        setApplyingRemoteData(false);
      }

      this.metadata.lastPullAt = Date.now();

      // Then push local changes
      await pushUserProfile(this.userId);
      await pushBreakHistory(this.userId, this.metadata.lastPushAt);
      await pushSettings(this.userId);

      this.metadata.lastPushAt = Date.now();
      this.metadata.lastSyncedAt = Date.now();

      await this.saveMetadata();

      this.consecutiveFailures = 0;
      if (__DEV__) {
        console.log('[SyncService] Full sync completed');
      }
    } catch (error) {
      this.consecutiveFailures += 1;
      captureError(error instanceof Error ? error : new Error(String(error)), {
        component: 'SyncService',
        action: 'performFullSync',
        extra: { consecutiveFailures: this.consecutiveFailures },
      });
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
    if (this.isRateLimited()) {
      if (__DEV__) console.log('[SyncService] Rate limited, skipping incremental sync');
      return;
    }

    const backoff = this.getBackoffDelay();
    if (backoff > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }

    this.isSyncing = true;
    this.recordSyncAttempt();

    try {
      // Fetch user doc once and share with both pull functions to avoid duplicate reads
      const userDoc = await getUserDoc(this.userId).get();
      setApplyingRemoteData(true);
      try {
        await pullUserProfile(this.userId, userDoc);
        await pullBreakHistory(this.userId, this.metadata.lastPullAt);
        await pullSettings(this.userId, userDoc);
      } finally {
        setApplyingRemoteData(false);
      }

      this.metadata.lastPullAt = Date.now();
      this.metadata.lastSyncedAt = Date.now();

      await this.saveMetadata();

      this.consecutiveFailures = 0;
      if (__DEV__) {
        console.log('[SyncService] Incremental sync completed');
      }
    } catch (error) {
      this.consecutiveFailures += 1;
      captureError(error instanceof Error ? error : new Error(String(error)), {
        component: 'SyncService',
        action: 'performIncrementalSync',
        extra: { consecutiveFailures: this.consecutiveFailures },
      });
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

    if (isUserDocSyncType(dataType)) {
      if (this.userDocDebounceTimer) {
        clearTimeout(this.userDocDebounceTimer);
      }

      this.userDocDebounceTimer = setTimeout(() => {
        this.userDocDebounceTimer = null;
        void this.pushQueuedUserDocChange();
      }, USER_DOC_DEBOUNCE_MS);
      return;
    }

    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      this.enqueuePending({ type: dataType, data });
      await this.savePendingQueue();
      return;
    }

    try {
      await this.pushChange(dataType, data);
    } catch (error) {
      // Failed to push - queue for retry
      this.enqueuePending({ type: dataType, data });
      await this.savePendingQueue();
      if (__DEV__) {
        console.warn('[SyncService] Push failed, queued for retry:', dataType);
      }
    }
  }

  /**
   * Enqueue with a hard cap. Once the cap is exceeded we drop the oldest
   * pending entry instead of letting the queue grow unbounded — both for
   * memory safety on long offline streaks and to keep Firestore write
   * bursts predictable when we come back online (D-PERF6).
   */
  private enqueuePending(entry: { type: SyncDataType; data?: unknown }): void {
    this.pendingQueue.push(entry);
    if (this.pendingQueue.length > MAX_PENDING_QUEUE_SIZE) {
      const dropped = this.pendingQueue.shift();
      addBreadcrumb(
        `Sync pending queue capped at ${MAX_PENDING_QUEUE_SIZE}; dropped oldest`,
        'sync',
        'warning',
        { droppedType: dropped?.type ?? 'unknown', queueSize: this.pendingQueue.length }
      );
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
    if (!this.userId || !this.isInitialized) {
      return;
    }

    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
    }

    this.settingsDebounceTimer = setTimeout(() => {
      this.settingsDebounceTimer = null;
      this.queueDataChange('settings');
    }, SETTINGS_DEBOUNCE_MS);
  }

  /**
   * Flush any debounced settings change before teardown.
   * This prevents silent loss of the latest settings mutation on logout/user rotation.
   */
  private async flushPendingSettingsChange(): Promise<void> {
    if (!this.settingsDebounceTimer) {
      return;
    }

    clearTimeout(this.settingsDebounceTimer);
    this.settingsDebounceTimer = null;

    await this.queueDataChange('settings');
  }

  /**
   * Process pending offline queue
   */
  private async processPendingQueue(): Promise<void> {
    if (!this.userId || this.pendingQueue.length === 0) return;

    const queue = [...this.pendingQueue];
    this.pendingQueue = [];

    // Deduplicate by type (only push latest of each type),
    // but never deduplicate 'break' items since each break is unique data
    const seen = new Set<string>();
    const deduped = queue.reverse().filter((item) => {
      if (item.type === 'break') return true; // Never deduplicate breaks
      const dedupeKey = isUserDocSyncType(item.type) ? 'user_doc' : item.type;
      if (seen.has(dedupeKey)) return false;
      seen.add(dedupeKey);
      return true;
    });

    for (const item of deduped) {
      try {
        await this.pushChange(item.type, item.data);
      } catch (error) {
        // Re-queue if still failing
        this.enqueuePending(item);
      }
    }

    await this.savePendingQueue();
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
      return;
    }

    if (state === 'background' || state === 'inactive') {
      // Force-flush any debounced writes before the OS suspends the JS
      // runtime. Without this, a fast home-button press immediately after
      // changing a setting drops the change on the floor (C-BUG7).
      void this.flushPendingSettingsChange().catch(() => {});
      void this.flushPendingUserDocChange().catch(() => {});
    }
  };

  /**
   * Save sync metadata to local storage
   */
  private async saveMetadata(): Promise<void> {
    const metadataKey = this.getMetadataStorageKey();
    if (!metadataKey) {
      return;
    }

    await setItem(metadataKey, this.metadata);
  }

  /**
   * Shutdown sync service and cleanup listeners
   */
  async shutdown(): Promise<void> {
    await this.flushPendingSettingsChange();
    await this.flushPendingUserDocChange();

    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.userId = null;
    this.metadata = { ...DEFAULT_SYNC_METADATA };
    this.pendingQueue = [];
    this.userDocDebounceTimer = null;
    this.isSyncing = false;
    this.isInitialized = false;
    this.syncTimestamps = [];
    this.consecutiveFailures = 0;

    clearSyncHandlers();
    setApplyingRemoteData(false);

    if (__DEV__) {
      console.log('[SyncService] Shutdown');
    }
  }
}

export { SyncService };
export const syncService = new SyncService();

/**
 * Reset the shared `syncService` instance so a test suite gets a clean
 * slate. Production code MUST NOT call this — it tears down internal
 * timers and listeners.
 */
export async function __resetSyncServiceForTests(): Promise<void> {
  await syncService.shutdown();
}
export const syncStorageTestUtils = {
  getSyncMetadataKey,
  getPendingQueueKey,
  LEGACY_SYNC_METADATA_KEY,
  LEGACY_PENDING_QUEUE_KEY,
};
