/**
 * Storage Service
 * AsyncStorage wrapper for persistent data.
 *
 * Service-level blob storage (break history, user stats, streak data)
 * stays on AsyncStorage for now. A MMKV-backed replacement lives at
 * `services/storage/blobMmkv.ts` ready for a future migration, but
 * landing it requires a coordinated test rewrite (~50+ tests probe
 * AsyncStorage directly) which is its own sprint. Zustand stores
 * already use MMKV through `zustandMmkv.ts` — that path is live and
 * gives the hot-path performance win.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_WEEKLY_GOAL } from '@/constants/config';
import { addBreadcrumb, captureError } from '@/services/firebase/crashlytics-adapter';
import { SERVICE_STORAGE_KEYS } from '@/constants/storageKeys';

// Re-exported for backwards-compat — new code should import from
// `@/constants/storageKeys` directly so the registry stays the single source.
export const STORAGE_KEYS = {
  BREAK_HISTORY: SERVICE_STORAGE_KEYS.BREAK_HISTORY,
  USER_STATS: SERVICE_STORAGE_KEYS.USER_STATS,
  STREAK_DATA: SERVICE_STORAGE_KEYS.STREAK_DATA,
  SETTINGS: SERVICE_STORAGE_KEYS.SETTINGS,
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

/**
 * Classify an error from the underlying storage layer so we can route quota
 * exhaustion (out of disk / blocked by OS) separately from JSON corruption
 * or unrelated I/O failures.
 */
function isStorageQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = (error as { message?: unknown }).message;
  if (typeof message !== 'string') return false;
  return /quota|disk full|no space|enospc/i.test(message);
}

function reportStorageWriteFailure(key: string, error: unknown): void {
  if (isStorageQuotaError(error)) {
    addBreadcrumb(
      `Storage write quota exceeded for ${key}`,
      'storage',
      'warning',
      { key }
    );
    return;
  }
  captureError(
    error instanceof Error ? error : new Error(`Storage write error for ${key}`),
    { component: 'storage', action: 'setItem' }
  );
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
    reportStorageWriteFailure(key, error);
    return false;
  }
}

// Set item with explicit error handling
export async function setItemWithError<T>(key: string, value: T): Promise<StorageError | null> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return null;
  } catch (error) {
    reportStorageWriteFailure(key, error);
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
  /**
   * Grace days the user has consumed in the current ISO week to keep
   * their streak alive across a single missed day. Reset every Monday.
   * Optional for back-compat with pre-grace persistence snapshots.
   */
  gracesUsedThisWeek?: number;
  /**
   * Local date string (YYYY-MM-DD) for the Monday that anchors the
   * current grace window. Used to detect rollover into a fresh week.
   */
  weekStartDate?: string;
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

export interface UserStreakProgressProjection {
  currentStreak: number;
  longestStreak: number;
  lastBreakDate: string | null;
  streakHistory?: { date: string; count: number }[];
  gracesUsedThisWeek?: number;
  weekStartDate?: string | null;
}

export async function syncStoredStreakDataFromProgress(
  progress: UserStreakProgressProjection
): Promise<StreakData> {
  const streakData: StreakData = {
    currentStreak: progress.currentStreak,
    longestStreak: progress.longestStreak,
    lastBreakDate: progress.lastBreakDate,
    streakHistory: progress.streakHistory ?? [],
    gracesUsedThisWeek: progress.gracesUsedThisWeek ?? 0,
    weekStartDate: progress.weekStartDate ?? undefined,
  };
  await setItem(STORAGE_KEYS.STREAK_DATA, streakData);
  return streakData;
}
