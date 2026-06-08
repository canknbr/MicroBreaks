/**
 * Missions Store
 *
 * Holds the current day's mission set, the bonus XP earned from
 * completed missions, and a rollover hook that regenerates the set
 * at each local midnight.
 *
 * The store is intentionally thin — all the logic lives in the pure
 * `generator` and `evaluator` modules and is unit-tested there. This
 * file is just persistence + dispatch.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createMmkvStorage } from '@/services/storage/zustandMmkv';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import type { CompletedBreak } from '@/services/storage';
import type { Mission, MissionsState } from '@/services/missions/types';
import { generateDailyMissions } from '@/services/missions/generator';
import { evaluateMissions } from '@/services/missions/evaluator';

function localDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface MissionsStoreState extends MissionsState {
  /** Regenerate the mission set if `dayStart` is stale. Idempotent. */
  rolloverIfNeeded: (now?: Date) => void;
  /** Process a freshly completed break. Returns missions that just
   *  transitioned to complete so the caller can award XP / haptics. */
  recordBreak: (
    newBreak: CompletedBreak,
    todayBreaks: CompletedBreak[]
  ) => Mission[];
  /** Test seam: force-replace the mission set. */
  __setMissionsForTests: (state: MissionsState) => void;
}

const initialDay = localDateString(new Date());

export const useMissionsStore = create<MissionsStoreState>()(
  persist(
    (set, get) => ({
      missions: generateDailyMissions(initialDay),
      dayStart: initialDay,
      bonusXPEarned: 0,

      rolloverIfNeeded(now = new Date()) {
        const today = localDateString(now);
        if (get().dayStart !== today) {
          set({
            missions: generateDailyMissions(today),
            dayStart: today,
            bonusXPEarned: 0,
          });
        }
      },

      recordBreak(newBreak, todayBreaks) {
        get().rolloverIfNeeded(new Date(newBreak.completedAt));
        const before = get();
        const result = evaluateMissions({
          missions: before.missions,
          newBreak,
          todayBreaks,
        });
        const earnedNow = result.newlyCompleted.reduce(
          (sum, m) => sum + m.bonusXP,
          0
        );
        set({
          missions: result.missions,
          bonusXPEarned: before.bonusXPEarned + earnedNow,
        });
        return result.newlyCompleted;
      },

      __setMissionsForTests(state) {
        set(state);
      },
    }),
    {
      name: ZUSTAND_PERSIST_KEYS.MISSIONS,
      storage: createMmkvStorage<MissionsStoreState>(),
    }
  )
);
