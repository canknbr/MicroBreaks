/**
 * Exercise Library Types
 *
 * The movement library is a curated, desk-friendly subset of the open
 * exercises dataset (see scripts/generate-exercise-library.mjs). Records
 * are generated into data/exerciseLibrary.generated.ts and rendered with
 * 180×180 GIF media (© Gym visual — https://gymvisual.com/).
 */

/** Dataset body-part taxonomy (subset present in the curated library). */
export type LibraryBodyPart =
  | 'back'
  | 'cardio'
  | 'chest'
  | 'lower arms'
  | 'lower legs'
  | 'neck'
  | 'shoulders'
  | 'upper arms'
  | 'upper legs'
  | 'waist';

/** What the movement does — drives session pacing and category mapping. */
export type LibraryKind = 'stretch' | 'mobility' | 'strength' | 'cardio';

/**
 * Minimum space the movement needs:
 *  - desk: doable in/with your chair or desk
 *  - standing: a small patch of open floor next to the desk
 *  - floor: needs to lie/kneel down (mat territory)
 */
export type LibraryPosition = 'desk' | 'standing' | 'floor';

/** User-facing body zones the UI groups and filters by. */
export type LibraryZoneId =
  | 'neck'
  | 'back'
  | 'chest'
  | 'arms'
  | 'core'
  | 'legs'
  | 'cardio';

export interface LocalizedText {
  en: string;
  tr: string;
}

export interface LocalizedSteps {
  en: readonly string[];
  tr: readonly string[];
}

export interface LibraryExerciseRecord {
  /** App-wide unique id, namespaced as `lib-<datasetId>`. */
  id: string;
  /** Four-digit dataset id — keys the generated media map. */
  datasetId: string;
  name: LocalizedText;
  bodyPart: LibraryBodyPart;
  /** Primary target muscle from the dataset (e.g. "levator scapulae"). */
  target: string;
  secondaryMuscles: readonly string[];
  kind: LibraryKind;
  position: LibraryPosition;
  /** 1 gentle · 2 moderate · 3 challenging */
  difficulty: 1 | 2 | 3;
  steps: LocalizedSteps;
}
