/**
 * Storage Service
 * AsyncStorage wrapper for persistent data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  BREAK_HISTORY: '@microbreaks/break_history',
  USER_STATS: '@microbreaks/user_stats',
  STREAK_DATA: '@microbreaks/streak_data',
  SETTINGS: '@microbreaks/settings',
} as const;

// Generic storage operations
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
}

export async function removeItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
}

export async function clearAll(): Promise<boolean> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
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
  weeklyGoal: 20,
  weeklyProgress: 0,
};
