import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import { useBuddiesStore } from '@/store/buddiesStore';

describe('useBuddiesStore persistence', () => {
  it('sources its persist key from the central registry, not an inline string', () => {
    // The storageKeys docstring forbids inlining the slice name so the key
    // stays discoverable by sessionReset's per-user clear sweep.
    expect(useBuddiesStore.persist.getOptions().name).toBe(ZUSTAND_PERSIST_KEYS.BUDDIES);
  });
});
