/**
 * Chained Session Composer
 *
 * Shared engine that stitches multiple library movements into one playable
 * Exercise: a short transition step before each move ("Next up: …"), the
 * move's walkthrough+flow steps with its GIF pinned per step, and a single
 * closing release. Zone circuits and user-authored custom routines both
 * compose through here so pacing and player behavior stay identical.
 */

import type { Exercise, ExerciseCategory, ExerciseStep } from '@/data/exercises';
import type { LibraryExerciseRecord } from './types';
import { getLibraryMedia, localizedName, type LibraryLocale } from './catalog';
import { buildLibrarySessionExercise, estimateSessionSeconds } from './session';

export const CHAIN_TRANSITION_SECONDS = 6;
export const CHAIN_RELEASE_SECONDS = 12;
/** Per-member release step dropped when chaining (see session.ts). */
const MEMBER_RELEASE_SECONDS = 10;

export const CHAIN_COPY: Record<LibraryLocale, { next: string; release: string }> = {
  en: {
    next: 'Next up:',
    release: 'All done — shake it out and breathe',
  },
  tr: {
    next: 'Sıradaki:',
    release: 'Hepsi tamam — silkelen ve nefes al',
  },
};

export interface ChainedSessionMeta {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  color: string;
  icon: string;
}

/** List-display estimate without building the chained session. */
export function estimateChainedSeconds(
  members: readonly LibraryExerciseRecord[]
): number {
  return members.reduce(
    (sum, member) =>
      sum +
      estimateSessionSeconds(member) -
      MEMBER_RELEASE_SECONDS +
      CHAIN_TRANSITION_SECONDS,
    CHAIN_RELEASE_SECONDS
  );
}

export function composeChainedSession(
  members: readonly LibraryExerciseRecord[],
  meta: ChainedSessionMeta,
  locale: LibraryLocale
): Exercise {
  const copy = CHAIN_COPY[locale];

  const steps: ExerciseStep[] = [];
  for (const [index, member] of members.entries()) {
    const memberMedia = getLibraryMedia(member);
    steps.push({
      id: `${meta.id}-t${index + 1}`,
      instruction: `${copy.next} ${localizedName(member, locale)}`,
      duration: CHAIN_TRANSITION_SECONDS,
      animation: 'rest',
      visualGuide: meta.icon,
    });

    // Reuse the member's walkthrough + flow steps (drop its release step)
    // and pin the member's GIF on each so the player switches media.
    const memberSession = buildLibrarySessionExercise(member, locale);
    for (const step of memberSession.steps.slice(0, -1)) {
      steps.push({ ...step, media: memberMedia });
    }
  }

  steps.push({
    id: `${meta.id}-release`,
    instruction: copy.release,
    duration: CHAIN_RELEASE_SECONDS,
    animation: 'rest',
    visualGuide: '😌',
  });

  return {
    id: meta.id,
    title: meta.title,
    description: meta.description,
    category: meta.category,
    totalDuration: steps.reduce((sum, step) => sum + step.duration, 0),
    color: meta.color,
    icon: meta.icon,
    steps,
    media: members.length > 0 ? getLibraryMedia(members[0]) : undefined,
    voiceLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
  };
}
