/**
 * Exercise Library Tests
 * Generated-data integrity, catalog search/grouping, session conversion,
 * and subscription gating for the movement library.
 */

import { LIBRARY_EXERCISES } from '@/data/exerciseLibrary.generated';
import { LIBRARY_EXERCISE_MEDIA } from '@/data/exerciseLibraryMedia.generated';
import {
  LIBRARY_ZONES,
  filterLibraryExercises,
  getLibraryExerciseRecord,
  getLibraryExercises,
  getLibraryMedia,
  groupLibraryByZone,
  isLibraryExerciseId,
  localizedName,
  localizedSteps,
  muscleLabel,
  toLibraryLocale,
  zoneForBodyPart,
} from '@/features/exercise-library/catalog';
import {
  buildLibrarySessionExercise,
  estimateSessionSeconds,
  resolveLibrarySessionExercise,
} from '@/features/exercise-library/session';
import { getExerciseById } from '@/data/exercises';
import { resolveBreakSessionBreakId } from '@/features/break-session/sessionParams';
import { FREE_LIBRARY_EXERCISE_IDS } from '@/constants/subscription';
import {
  isFreeExercise,
  requiresUpgradeForExercise,
} from '@/services/subscription/exerciseAccess';

const VALID_BODY_PARTS = [
  'back',
  'cardio',
  'chest',
  'lower arms',
  'lower legs',
  'neck',
  'shoulders',
  'upper arms',
  'upper legs',
  'waist',
];
const VALID_KINDS = ['stretch', 'mobility', 'strength', 'cardio'];
const VALID_POSITIONS = ['desk', 'standing', 'floor'];

