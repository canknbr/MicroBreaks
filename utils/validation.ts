/**
 * Validation Utilities
 * Input validation functions for the app
 */

import {
  MIN_BREAK_DURATION,
  MAX_BREAK_DURATION,
  MIN_WEEKLY_GOAL,
  MAX_WEEKLY_GOAL,
  MIN_DAILY_GOAL,
} from '@/constants/config';

/**
 * Validate break duration in seconds
 */
export function validateBreakDuration(duration: number): {
  isValid: boolean;
  value: number;
  error?: string;
} {
  if (typeof duration !== 'number' || isNaN(duration)) {
    return {
      isValid: false,
      value: MIN_BREAK_DURATION,
      error: 'Duration must be a valid number',
    };
  }

  if (duration < MIN_BREAK_DURATION) {
    return {
      isValid: false,
      value: MIN_BREAK_DURATION,
      error: `Duration must be at least ${MIN_BREAK_DURATION} second(s)`,
    };
  }

  if (duration > MAX_BREAK_DURATION) {
    return {
      isValid: false,
      value: MAX_BREAK_DURATION,
      error: `Duration cannot exceed ${MAX_BREAK_DURATION} seconds`,
    };
  }

  return { isValid: true, value: Math.round(duration) };
}

/**
 * Validate weekly goal
 */
export function validateWeeklyGoal(goal: number): {
  isValid: boolean;
  value: number;
  error?: string;
} {
  if (typeof goal !== 'number' || isNaN(goal)) {
    return {
      isValid: false,
      value: MIN_WEEKLY_GOAL,
      error: 'Goal must be a valid number',
    };
  }

  if (goal < MIN_WEEKLY_GOAL) {
    return {
      isValid: false,
      value: MIN_WEEKLY_GOAL,
      error: `Goal must be at least ${MIN_WEEKLY_GOAL}`,
    };
  }

  if (goal > MAX_WEEKLY_GOAL) {
    return {
      isValid: false,
      value: MAX_WEEKLY_GOAL,
      error: `Goal cannot exceed ${MAX_WEEKLY_GOAL}`,
    };
  }

  return { isValid: true, value: Math.round(goal) };
}

/**
 * Calculate and validate daily goal from weekly goal
 */
export function calculateDailyGoal(weeklyGoal: number): number {
  const { value: validatedGoal } = validateWeeklyGoal(weeklyGoal);
  return Math.max(Math.round(validatedGoal / 7), MIN_DAILY_GOAL);
}

/**
 * Validate date string in YYYY-MM-DD format
 */
export function validateDateString(dateStr: string): {
  isValid: boolean;
  date: Date | null;
  error?: string;
} {
  if (!dateStr || typeof dateStr !== 'string') {
    return { isValid: false, date: null, error: 'Date string is required' };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return {
      isValid: false,
      date: null,
      error: 'Date must be in YYYY-MM-DD format',
    };
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Check if the date is valid (e.g., not Feb 30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { isValid: false, date: null, error: 'Invalid date' };
  }

  return { isValid: true, date };
}

/**
 * Sanitize and validate XP value
 */
export function validateXP(xp: number): number {
  if (typeof xp !== 'number' || isNaN(xp)) {
    return 0;
  }
  return Math.max(0, Math.round(xp));
}

/**
 * Validate streak count
 */
export function validateStreak(streak: number): number {
  if (typeof streak !== 'number' || isNaN(streak)) {
    return 0;
  }
  return Math.max(0, Math.round(streak));
}
