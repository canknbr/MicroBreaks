/**
 * Zone Circuits
 *
 * Auto-composed 3-move chained sessions per body zone ("Neck circuit",
 * "Core circuit", …). Member selection is deterministic (gentlest, most
 * desk-friendly moves first) so a circuit id always plays the same
 * session; composition runs through the shared chaining engine.
 */

import type { Exercise, ExerciseCategory } from '@/data/exercises';
import type { LibraryExerciseRecord, LibraryZoneId } from './types';
import {
  LIBRARY_ZONES,
  getLibraryExercises,
  zoneForBodyPart,
  type LibraryLocale,
} from './catalog';
import { composeChainedSession } from './chaining';

export const CIRCUIT_ID_PREFIX = 'circuit-';
export const CIRCUIT_MOVE_COUNT = 3;

export function isCircuitId(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith(CIRCUIT_ID_PREFIX);
}

export function circuitIdForZone(zoneId: LibraryZoneId): string {
  return `${CIRCUIT_ID_PREFIX}${zoneId}`;
}

const CIRCUIT_COPY: Record<
  LibraryLocale,
  { titles: Record<LibraryZoneId, string>; description: string }
> = {
  en: {
    titles: {
      neck: 'Neck & Shoulder Circuit',
      back: 'Back & Spine Circuit',
      chest: 'Chest Opener Circuit',
      arms: 'Arms & Wrists Circuit',
      core: 'Core Circuit',
      legs: 'Hips & Legs Circuit',
      cardio: 'Energy Circuit',
    },
    description: '3 moves, guided back-to-back',
  },
  tr: {
    titles: {
      neck: 'Boyun ve Omuz Devresi',
      back: 'Sırt ve Omurga Devresi',
      chest: 'Göğüs Açıcı Devre',
      arms: 'Kol ve Bilek Devresi',
      core: 'Merkez (Core) Devresi',
      legs: 'Kalça ve Bacak Devresi',
      cardio: 'Enerji Devresi',
    },
    description: 'Art arda rehberli 3 hareket',
  },
};

/** Position preference for circuit picks — desk-friendliest first. */
const POSITION_RANK: Record<LibraryExerciseRecord['position'], number> = {
  desk: 0,
  standing: 1,
  floor: 2,
};

const CATEGORY_FOR_ZONE: Record<LibraryZoneId, ExerciseCategory> = {
  neck: 'stretch',
  back: 'stretch',
  chest: 'stretch',
  arms: 'stretch',
  core: 'active',
  legs: 'active',
  cardio: 'active',
};

const membersCache = new Map<LibraryZoneId, LibraryExerciseRecord[]>();

/**
 * The zone's circuit line-up: gentlest and most desk-friendly moves first,
 * name as the stable tiebreaker. Deterministic for a given generated catalog.
 */
export function getCircuitMembers(zoneId: LibraryZoneId): LibraryExerciseRecord[] {
  const cached = membersCache.get(zoneId);
  if (cached) return cached;

  const members = getLibraryExercises()
    .filter((record) => zoneForBodyPart(record.bodyPart) === zoneId)
    .slice()
    .sort(
      (a, b) =>
        a.difficulty - b.difficulty ||
        POSITION_RANK[a.position] - POSITION_RANK[b.position] ||
        a.name.en.localeCompare(b.name.en)
    )
    .slice(0, CIRCUIT_MOVE_COUNT);

  membersCache.set(zoneId, members);
  return members;
}

const circuitCache = new Map<string, Exercise>();

/** Build (and cache) the chained session for a zone circuit. */
export function buildZoneCircuit(zoneId: LibraryZoneId, locale: LibraryLocale): Exercise {
  const cacheKey = `${zoneId}:${locale}`;
  const cached = circuitCache.get(cacheKey);
  if (cached) return cached;

  const zone = LIBRARY_ZONES.find((candidate) => candidate.id === zoneId) ?? LIBRARY_ZONES[0];
  const copy = CIRCUIT_COPY[locale];

  const exercise = composeChainedSession(
    getCircuitMembers(zoneId),
    {
      id: circuitIdForZone(zoneId),
      title: copy.titles[zoneId],
      description: copy.description,
      category: CATEGORY_FOR_ZONE[zoneId],
      color: zone.color,
      icon: zone.icon,
    },
    locale
  );

  circuitCache.set(cacheKey, exercise);
  return exercise;
}

/** Resolve a `circuit-*` id, or undefined for unknown zones. */
export function resolveCircuitExercise(
  id: string,
  locale: LibraryLocale
): Exercise | undefined {
  if (!isCircuitId(id)) return undefined;
  const zoneId = id.slice(CIRCUIT_ID_PREFIX.length) as LibraryZoneId;
  if (!LIBRARY_ZONES.some((zone) => zone.id === zoneId)) return undefined;
  return buildZoneCircuit(zoneId, locale);
}

/** All zone circuits in display order — for the library rail. */
export function getZoneCircuits(locale: LibraryLocale): Exercise[] {
  return LIBRARY_ZONES.map((zone) => buildZoneCircuit(zone.id, locale));
}
