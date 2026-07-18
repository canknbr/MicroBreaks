/**
 * Recommendation Engine
 * Generates personalized exercise recommendations based on user profile and history
 */

import { ALL_EXERCISES } from '@/data/exercises';
import type { Exercise } from '@/data/exercises';
import {
  scoreExercise,
  getTimeOfDay,
  getMatchedPainAreas,
  normalizeBreakStylePreferences,
  getHistoricalOutcomeSummary,
  type RecommendationOutcomeSignal,
} from './scoring';
import type { OnboardingData } from '@/store/onboardingStore';

export interface Recommendation {
  exercise: Exercise;
  score: number;
  reason: string;
}

export interface PersonalizedPlan {
  matchScore: number;
  primaryConcern: string;
  recommendedFocus: string;
  optimalSchedule: string;
  weekGoal: string;
  topExercises: Recommendation[];
}

/**
 * Get top N exercise recommendations for the user
 */
export function getRecommendations(
  painAreas: string[],
  painSeverity: Record<string, 'mild' | 'moderate' | 'severe'>,
  breakStyle: string[],
  recentBreakIds: string[],
  todayBreakCount: number,
  count: number = 5,
  historicalOutcomes: RecommendationOutcomeSignal[] = []
): Recommendation[] {
  const timeOfDay = getTimeOfDay();

  const scored = ALL_EXERCISES.map((exercise) => ({
    exercise,
    score: scoreExercise(exercise, {
      painAreas,
      painSeverity,
      breakStyle,
      recentBreakIds,
      timeOfDay,
      todayBreakCount,
      historicalOutcomes,
    }),
    reason: getRecommendationReason(
      exercise,
      painAreas,
      breakStyle,
      timeOfDay,
      historicalOutcomes
    ),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, count);
}

/**
 * Get a single recommended exercise (for quick break suggestions)
 */
export function getSuggestedBreak(
  painAreas: string[],
  painSeverity: Record<string, 'mild' | 'moderate' | 'severe'>,
  breakStyle: string[],
  recentBreakIds: string[],
  todayBreakCount: number,
  historicalOutcomes: RecommendationOutcomeSignal[] = []
): Recommendation | null {
  const recommendations = getRecommendations(
    painAreas,
    painSeverity,
    breakStyle,
    recentBreakIds,
    todayBreakCount,
    1,
    historicalOutcomes
  );
  return recommendations[0] ?? null;
}

/**
 * Generate a personalized plan based on onboarding data
 */
export function generatePersonalizedPlan(data: Partial<OnboardingData>): PersonalizedPlan {
  const painAreas = (data.painAreas ?? []).filter((area) => area !== 'none');
  const painSeverity = data.painSeverity ?? {};
  const breakStyle = normalizeBreakStylePreferences(data.breakStyle ?? []);
  const breakInterval = data.breakInterval ?? 25;
  const screenTime = data.screenTime ?? 8;

  // Calculate match score based on profile completeness
  let matchScore = 60; // Base
  if (painAreas.length > 0) matchScore += 10;
  if (Object.keys(painSeverity).length > 0) matchScore += 5;
  if (breakStyle.length > 0) matchScore += 10;
  if (data.workRole) matchScore += 5;
  if (data.energyPattern) matchScore += 5;
  if (data.screenTime) matchScore += 5;
  if (data.workPattern) matchScore += 5;
  matchScore = Math.min(98, matchScore);

  // Primary concern
  const concernMap: Record<string, string> = {
    eyes: 'Eye strain & digital fatigue',
    head: 'Head tension & mental overload',
    neck: 'Neck & shoulder tension',
    shoulders: 'Shoulder tension',
    upper_back: 'Upper back tightness',
    lower_back: 'Lower back discomfort',
    wrists: 'Wrist & hand strain',
    hands: 'Hand fatigue & tension',
  };
  const primaryConcern = painAreas.length > 0
    ? painAreas.map((area) => concernMap[area] ?? area).join(', ')
    : 'General wellness';

  // Recommended focus
  const focusMap: Record<string, string> = {
    quick: 'Quick relief exercises',
    stretch: 'Stretching routines',
    mindful: 'Mindfulness sessions',
    active: 'Active movement breaks',
  };
  const recommendedFocus = breakStyle.length > 0
    ? breakStyle.map((style) => focusMap[style] ?? style).join(' & ')
    : 'Mixed exercise variety';

  // Optimal schedule
  const breakDuration = breakStyle.includes('quick') ? '1-2' : breakStyle.includes('stretch') ? '3-5' : '2-3';
  const optimalSchedule = `${breakInterval}-min work, ${breakDuration}-min breaks`;

  // Week goal
  const dailyGoal = Math.max(3, Math.ceil(screenTime / 2));
  const weekGoal = `${dailyGoal} breaks/day, build consistency`;

  // Top exercises
  const topExercises = getRecommendations(painAreas, painSeverity, breakStyle, [], 0, 5);

  return {
    matchScore,
    primaryConcern,
    recommendedFocus,
    optimalSchedule,
    weekGoal,
    topExercises,
  };
}

/**
 * Generate a human-readable reason for a recommendation
 */
function getRecommendationReason(
  exercise: Exercise,
  painAreas: string[],
  breakStyle: string[],
  timeOfDay: string,
  historicalOutcomes: RecommendationOutcomeSignal[]
): string {
  const painAreaLabels: Record<string, string> = {
    eyes: 'eye strain',
    head: 'head tension',
    neck: 'neck relief',
    shoulders: 'shoulder tension',
    upper_back: 'upper back relief',
    lower_back: 'lower back relief',
    wrists: 'wrist strain',
    hands: 'hand fatigue',
  };

  const outcomeSummary = getHistoricalOutcomeSummary(exercise, historicalOutcomes);
  if (outcomeSummary.exactAverage !== null && outcomeSummary.exactAverage >= 6) {
    return 'You have felt better after this reset before';
  }
  if (outcomeSummary.exactAverage !== null && outcomeSummary.exactAverage <= -4) {
    return 'Fresh alternative after low-relief results';
  }
  if (outcomeSummary.categoryAverage !== null && outcomeSummary.categoryAverage >= 5) {
    return 'Similar resets have felt high-relief lately';
  }
  if (outcomeSummary.categoryAverage !== null && outcomeSummary.categoryAverage <= -4) {
    return 'A better alternative to low-relief routines';
  }

  const matchedPainAreas = getMatchedPainAreas(exercise, painAreas);
  if (matchedPainAreas.length > 0) {
    const topMatch = matchedPainAreas[0]!;
    return `Great for ${painAreaLabels[topMatch] ?? topMatch}`;
  }

  // Check break style match
  const preferredCategories = normalizeBreakStylePreferences(breakStyle);
  if (preferredCategories.includes(exercise.category)) {
    const categoryLabels: Record<string, string> = {
      quick: 'quick reset',
      stretch: 'stretching',
      mindful: 'mindfulness',
      active: 'movement',
    };
    return `Matches your ${categoryLabels[exercise.category] ?? exercise.category} preference`;
  }

  // Time-based reason
  if (timeOfDay === 'morning' && exercise.category === 'active') {
    return 'Energizing morning exercise';
  }
  if (timeOfDay === 'evening' && exercise.category === 'mindful') {
    return 'Relaxing evening exercise';
  }

  return 'Recommended for you';
}
