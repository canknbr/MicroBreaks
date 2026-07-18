/**
 * Custom Routines Store
 *
 * User-authored movement routines (Pro): an ordered list of library move
 * ids with a user-chosen name. Playback composes them into one chained
 * session via features/exercise-library/customRoutines.ts using the
 * virtual id `routine-<uuid>`.
 *
 * Validation lives here so every write path (create/update) enforces the
 * same invariants: trimmed non-empty name, 2–8 distinct known library
 * moves, and a bounded total routine count.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createMmkvStorage } from '@/services/storage/zustandMmkv';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import { generateId } from '@/utils/generateId';
import { getLibraryExerciseRecord } from '@/features/exercise-library/catalog';

export const ROUTINE_MIN_MOVES = 2;
export const ROUTINE_MAX_MOVES = 8;
export const ROUTINE_MAX_COUNT = 20;
export const ROUTINE_NAME_MAX_LENGTH = 40;

export interface CustomRoutine {
  /** Virtual exercise id, namespaced as `routine-<uuid>`. */
  id: string;
  name: string;
  /** Ordered, distinct `lib-*` ids. */
  moveIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface RoutinesState {
  routines: CustomRoutine[];

  /** Returns the created routine, or null when validation fails. */
  createRoutine: (_name: string, _moveIds: string[]) => CustomRoutine | null;
  /** Returns true when the update was applied. */
  updateRoutine: (
    _id: string,
    _updates: { name?: string; moveIds?: string[] }
  ) => boolean;
  deleteRoutine: (_id: string) => void;
}

function sanitizeName(name: string): string {
  return name.trim().slice(0, ROUTINE_NAME_MAX_LENGTH);
}

function sanitizeMoveIds(moveIds: readonly string[]): string[] | null {
  const distinct: string[] = [];
  for (const id of moveIds) {
    if (distinct.includes(id)) continue;
    if (!getLibraryExerciseRecord(id)) return null; // unknown move
    distinct.push(id);
  }
  if (distinct.length < ROUTINE_MIN_MOVES || distinct.length > ROUTINE_MAX_MOVES) {
    return null;
  }
  return distinct;
}

export const useRoutinesStore = create<RoutinesState>()(
  persist(
    (set, get) => ({
      routines: [],

      createRoutine: (name, moveIds) => {
        const cleanName = sanitizeName(name);
        const cleanMoves = sanitizeMoveIds(moveIds);
        if (!cleanName || !cleanMoves) return null;
        if (get().routines.length >= ROUTINE_MAX_COUNT) return null;

        const now = Date.now();
        const routine: CustomRoutine = {
          id: `routine-${generateId()}`,
          name: cleanName,
          moveIds: cleanMoves,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ routines: [routine, ...state.routines] }));
        return routine;
      },

      updateRoutine: (id, updates) => {
        const existing = get().routines.find((routine) => routine.id === id);
        if (!existing) return false;

        const nextName =
          updates.name !== undefined ? sanitizeName(updates.name) : existing.name;
        const nextMoves =
          updates.moveIds !== undefined
            ? sanitizeMoveIds(updates.moveIds)
            : existing.moveIds;
        if (!nextName || !nextMoves) return false;

        set((state) => ({
          routines: state.routines.map((routine) =>
            routine.id === id
              ? { ...routine, name: nextName, moveIds: nextMoves, updatedAt: Date.now() }
              : routine
          ),
        }));
        return true;
      },

      deleteRoutine: (id) => {
        set((state) => ({
          routines: state.routines.filter((routine) => routine.id !== id),
        }));
      },
    }),
    {
      name: ZUSTAND_PERSIST_KEYS.ROUTINES,
      storage: createMmkvStorage(),
      version: 1,
    }
  )
);
