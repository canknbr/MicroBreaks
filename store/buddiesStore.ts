/**
 * Buddies Store
 *
 * Local-only store that surfaces the existing `services/buddies`
 * engine through a screen. The engine itself is pure and the
 * Firestore sync layer is a separate phase — this store owns just
 * enough state for the user to:
 *
 *   - See their own published invite code (regenerate on demand).
 *   - Validate and remember a buddy code they've accepted.
 *   - Display the local buddies list (empty until sync lands).
 *
 * Persisted via the standard MMKV adapter so the invite code
 * survives app restarts; the actual buddy relationships will be
 * back-filled by the future Firestore sync.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import { createMmkvStorage } from '@/services/storage/zustandMmkv';
import {
  generateBuddyCode,
  validateBuddyCode,
} from '@/services/buddies/inviteCodes';
import {
  type Buddy,
  type BuddyCode,
  MAX_BUDDIES,
} from '@/services/buddies/types';

interface BuddiesState {
  /** The current user's own invite code, regenerated on demand. */
  ownCode: BuddyCode | null;
  /** Codes the user has typed in but whose other side hasn't synced yet. */
  pendingAcceptedCodes: BuddyCode[];
  /** Confirmed buddy relationships (back-filled by sync layer). */
  buddies: Buddy[];

  /** Generate or regenerate the user's invite code. */
  refreshOwnCode: () => BuddyCode;
  /** Accept a buddy code typed in by the user. Returns the normalized
   *  code if valid, null if invalid or duplicate. */
  acceptCode: (raw: string) => BuddyCode | null;
  /** Drop a pending code (e.g. user gave up waiting). */
  dropPendingCode: (code: BuddyCode) => void;
  /** Reset everything (used by the session reset flow). */
  reset: () => void;
}

const STORAGE_KEY = ZUSTAND_PERSIST_KEYS.BUDDIES;

export const useBuddiesStore = create<BuddiesState>()(
  persist(
    (set, get) => ({
      ownCode: null,
      pendingAcceptedCodes: [],
      buddies: [],

      refreshOwnCode: () => {
        const next = generateBuddyCode();
        set({ ownCode: next });
        return next;
      },

      acceptCode: (raw: string) => {
        const normalized = validateBuddyCode(raw);
        if (!normalized) return null;
        const state = get();
        if (normalized === state.ownCode) {
          return null; // can't buddy yourself
        }
        if (state.pendingAcceptedCodes.includes(normalized)) {
          return null;
        }
        if (state.buddies.length >= MAX_BUDDIES) {
          return null;
        }
        set({
          pendingAcceptedCodes: [...state.pendingAcceptedCodes, normalized],
        });
        return normalized;
      },

      dropPendingCode: (code: BuddyCode) => {
        set((state) => ({
          pendingAcceptedCodes: state.pendingAcceptedCodes.filter(
            (c) => c !== code,
          ),
        }));
      },

      reset: () =>
        set({ ownCode: null, pendingAcceptedCodes: [], buddies: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createMmkvStorage(),
      version: 1,
    },
  ),
);
