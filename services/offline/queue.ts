/**
 * Offline Queue Service
 * Persistent queue for operations that fail when offline
 * Automatically retries when connectivity is restored
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';

// Queue item types
export type QueueItemType =
  | 'notification'
  | 'analytics'
  | 'break_save'
  | 'stats_sync';

export interface QueueItem<T = unknown> {
  id: string;
  type: QueueItemType;
  payload: T;
  createdAt: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
}

interface QueueState {
  items: QueueItem[];
  isProcessing: boolean;
  lastProcessedAt: string | null;
}

const STORAGE_KEY = '@microbreaks/offline_queue';
const MAX_QUEUE_SIZE = 100;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

// Singleton state
let queueState: QueueState = {
  items: [],
  isProcessing: false,
  lastProcessedAt: null,
};

let processingTimeout: ReturnType<typeof setTimeout> | null = null;
let netInfoUnsubscribe: (() => void) | null = null;
let appStateSubscription: { remove: () => void } | null = null;

// Processor functions for each item type
type ProcessorFunction<T = unknown> = (payload: T) => Promise<void>;
const processors: Map<QueueItemType, ProcessorFunction> = new Map();

/**
 * Initialize the offline queue
 * Should be called once at app startup
 */
export async function initializeOfflineQueue(): Promise<void> {
  // Load persisted queue
  await loadQueue();

  // Listen for network changes
  netInfoUnsubscribe = NetInfo.addEventListener(handleConnectivityChange);

  // Listen for app state changes
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // Process queue if online
  const netState = await NetInfo.fetch();
  if (netState.isConnected) {
    processQueue();
  }
}

/**
 * Cleanup the offline queue listeners
 * Should be called when app unmounts
 */
export function cleanupOfflineQueue(): void {
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  if (processingTimeout) {
    clearTimeout(processingTimeout);
    processingTimeout = null;
  }
}

/**
 * Register a processor function for a queue item type
 */
export function registerProcessor<T>(type: QueueItemType, processor: ProcessorFunction<T>): void {
  processors.set(type, processor as ProcessorFunction);
}

/**
 * Add an item to the offline queue
 */
export async function enqueue<T>(
  type: QueueItemType,
  payload: T,
  maxRetries: number = DEFAULT_MAX_RETRIES
): Promise<string> {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const item: QueueItem<T> = {
    id,
    type,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries,
  };

  queueState.items.push(item as QueueItem);

  // Trim queue if too large (remove oldest items)
  if (queueState.items.length > MAX_QUEUE_SIZE) {
    queueState.items = queueState.items.slice(-MAX_QUEUE_SIZE);
  }

  await saveQueue();

  // Try to process immediately if online
  const netState = await NetInfo.fetch();
  if (netState.isConnected && !queueState.isProcessing) {
    processQueue();
  }

  return id;
}

/**
 * Remove an item from the queue
 */
export async function dequeue(id: string): Promise<void> {
  queueState.items = queueState.items.filter(item => item.id !== id);
  await saveQueue();
}

/**
 * Get current queue length
 */
export function getQueueLength(): number {
  return queueState.items.length;
}

/**
 * Get pending items for a specific type
 */
export function getPendingItems(type: QueueItemType): QueueItem[] {
  return queueState.items.filter(item => item.type === type);
}

/**
 * Clear all items from the queue
 */
export async function clearQueue(): Promise<void> {
  queueState.items = [];
  await saveQueue();
}

/**
 * Process the queue
 */
async function processQueue(): Promise<void> {
  if (queueState.isProcessing || queueState.items.length === 0) {
    return;
  }

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    return;
  }

  queueState.isProcessing = true;

  const itemsToProcess = [...queueState.items];
  const failedItems: QueueItem[] = [];

  for (const item of itemsToProcess) {
    const processor = processors.get(item.type);
    if (!processor) {
      if (__DEV__) {
        console.warn(`No processor registered for queue item type: ${item.type}`);
      }
      continue;
    }

    try {
      await processor(item.payload);
      // Remove successfully processed item
      queueState.items = queueState.items.filter(i => i.id !== item.id);
    } catch (error) {
      item.retryCount += 1;
      item.lastError = error instanceof Error ? error.message : 'Unknown error';

      if (item.retryCount >= item.maxRetries) {
        // Remove item that has exceeded max retries
        queueState.items = queueState.items.filter(i => i.id !== item.id);
        if (__DEV__) {
          console.warn(`Queue item ${item.id} exceeded max retries and was removed`);
        }
      } else {
        failedItems.push(item);
      }
    }
  }

  queueState.lastProcessedAt = new Date().toISOString();
  queueState.isProcessing = false;
  await saveQueue();

  // Schedule retry for failed items
  if (failedItems.length > 0) {
    scheduleRetry();
  }
}

/**
 * Schedule a retry for failed items
 */
function scheduleRetry(): void {
  if (processingTimeout) {
    clearTimeout(processingTimeout);
  }

  processingTimeout = setTimeout(() => {
    processingTimeout = null;
    processQueue();
  }, RETRY_DELAY_MS);
}

/**
 * Handle connectivity changes
 */
function handleConnectivityChange(state: NetInfoState): void {
  if (state.isConnected && !queueState.isProcessing) {
    processQueue();
  }
}

/**
 * Handle app state changes
 */
function handleAppStateChange(state: AppStateStatus): void {
  if (state === 'active' && !queueState.isProcessing) {
    processQueue();
  }
}

/**
 * Load queue from storage
 */
async function loadQueue(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as QueueState;
      queueState = {
        ...parsed,
        isProcessing: false, // Reset processing state on load
      };
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to load offline queue:', error);
    }
    queueState = {
      items: [],
      isProcessing: false,
      lastProcessedAt: null,
    };
  }
}

/**
 * Save queue to storage
 */
async function saveQueue(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queueState));
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to save offline queue:', error);
    }
  }
}

/**
 * Check if currently online
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true;
}

/**
 * Execute with offline fallback
 * Tries to execute immediately if online, otherwise queues for later
 */
export async function executeWithOfflineFallback<T>(
  type: QueueItemType,
  payload: T,
  immediateExecutor: (payload: T) => Promise<void>,
  maxRetries: number = DEFAULT_MAX_RETRIES
): Promise<{ immediate: boolean; queueId?: string }> {
  const online = await isOnline();

  if (online) {
    try {
      await immediateExecutor(payload);
      return { immediate: true };
    } catch (error) {
      // Failed even though online - queue for retry
      const queueId = await enqueue(type, payload, maxRetries);
      return { immediate: false, queueId };
    }
  }

  // Offline - queue for later
  const queueId = await enqueue(type, payload, maxRetries);
  return { immediate: false, queueId };
}