describe('exercise library — generated data integrity', () => {
  it('contains a substantial curated set', () => {
    // Desk-app curation: floor/lying/kneeling moves are excluded by the
    // generator, so the catalog is intentionally standing/seated only.
    expect(LIBRARY_EXERCISES.length).toBeGreaterThanOrEqual(60);
  });

  it('excludes floor exercises — every move is standing or seated', () => {
    for (const record of LIBRARY_EXERCISES) {
      expect(record.position).not.toBe('floor');
    }
  });

  it('has unique, namespaced ids matching their dataset ids', () => {
    const ids = new Set<string>();
    for (const record of LIBRARY_EXERCISES) {
      expect(record.id).toBe(`lib-${record.datasetId}`);
      expect(record.datasetId).toMatch(/^\d{4}$/);
      expect(ids.has(record.id)).toBe(false);
      ids.add(record.id);
    }
  });

  it('has non-empty EN and TR names and steps for every record', () => {
    for (const record of LIBRARY_EXERCISES) {
      expect(record.name.en.trim().length).toBeGreaterThan(0);
      expect(record.name.tr.trim().length).toBeGreaterThan(0);
      expect(record.steps.en.length).toBeGreaterThan(0);
      expect(record.steps.tr.length).toBeGreaterThan(0);
      for (const step of [...record.steps.en, ...record.steps.tr]) {
        expect(step.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('uses only valid taxonomy values', () => {
    for (const record of LIBRARY_EXERCISES) {
      expect(VALID_BODY_PARTS).toContain(record.bodyPart);
      expect(VALID_KINDS).toContain(record.kind);
      expect(VALID_POSITIONS).toContain(record.position);
      expect([1, 2, 3]).toContain(record.difficulty);
      expect(record.target.trim().length).toBeGreaterThan(0);
    }
  });

  it('has media registered for every record and no orphan media', () => {
    const datasetIds = new Set(LIBRARY_EXERCISES.map((record) => record.datasetId));
    for (const record of LIBRARY_EXERCISES) {
      const media = LIBRARY_EXERCISE_MEDIA[record.datasetId];
      expect(media).toBeDefined();
      expect(media.gif).toBeDefined();
      expect(media.thumb).toBeDefined();
    }
    for (const key of Object.keys(LIBRARY_EXERCISE_MEDIA)) {
      expect(datasetIds.has(key)).toBe(true);
    }
  });

  it('never collides with hand-authored break ids', () => {
    for (const record of LIBRARY_EXERCISES) {
      expect(isLibraryExerciseId(record.id)).toBe(true);
    }
    expect(isLibraryExerciseId('eye-rest')).toBe(false);
    expect(isLibraryExerciseId(null)).toBe(false);
  });
});

describe('exercise library — catalog', () => {
  it('maps every body part to a defined zone', () => {
    const zoneIds = new Set(LIBRARY_ZONES.map((zone) => zone.id));
    for (const bodyPart of VALID_BODY_PARTS) {
      const zone = zoneForBodyPart(bodyPart as never);
      expect(zoneIds.has(zone)).toBe(true);
    }
  });

  it('looks up records by id', () => {
    const first = LIBRARY_EXERCISES[0];
    expect(getLibraryExerciseRecord(first.id)).toBe(first);
    expect(getLibraryExerciseRecord('lib-9999')).toBeUndefined();
    expect(getLibraryExerciseRecord(undefined)).toBeUndefined();
  });

  it('filters by zone and position', () => {
    const neckOnly = filterLibraryExercises({ zone: 'neck' });
    expect(neckOnly.length).toBeGreaterThan(0);
    for (const record of neckOnly) {
      expect(['neck', 'shoulders']).toContain(record.bodyPart);
    }

    const deskOnly = filterLibraryExercises({ position: 'desk' });
    expect(deskOnly.length).toBeGreaterThan(0);
    for (const record of deskOnly) {
      expect(record.position).toBe('desk');
    }
  });

  it('searches EN and TR names case-insensitively (incl. Turkish İ/i)', () => {
    const englishHits = filterLibraryExercises({ query: 'WALL PUSH' });
    expect(englishHits.some((record) => record.id === 'lib-0659')).toBe(true);

    const turkishHits = filterLibraryExercises({ query: 'BİLEK' });
    expect(turkishHits.some((record) => record.id === 'lib-1428')).toBe(true);

    const muscleHits = filterLibraryExercises({ query: 'triceps' });
    expect(muscleHits.length).toBeGreaterThan(0);
  });

  it('matches uppercase English queries containing I (dotted/dotless regression)', () => {
    // tr-locale folding alone turns "SIT" into "sıt" and misses "sit-up".
    const sitHits = filterLibraryExercises({ query: 'SIT' });
    expect(sitHits.some((record) => record.name.en.toLowerCase().includes('sit'))).toBe(true);

    const inclineHits = filterLibraryExercises({ query: 'INCLINE' });
    expect(inclineHits.some((record) => record.id === 'lib-0493')).toBe(true);

    // Dotless Turkish query still matches Turkish names.
    const dotlessHits = filterLibraryExercises({ query: 'AYAKTA' });
    expect(dotlessHits.length).toBeGreaterThan(0);
  });

  it('returns everything for an empty filter', () => {
    expect(filterLibraryExercises({}).length).toBe(LIBRARY_EXERCISES.length);
    expect(getLibraryExercises().length).toBe(LIBRARY_EXERCISES.length);
  });

  it('groups records by zone in display order without losses', () => {
    const groups = groupLibraryByZone(LIBRARY_EXERCISES);
    const orderedZoneIds = LIBRARY_ZONES.map((zone) => zone.id);
    let lastIndex = -1;
    let total = 0;
    for (const group of groups) {
      const index = orderedZoneIds.indexOf(group.zone.id);
      expect(index).toBeGreaterThan(lastIndex);
      lastIndex = index;
      total += group.items.length;
    }
    expect(total).toBe(LIBRARY_EXERCISES.length);
  });

  it('localizes names, steps, and muscle labels with safe fallbacks', () => {
    const record = getLibraryExerciseRecord('lib-1403');
    expect(record).toBeDefined();
    if (!record) return;
    expect(localizedName(record, 'tr')).toBe(record.name.tr);
    expect(localizedSteps(record, 'tr')).toBe(record.steps.tr);
    expect(muscleLabel('abs', 'tr')).toBe('Karın');
    expect(muscleLabel('abs', 'en')).toBe('Abs');
    expect(muscleLabel('mystery muscle', 'en')).toBe('Mystery muscle');
  });

  it('normalizes app languages to library locales', () => {
    expect(toLibraryLocale('tr')).toBe('tr');
    expect(toLibraryLocale('tr-TR')).toBe('tr');
    expect(toLibraryLocale('en')).toBe('en');
    expect(toLibraryLocale('de')).toBe('en');
    expect(toLibraryLocale(undefined)).toBe('en');
  });
});

describe('exercise library — session conversion', () => {
  it('builds a coherent timed session for every record', () => {
    for (const record of LIBRARY_EXERCISES) {
      const session = buildLibrarySessionExercise(record, 'en');
      const stepSum = session.steps.reduce((sum, step) => sum + step.duration, 0);
      expect(session.totalDuration).toBe(stepSum);
      expect(session.totalDuration).toBeGreaterThanOrEqual(45);
      expect(session.totalDuration).toBeLessThanOrEqual(180);
      // walkthrough steps + flow + release
      expect(session.steps.length).toBe(record.steps.en.length + 2);
      expect(session.media).toBeDefined();
      expect(session.title).toBe(record.name.en);
      expect(['stretch', 'active']).toContain(session.category);

      const stepIds = new Set(session.steps.map((step) => step.id));
      expect(stepIds.size).toBe(session.steps.length);

      const flow = session.steps[session.steps.length - 2];
      const release = session.steps[session.steps.length - 1];
      expect(flow.id.endsWith('-flow')).toBe(true);
      expect(flow.duration).toBeGreaterThanOrEqual(15);
      expect(release.animation).toBe('rest');
      expect(release.duration).toBe(10);

      expect(estimateSessionSeconds(record)).toBe(session.totalDuration);
    }
  });

  it('localizes session copy and caches per id+locale', () => {
    const record = getLibraryExerciseRecord('lib-1403');
    expect(record).toBeDefined();
    if (!record) return;

    const en = buildLibrarySessionExercise(record, 'en');
    const tr = buildLibrarySessionExercise(record, 'tr');
    expect(tr.title).toBe(record.name.tr);
    expect(tr.steps[0].instruction).toBe(record.steps.tr[0]);
    expect(en.steps[0].instruction).toBe(record.steps.en[0]);
    expect(buildLibrarySessionExercise(record, 'en')).toBe(en);
    expect(en).not.toBe(tr);
  });

  it('resolves through the data-layer bridge', () => {
    const viaBridge = getExerciseById('lib-1403', 'tr');
    expect(viaBridge).toBeDefined();
    expect(viaBridge?.media).toBeDefined();
    expect(getExerciseById('lib-9999')).toBeUndefined();
    // Core exercises still resolve untouched.
    expect(getExerciseById('eye-rest')?.id).toBe('eye-rest');
    expect(resolveLibrarySessionExercise('nope', 'en')).toBeUndefined();
  });

  it('is accepted by break-session param resolution', () => {
    expect(resolveBreakSessionBreakId('lib-1403')).toBe('lib-1403');
    expect(resolveBreakSessionBreakId('lib-0000')).toBe('deep-breath');
  });
});

describe('exercise library — subscription gating', () => {
  it('free starter ids all exist in the generated catalog', () => {
    for (const id of FREE_LIBRARY_EXERCISE_IDS) {
      const record = getLibraryExerciseRecord(id);
      expect(record).toBeDefined();
      expect(record && getLibraryMedia(record)).toBeDefined();
    }
  });

  it('starter moves are free; the rest are gated for free tier', () => {
    for (const id of FREE_LIBRARY_EXERCISE_IDS) {
      expect(isFreeExercise(id)).toBe(true);
      expect(requiresUpgradeForExercise(id, 'free')).toBe(false);
    }

    const starterSet = new Set<string>(FREE_LIBRARY_EXERCISE_IDS);
    const gated = LIBRARY_EXERCISES.filter((record) => !starterSet.has(record.id));
    expect(gated.length).toBeGreaterThan(0);
    for (const record of gated.slice(0, 10)) {
      expect(requiresUpgradeForExercise(record.id, 'free')).toBe(true);
      expect(requiresUpgradeForExercise(record.id, 'solo')).toBe(false);
    }
  });
});
