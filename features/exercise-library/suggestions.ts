/**
 * Library Suggestions
 *
 * Pure, deterministic pickers that turn the movement catalog into daily
 * habit hooks:
 *
 *  - Today's plan: three moves across the user's priority zones, rotated
 *    daily by a date-key hash so the plan feels fresh but is reproducible
 *    (same day + same pain areas → same plan, no RNG).
 *  - Next-move suggestion: the natural follow-up inside a zone after
 *    finishing a session, used by the post-session "keep going" card.
 */

import type { LibraryExerciseRecord, LibraryZoneId } from './types';
import {
  getLibraryExerciseRecord,
  getLibraryExercises,
  zoneForBodyPart,
} from './catalog';

const PLAN_SIZE = 3;

/** Stable in-zone ordering shared by plans and next-move suggestions. */
const POSITION_RANK: Record<LibraryExerciseRecord['position'], number> = {
  desk: 0,
  standing: 1,
  floor: 2,
};

function sortedZoneRecords(zoneId: LibraryZoneId): LibraryExerciseRecord[] {
  return getLibraryExercises()
    .filter((record) => zoneForBodyPart(record.bodyPart) === zoneId)
    .slice()
    .sort(
      (a, b) =>
        a.difficulty - b.difficulty ||
        POSITION_RANK[a.position] - POSITION_RANK[b.position] ||
        a.name.en.localeCompare(b.name.en)
    );
}

/** FNV-1a — tiny, stable, good enough for daily rotation. */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Local-date key (YYYY-MM-DD) for deterministic daily rotation. */
export function formatPlanDateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const PAIN_AREA_ZONES: Record<string, LibraryZoneId> = {
  neck: 'neck',
  shoulders: 'neck',
  upper_back: 'back',
  lower_back: 'back',
  wrists: 'arms',
};

/**
 * The movement-library zone that best serves an onboarding pain area, or
 * null for areas without a movement zone (eyes → guided eye breaks instead).
 * Used by notification deep links to land pain-focused reminders on the
 * right library shelf.
 */
export function zoneForPainArea(area: string): LibraryZoneId | null {
  return PAIN_AREA_ZONES[area] ?? null;
}

const DEFAULT_ZONE_ROTATION: LibraryZoneId[] = [
  'neck',
  'back',
  'core',
  'legs',
  'chest',
  'arms',
  'cardio',
];

/**
 * Priority zones for the plan: pain areas first (deduped, onboarding
 * order preserved), then the default rotation fills up to three zones.
 * Pain areas without a movement zone (e.g. eyes) are skipped — eye care
 * lives in the guided-breaks library.
 */
export function getPlanZones(painAreas: readonly string[]): LibraryZoneId[] {
  const zones: LibraryZoneId[] = [];
  for (const area of painAreas) {
    const zone = PAIN_AREA_ZONES[area];
    if (zone && !zones.includes(zone)) {
      zones.push(zone);
    }
  }
  for (const zone of DEFAULT_ZONE_ROTATION) {
    if (zones.length >= PLAN_SIZE) break;
    if (!zones.includes(zone)) {
      zones.push(zone);
    }
  }
  return zones.slice(0, PLAN_SIZE);
}

/**
 * Today's three moves. Deterministic: the same (painAreas, dateKey) pair
 * always returns the same records, and consecutive days rotate through
 * each zone's catalog instead of repeating.
 */
export function getTodayPlan(
  painAreas: readonly string[],
  dateKey: string
): LibraryExerciseRecord[] {
  const plan: LibraryExerciseRecord[] = [];
  for (const zone of getPlanZones(painAreas)) {
    const candidates = sortedZoneRecords(zone).filter(
      (record) => !plan.some((picked) => picked.id === record.id)
    );
    if (candidates.length === 0) continue;
    const index = hashString(`${dateKey}:${zone}`) % candidates.length;
    plan.push(candidates[index]);
  }
  return plan;
}

/**
 * The next move in the same zone after `currentId`, cycling through the
 * zone's stable order and skipping entries `isPlayable` rejects (e.g.
 * locked moves for free users). Returns null for non-library ids or when
 * nothing else in the zone is playable.
 */
export function getNextZoneMove(
  currentId: string,
  isPlayable: (_id: string) => boolean
): LibraryExerciseRecord | null {
  const current = getLibraryExerciseRecord(currentId);
  if (!current) return null;

  const zoneRecords = sortedZoneRecords(zoneForBodyPart(current.bodyPart));
  const currentIndex = zoneRecords.findIndex((record) => record.id === current.id);
  if (currentIndex < 0 || zoneRecords.length < 2) return null;

  for (let offset = 1; offset < zoneRecords.length; offset += 1) {
    const candidate = zoneRecords[(currentIndex + offset) % zoneRecords.length];
    if (isPlayable(candidate.id)) {
      return candidate;
    }
  }
  return null;
}
