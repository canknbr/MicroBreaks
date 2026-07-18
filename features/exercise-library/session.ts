/**
 * Library → Break Session Conversion
 *
 * Turns a static movement record into a playable, timed `Exercise` for the
 * break-session player: a short guided walkthrough of the instruction steps,
 * a longer "flow" block where the user follows the looping animation, and a
 * closing release step. All copy is resolved for the active locale at build
 * time so the session player stays locale-agnostic.
 */

import type { Exercise, ExerciseCategory, ExerciseStep } from '@/data/exercises';
import type { LibraryExerciseRecord, LibraryKind } from './types';
import {
  getLibraryExerciseRecord,
  getLibraryMedia,
  localizedName,
  localizedSteps,
  zoneMetaForRecord,
  type LibraryLocale,
} from './catalog';

/** Target seconds of actual work per movement kind (before the release step). */
const WORK_SECONDS: Record<LibraryKind, number> = {
  stretch: 80,
  mobility: 60,
  strength: 60,
  cardio: 45,
};

const WALKTHROUGH_SHARE = 0.55;
const WALKTHROUGH_MIN_STEP = 8;
const WALKTHROUGH_MAX_STEP = 20;
const FLOW_MIN_SECONDS = 15;
const RELEASE_SECONDS = 10;

const CATEGORY_FOR_KIND: Record<LibraryKind, ExerciseCategory> = {
  stretch: 'stretch',
  mobility: 'stretch',
  strength: 'active',
  cardio: 'active',
};

const SESSION_COPY: Record<
  LibraryLocale,
  {
    flow: Record<LibraryKind, string>;
    release: string;
    description: Record<LibraryKind, string>;
  }
> = {
  en: {
    flow: {
      stretch: 'Hold the stretch — breathe slowly and sink a little deeper',
      mobility: 'Keep flowing through the movement at a calm pace',
      strength: 'Keep repeating with controlled form — follow the animation',
      cardio: 'Keep the rhythm going — stay light on your feet',
    },
    release: 'Nice work — release, shake it out, and breathe',
    description: {
      stretch: 'Guided stretch',
      mobility: 'Mobility reset',
      strength: 'Strength micro-set',
      cardio: 'Energy burst',
    },
  },
  tr: {
    flow: {
      stretch: 'Esnemede kal — yavaş nefes al ve biraz daha gevşe',
      mobility: 'Hareketi sakin bir tempoda akıcı şekilde sürdür',
      strength: 'Kontrollü formda tekrarlamaya devam et — animasyonu takip et',
      cardio: 'Ritmi koru — ayakların hafif kalsın',
    },
    release: 'Harika iş — bırak, silkelen ve nefes al',
    description: {
      stretch: 'Rehberli esneme',
      mobility: 'Mobilite molası',
      strength: 'Mini güç seti',
      cardio: 'Enerji patlaması',
    },
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface SessionTiming {
  walkthroughStepSeconds: number;
  flowSeconds: number;
  totalSeconds: number;
}

function computeTiming(kind: LibraryKind, stepCount: number): SessionTiming {
  const work = WORK_SECONDS[kind];
  const safeStepCount = Math.max(1, stepCount);
  const walkthroughStepSeconds = clamp(
    Math.round((work * WALKTHROUGH_SHARE) / safeStepCount),
    WALKTHROUGH_MIN_STEP,
    WALKTHROUGH_MAX_STEP
  );
  const flowSeconds = Math.max(
    work - walkthroughStepSeconds * safeStepCount,
    FLOW_MIN_SECONDS
  );
  return {
    walkthroughStepSeconds,
    flowSeconds,
    totalSeconds:
      walkthroughStepSeconds * safeStepCount + flowSeconds + RELEASE_SECONDS,
  };
}

/** List-display estimate without building the full session. */
export function estimateSessionSeconds(record: LibraryExerciseRecord): number {
  return computeTiming(record.kind, record.steps.en.length).totalSeconds;
}

const sessionCache = new Map<string, Exercise>();

/**
 * Build (and cache) the playable session for a library record. The cache key
 * includes the locale so a language switch produces freshly localized steps.
 */
export function buildLibrarySessionExercise(
  record: LibraryExerciseRecord,
  locale: LibraryLocale
): Exercise {
  const cacheKey = `${record.id}:${locale}`;
  const cached = sessionCache.get(cacheKey);
  if (cached) return cached;

  const zone = zoneMetaForRecord(record);
  const steps = localizedSteps(record, locale);
  const timing = computeTiming(record.kind, steps.length);
  const copy = SESSION_COPY[locale];

  const walkthroughSteps: ExerciseStep[] = steps.map((instruction, index) => ({
    id: `${record.id}-step-${index + 1}`,
    instruction,
    duration: timing.walkthroughStepSeconds,
    animation: 'hold',
    visualGuide: zone.icon,
  }));

  // The '-flow' id suffix is a contract with app/break-session.tsx, which
  // uses it to show the follow-along badge during this block. Walkthrough
  // ids end in '-step-N' and the closer in '-release', so it can't collide.
  const flowStep: ExerciseStep = {
    id: `${record.id}-flow`,
    instruction: copy.flow[record.kind],
    duration: timing.flowSeconds,
    animation: record.kind === 'stretch' ? 'hold' : 'active',
    visualGuide: zone.icon,
  };

  const releaseStep: ExerciseStep = {
    id: `${record.id}-release`,
    instruction: copy.release,
    duration: RELEASE_SECONDS,
    animation: 'rest',
    visualGuide: '😌',
  };

  const exercise: Exercise = {
    id: record.id,
    title: localizedName(record, locale),
    description: copy.description[record.kind],
    category: CATEGORY_FOR_KIND[record.kind],
    totalDuration: timing.totalSeconds,
    color: zone.color,
    icon: zone.icon,
    steps: [...walkthroughSteps, flowStep, releaseStep],
    media: getLibraryMedia(record),
    voiceLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
  };

  sessionCache.set(cacheKey, exercise);
  return exercise;
}

/**
 * Resolve a `lib-*` id to a playable session exercise, or undefined for
 * unknown ids. Used by the data-layer `getExerciseById` bridge.
 */
export function resolveLibrarySessionExercise(
  id: string,
  locale: LibraryLocale
): Exercise | undefined {
  const record = getLibraryExerciseRecord(id);
  if (!record) return undefined;
  return buildLibrarySessionExercise(record, locale);
}
