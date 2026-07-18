/**
 * Zone Circuits & Suggestions Tests
 * Chained-session composition, deterministic daily plans, and next-move
 * cycling for the movement library.
 */

import {
  CIRCUIT_MOVE_COUNT,
  buildZoneCircuit,
  circuitIdForZone,
  getCircuitMembers,
  getZoneCircuits,
  isCircuitId,
  resolveCircuitExercise,
} from '@/features/exercise-library/circuits';
import {
  formatPlanDateKey,
  getNextZoneMove,
  getPlanZones,
  getTodayPlan,
} from '@/features/exercise-library/suggestions';
import { LIBRARY_ZONES, zoneForBodyPart } from '@/features/exercise-library/catalog';
import { getExerciseById } from '@/data/exercises';
import { FREE_CIRCUIT_IDS } from '@/constants/subscription';
import { requiresUpgradeForExercise } from '@/services/subscription/exerciseAccess';

describe('zone circuits', () => {
  it('builds a coherent chained session for every zone', () => {
    for (const zone of LIBRARY_ZONES) {
      const members = getCircuitMembers(zone.id);
      expect(members.length).toBe(CIRCUIT_MOVE_COUNT);
      for (const member of members) {
        expect(zoneForBodyPart(member.bodyPart)).toBe(zone.id);
      }

      const circuit = buildZoneCircuit(zone.id, 'en');
      expect(circuit.id).toBe(circuitIdForZone(zone.id));
      const stepSum = circuit.steps.reduce((sum, step) => sum + step.duration, 0);
      expect(circuit.totalDuration).toBe(stepSum);
      // 3–6 minutes: long enough to feel like a routine, short enough for a break.
      expect(circuit.totalDuration).toBeGreaterThanOrEqual(150);
      expect(circuit.totalDuration).toBeLessThanOrEqual(400);

      // Per-move media pinned on working steps; transitions/release are rest.
      const mediaSteps = circuit.steps.filter((step) => step.media);
      expect(mediaSteps.length).toBeGreaterThan(0);
      const distinctMedia = new Set(mediaSteps.map((step) => step.media));
      expect(distinctMedia.size).toBe(CIRCUIT_MOVE_COUNT);
      expect(circuit.steps[0].animation).toBe('rest');
      expect(circuit.steps[circuit.steps.length - 1].animation).toBe('rest');

      const ids = new Set(circuit.steps.map((step) => step.id));
      expect(ids.size).toBe(circuit.steps.length);
    }
  });

  it('localizes circuit copy per locale and caches per zone+locale', () => {
    const en = buildZoneCircuit('neck', 'en');
    const tr = buildZoneCircuit('neck', 'tr');
    expect(en.title).not.toBe(tr.title);
    expect(tr.voiceLanguage).toBe('tr-TR');
    expect(buildZoneCircuit('neck', 'en')).toBe(en);
  });

  it('resolves through the data-layer bridge and rejects unknown ids', () => {
    expect(isCircuitId('circuit-neck')).toBe(true);
    expect(isCircuitId('lib-0001')).toBe(false);
    expect(getExerciseById('circuit-neck', 'tr')?.title).toBe(
      buildZoneCircuit('neck', 'tr').title
    );
    expect(resolveCircuitExercise('circuit-unknown', 'en')).toBeUndefined();
    expect(getZoneCircuits('en').length).toBe(LIBRARY_ZONES.length);
  });

  it('keeps the neck circuit free and gates the rest', () => {
    for (const id of FREE_CIRCUIT_IDS) {
      expect(requiresUpgradeForExercise(id, 'free')).toBe(false);
    }
    expect(requiresUpgradeForExercise('circuit-core', 'free')).toBe(true);
    expect(requiresUpgradeForExercise('circuit-core', 'solo')).toBe(false);
  });
});

describe('today plan', () => {
  it('prioritizes pain-area zones then fills to three', () => {
    expect(getPlanZones(['neck', 'wrists'])).toEqual(['neck', 'arms', 'back']);
    expect(getPlanZones(['lower_back'])).toEqual(['back', 'neck', 'core']);
    expect(getPlanZones([])).toEqual(['neck', 'back', 'core']);
    // Pain areas without a movement zone (eyes) are skipped.
    expect(getPlanZones(['eyes'])).toEqual(['neck', 'back', 'core']);
  });

  it('is deterministic for the same day and rotates across days', () => {
    const a = getTodayPlan(['neck'], '2026-07-18');
    const b = getTodayPlan(['neck'], '2026-07-18');
    expect(a.map((record) => record.id)).toEqual(b.map((record) => record.id));
    expect(a.length).toBe(3);
    expect(new Set(a.map((record) => record.id)).size).toBe(3);

    // Across a week, at least one day differs from day one.
    const first = a.map((record) => record.id).join(',');
    const week = ['19', '20', '21', '22', '23', '24'].map((day) =>
      getTodayPlan(['neck'], `2026-07-${day}`)
        .map((record) => record.id)
        .join(',')
    );
    expect(week.some((planKey) => planKey !== first)).toBe(true);
  });

  it('formats local date keys as YYYY-MM-DD', () => {
    expect(formatPlanDateKey(new Date(2026, 6, 18))).toBe('2026-07-18');
    expect(formatPlanDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('next zone move', () => {
  it('suggests another move from the same zone and cycles deterministically', () => {
    const next = getNextZoneMove('lib-1403', () => true);
    expect(next).not.toBeNull();
    expect(next?.id).not.toBe('lib-1403');
    if (next) {
      expect(zoneForBodyPart(next.bodyPart)).toBe('neck');
    }
    expect(getNextZoneMove('lib-1403', () => true)?.id).toBe(next?.id);
  });

  it('skips unplayable candidates and returns null when nothing is playable', () => {
    const blockedId = getNextZoneMove('lib-1403', () => true)?.id;
    const alternative = getNextZoneMove('lib-1403', (id) => id !== blockedId);
    expect(alternative?.id).not.toBe(blockedId);

    expect(getNextZoneMove('lib-1403', () => false)).toBeNull();
    expect(getNextZoneMove('not-a-library-id', () => true)).toBeNull();
  });
});
