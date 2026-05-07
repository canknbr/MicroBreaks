import { syncStorageTestUtils } from '@/services/sync/syncService';

describe('sync storage isolation', () => {
  it('creates user-scoped metadata keys', () => {
    expect(syncStorageTestUtils.getSyncMetadataKey('user-a')).toBe(
      '@microbreaks/sync_metadata/user-a'
    );
    expect(syncStorageTestUtils.getSyncMetadataKey('user-b')).toBe(
      '@microbreaks/sync_metadata/user-b'
    );
    expect(syncStorageTestUtils.getSyncMetadataKey('user-a')).not.toBe(
      syncStorageTestUtils.getSyncMetadataKey('user-b')
    );
  });

  it('creates user-scoped pending queue keys and keeps them separate from legacy keys', () => {
    expect(syncStorageTestUtils.getPendingQueueKey('user-a')).toBe(
      '@microbreaks/sync_pending_queue/user-a'
    );
    expect(syncStorageTestUtils.getPendingQueueKey('user-b')).toBe(
      '@microbreaks/sync_pending_queue/user-b'
    );
    expect(syncStorageTestUtils.getPendingQueueKey('user-a')).not.toBe(
      syncStorageTestUtils.LEGACY_PENDING_QUEUE_KEY
    );
    expect(syncStorageTestUtils.getSyncMetadataKey('user-a')).not.toBe(
      syncStorageTestUtils.LEGACY_SYNC_METADATA_KEY
    );
  });
});
