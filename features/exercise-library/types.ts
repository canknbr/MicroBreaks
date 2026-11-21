/**
 * Exercise Library Types
 *
 * The movement library is a set of desk moves drawn with the project's own
 * figure rig (see scripts/generate-move-library.mjs). Records are generated
 * into data/exerciseLibrary.generated.ts; each has an animated WebP demo and
 * a still key pose. Artwork and text are original to this project.
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
 * Where the move happens:
 *  - desk: in your chair or with your desk
 *  - standing: on your feet next to the desk
 * Nothing in the library needs the floor.
 */
export type LibraryPosition = 'desk' | 'standing';

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
  /** App-wide unique id, namespaced as `lib-<mediaKey>`. */
  id: string;
  /** Move slug (e.g. `seated-twist`) — keys the generated media map. */
  mediaKey: string;
  name: LocalizedText;
  bodyPart: LibraryBodyPart;
  /** Primary target muscle (e.g. "levator scapulae"). */
  target: string;
  secondaryMuscles: readonly string[];
  kind: LibraryKind;
  position: LibraryPosition;
  /** 1 gentle · 2 moderate · 3 challenging */
  difficulty: 1 | 2 | 3;
  steps: LocalizedSteps;
}
