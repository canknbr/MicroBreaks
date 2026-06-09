import {
  isFreeExercise,
  requiresUpgradeForExercise,
} from '@/services/subscription/exerciseAccess';
import { FREE_EXERCISE_IDS } from '@/constants/subscription';
import type { Tier } from '@/services/subscription/tiers';

describe('isFreeExercise', () => {
  it('returns true for every id in FREE_EXERCISE_IDS', () => {
    for (const id of FREE_EXERCISE_IDS) {
      expect(isFreeExercise(id)).toBe(true);
    }
  });

  it('returns false for unknown / paid exercise ids', () => {
    expect(isFreeExercise('definitely-not-free')).toBe(false);
  });

  it('returns false for empty / null / undefined input', () => {
    expect(isFreeExercise('')).toBe(false);
    expect(isFreeExercise(null)).toBe(false);
    expect(isFreeExercise(undefined)).toBe(false);
  });
});

describe('requiresUpgradeForExercise', () => {
  it('never asks free users to upgrade for a starter exercise', () => {
    for (const id of FREE_EXERCISE_IDS) {
      expect(requiresUpgradeForExercise(id, 'free')).toBe(false);
    }
  });

  it('asks free + solo users to upgrade for any non-starter exercise', () => {
    expect(requiresUpgradeForExercise('mindful-deep-focus', 'free')).toBe(true);
    // solo+ already includes full_break_library — no upgrade prompt.
    expect(requiresUpgradeForExercise('mindful-deep-focus', 'solo')).toBe(false);
  });

  it('does not ask pro / family users to upgrade for any exercise', () => {
    const tiers: Tier[] = ['pro', 'family'];
    for (const tier of tiers) {
      expect(requiresUpgradeForExercise('any-paid-id', tier)).toBe(false);
      expect(requiresUpgradeForExercise(FREE_EXERCISE_IDS[0], tier)).toBe(false);
    }
  });

  it('returns false on unknown id input so the screen can decide what to do', () => {
    // We don't want to flash a paywall for an exercise id we can't
    // identify — let the screen surface a 404-style error instead.
    expect(requiresUpgradeForExercise(null, 'free')).toBe(false);
    expect(requiresUpgradeForExercise(undefined, 'free')).toBe(false);
    expect(requiresUpgradeForExercise('', 'free')).toBe(false);
  });
});
