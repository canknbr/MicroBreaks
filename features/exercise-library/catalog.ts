/**
 * Exercise Library Catalog
 *
 * Pure lookup/search/grouping helpers over the generated movement records.
 * UI copy (zone titles, filter labels) lives in i18n — this module only owns
 * taxonomy metadata (ids, icons, colors) and matching logic.
 */

import { LIBRARY_EXERCISES } from '@/data/exerciseLibrary.generated';
import {
  LIBRARY_EXERCISE_MEDIA,
  type LibraryExerciseMedia,
} from '@/data/exerciseLibraryMedia.generated';
import type {
  LibraryBodyPart,
  LibraryExerciseRecord,
  LibraryPosition,
  LibraryZoneId,
} from './types';

export const LIBRARY_ID_PREFIX = 'lib-';

/** Locale axis supported by the library content (mirrors app languages). */
export type LibraryLocale = 'en' | 'tr';

export function toLibraryLocale(language: string | null | undefined): LibraryLocale {
  return language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

export function isLibraryExerciseId(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith(LIBRARY_ID_PREFIX);
}

// ---------------------------------------------------------------------------
// Zones
// ---------------------------------------------------------------------------

export interface LibraryZoneMeta {
  id: LibraryZoneId;
  icon: string;
  color: string;
}

/** Display order for zone rails and grouped lists. */
export const LIBRARY_ZONES: readonly LibraryZoneMeta[] = [
  { id: 'neck', icon: '🙆', color: '#06FFA5' },
  { id: 'back', icon: '🧘', color: '#B47EFF' },
  { id: 'chest', icon: '🫁', color: '#00E5FF' },
  { id: 'arms', icon: '💪', color: '#4ECDC4' },
  { id: 'core', icon: '🎯', color: '#FF6B9D' },
  { id: 'legs', icon: '🦵', color: '#FFD166' },
  { id: 'cardio', icon: '🏃', color: '#FF6B6B' },
];

const ZONE_BY_ID = new Map(LIBRARY_ZONES.map((zone) => [zone.id, zone]));

const ZONE_FOR_BODY_PART: Record<LibraryBodyPart, LibraryZoneId> = {
  neck: 'neck',
  shoulders: 'neck',
  back: 'back',
  chest: 'chest',
  'lower arms': 'arms',
  'upper arms': 'arms',
  waist: 'core',
  'upper legs': 'legs',
  'lower legs': 'legs',
  cardio: 'cardio',
};

export function zoneForBodyPart(bodyPart: LibraryBodyPart): LibraryZoneId {
  return ZONE_FOR_BODY_PART[bodyPart];
}

export function getZoneMeta(zoneId: LibraryZoneId): LibraryZoneMeta {
  const zone = ZONE_BY_ID.get(zoneId);
  if (!zone) {
    // Unreachable with a well-formed taxonomy; keep a safe fallback anyway.
    return { id: zoneId, icon: '🧩', color: '#06FFA5' };
  }
  return zone;
}

export function zoneMetaForRecord(record: LibraryExerciseRecord): LibraryZoneMeta {
  return getZoneMeta(zoneForBodyPart(record.bodyPart));
}

// ---------------------------------------------------------------------------
// Records & media
// ---------------------------------------------------------------------------

const RECORD_BY_ID = new Map(LIBRARY_EXERCISES.map((record) => [record.id, record]));

export function getLibraryExercises(): readonly LibraryExerciseRecord[] {
  return LIBRARY_EXERCISES;
}

export function getLibraryExerciseRecord(
  id: string | null | undefined
): LibraryExerciseRecord | undefined {
  if (!id) return undefined;
  return RECORD_BY_ID.get(id);
}

export function getLibraryMedia(
  record: LibraryExerciseRecord
): LibraryExerciseMedia | undefined {
  return LIBRARY_EXERCISE_MEDIA[record.datasetId];
}

export function localizedName(
  record: LibraryExerciseRecord,
  locale: LibraryLocale
): string {
  return record.name[locale] ?? record.name.en;
}

export function localizedSteps(
  record: LibraryExerciseRecord,
  locale: LibraryLocale
): readonly string[] {
  const steps = record.steps[locale];
  return steps && steps.length > 0 ? steps : record.steps.en;
}

// ---------------------------------------------------------------------------
// Search & filtering
// ---------------------------------------------------------------------------

export interface LibraryFilter {
  query?: string;
  zone?: LibraryZoneId | null;
  position?: LibraryPosition | null;
}

/**
 * Case folding across two alphabets. Turkish İ/ı need the tr locale
 * ("BİLEK" → "bilek"), but tr-locale folding corrupts uppercase English
 * ("SIT" → "sıt" never matches "sit-up"). A haystack matches when EITHER
 * folding matches, so both alphabets search correctly.
 */
function foldStandard(value: string): string {
  return value.toLowerCase().trim();
}

function foldTurkish(value: string): string {
  return value.toLocaleLowerCase('tr-TR').trim();
}

function matchesQuery(
  record: LibraryExerciseRecord,
  queryStandard: string,
  queryTurkish: string
): boolean {
  const haystacks = [record.name.en, record.name.tr, record.target];
  return haystacks.some(
    (haystack) =>
      foldStandard(haystack).includes(queryStandard) ||
      foldTurkish(haystack).includes(queryTurkish)
  );
}

export function filterLibraryExercises(
  filter: LibraryFilter
): readonly LibraryExerciseRecord[] {
  const rawQuery = filter.query ?? '';
  const queryStandard = foldStandard(rawQuery);
  const queryTurkish = foldTurkish(rawQuery);
  const hasQuery = queryStandard.length > 0;
  return LIBRARY_EXERCISES.filter((record) => {
    if (filter.zone && zoneForBodyPart(record.bodyPart) !== filter.zone) return false;
    if (filter.position && record.position !== filter.position) return false;
    return !hasQuery || matchesQuery(record, queryStandard, queryTurkish);
  });
}

export interface LibraryZoneGroup {
  zone: LibraryZoneMeta;
  items: LibraryExerciseRecord[];
}

export function groupLibraryByZone(
  records: readonly LibraryExerciseRecord[]
): LibraryZoneGroup[] {
  const buckets = new Map<LibraryZoneId, LibraryExerciseRecord[]>();
  for (const record of records) {
    const zoneId = zoneForBodyPart(record.bodyPart);
    const bucket = buckets.get(zoneId);
    if (bucket) {
      bucket.push(record);
    } else {
      buckets.set(zoneId, [record]);
    }
  }
  return LIBRARY_ZONES.filter((zone) => buckets.has(zone.id)).map((zone) => ({
    zone,
    items: buckets.get(zone.id) ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Muscle labels
// ---------------------------------------------------------------------------

/**
 * Human-friendly labels for dataset muscle names. Keys cover every target and
 * secondary muscle present in the curated set; anything new falls back to a
 * capitalized raw name so a dataset refresh can never crash the UI.
 */
const MUSCLE_LABELS: Record<string, { en: string; tr: string }> = {
  abductors: { en: 'Abductors', tr: 'Dış bacak (abduktör)' },
  abdominals: { en: 'Abdominals', tr: 'Karın' },
  abs: { en: 'Abs', tr: 'Karın' },
  adductors: { en: 'Adductors', tr: 'İç bacak (adduktör)' },
  'ankle stabilizers': { en: 'Ankle stabilizers', tr: 'Ayak bileği stabilizatörleri' },
  ankles: { en: 'Ankles', tr: 'Ayak bilekleri' },
  biceps: { en: 'Biceps', tr: 'Biseps' },
  calves: { en: 'Calves', tr: 'Baldır' },
  'cardiovascular system': { en: 'Cardio', tr: 'Kardiyo' },
  chest: { en: 'Chest', tr: 'Göğüs' },
  core: { en: 'Core', tr: 'Merkez (core)' },
  deltoids: { en: 'Deltoids', tr: 'Omuz (deltoid)' },
  delts: { en: 'Delts', tr: 'Omuz (deltoid)' },
  feet: { en: 'Feet', tr: 'Ayaklar' },
  forearms: { en: 'Forearms', tr: 'Ön kol' },
  glutes: { en: 'Glutes', tr: 'Kalça (gluteus)' },
  groin: { en: 'Groin', tr: 'Kasık' },
  hamstrings: { en: 'Hamstrings', tr: 'Arka bacak' },
  hands: { en: 'Hands', tr: 'Eller' },
  'hip flexors': { en: 'Hip flexors', tr: 'Kalça fleksörleri' },
  lats: { en: 'Lats', tr: 'Kanat (latissimus)' },
  'levator scapulae': { en: 'Levator scapulae', tr: 'Boyun-kürek kası' },
  'lower abs': { en: 'Lower abs', tr: 'Alt karın' },
  'lower back': { en: 'Lower back', tr: 'Bel' },
  obliques: { en: 'Obliques', tr: 'Yan karın (oblik)' },
  pectorals: { en: 'Pectorals', tr: 'Göğüs (pektoral)' },
  quadriceps: { en: 'Quadriceps', tr: 'Ön bacak (quadriceps)' },
  quads: { en: 'Quads', tr: 'Ön bacak (quadriceps)' },
  rhomboids: { en: 'Rhomboids', tr: 'Kürek arası (romboid)' },
  'serratus anterior': { en: 'Serratus anterior', tr: 'Serratus anterior' },
  shoulders: { en: 'Shoulders', tr: 'Omuzlar' },
  spine: { en: 'Spine', tr: 'Omurga' },
  sternocleidomastoid: { en: 'Neck (SCM)', tr: 'Boyun (SCM)' },
  trapezius: { en: 'Trapezius', tr: 'Trapez' },
  triceps: { en: 'Triceps', tr: 'Triseps' },
  'upper back': { en: 'Upper back', tr: 'Üst sırt' },
  wrists: { en: 'Wrists', tr: 'Bilekler' },
};

export function muscleLabel(muscle: string, locale: LibraryLocale): string {
  const entry = MUSCLE_LABELS[muscle.toLowerCase()];
  if (entry) return entry[locale];
  return muscle.charAt(0).toUpperCase() + muscle.slice(1);
}
