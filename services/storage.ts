/**
 * Storage Service
 * AsyncStorage wrapper for persistent data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_WEEKLY_GOAL } from '@/constants/config';
import { captureError } from '@/services/firebase/crashlytics-adapter';

// Storage keys
export const STORAGE_KEYS = {
  BREAK_HISTORY: '@microbreaks/break_history',
  USER_STATS: '@microbreaks/user_stats',
  STREAK_DATA: '@microbreaks/streak_data',
  SETTINGS: '@microbreaks/settings',
} as const;

// Error types for better error handling
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly key: string,
    public readonly operation: 'read' | 'write' | 'remove' | 'clear',
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// Result type for operations that need to distinguish between null and error
export interface StorageResult<T> {
  data: T | null;
  error: StorageError | null;
}

async function purgeCorruptedItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Best effort cleanup only.
  }
}

// Generic storage operations with improved error handling
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    await purgeCorruptedItem(key);
    if (__DEV__) {
      console.error(`Storage read error for ${key}:`, error);
    }
    captureError(error instanceof Error ? error : new Error(`Storage read error for ${key}`));
    return null;
  }
}

// Get item with explicit error handling
export async function getItemWithError<T>(key: string): Promise<StorageResult<T>> {
  try {
    const value = await AsyncStorage.getItem(key);
    return { data: value ? JSON.parse(value) : null, error: null };
  } catch (error) {
    await purgeCorruptedItem(key);
    return {
      data: null,
      error: new StorageError(`Failed to read ${key}`, key, 'read', error),
    };
  }
}

export async function setItem<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error(`Storage write error for ${key}:`, error);
    }
    return false;
  }
}

// Set item with explicit error handling
export async function setItemWithError<T>(key: string, value: T): Promise<StorageError | null> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return null;
  } catch (error) {
    return new StorageError(`Failed to save ${key}`, key, 'write', error);
  }
}

export async function removeItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error(`Storage remove error for ${key}:`, error);
    }
    return false;
  }
}

export async function clearAll(): Promise<boolean> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Storage clear error:', error);
    }
    return false;
  }
}

// Type definitions for stored data
export interface CompletedBreak {
  id: string;
  breakId: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  duration: number; // seconds
  stepsCompleted: number;
  totalSteps: number;
  xpEarned: number;
  rating: 'good' | 'neutral' | 'bad' | null;
  reliefScore?: 'worse' | 'same' | 'better' | 'much_better' | null;
  completedAt: string; // ISO date string
  updatedAt?: string; // ISO date string for mutable field sync
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastBreakDate: string | null; // ISO date string
  streakHistory: { date: string; count: number }[];
}

export interface UserStats {
  totalBreaks: number;
  totalMinutes: number;
  totalXP: number;
  level: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface UserStatsProgressProjection {
  totalBreaks: number;
  totalXP: number;
  level: number;
  weeklyGoal: number;
}

// Default values
export const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastBreakDate: null,
  streakHistory: [],
};

export const DEFAULT_USER_STATS: UserStats = {
  totalBreaks: 0,
  totalMinutes: 0,
  totalXP: 0,
  level: 1,
  weeklyGoal: DEFAULT_WEEKLY_GOAL,
  weeklyProgress: 0,
};

function toRoundedNonNegativeNumber(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.round(value));
}

function toLevel(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.round(value));
}

export function createDefaultUserStats(): UserStats {
  return {
    ...DEFAULT_USER_STATS,
  };
}

export function sanitizeUserStats(value: unknown): UserStats {
  const stats = value && typeof value === 'object' ? value as Partial<UserStats> : {};

  return {
    totalBreaks: toRoundedNonNegativeNumber(stats.totalBreaks, DEFAULT_USER_STATS.totalBreaks),
    totalMinutes: toRoundedNonNegativeNumber(stats.totalMinutes, DEFAULT_USER_STATS.totalMinutes),
    totalXP: toRoundedNonNegativeNumber(stats.totalXP, DEFAULT_USER_STATS.totalXP),
    level: toLevel(stats.level, DEFAULT_USER_STATS.level),
    weeklyGoal: toRoundedNonNegativeNumber(stats.weeklyGoal, DEFAULT_USER_STATS.weeklyGoal),
    weeklyProgress: toRoundedNonNegativeNumber(stats.weeklyProgress, DEFAULT_USER_STATS.weeklyProgress),
  };
}

export async function getStoredUserStats(): Promise<UserStats> {
  const result = await getItemWithError<UserStats>(STORAGE_KEYS.USER_STATS);
  if (result.error) {
    const fallback = createDefaultUserStats();
    await setItem(STORAGE_KEYS.USER_STATS, fallback);
    return fallback;
  }

  return result.data ? sanitizeUserStats(result.data) : createDefaultUserStats();
}

export async function updateStoredUserStats(
  updates: Partial<UserStats>
): Promise<UserStats> {
  const currentStats = await getStoredUserStats();
  const nextStats = sanitizeUserStats({
    ...currentStats,
    ...updates,
  });

  await setItem(STORAGE_KEYS.USER_STATS, nextStats);
  return nextStats;
}

export async function syncStoredUserStatsFromProgress(
  progress: UserStatsProgressProjection
): Promise<UserStats> {
  return updateStoredUserStats({
    totalBreaks: progress.totalBreaks,
    totalXP: progress.totalXP,
    level: progress.level,
    weeklyGoal: progress.weeklyGoal,
  });
}
