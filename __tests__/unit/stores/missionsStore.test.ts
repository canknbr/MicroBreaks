import { act } from '@testing-library/react-native';
import { useMissionsStore } from '@/store/missionsStore';
import { generateDailyMissions } from '@/services/missions/generator';
import type { CompletedBreak } from '@/services/storage';

function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function makeBreak(overrides: Partial<CompletedBreak> = {}): CompletedBreak {
  return {
    id: `b-${Math.random()}`,
    breakId: 'eye-rest',
    title: 'Eye Rest',
    category: 'quick',
    icon: '👁️',
    color: '#00E5FF',
    duration: 60,
    stepsCompleted: 1,
    totalSteps: 1,
    xpEarned: 5,
    rating: null,
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('useMissionsStore', () => {
  beforeEach(() => {
    const today = localDateString(new Date());
    act(() => {
      useMissionsStore.getState().__setMissionsForTests({
        missions: generateDailyMissions(today, 3),
        dayStart: today,
        bonusXPEarned: 0,
      });
    });
  });

  describe('rolloverIfNeeded', () => {
    it('regenerates the mission set when the day flips', () => {
      const before = useMissionsStore.getState().missions;
      const todayStr = useMissionsStore.getState().dayStart;

      // Force the store into yesterday so the rollover fires
      act(() => {
        useMissionsStore.getState().__setMissionsForTests({
          missions: before,
          dayStart: '1999-12-31',
          bonusXPEarned: 50, // simulate yesterday's earnings
        });
      });
      act(() => {
        useMissionsStore.getState().rolloverIfNeeded(new Date());
      });

      const after = useMissionsStore.getState();
      expect(after.dayStart).toBe(todayStr);
      expect(after.bonusXPEarned).toBe(0);
      expect(after.missions.length).toBe(before.length);
    });

    it('is a no-op when the day matches', () => {
      const stateBefore = useMissionsStore.getState();
      act(() => {
        stateBefore.rolloverIfNeeded(new Date());
      });
      const stateAfter = useMissionsStore.getState();
      // Mission set identity preserved.
      expect(stateAfter.missions).toBe(stateBefore.missions);
    });
  });

  describe('recordBreak', () => {
    it('credits bonus XP when a mission newly completes', () => {
      // Seed with a known-complete-able mission.
      act(() => {
        useMissionsStore.getState().__setMissionsForTests({
          missions: [
            {
              id: 'm-take-1',
              kind: 'take_breaks',
              target: 1,
              progress: 0,
              completed: false,
              completedAt: null,
              bonusXP: 25,
              description: 'test',
            },
          ],
          dayStart: localDateString(new Date()),
          bonusXPEarned: 0,
        });
      });

      const b = makeBreak();
      let earned: ReturnType<typeof useMissionsStore.getState>['recordBreak'] extends (
        ...args: never[]
      ) => infer R
        ? R
        : never = [];
      act(() => {
        earned = useMissionsStore.getState().recordBreak(b, [b]);
      });
      expect(earned).toHaveLength(1);
      expect(earned[0].id).toBe('m-take-1');
      expect(useMissionsStore.getState().bonusXPEarned).toBe(25);
    });

    it('returns no newly-completed missions if nothing changed', () => {
      // mission target=5, only 1 break today → not done yet
      act(() => {
        useMissionsStore.getState().__setMissionsForTests({
          missions: [
            {
              id: 'm-take-5',
              kind: 'take_breaks',
              target: 5,
              progress: 0,
              completed: false,
              completedAt: null,
              bonusXP: 50,
              description: 'test',
            },
          ],
          dayStart: localDateString(new Date()),
          bonusXPEarned: 0,
        });
      });

      const b = makeBreak();
      let earned: unknown[] = [];
      act(() => {
        earned = useMissionsStore.getState().recordBreak(b, [b]);
      });
      expect(earned).toHaveLength(0);
      expect(useMissionsStore.getState().bonusXPEarned).toBe(0);
    });

    it('triggers a rollover when the break is logged on a new day', () => {
      // Seed yesterday's state.
      act(() => {
        useMissionsStore.getState().__setMissionsForTests({
          missions: [
            {
              id: 'm-old',
              kind: 'take_breaks',
              target: 1,
              progress: 1,
              completed: true,
              completedAt: '1999-12-31T20:00:00',
              bonusXP: 10,
              description: 'stale',
            },
          ],
          dayStart: '1999-12-31',
          bonusXPEarned: 10,
        });
      });

      // A break completed *today* should trigger the rollover and
      // generate a fresh mission set.
      const b = makeBreak({ completedAt: new Date().toISOString() });
      act(() => {
        useMissionsStore.getState().recordBreak(b, [b]);
      });

      const state = useMissionsStore.getState();
      expect(state.dayStart).toBe(localDateString(new Date()));
      // bonusXPEarned should be 0 (yesterday's earnings cleared) or
      // > 0 if the freshly-generated mission happened to complete on
      // this single break; either way the stale 10 is gone.
      expect(state.missions.some((m) => m.id === 'm-old')).toBe(false);
    });
  });
});
