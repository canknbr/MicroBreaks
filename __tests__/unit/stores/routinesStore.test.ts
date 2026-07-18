/**
 * Custom Routines Store Tests
 * CRUD validation invariants plus the routine → chained-session pipeline
 * (composition, cache invalidation on edit, data-layer bridge, gating).
 */

import { act } from '@testing-library/react-native';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import {
  ROUTINE_MAX_MOVES,
  ROUTINE_MIN_MOVES,
  useRoutinesStore,
} from '@/store/routinesStore';
import {
  buildRoutineSessionExercise,
  getRoutineMembers,
  isRoutineId,
  resolveRoutineExercise,
} from '@/features/exercise-library/customRoutines';
import { estimateChainedSeconds } from '@/features/exercise-library/chaining';
import { getExerciseById } from '@/data/exercises';
import { requiresUpgradeForExercise } from '@/services/subscription/exerciseAccess';

const VALID_MOVES = ['lib-1403', 'lib-1428', 'lib-0659'];

function resetStore() {
  act(() => {
    useRoutinesStore.setState({ routines: [] });
  });
}

describe('routines store', () => {
  beforeEach(resetStore);

  it('sources its persist key from the central registry', () => {
    expect(useRoutinesStore.persist.getOptions().name).toBe(
      ZUSTAND_PERSIST_KEYS.ROUTINES
    );
  });

  it('creates a routine with a namespaced id and newest-first ordering', () => {
    let first: ReturnType<typeof useRoutinesStore.getState>['routines'][number] | null =
      null;
    act(() => {
      first = useRoutinesStore.getState().createRoutine('Morning reset', VALID_MOVES);
      useRoutinesStore.getState().createRoutine('Evening reset', VALID_MOVES);
    });
    expect(first).not.toBeNull();
    expect(isRoutineId(first!.id)).toBe(true);
    const routines = useRoutinesStore.getState().routines;
    expect(routines).toHaveLength(2);
    expect(routines[0].name).toBe('Evening reset');
  });

  it('rejects invalid names, unknown moves, and out-of-range counts', () => {
    const { createRoutine } = useRoutinesStore.getState();
    act(() => {
      expect(createRoutine('   ', VALID_MOVES)).toBeNull();
      expect(createRoutine('Bad move', ['lib-1403', 'lib-9999'])).toBeNull();
      expect(createRoutine('Too few', VALID_MOVES.slice(0, ROUTINE_MIN_MOVES - 1))).toBeNull();
      expect(
        createRoutine(
          'Too many',
          [
            'lib-1403',
            'lib-1428',
            'lib-0659',
            'lib-3533',
            'lib-1368',
            'lib-3147',
            'lib-3672',
            'lib-1365',
            'lib-0716',
          ].slice(0, ROUTINE_MAX_MOVES + 1)
        )
      ).toBeNull();
    });
    expect(useRoutinesStore.getState().routines).toHaveLength(0);
  });

  it('dedupes repeated move ids on create', () => {
    act(() => {
      useRoutinesStore
        .getState()
        .createRoutine('Deduped', ['lib-1403', 'lib-1403', 'lib-1428']);
    });
    expect(useRoutinesStore.getState().routines[0].moveIds).toEqual([
      'lib-1403',
      'lib-1428',
    ]);
  });

  it('updates name and order, bumping updatedAt; rejects bad updates', () => {
    let id = '';
    act(() => {
      id = useRoutinesStore.getState().createRoutine('Original', VALID_MOVES)!.id;
    });
    const before = useRoutinesStore.getState().routines[0].updatedAt;

    act(() => {
      expect(
        useRoutinesStore.getState().updateRoutine(id, {
          name: 'Renamed',
          moveIds: [...VALID_MOVES].reverse(),
        })
      ).toBe(true);
      expect(useRoutinesStore.getState().updateRoutine(id, { name: '  ' })).toBe(false);
      expect(useRoutinesStore.getState().updateRoutine('routine-missing', {})).toBe(false);
    });

    const updated = useRoutinesStore.getState().routines[0];
    expect(updated.name).toBe('Renamed');
    expect(updated.moveIds).toEqual([...VALID_MOVES].reverse());
    expect(updated.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('deletes routines', () => {
    let id = '';
    act(() => {
      id = useRoutinesStore.getState().createRoutine('Doomed', VALID_MOVES)!.id;
      useRoutinesStore.getState().deleteRoutine(id);
    });
    expect(useRoutinesStore.getState().routines).toHaveLength(0);
  });
});

describe('routine → chained session', () => {
  beforeEach(resetStore);

  it('composes a playable session with per-move media and the routine name', () => {
    let id = '';
    act(() => {
      id = useRoutinesStore.getState().createRoutine('Desk combo', VALID_MOVES)!.id;
    });
    const routine = useRoutinesStore.getState().routines[0];
    const session = buildRoutineSessionExercise(routine, 'tr');
    expect(session).toBeDefined();
    if (!session) return;

    expect(session.id).toBe(id);
    expect(session.title).toBe('Desk combo');
    const stepSum = session.steps.reduce((sum, step) => sum + step.duration, 0);
    expect(session.totalDuration).toBe(stepSum);
    expect(session.totalDuration).toBe(
      estimateChainedSeconds(getRoutineMembers(routine))
    );
    const distinctMedia = new Set(
      session.steps.filter((step) => step.media).map((step) => step.media)
    );
    expect(distinctMedia.size).toBe(VALID_MOVES.length);
  });

  it('invalidates the composition cache when the routine is edited', () => {
    act(() => {
      useRoutinesStore.getState().createRoutine('Cache check', VALID_MOVES);
    });
    const routine = useRoutinesStore.getState().routines[0];
    const before = buildRoutineSessionExercise(routine, 'en');

    act(() => {
      useRoutinesStore
        .getState()
        .updateRoutine(routine.id, { moveIds: [...VALID_MOVES].reverse() });
    });
    const after = buildRoutineSessionExercise(
      useRoutinesStore.getState().routines[0],
      'en'
    );
    expect(after).not.toBe(before);
    expect(after?.steps[1].media).not.toBe(before?.steps[1].media);
  });

  it('resolves through the data-layer bridge and gates for free tier', () => {
    let id = '';
    act(() => {
      id = useRoutinesStore.getState().createRoutine('Bridged', VALID_MOVES)!.id;
    });
    expect(getExerciseById(id, 'en')?.title).toBe('Bridged');
    expect(resolveRoutineExercise('routine-does-not-exist', 'en')).toBeUndefined();
    expect(getExerciseById('routine-does-not-exist')).toBeUndefined();

    // Custom routines are a Pro surface — never in the free set.
    expect(requiresUpgradeForExercise(id, 'free')).toBe(true);
    expect(requiresUpgradeForExercise(id, 'solo')).toBe(false);
  });
});
