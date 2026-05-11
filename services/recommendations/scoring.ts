/**
 * Recommendation Scoring
 * Scores exercises based on user profile, history, and time of day
 */

import type { AnimationType, Exercise, ExerciseCategory } from '@/data/exercises';
import type { CompletedBreak } from '@/services/storage';

interface ScoringContext {
  painAreas: string[];
  painSeverity: Record<string, 'mild' | 'moderate' | 'severe'>;
  breakStyle: string[];
  recentBreakIds: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  todayBreakCount: number;
  historicalOutcomes?: RecommendationOutcomeSignal[];
}

export interface RecommendationOutcomeSignal {
  breakId: string;
  category: string;
  rating: CompletedBreak['rating'];
  reliefScore?: CompletedBreak['reliefScore'];
}

export interface HistoricalOutcomeSummary {
  exactAverage: number | null;
  exactCount: number;
  categoryAverage: number | null;
  categoryCount: number;
}

interface PainAreaRule {
  categories: ExerciseCategory[];
  keywords: string[];
  animations: AnimationType[];
}

const PAIN_AREA_RULES: Record<string, PainAreaRule> = {
  eyes: {
    categories: ['quick'],
    keywords: ['eye', 'gazing', 'palming', 'blink', 'vision', 'focus strain'],
    animations: [
      'eye-focus-far',
      'eye-focus-near',
      'eye-move-circle',
      'eye-move-horizontal',
      'eye-move-vertical',
      'eye-move-figure8',
      'eye-palming',
      'eye-rest',
    ],
  },
  head: {
    categories: ['quick', 'mindful'],
    keywords: ['breath', 'meditation', 'calm', 'mindful', 'grounding', 'stress', 'overload'],
    animations: ['breathe-in', 'breathe-hold', 'breathe-out', 'grounding', 'affirmation', 'rest'],
  },
  neck: {
    categories: ['quick', 'stretch'],
    keywords: ['neck', 'jaw', 'upper body', 'desk posture'],
    animations: ['rotate-left', 'rotate-right', 'tilt-left', 'tilt-right', 'tilt-forward', 'tilt-back', 'jaw-release'],
  },
  shoulders: {
    categories: ['quick', 'stretch'],
    keywords: ['shoulder', 'chest opener', 'upper body', 'desk posture'],
    animations: ['shoulder-shrug', 'stretch-up', 'stretch-side', 'chest-opener'],
  },
  upper_back: {
    categories: ['stretch', 'active'],
    keywords: ['upper back', 'spine', 'twist', 'cat-cow', 'desk posture', 'back release'],
    animations: ['cat-cow', 'seated-twist', 'spine-twist', 'stretch-back', 'stretch-up'],
  },
  lower_back: {
    categories: ['stretch', 'active'],
    keywords: ['lower back', 'spine', 'twist', 'cat-cow', 'hips', 'hamstrings', 'lower body'],
    animations: ['cat-cow', 'seated-twist', 'spine-twist', 'hip-opener', 'hamstring-stretch', 'stretch-forward'],
  },
  wrists: {
    categories: ['quick'],
    keywords: ['wrist', 'mouse usage', 'keyboard fatigue'],
    animations: ['wrist-circle', 'hand-stretch'],
  },
  hands: {
    categories: ['quick'],
    keywords: ['hand', 'wrist', 'keyboard fatigue', 'mouse usage'],
    animations: ['hand-stretch', 'wrist-circle', 'ear-massage'],
  },
};

const exercisePainAreaCache = new WeakMap<Exercise, string[]>();

// Time-of-day preferences
const TIME_PREFERENCES: Record<string, string[]> = {
  morning: ['quick', 'active'], // Energize in the morning
  afternoon: ['stretch', 'active'], // Movement in afternoon
  evening: ['mindful', 'stretch'], // Wind down in evening
  night: ['mindful', 'quick'], // Gentle at night
};

const SEVERITY_SCORE_BOOST: Record<'mild' | 'moderate' | 'severe', number> = {
  mild: 0,
  moderate: 6,
  severe: 12,
};

const EXERCISE_CATEGORIES: ExerciseCategory[] = ['quick', 'stretch', 'mindful', 'active'];

const BREAK_STYLE_CATEGORY_MAP: Record<string, ExerciseCategory[]> = {
  quick: ['quick'],
  stretch: ['stretch'],
  mindful: ['mindful'],
  active: ['active'],
  movement: ['active', 'stretch'],
  desk_exercises: ['stretch', 'quick'],
  breathing: ['mindful'],
  eye_micro: ['quick'],
  mixed: [],
};

const RATING_SCORE_MAP: Record<NonNullable<CompletedBreak['rating']>, number> = {
  good: 4,
  neutral: 0,
  bad: -6,
};

