/**
 * Recommendation Engine
 * Generates personalized exercise recommendations based on user profile and history
 */

import { ALL_EXERCISES } from '@/data/exercises';
import type { Exercise } from '@/data/exercises';
import { scoreExercise, getTimeOfDay } from './scoring';
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
  breakStyle: string[],
  recentBreakIds: string[],
  todayBreakCount: number,
  count: number = 5
): Recommendation[] {
  const timeOfDay = getTimeOfDay();

  const scored = ALL_EXERCISES.map((exercise) => ({
    exercise,
    score: scoreExercise(exercise, {
      painAreas,
      breakStyle,
      recentBreakIds,
      timeOfDay,
      todayBreakCount,
    }),
    reason: getRecommendationReason(exercise, painAreas, breakStyle, timeOfDay),
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
  breakStyle: string[],
  recentBreakIds: string[],
  todayBreakCount: number
): Recommendation | null {
  const recommendations = getRecommendations(painAreas, breakStyle, recentBreakIds, todayBreakCount, 1);
  return recommendations[0] ?? null;
}

/**
 * Generate a personalized plan based on onboarding data
 */
export function generatePersonalizedPlan(data: Partial<OnboardingData>): PersonalizedPlan {
  const painAreas = data.painAreas ?? [];
  const breakStyle = data.breakStyle ?? [];
  const breakInterval = data.breakInterval ?? 25;
  const screenTime = data.screenTime ?? 8;

  // Calculate match score based on profile completeness
  let matchScore = 60; // Base
  if (painAreas.length > 0) matchScore += 10;
  if (breakStyle.length > 0) matchScore += 10;
  if (data.workRole) matchScore += 5;
  if (data.energyPattern) matchScore += 5;
  if (data.screenTime) matchScore += 5;
  if (data.workPattern) matchScore += 5;
  matchScore = Math.min(98, matchScore);

  // Primary concern
  const concernMap: Record<string, string> = {
    eyes: 'Eye strain & digital fatigue',
    neck: 'Neck & shoulder tension',
    back: 'Back pain & posture',
    wrists: 'Wrist & hand strain',
    shoulders: 'Shoulder tension',
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
  const topExercises = getRecommendations(painAreas, breakStyle, [], 0, 5);

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
  timeOfDay: string
): string {
  // Check pain area match
  for (const area of painAreas) {
    if (exercise.id.includes(area) || exercise.category === 'quick') {
      return `Great for ${area} relief`;
    }
  }

  // Check break style match
  if (breakStyle.includes(exercise.category)) {
    return `Matches your ${exercise.category} preference`;
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
