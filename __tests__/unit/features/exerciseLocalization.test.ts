/**
 * Core Exercise Localization Tests
 * Guarantees every hand-authored guided break has Turkish display copy and
 * that localization preserves identity semantics for React memoization.
 */

import { ALL_EXERCISES } from '@/data/exercises';
import { CORE_EXERCISE_TR, localizeExercise } from '@/data/exerciseLocalization';

describe('core exercise localization', () => {
  it('covers every core exercise id with non-empty Turkish copy', () => {
    for (const exercise of ALL_EXERCISES) {
      const meta = CORE_EXERCISE_TR[exercise.id];
      expect(meta).toBeDefined();
      expect(meta.title.trim().length).toBeGreaterThan(0);
      expect(meta.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('has no orphan localization entries', () => {
    const knownIds = new Set(ALL_EXERCISES.map((exercise) => exercise.id));
    for (const id of Object.keys(CORE_EXERCISE_TR)) {
      expect(knownIds.has(id)).toBe(true);
    }
  });

  it('localizes title/description for tr and passes en through untouched', () => {
    const exercise = ALL_EXERCISES[0];
    expect(localizeExercise(exercise, 'en')).toBe(exercise);

    const localized = localizeExercise(exercise, 'tr');
    expect(localized).not.toBe(exercise);
    expect(localized.title).toBe(CORE_EXERCISE_TR[exercise.id].title);
    expect(localized.description).toBe(CORE_EXERCISE_TR[exercise.id].description);
    // Everything else — steps, timing, category — is untouched.
    expect(localized.steps).toBe(exercise.steps);
    expect(localized.totalDuration).toBe(exercise.totalDuration);
    expect(localized.voiceLanguage).toBeUndefined();
  });

  it('returns a stable cached instance per exercise for tr', () => {
    const exercise = ALL_EXERCISES[1];
    expect(localizeExercise(exercise, 'tr')).toBe(localizeExercise(exercise, 'tr'));
  });

  it('passes pre-localized library exercises through unchanged', () => {
    const fakeLibraryExercise = {
      ...ALL_EXERCISES[0],
      id: 'lib-0001',
      title: 'Önceden yerelleştirilmiş',
    };
    expect(localizeExercise(fakeLibraryExercise, 'tr')).toBe(fakeLibraryExercise);
  });
});