const RELIEF_SCORE_MAP: Record<NonNullable<CompletedBreak['reliefScore']>, number> = {
  worse: -10,
  same: -2,
  better: 6,
  much_better: 10,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeBreakStylePreferences(
  breakStyle: string[]
): ExerciseCategory[] {
  const categories = new Set<ExerciseCategory>();

  for (const style of breakStyle) {
    if (EXERCISE_CATEGORIES.includes(style as ExerciseCategory)) {
      categories.add(style as ExerciseCategory);
      continue;
    }

    for (const category of BREAK_STYLE_CATEGORY_MAP[style] ?? []) {
      categories.add(category);
    }
  }

  return Array.from(categories);
}

function getExerciseSearchText(exercise: Exercise): string {
  const stepText = exercise.steps
    .map((step) => `${step.instruction} ${step.voiceInstruction ?? ''} ${step.animation}`)
    .join(' ');
  return `${exercise.id} ${exercise.title} ${exercise.description} ${stepText}`.toLowerCase();
}

function getExercisePainAreaSignals(exercise: Exercise): string[] {
  const cached = exercisePainAreaCache.get(exercise);
  if (cached) {
    return cached;
  }

  const searchText = getExerciseSearchText(exercise);
  const stepAnimations = new Set(exercise.steps.map((step) => step.animation));
  const matchedPainAreas = Object.entries(PAIN_AREA_RULES)
    .filter(([, rule]) => {
      const matchesKeyword = rule.keywords.some((keyword) => searchText.includes(keyword));
      const matchesAnimation = rule.animations.some((animation) => stepAnimations.has(animation));
      return matchesKeyword || matchesAnimation;
    })
    .map(([painArea]) => painArea);

  exercisePainAreaCache.set(exercise, matchedPainAreas);
  return matchedPainAreas;
}

export function getMatchedPainAreas(
  exercise: Exercise,
  painAreas: string[]
): string[] {
  return painAreas.filter((painArea) => {
    if (painArea === 'none') {
      return false;
    }

    return getExercisePainAreaSignals(exercise).includes(painArea);
  });
}

function getOutcomeSignalScore(signal: RecommendationOutcomeSignal): number | null {
  const ratingScore = signal.rating ? RATING_SCORE_MAP[signal.rating] : null;
  const reliefScore = signal.reliefScore ? RELIEF_SCORE_MAP[signal.reliefScore] : null;

  if (ratingScore === null && reliefScore === null) {
    return null;
  }

  return (ratingScore ?? 0) + (reliefScore ?? 0);
}

function getAverageOutcomeScore(signals: RecommendationOutcomeSignal[]): number | null {
  const scoredSignals = signals
    .map(getOutcomeSignalScore)
    .filter((score): score is number => score !== null);

  if (scoredSignals.length === 0) {
    return null;
  }

  const total = scoredSignals.reduce((sum, score) => sum + score, 0);
  return total / scoredSignals.length;
}

export function getHistoricalOutcomeSummary(
  exercise: Exercise,
  historicalOutcomes: RecommendationOutcomeSignal[]
): HistoricalOutcomeSummary {
  const relevantSignals = historicalOutcomes.filter(
    (signal) => signal.rating !== null || signal.reliefScore !== null
  );
  const exactSignals = relevantSignals.filter((signal) => signal.breakId === exercise.id);
  const categorySignals = relevantSignals.filter(
    (signal) => signal.breakId !== exercise.id && signal.category === exercise.category
  );

  return {
    exactAverage: getAverageOutcomeScore(exactSignals),
    exactCount: exactSignals.length,
    categoryAverage: getAverageOutcomeScore(categorySignals),
    categoryCount: categorySignals.length,
  };
}

/**
 * Score a single exercise for the given context
 */
export function scoreExercise(exercise: Exercise, context: ScoringContext): number {
  let score = 50; // Base score
  const preferredCategories = normalizeBreakStylePreferences(context.breakStyle);

  // Pain area relevance (+30 max)
  for (const painArea of context.painAreas) {
    const rule = PAIN_AREA_RULES[painArea];
    if (!rule) continue;
    const severityBoost = SEVERITY_SCORE_BOOST[context.painSeverity[painArea] ?? 'mild'];

    if (getExercisePainAreaSignals(exercise).includes(painArea)) {
      score += 20 + severityBoost;
    }
    if (rule.categories.includes(exercise.category)) {
      score += 10 + Math.round(severityBoost / 2);
    }
  }

  // Break style preference match (+15 max)
  if (preferredCategories.includes(exercise.category)) {
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

  const outcomeSummary = getHistoricalOutcomeSummary(
    exercise,
    context.historicalOutcomes ?? []
  );
  if (outcomeSummary.exactAverage !== null) {
    score += clamp(Math.round(outcomeSummary.exactAverage), -16, 16);
  }
  if (outcomeSummary.categoryAverage !== null) {
    score += clamp(Math.round(outcomeSummary.categoryAverage * 0.4), -6, 6);
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
