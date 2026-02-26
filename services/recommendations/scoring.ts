/**
 * Recommendation Scoring
 * Scores exercises based on user profile, history, and time of day
 */

import type { Exercise } from '@/data/exercises';

interface ScoringContext {
  painAreas: string[];
  breakStyle: string[];
  recentBreakIds: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  todayBreakCount: number;
}

// Maps pain areas to exercise categories and specific exercise IDs
const PAIN_AREA_EXERCISE_MAP: Record<string, { categories: string[]; exerciseIds: string[] }> = {
  eyes: {
    categories: ['quick'],
    exerciseIds: ['eye-rest', 'eye-palming', 'eye-figure-8', 'distance-gazing'],
  },
  neck: {
    categories: ['quick', 'stretch'],
    exerciseIds: ['neck-roll', 'upper-body-stretch', 'jaw-release'],
  },
  back: {
    categories: ['stretch', 'active'],
    exerciseIds: ['lower-body-stretch', 'full-body-stretch', 'cat-cow', 'spine-twist', 'seated-spinal-twist'],
  },
  wrists: {
    categories: ['quick'],
    exerciseIds: ['wrist-stretch', 'wrist-circles', 'hand-stretch'],
  },
  shoulders: {
    categories: ['quick', 'stretch'],
    exerciseIds: ['shoulder-shrugs', 'chest-opener', 'upper-body-stretch'],
  },
};

// Time-of-day preferences
const TIME_PREFERENCES: Record<string, string[]> = {
  morning: ['quick', 'active'], // Energize in the morning
  afternoon: ['stretch', 'active'], // Movement in afternoon
  evening: ['mindful', 'stretch'], // Wind down in evening
  night: ['mindful', 'quick'], // Gentle at night
};

/**
 * Score a single exercise for the given context
 */
export function scoreExercise(exercise: Exercise, context: ScoringContext): number {
  let score = 50; // Base score

  // Pain area relevance (+30 max)
  for (const painArea of context.painAreas) {
    const mapping = PAIN_AREA_EXERCISE_MAP[painArea];
    if (!mapping) continue;

    if (mapping.exerciseIds.includes(exercise.id)) {
      score += 20;
    }
    if (mapping.categories.includes(exercise.category)) {
      score += 10;
    }
  }

  // Break style preference match (+15 max)
  if (context.breakStyle.includes(exercise.category)) {
    score += 15;
  }

  // Time-of-day appropriateness (+10)
  const timePrefs = TIME_PREFERENCES[context.timeOfDay] ?? [];
  if (timePrefs.includes(exercise.category)) {
    score += 10;
  }

  // Variety penalty: penalize recently done exercises (-20 per recent)
  const recentIndex = context.recentBreakIds.indexOf(exercise.id);
  if (recentIndex !== -1) {
    score -= 20;
  }

  // Duration preference: favor quick exercises early in the day when few breaks done
  if (context.todayBreakCount < 2 && exercise.totalDuration <= 120) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get the current time-of-day category
 */
export function getTimeOfDay(): ScoringContext['timeOfDay'] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}
