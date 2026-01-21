/**
 * useOfflineQueue Hook
 * React hook for interacting with the offline queue system
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getQueueLength,
  getPendingItems,
  executeWithOfflineFallback,
  isOnline as checkOnline,
  QueueItemType,
  QueueItem,
} from '@/services/offline';

interface UseOfflineQueueReturn {
  isOnline: boolean;
  queueLength: number;
  getPending: (type: QueueItemType) => QueueItem[];
  executeWithFallback: <T>(
    type: QueueItemType,
    payload: T,
    executor: (payload: T) => Promise<void>
  ) => Promise<{ immediate: boolean; queueId?: string }>;
}

export function useOfflineQueue(): UseOfflineQueueReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    // Initial online check
    checkOnline().then(setIsOnline);

    // Initial queue length
    setQueueLength(getQueueLength());

    // Periodically check online status (every 10 seconds)
    const interval = setInterval(() => {
      checkOnline().then(setIsOnline);
      setQueueLength(getQueueLength());
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getPending = useCallback((type: QueueItemType): QueueItem[] => {
    return getPendingItems(type);
  }, []);

  const executeWithFallback = useCallback(
    async <T>(
      type: QueueItemType,
      payload: T,
      executor: (payload: T) => Promise<void>
    ): Promise<{ immediate: boolean; queueId?: string }> => {
      const result = await executeWithOfflineFallback(type, payload, executor);
      setQueueLength(getQueueLength());
      return result;
    },
    []
  );

  return {
    isOnline,
    queueLength,
    getPending,
    executeWithFallback,
  };
}

export default useOfflineQueue;
