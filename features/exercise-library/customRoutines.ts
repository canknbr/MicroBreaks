/**
 * Custom Routines → Playable Sessions
 *
 * Resolves user-authored routines (store/routinesStore.ts) into chained
 * sessions via the shared composer. The virtual exercise id is the routine
 * id itself (`routine-<uuid>`), so the break-session player, history, and
 * gating all work unchanged. Not in any free list → Pro-gated implicitly.
 */

import type { Exercise, ExerciseCategory } from '@/data/exercises';
import { useRoutinesStore, type CustomRoutine } from '@/store/routinesStore';
import type { LibraryExerciseRecord, LibraryZoneId } from './types';
import {
  getLibraryExerciseRecord,
  getZoneMeta,
  zoneForBodyPart,
  type LibraryLocale,
} from './catalog';
import { composeChainedSession } from './chaining';

export const ROUTINE_ID_PREFIX = 'routine-';

export function isRoutineId(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith(ROUTINE_ID_PREFIX);
}

const DESCRIPTION_COPY: Record<LibraryLocale, (_count: number) => string> = {
  en: (count) => `Custom routine · ${count} moves`,
  tr: (count) => `Özel rutin · ${count} hareket`,
};

/** Resolve the routine's member records, dropping ids that no longer exist. */
export function getRoutineMembers(routine: CustomRoutine): LibraryExerciseRecord[] {
  return routine.moveIds
    .map((id) => getLibraryExerciseRecord(id))
    .filter((record): record is LibraryExerciseRecord => record != null);
}

function dominantZone(members: readonly LibraryExerciseRecord[]): LibraryZoneId {
  const counts = new Map<LibraryZoneId, number>();
  for (const member of members) {
    const zone = zoneForBodyPart(member.bodyPart);
    counts.set(zone, (counts.get(zone) ?? 0) + 1);
  }
  let best: LibraryZoneId = members.length
    ? zoneForBodyPart(members[0].bodyPart)
    : 'neck';
  let bestCount = 0;
  for (const [zone, count] of counts) {
    if (count > bestCount) {
      best = zone;
      bestCount = count;
    }
  }
  return best;
}

function categoryForMembers(
  members: readonly LibraryExerciseRecord[]
): ExerciseCategory {
  const activeCount = members.filter(
    (member) => member.kind === 'strength' || member.kind === 'cardio'
  ).length;
  return activeCount * 2 >= members.length ? 'active' : 'stretch';
}

const routineCache = new Map<string, Exercise>();

/**
 * Build (and cache) the chained session for a routine. The cache key is a
 * full content signature (name + ordered moves + locale), so any edit —
 * even within the same clock millisecond — produces a fresh composition.
 */
export function buildRoutineSessionExercise(
  routine: CustomRoutine,
  locale: LibraryLocale
): Exercise | undefined {
  const members = getRoutineMembers(routine);
  if (members.length === 0) return undefined;

  const cacheKey = `${routine.id}:${locale}:${routine.name}:${routine.moveIds.join(',')}`;
  const cached = routineCache.get(cacheKey);
  if (cached) return cached;

  const zone = getZoneMeta(dominantZone(members));
  const exercise = composeChainedSession(
    members,
    {
      id: routine.id,
      title: routine.name,
      description: DESCRIPTION_COPY[locale](members.length),
      category: categoryForMembers(members),
      color: zone.color,
      icon: zone.icon,
    },
    locale
  );

  routineCache.set(cacheKey, exercise);
  return exercise;
}

/**
 * Resolve a `routine-*` id from the persisted store, or undefined when the
 * routine was deleted (session params then fall back to the default break).
 */
export function resolveRoutineExercise(
  id: string,
  locale: LibraryLocale
): Exercise | undefined {
  if (!isRoutineId(id)) return undefined;
  const routine = useRoutinesStore
    .getState()
    .routines.find((candidate) => candidate.id === id);
  if (!routine) return undefined;
  return buildRoutineSessionExercise(routine, locale);
}
