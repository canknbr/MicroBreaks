import type { ExerciseCategory } from '@/data/exercises';
import type { RecommendationOutcomeSignal } from '@/services/recommendations/scoring';
import type { CompletedBreak } from '@/services/storage';

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

export interface BreakOutcomeSummary {
  exactAverage: number | null;
  exactCount: number;
  categoryAverage: number | null;
  categoryCount: number;
}

export interface BreakOutcomeBadge {
  label: string;
  tone: 'positive' | 'warning';
}

export interface OutcomeSortableBreak {
  id: string;
  category: ExerciseCategory;
  isLocked: boolean;
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

function hasOutcomeSignal(
  signal: CompletedBreak
): boolean {
  return signal.rating !== null || signal.reliefScore !== null;
}

export function mapBreakHistoryToOutcomeSignals(
  history: CompletedBreak[],
  limit: number = 20
): RecommendationOutcomeSignal[] {
  return history
    .slice(0, limit)
    .filter(hasOutcomeSignal)
    .map((breakEntry) => ({
      breakId: breakEntry.breakId,
      category: breakEntry.category,
      rating: breakEntry.rating,
      reliefScore: breakEntry.reliefScore ?? null,
    }));
}

export function getBreakOutcomeSummary(
  breakId: string,
  category: ExerciseCategory,
  historicalOutcomes: RecommendationOutcomeSignal[]
): BreakOutcomeSummary {
  const relevantSignals = historicalOutcomes.filter(
    (signal) => signal.rating !== null || signal.reliefScore !== null
  );
  const exactSignals = relevantSignals.filter((signal) => signal.breakId === breakId);
  const categorySignals = relevantSignals.filter(
    (signal) => signal.breakId !== breakId && signal.category === category
  );

  return {
    exactAverage: getAverageOutcomeScore(exactSignals),
    exactCount: exactSignals.length,
    categoryAverage: getAverageOutcomeScore(categorySignals),
    categoryCount: categorySignals.length,
  };
}

export function getBreakOutcomeBadge(
  breakId: string,
  category: ExerciseCategory,
  historicalOutcomes: RecommendationOutcomeSignal[]
): BreakOutcomeBadge | null {
  const summary = getBreakOutcomeSummary(breakId, category, historicalOutcomes);

  if (summary.exactAverage !== null && summary.exactAverage >= 6) {
    return {
      label: 'Works well for you',
      tone: 'positive',
    };
  }

  if (summary.exactAverage !== null && summary.exactAverage <= -4) {
    return {
      label: 'Try a fresher reset',
      tone: 'warning',
    };
  }

  if (summary.categoryAverage !== null && summary.categoryAverage >= 5 && summary.categoryCount >= 2) {
    return {
      label: 'This type tends to help',
      tone: 'positive',
    };
  }

  if (summary.categoryAverage !== null && summary.categoryAverage <= -4 && summary.categoryCount >= 2) {
    return {
      label: 'Use when you need variety',
      tone: 'warning',
    };
  }

  return null;
}

function getBreakOutcomeSortScore(
  breakItem: OutcomeSortableBreak,
  historicalOutcomes: RecommendationOutcomeSignal[],
  preferredBreakId: string | null,
  hasActiveSubscription: boolean
): number {
  const summary = getBreakOutcomeSummary(
    breakItem.id,
    breakItem.category,
    historicalOutcomes
  );

  let score = 0;

  if (!hasActiveSubscription && breakItem.isLocked) {
    score -= 200;
  }

  if (summary.exactAverage !== null) {
    score += summary.exactAverage * 2;
    score += Math.min(summary.exactCount, 3);
  } else if (summary.categoryAverage !== null) {
    score += summary.categoryAverage * 0.75;
    score += Math.min(summary.categoryCount, 4) * 0.25;
  }

  if (preferredBreakId && breakItem.id === preferredBreakId) {
    score += 1;
  }

  return score;
}

export function sortBreakListByOutcome<T extends OutcomeSortableBreak>(
  items: T[],
  historicalOutcomes: RecommendationOutcomeSignal[],
  preferredBreakId: string | null,
  hasActiveSubscription: boolean
): T[] {
  return items
    .map((item, index) => ({
      item,
      index,
      score: getBreakOutcomeSortScore(
        item,
        historicalOutcomes,
        preferredBreakId,
        hasActiveSubscription
      ),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.item);
}
