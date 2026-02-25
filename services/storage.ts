/**
 * Storage Service
 * AsyncStorage wrapper for persistent data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Generic storage operations with improved error handling
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
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
  completedAt: string; // ISO date string
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
  weeklyGoal: 35,
  weeklyProgress: 0,
};
