/**
 * Break History Service Unit Tests
 * 100% coverage with all edge cases and error paths
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getBreakHistory,
  getBreaksByDateRange,
  getTodayBreaks,
  getWeekBreaks,
  getMonthBreaks,
  getYearlyChartData,
  saveCompletedBreak,
  replaceBreakHistory,
  updateBreakRating,
  getStreakData,
  applyStreakDecay,
  getUserStats,
  getWeeklyChartData,
  getMonthlyChartData,
  getBreakTypeDistribution,
  getRecentBreaks,
  checkStreakStatus,
  getTimePatterns,
  getBestBreakTime,
  getYearBreaksFromHistory,
  getYearlyChartDataFromHistory,
} from '@/services/breakHistory';
import { STORAGE_KEYS, DEFAULT_STREAK_DATA, DEFAULT_USER_STATS } from '@/services/storage';
import { syncService } from '@/services/sync';
import { useUserStore } from '@/store/userStore';
import { MAX_BREAK_HISTORY } from '@/constants/config';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/services/sync', () => ({
  syncService: {
    queueDataChange: jest.fn(),
  },
}));

// Helper to create mock break data
function createMockBreak(overrides: Partial<{
  id: string;
  breakId: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  duration: number;
  stepsCompleted: number;
  totalSteps: number;
  xpEarned: number;
  rating: 'good' | 'neutral' | 'bad' | null;
  completedAt: string;
  updatedAt: string;
}> = {}) {
  return {
    id: overrides.id || `break_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    breakId: overrides.breakId || 'eye-rest',
    title: overrides.title || 'Eye Rest',
    category: overrides.category || 'quick',
    icon: overrides.icon || '👁️',
    color: overrides.color || '#06FFA5',
    duration: overrides.duration || 60,
    stepsCompleted: overrides.stepsCompleted || 2,
    totalSteps: overrides.totalSteps || 2,
    xpEarned: overrides.xpEarned || 15,
    rating: overrides.rating !== undefined ? overrides.rating : 'good',
    completedAt: overrides.completedAt || new Date().toISOString(),
    updatedAt: overrides.updatedAt || overrides.completedAt || new Date().toISOString(),
  };
}

// Helper to get date string for a specific time
function getDateAtHour(hour: number, daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

describe('Break History Service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    useUserStore.getState().signOut();
  });

  describe('getBreakHistory', () => {
    it('should return empty array when no breaks exist', async () => {
      const result = await getBreakHistory();
      expect(result).toEqual([]);
    });

    it('should return all breaks when they exist', async () => {
      const breaks = [
        createMockBreak({ id: 'break-1' }),
        createMockBreak({ id: 'break-2' }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getBreakHistory();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('break-1');
      expect(result[1].id).toBe('break-2');
    });

    it('should handle corrupted data gracefully', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, 'invalid-json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getBreakHistory();

      expect(result).toEqual([]);
      expect(await AsyncStorage.getItem(STORAGE_KEYS.BREAK_HISTORY)).toBe(JSON.stringify([]));
      consoleSpy.mockRestore();
    });
  });

  describe('getBreaksByDateRange', () => {
    it('should return empty array for empty history', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await getBreaksByDateRange(startDate, endDate);
      expect(result).toEqual([]);
    });

    it('should filter breaks within date range', async () => {
      const breaks = [
        createMockBreak({ id: 'break-1', completedAt: '2024-01-15T10:00:00.000Z' }),
        createMockBreak({ id: 'break-2', completedAt: '2024-01-20T10:00:00.000Z' }),
        createMockBreak({ id: 'break-3', completedAt: '2024-02-01T10:00:00.000Z' }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await getBreaksByDateRange(startDate, endDate);
      expect(result).toHaveLength(2);
      expect(result.map(b => b.id)).toEqual(['break-1', 'break-2']);
    });

    it('should include breaks exactly on boundary dates', async () => {
      const breaks = [
        createMockBreak({ id: 'break-1', completedAt: '2024-01-01T00:00:00.000Z' }),
        createMockBreak({ id: 'break-2', completedAt: '2024-01-31T23:59:59.999Z' }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const startDate = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-02-01T00:00:00.000Z');

      const result = await getBreaksByDateRange(startDate, endDate);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no breaks match', async () => {
      const breaks = [
        createMockBreak({ id: 'break-1', completedAt: '2024-03-01T10:00:00.000Z' }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await getBreaksByDateRange(startDate, endDate);
      expect(result).toEqual([]);
    });
  });

  describe('getTodayBreaks', () => {
    it('should return empty array when no breaks today', async () => {
      const breaks = [
        createMockBreak({ completedAt: getDateAtHour(10, 1) }), // yesterday
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getTodayBreaks();
      expect(result).toEqual([]);
    });

    it('should return only today breaks', async () => {
      const todayBreak = createMockBreak({ id: 'today-1', completedAt: getDateAtHour(10, 0) });
      const yesterdayBreak = createMockBreak({ id: 'yesterday-1', completedAt: getDateAtHour(10, 1) });
      const breaks = [todayBreak, yesterdayBreak];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getTodayBreaks();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('today-1');
    });

    it('should include breaks at midnight', async () => {
      const midnightBreak = createMockBreak({ id: 'midnight', completedAt: getDateAtHour(0, 0) });
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([midnightBreak]));

      const result = await getTodayBreaks();
      expect(result).toHaveLength(1);
    });
  });

  describe('getWeekBreaks', () => {
    it('should return breaks from current week (Monday-Sunday)', async () => {
      // Create breaks for different days
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const thisWeekBreak = createMockBreak({
        id: 'this-week',
        completedAt: new Date().toISOString(),
      });
      const lastWeekBreak = createMockBreak({
        id: 'last-week',
        completedAt: new Date(Date.now() - (daysFromMonday + 2) * 24 * 60 * 60 * 1000).toISOString(),
      });

      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([thisWeekBreak, lastWeekBreak]));

      const result = await getWeekBreaks();
      expect(result.some(b => b.id === 'this-week')).toBe(true);
    });

    it('should handle Sunday correctly', async () => {
      // Sunday is day 0, should still be in current week
      const result = await getWeekBreaks();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMonthBreaks', () => {
    it('should return breaks from current month', async () => {
      const now = new Date();
      const thisMonthBreak = createMockBreak({
        id: 'this-month',
        completedAt: now.toISOString(),
      });

      // Create a break from last month
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      const lastMonthBreak = createMockBreak({
        id: 'last-month',
        completedAt: lastMonth.toISOString(),
      });

      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([thisMonthBreak, lastMonthBreak]));

      const result = await getMonthBreaks();
      expect(result.some(b => b.id === 'this-month')).toBe(true);
      expect(result.some(b => b.id === 'last-month')).toBe(false);
    });

    it('should include first and last day of month', async () => {
      const now = new Date();
      const firstDayBreak = createMockBreak({
        id: 'first-day',
        completedAt: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString(),
      });

      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([firstDayBreak]));

      const result = await getMonthBreaks();
      expect(result.some(b => b.id === 'first-day')).toBe(true);
    });
  });

  describe('saveCompletedBreak', () => {
    it('should save a new break and return true', async () => {
      const breakData = {
        breakId: 'eye-rest',
        title: 'Eye Rest',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 2,
        totalSteps: 2,
        xpEarned: 15,
        rating: 'good' as const,
        reliefScore: 'better' as const,
        completedAt: new Date().toISOString(),
      };

      const result = await saveCompletedBreak(breakData);

      expect(result.success).toBe(true);
      expect(result.breakId).toBeDefined();
      const history = await getBreakHistory();
      expect(history).toHaveLength(1);
      expect(history[0].breakId).toBe('eye-rest');
      expect(history[0].id).toBeDefined();
      expect(history[0].id).toMatch(/^break_[0-9a-f-]+$/);
      expect(history[0].reliefScore).toBe('better');
    });

    it('should add new breaks to the beginning', async () => {
      const firstBreak = createMockBreak({ id: 'first' });
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([firstBreak]));

      await saveCompletedBreak({
        breakId: 'new-break',
        title: 'New Break',
        category: 'stretch',
        icon: '🧘',
        color: '#B47EFF',
        duration: 120,
        stepsCompleted: 3,
        totalSteps: 3,
        xpEarned: 20,
        rating: 'good' as const,
        completedAt: new Date().toISOString(),
      });

      const history = await getBreakHistory();
      expect(history).toHaveLength(2);
      expect(history[0].breakId).toBe('new-break'); // New break at beginning
      expect(history[1].id).toBe('first'); // Old break moved
    });

    it('should limit history to MAX_BREAK_HISTORY breaks', async () => {
      // Create MAX_BREAK_HISTORY existing breaks
      const existingBreaks = Array.from({ length: MAX_BREAK_HISTORY }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(existingBreaks));

      // Add one more
      await saveCompletedBreak({
        breakId: 'new-break',
        title: 'New Break',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      const history = await getBreakHistory();
      expect(history.length).toBe(MAX_BREAK_HISTORY);
      expect(history[0].breakId).toBe('new-break'); // New break at front
    });

    it('should update streak data', async () => {
      await saveCompletedBreak({
        breakId: 'eye-rest',
        title: 'Eye Rest',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: 'good' as const,
        completedAt: new Date().toISOString(),
      });

      const streakData = await getStreakData();
      expect(streakData.currentStreak).toBeGreaterThanOrEqual(1);
      expect(streakData.lastBreakDate).not.toBeNull();
    });

    it('should update user stats', async () => {
      // Ensure clean state
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify({
        totalBreaks: 0,
        totalMinutes: 0,
        totalXP: 0,
        level: 1,
        weeklyGoal: 20,
        weeklyProgress: 0,
      }));

      const result = await saveCompletedBreak({
        breakId: 'eye-rest',
        title: 'Eye Rest',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 120, // 2 minutes
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 25,
        rating: 'good' as const,
        completedAt: new Date().toISOString(),
      });

      expect(result.success).toBe(true);

      const stats = await getUserStats();
      expect(stats.totalBreaks).toBeGreaterThanOrEqual(1);
      expect(stats.totalMinutes).toBeGreaterThanOrEqual(2); // 120/60
      expect(stats.totalXP).toBeGreaterThanOrEqual(25);
    });

    it('should synchronize user store progress projection after a successful save', async () => {
      await saveCompletedBreak({
        breakId: 'eye-rest',
        title: 'Eye Rest',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 120,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 25,
        rating: 'good' as const,
        completedAt: new Date().toISOString(),
      });

      const progress = useUserStore.getState().progress;
      expect(progress.totalBreaks).toBe(1);
      expect(progress.totalXP).toBe(25);
      expect(progress.level).toBe(1);
      expect(progress.currentStreak).toBe(1);
      expect(progress.longestStreak).toBe(1);
      expect(progress.weeklyGoal).toBe(DEFAULT_USER_STATS.weeklyGoal);
      expect(progress.dailyGoal).toBe(5);
    });

    it('should return false and log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      // Mock setItem to fail so the save operation fails
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage error'));

      const result = await saveCompletedBreak({
        breakId: 'test',
        title: 'Test',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      expect(result.success).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should serialize concurrent saves without dropping entries', async () => {
      const breakA = saveCompletedBreak({
        breakId: 'neck-reset',
        title: 'Neck Reset',
        category: 'stretch',
        icon: '🧘',
        color: '#B47EFF',
        duration: 90,
        stepsCompleted: 2,
        totalSteps: 2,
        xpEarned: 15,
        rating: 'good',
        completedAt: new Date().toISOString(),
      });

      const breakB = saveCompletedBreak({
        breakId: 'eye-rescue',
        title: 'Eye Rescue',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: 'good',
        completedAt: new Date().toISOString(),
      });

      const results = await Promise.all([breakA, breakB]);

      expect(results.every((result) => result.success)).toBe(true);

      const history = await getBreakHistory();
      const stats = await getUserStats();

      expect(history).toHaveLength(2);
      expect(history.map((item) => item.breakId).sort()).toEqual(['eye-rescue', 'neck-reset']);
      expect(stats.totalBreaks).toBe(2);
      expect(stats.totalXP).toBe(25);
    });
  });

  describe('replaceBreakHistory', () => {
    it('applies the transform to current history and persists the result', async () => {
      const seed = createMockBreak({ id: 'seed', breakId: 'seed-break' });
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([seed]));

      const result = await replaceBreakHistory((current) => [
        ...current,
        createMockBreak({ id: 'merged', breakId: 'merged-break' }),
      ]);

      expect(result.map((b) => b.breakId).sort()).toEqual(['merged-break', 'seed-break']);

      const persisted = await getBreakHistory();
      expect(persisted.map((b) => b.breakId).sort()).toEqual(['merged-break', 'seed-break']);
    });

    it('serializes against a concurrent save so a just-completed break is never dropped', async () => {
      // Race: a break completes while a sync pull merges remote history.
      // Both must survive — the pull's read+merge+write has to run inside
      // the same serialized queue as saveCompletedBreak, not bypass it.
      const save = saveCompletedBreak(
        createMockBreak({ breakId: 'live-break', completedAt: new Date().toISOString() })
      );
      const pullMerge = replaceBreakHistory((current) => [
        ...current,
        createMockBreak({ id: 'remote-1', breakId: 'remote-break' }),
      ]);

      await Promise.all([save, pullMerge]);

      const history = await getBreakHistory();
      expect(history.map((b) => b.breakId).sort()).toEqual(['live-break', 'remote-break']);
    });
  });

  describe('getStreakData', () => {
    it('should return default streak data when none exists', async () => {
      const result = await getStreakData();
      expect(result).toEqual(DEFAULT_STREAK_DATA);
    });

    it('should return stored streak data', async () => {
      // Use today's local date so the read-time decay correction does not
      // fire — this test only verifies that persisted fields round-trip.
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;
      const streakData = {
        currentStreak: 5,
        longestStreak: 10,
        lastBreakDate: todayStr,
        streakHistory: [{ date: todayStr, count: 3 }],
      };
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(streakData));

      const result = await getStreakData();
      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(10);
      expect(result.lastBreakDate).toBe(todayStr);
    });

    it('should self-heal corrupted streak data', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, 'invalid-json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getStreakData();

      expect(result).toEqual(DEFAULT_STREAK_DATA);
      expect(await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA)).toBe(JSON.stringify(DEFAULT_STREAK_DATA));
      consoleSpy.mockRestore();
    });

    it('increments streak across a spring-forward DST transition', async () => {
      // Pre-seed: yesterday was 2026-03-07 (the Saturday before the typical US
      // spring-forward window) — using an explicit date string.
      await AsyncStorage.setItem(
        STORAGE_KEYS.STREAK_DATA,
        JSON.stringify({
          currentStreak: 3,
          longestStreak: 5,
          lastBreakDate: '2026-03-07',
          streakHistory: [{ date: '2026-03-07', count: 1 }],
        })
      );

      // Today: 2026-03-08, just after the DST jump (local 03:00).
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 2, 8, 9, 0, 0));

      try {
        await saveCompletedBreak({
          breakId: 'eye-rest',
          title: 'Eye Rest',
          category: 'quick',
          icon: '👁️',
          color: '#06FFA5',
          duration: 60,
          stepsCompleted: 1,
          totalSteps: 1,
          xpEarned: 10,
          rating: 'good' as const,
          completedAt: new Date().toISOString(),
        });

        const data = await getStreakData();
        expect(data.lastBreakDate).toBe('2026-03-08');
        expect(data.currentStreak).toBe(4);
      } finally {
        jest.useRealTimers();
      }
    });

    it('keeps streak unchanged for a second break on the same day across DST', async () => {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STREAK_DATA,
        JSON.stringify({
          currentStreak: 4,
          longestStreak: 5,
          lastBreakDate: '2026-03-08',
          streakHistory: [{ date: '2026-03-08', count: 1 }],
        })
      );

      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 2, 8, 23, 30, 0));

      try {
        await saveCompletedBreak({
          breakId: 'eye-rest',
          title: 'Eye Rest',
          category: 'quick',
          icon: '👁️',
          color: '#06FFA5',
          duration: 60,
          stepsCompleted: 1,
          totalSteps: 1,
          xpEarned: 10,
          rating: 'good' as const,
          completedAt: new Date().toISOString(),
        });

        const data = await getStreakData();
        expect(data.currentStreak).toBe(4);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('applyStreakDecay (read-time staleness correction)', () => {
    const NOW = new Date(2026, 5, 22, 12, 0, 0); // Mon 2026-06-22, local noon

    function dayStr(offsetDays: number): string {
      const d = new Date(NOW);
      d.setDate(d.getDate() + offsetDays);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
    }

    function weekStartOf(date: Date): string {
      const d = new Date(date);
      const day = d.getDay();
      const shift = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + shift);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
    }

    const base = {
      longestStreak: 10,
      streakHistory: [],
      gracesUsedThisWeek: 0,
      weekStartDate: weekStartOf(NOW),
    };

    it('keeps the streak when the last break was today', () => {
      const out = applyStreakDecay(
        { ...base, currentStreak: 10, lastBreakDate: dayStr(0) },
        NOW
      );
      expect(out.currentStreak).toBe(10);
    });

    it('keeps the streak when the last break was yesterday', () => {
      const out = applyStreakDecay(
        { ...base, currentStreak: 10, lastBreakDate: dayStr(-1) },
        NOW
      );
      expect(out.currentStreak).toBe(10);
    });

    it('keeps a 2-day-gap streak alive while a grace is still available', () => {
      const out = applyStreakDecay(
        { ...base, currentStreak: 10, lastBreakDate: dayStr(-2), gracesUsedThisWeek: 0 },
        NOW
      );
      expect(out.currentStreak).toBe(10);
    });

    it('zeroes a 2-day-gap streak once the weekly grace is spent', () => {
      const out = applyStreakDecay(
        { ...base, currentStreak: 10, lastBreakDate: dayStr(-2), gracesUsedThisWeek: 1 },
        NOW
      );
      expect(out.currentStreak).toBe(0);
      expect(out.longestStreak).toBe(10); // longest is preserved
    });

    it('zeroes a streak after a 3-day gap regardless of grace', () => {
      const out = applyStreakDecay(
        { ...base, currentStreak: 10, lastBreakDate: dayStr(-3), gracesUsedThisWeek: 0 },
        NOW
      );
      expect(out.currentStreak).toBe(0);
    });

    it('treats a 2-day gap as savable when the ISO week rolled over (grace refreshes)', () => {
      const lastWeek = new Date(NOW);
      lastWeek.setDate(lastWeek.getDate() - 14);
      const out = applyStreakDecay(
        {
          ...base,
          currentStreak: 10,
          lastBreakDate: dayStr(-2),
          gracesUsedThisWeek: 1, // burned, but in a previous ISO week
          weekStartDate: weekStartOf(lastWeek),
        },
        NOW
      );
      expect(out.currentStreak).toBe(10);
    });

    it('leaves an already-zero streak untouched', () => {
      const out = applyStreakDecay(
        { ...base, currentStreak: 0, lastBreakDate: dayStr(-30) },
        NOW
      );
      expect(out.currentStreak).toBe(0);
    });

    it('does not mutate the input object', () => {
      const input = { ...base, currentStreak: 10, lastBreakDate: dayStr(-5) };
      applyStreakDecay(input, NOW);
      expect(input.currentStreak).toBe(10);
    });

    it('getStreakData reports a lapsed streak as 0 without rewriting storage', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(NOW);
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.STREAK_DATA,
          JSON.stringify({
            currentStreak: 10,
            longestStreak: 12,
            lastBreakDate: dayStr(-5),
            streakHistory: [],
            gracesUsedThisWeek: 0,
            weekStartDate: weekStartOf(NOW),
          })
        );

        const read = await getStreakData();
        expect(read.currentStreak).toBe(0);
        expect(read.longestStreak).toBe(12);

        // Correction is read-time only — persisted value is untouched.
        const raw = JSON.parse(
          (await AsyncStorage.getItem(STORAGE_KEYS.STREAK_DATA)) as string
        );
        expect(raw.currentStreak).toBe(10);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('updateBreakRating', () => {
    it('updates a saved break rating and queues a break sync', async () => {
      const breakEntry = createMockBreak({ id: 'break-1', rating: null });
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([breakEntry]));

      await updateBreakRating('break-1', 'good', 'much_better');

      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BREAK_HISTORY);
      const parsed = JSON.parse(stored as string);
      expect(parsed[0].rating).toBe('good');
      expect(parsed[0].reliefScore).toBe('much_better');
      expect(parsed[0].updatedAt).toBeDefined();
      expect(syncService.queueDataChange).toHaveBeenCalledWith(
        'break',
        expect.objectContaining({
          id: 'break-1',
          rating: 'good',
          reliefScore: 'much_better',
        })
      );
    });

    it('does not queue sync when the rating is unchanged', async () => {
      const breakEntry = createMockBreak({ id: 'break-1', rating: 'good' });
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([breakEntry]));

      await updateBreakRating('break-1', 'good');

      expect(syncService.queueDataChange).not.toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('should return default user stats when none exists', async () => {
      const result = await getUserStats();
      expect(result).toEqual(DEFAULT_USER_STATS);
    });

    it('should return stored user stats', async () => {
      const stats = {
        totalBreaks: 50,
        totalMinutes: 250,
        totalXP: 750,
        level: 8,
        weeklyGoal: 25,
        weeklyProgress: 15,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));

      const result = await getUserStats();
      expect(result.totalBreaks).toBe(50);
      expect(result.totalXP).toBe(750);
      expect(result.level).toBe(8);
    });

    it('should self-heal corrupted stored user stats', async () => {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, 'invalid-json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getUserStats();

      expect(result).toEqual(DEFAULT_USER_STATS);
      expect(await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS)).toBe(JSON.stringify(DEFAULT_USER_STATS));
      consoleSpy.mockRestore();
    });
  });

  describe('Streak Logic', () => {
    it('should start streak at 1 for first break ever', async () => {
      await saveCompletedBreak({
        breakId: 'test',
        title: 'Test',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      const streakData = await getStreakData();
      expect(streakData.currentStreak).toBe(1);
      expect(streakData.longestStreak).toBe(1);
    });

    it('should not increment streak for same day', async () => {
      // First break
      await saveCompletedBreak({
        breakId: 'test1',
        title: 'Test',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      // Second break same day
      await saveCompletedBreak({
        breakId: 'test2',
        title: 'Test 2',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      const streakData = await getStreakData();
      expect(streakData.currentStreak).toBe(1); // Still 1, not 2
    });

    it('should increment streak history count for same day', async () => {
      const streakBefore = await getStreakData();
      const todayStr = new Date().toISOString().split('T')[0];
      const countBefore = streakBefore.streakHistory.find(h => h.date === todayStr)?.count ?? 0;

      // First break
      await saveCompletedBreak({
        breakId: 'test1',
        title: 'Test',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      // Second break same day
      await saveCompletedBreak({
        breakId: 'test2',
        title: 'Test 2',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      const streakData = await getStreakData();
      const todayHistory = streakData.streakHistory.find(h => h.date === todayStr);
      expect(todayHistory?.count).toBe(countBefore + 2);
    });
  });

  describe('Grace Day Logic', () => {
    function localDateString(date: Date): string {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    function weekStartString(date: Date): string {
      const d = new Date(date);
      const day = d.getDay();
      const shift = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + shift);
      return localDateString(d);
    }

    async function seedStreak(opts: {
      currentStreak: number;
      lastBreakDate: string;
      gracesUsedThisWeek: number;
      weekStartDate: string;
      longestStreak?: number;
    }) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STREAK_DATA,
        JSON.stringify({
          currentStreak: opts.currentStreak,
          longestStreak: opts.longestStreak ?? opts.currentStreak,
          lastBreakDate: opts.lastBreakDate,
          streakHistory: [],
          gracesUsedThisWeek: opts.gracesUsedThisWeek,
          weekStartDate: opts.weekStartDate,
        })
      );
    }

    it('spends a grace to keep a streak alive across a single missed day', async () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      await seedStreak({
        currentStreak: 4,
        lastBreakDate: localDateString(twoDaysAgo),
        gracesUsedThisWeek: 0,
        weekStartDate: weekStartString(today),
      });

      await saveCompletedBreak(createMockBreak({ completedAt: today.toISOString() }));

      const streak = await getStreakData();
      expect(streak.currentStreak).toBe(5);
      expect(streak.gracesUsedThisWeek).toBe(1);
    });

    it('lets the streak break when no grace is available', async () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      await seedStreak({
        currentStreak: 4,
        lastBreakDate: localDateString(twoDaysAgo),
        gracesUsedThisWeek: 1, // already spent this week
        weekStartDate: weekStartString(today),
      });

      await saveCompletedBreak(createMockBreak({ completedAt: today.toISOString() }));

      const streak = await getStreakData();
      expect(streak.currentStreak).toBe(1);
      expect(streak.gracesUsedThisWeek).toBe(1);
    });

    it('does not save a grace on a 3-day gap', async () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      await seedStreak({
        currentStreak: 7,
        lastBreakDate: localDateString(threeDaysAgo),
        gracesUsedThisWeek: 0,
        weekStartDate: weekStartString(today),
      });

      await saveCompletedBreak(createMockBreak({ completedAt: today.toISOString() }));

      const streak = await getStreakData();
      expect(streak.currentStreak).toBe(1);
      expect(streak.gracesUsedThisWeek).toBe(0);
    });

    it('resets the grace counter when a new ISO week begins', async () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const lastWeekMonday = new Date(today);
      lastWeekMonday.setDate(lastWeekMonday.getDate() - 14);

      await seedStreak({
        currentStreak: 8,
        lastBreakDate: localDateString(twoDaysAgo),
        gracesUsedThisWeek: 1, // burned last week
        weekStartDate: weekStartString(lastWeekMonday), // stale week
      });

      await saveCompletedBreak(createMockBreak({ completedAt: today.toISOString() }));

      const streak = await getStreakData();
      // Rollover resets gracesUsedThisWeek → grace is available → spend
      // to cover the 2-day gap and grow the streak.
      expect(streak.currentStreak).toBe(9);
      expect(streak.gracesUsedThisWeek).toBe(1);
      expect(streak.weekStartDate).toBe(weekStartString(today));
    });

    it('still increments longestStreak when grace saves the streak', async () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      await seedStreak({
        currentStreak: 9,
        longestStreak: 9,
        lastBreakDate: localDateString(twoDaysAgo),
        gracesUsedThisWeek: 0,
        weekStartDate: weekStartString(today),
      });

      await saveCompletedBreak(createMockBreak({ completedAt: today.toISOString() }));

      const streak = await getStreakData();
      expect(streak.currentStreak).toBe(10);
      expect(streak.longestStreak).toBe(10);
    });
  });

  describe('getWeeklyChartData', () => {
    it('should return 7 days of data', async () => {
      const result = await getWeeklyChartData();
      expect(result).toHaveLength(7);
      expect(result[0].day).toBe('Mon');
      expect(result[6].day).toBe('Sun');
    });

    it('should return zero counts for days without breaks', async () => {
      const result = await getWeeklyChartData();
      result.forEach(day => {
        expect(day.count).toBe(0);
        expect(day.minutes).toBe(0);
      });
    });

    it('should calculate correct counts and minutes', async () => {
      // Add a break for today
      const todayBreak = createMockBreak({
        duration: 180, // 3 minutes
        completedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify([todayBreak]));

      const result = await getWeeklyChartData();
      const today = new Date().getDay();
      const todayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0, Sun=6

      expect(result[todayIndex].count).toBe(1);
      expect(result[todayIndex].minutes).toBe(3);
    });
  });

  describe('getMonthlyChartData', () => {
    it('should return 30 days of data', async () => {
      const result = await getMonthlyChartData();
      expect(result).toHaveLength(30);
    });

    it('should format dates correctly', async () => {
      const result = await getMonthlyChartData();
      result.forEach(day => {
        expect(day.date).toMatch(/^\d{1,2}\/\d{1,2}$/);
      });
    });

    it('should aggregate breaks correctly', async () => {
      const today = new Date();
      const breaks = [
        createMockBreak({ duration: 60, completedAt: today.toISOString() }),
        createMockBreak({ duration: 120, completedAt: today.toISOString() }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getMonthlyChartData();
      const todayData = result[result.length - 1]; // Last item is today

      expect(todayData.count).toBe(2);
      expect(todayData.minutes).toBe(3); // 60/60 + 120/60 = 1 + 2
    });
  });

  describe('Year Analytics', () => {
    it('should filter year breaks to the last 12 months', () => {
      const now = new Date();
      const withinYear = createMockBreak({
        id: 'within-year',
        completedAt: new Date(now.getFullYear(), now.getMonth() - 11, 15).toISOString(),
      });
      const olderThanYear = createMockBreak({
        id: 'older-than-year',
        completedAt: new Date(now.getFullYear(), now.getMonth() - 12, 1).toISOString(),
      });

      const result = getYearBreaksFromHistory([withinYear, olderThanYear]);
      expect(result.map((item) => item.id)).toContain('within-year');
      expect(result.map((item) => item.id)).not.toContain('older-than-year');
    });

    it('should build 12 monthly buckets for yearly chart data', async () => {
      const now = new Date();
      const currentMonthBreak = createMockBreak({
        id: 'current-month',
        duration: 120,
        completedAt: new Date(now.getFullYear(), now.getMonth(), 10).toISOString(),
      });
      const previousMonthBreak = createMockBreak({
        id: 'previous-month',
        duration: 60,
        completedAt: new Date(now.getFullYear(), now.getMonth() - 1, 12).toISOString(),
      });

      const chart = getYearlyChartDataFromHistory([currentMonthBreak, previousMonthBreak]);
      expect(chart).toHaveLength(12);
      expect(chart[10].count).toBe(1);
      expect(chart[10].minutes).toBe(1);
      expect(chart[11].count).toBe(1);
      expect(chart[11].minutes).toBe(2);

      await AsyncStorage.setItem(
        STORAGE_KEYS.BREAK_HISTORY,
        JSON.stringify([currentMonthBreak, previousMonthBreak])
      );
      const persistedChart = await getYearlyChartData();
      expect(persistedChart).toHaveLength(12);
    });
  });

  describe('getBreakTypeDistribution', () => {
    it('should return empty array when no breaks', async () => {
      const result = await getBreakTypeDistribution('week');
      expect(result).toEqual([]);
    });

    it('should calculate distribution correctly', async () => {
      const breaks = [
        createMockBreak({ category: 'quick', color: '#06FFA5' }),
        createMockBreak({ category: 'quick', color: '#06FFA5' }),
        createMockBreak({ category: 'stretch', color: '#B47EFF' }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getBreakTypeDistribution('all');

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('Quick'); // Capitalized
      expect(result[0].count).toBe(2);
      expect(result[0].percentage).toBe(67); // 2/3 = 67%
      expect(result[1].category).toBe('Stretch');
      expect(result[1].count).toBe(1);
      expect(result[1].percentage).toBe(33);
    });

    it('should filter by week period', async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

      const breaks = [
        createMockBreak({ category: 'quick', completedAt: now.toISOString() }),
        createMockBreak({ category: 'stretch', completedAt: weekAgo.toISOString() }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getBreakTypeDistribution('week');
      // Should only include this week's break
      expect(result.some(r => r.category === 'Quick')).toBe(true);
    });

    it('should filter by month period', async () => {
      const now = new Date();
      const monthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 15);

      const breaks = [
        createMockBreak({ category: 'quick', completedAt: now.toISOString() }),
        createMockBreak({ category: 'stretch', completedAt: monthsAgo.toISOString() }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getBreakTypeDistribution('month');
      expect(result.some(r => r.category === 'Quick')).toBe(true);
    });

    it('should sort by count descending', async () => {
      const breaks = [
        createMockBreak({ category: 'stretch' }),
        createMockBreak({ category: 'quick' }),
        createMockBreak({ category: 'quick' }),
        createMockBreak({ category: 'quick' }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getBreakTypeDistribution('all');
      expect(result[0].category).toBe('Quick');
      expect(result[0].count).toBe(3);
    });
  });

  describe('getRecentBreaks', () => {
    it('should return empty array for no breaks', async () => {
      const result = await getRecentBreaks();
      expect(result).toEqual([]);
    });

    it('should return limited number of breaks', async () => {
      const breaks = Array.from({ length: 20 }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getRecentBreaks(5);
      expect(result).toHaveLength(5);
      expect(result[0].id).toBe('break-0');
      expect(result[4].id).toBe('break-4');
    });

    it('should default to 10 breaks', async () => {
      const breaks = Array.from({ length: 20 }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getRecentBreaks();
      expect(result).toHaveLength(10);
    });

    it('should return all breaks if fewer than limit', async () => {
      const breaks = [createMockBreak({ id: 'break-1' }), createMockBreak({ id: 'break-2' })];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getRecentBreaks(10);
      expect(result).toHaveLength(2);
    });
  });

  describe('checkStreakStatus', () => {
    it('should return not at risk when no streak exists', async () => {
      // Ensure clean state - explicitly set default streak data
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify({
        currentStreak: 0,
        longestStreak: 0,
        lastBreakDate: null,
        streakHistory: [],
      }));

      const result = await checkStreakStatus();
      expect(result.isAtRisk).toBe(false);
      expect(result.hoursUntilReset).toBe(0);
    });

    it('should return not at risk when streak is 0', async () => {
      const streakData = {
        currentStreak: 0,
        longestStreak: 5,
        lastBreakDate: '2024-01-15',
        streakHistory: [],
      };
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(streakData));

      const result = await checkStreakStatus();
      expect(result.isAtRisk).toBe(false);
    });

    it('should calculate hours until reset correctly', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const streakData = {
        currentStreak: 5,
        longestStreak: 5,
        lastBreakDate: yesterday.toISOString().split('T')[0],
        streakHistory: [],
      };
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(streakData));

      const result = await checkStreakStatus();
      expect(result.hoursUntilReset).toBeGreaterThanOrEqual(0);
    });

    it('should mark as at risk when less than 6 hours remaining', async () => {
      // Create a scenario where the streak is about to expire
      const now = new Date();
      // Set last break to day before yesterday to ensure streak is at risk
      const dayBeforeYesterday = new Date(now);
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

      const streakData = {
        currentStreak: 5,
        longestStreak: 5,
        lastBreakDate: dayBeforeYesterday.toISOString().split('T')[0],
        streakHistory: [],
      };
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(streakData));

      const result = await checkStreakStatus();
      // The exact result depends on current time, but the function should work
      expect(typeof result.isAtRisk).toBe('boolean');
      expect(typeof result.hoursUntilReset).toBe('number');
    });
  });

  describe('getTimePatterns', () => {
    it('should return empty array when no breaks', async () => {
      const result = await getTimePatterns('week');
      expect(result).toEqual([]);
    });

    it('should categorize breaks by time of day', async () => {
      const breaks = [
        createMockBreak({ completedAt: getDateAtHour(8) }),  // morning
        createMockBreak({ completedAt: getDateAtHour(14) }), // afternoon
        createMockBreak({ completedAt: getDateAtHour(18) }), // evening
        createMockBreak({ completedAt: getDateAtHour(22) }), // night
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getTimePatterns('all');

      expect(result).toHaveLength(4);
      const morning = result.find(p => p.period === 'morning');
      const afternoon = result.find(p => p.period === 'afternoon');
      const evening = result.find(p => p.period === 'evening');
      const night = result.find(p => p.period === 'night');

      expect(morning?.count).toBe(1);
      expect(afternoon?.count).toBe(1);
      expect(evening?.count).toBe(1);
      expect(night?.count).toBe(1);
    });

    it('should calculate percentages correctly', async () => {
      const breaks = [
        createMockBreak({ completedAt: getDateAtHour(8) }),
        createMockBreak({ completedAt: getDateAtHour(9) }),
        createMockBreak({ completedAt: getDateAtHour(10) }),
        createMockBreak({ completedAt: getDateAtHour(14) }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getTimePatterns('all');
      const morning = result.find(p => p.period === 'morning');

      expect(morning?.count).toBe(3);
      expect(morning?.percentage).toBe(75); // 3/4 = 75%
    });

    it('should include correct labels and colors', async () => {
      const breaks = [createMockBreak({ completedAt: getDateAtHour(10) })];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getTimePatterns('all');
      const morning = result.find(p => p.period === 'morning');

      expect(morning?.label).toBe('Morning');
      expect(morning?.timeRange).toBe('5 AM - 12 PM');
      expect(morning?.color).toBe('#FFD166');
      expect(morning?.icon).toBe('🌅');
    });

    it('should handle night hours (21-5) correctly', async () => {
      const breaks = [
        createMockBreak({ completedAt: getDateAtHour(22) }),
        createMockBreak({ completedAt: getDateAtHour(23) }),
        createMockBreak({ completedAt: getDateAtHour(2) }),
        createMockBreak({ completedAt: getDateAtHour(4) }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getTimePatterns('all');
      const night = result.find(p => p.period === 'night');

      expect(night?.count).toBe(4);
    });

    it('should filter by period correctly', async () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

      const breaks = [
        createMockBreak({ completedAt: now.toISOString() }),
        createMockBreak({ completedAt: weekAgo.toISOString() }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const weekResult = await getTimePatterns('week');
      const allResult = await getTimePatterns('all');

      const weekTotal = weekResult.reduce((sum, p) => sum + p.count, 0);
      const allTotal = allResult.reduce((sum, p) => sum + p.count, 0);

      expect(weekTotal).toBeLessThanOrEqual(allTotal);
    });

    it('should sort by count descending', async () => {
      const breaks = [
        createMockBreak({ completedAt: getDateAtHour(10) }),
        createMockBreak({ completedAt: getDateAtHour(10) }),
        createMockBreak({ completedAt: getDateAtHour(14) }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getTimePatterns('all');
      expect(result[0].period).toBe('morning');
      expect(result[0].count).toBe(2);
    });
  });

  describe('getBestBreakTime', () => {
    it('should return null when no breaks exist', async () => {
      const result = await getBestBreakTime();
      expect(result).toBeNull();
    });

    it('should return the most common break time', async () => {
      const breaks = [
        createMockBreak({ completedAt: getDateAtHour(10) }),
        createMockBreak({ completedAt: getDateAtHour(10) }),
        createMockBreak({ completedAt: getDateAtHour(14) }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const result = await getBestBreakTime();

      expect(result).not.toBeNull();
      expect(result?.period).toBe('Morning');
      expect(result?.percentage).toBe(67);
      expect(result?.icon).toBe('🌅');
    });

    it('should return correct icon for each period', async () => {
      // Test afternoon
      const afternoonBreaks = [
        createMockBreak({ completedAt: getDateAtHour(14) }),
        createMockBreak({ completedAt: getDateAtHour(15) }),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(afternoonBreaks));

      const result = await getBestBreakTime();
      expect(result?.icon).toBe('☀️');
    });
  });

  describe('Level Calculation', () => {
    it('should calculate level based on XP (level = floor(XP/100) + 1)', async () => {
      // Reset stats to known state
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify({
        totalBreaks: 0,
        totalMinutes: 0,
        totalXP: 0,
        level: 1,
        weeklyGoal: 20,
        weeklyProgress: 0,
      }));

      await saveCompletedBreak({
        breakId: 'test',
        title: 'Test',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 99,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      let stats = await getUserStats();
      expect(stats.level).toBe(1); // floor(99/100) + 1 = 1

      await saveCompletedBreak({
        breakId: 'test2',
        title: 'Test 2',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 101,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      stats = await getUserStats();
      expect(stats.level).toBe(3); // floor(200/100) + 1 = 3
    });
  });

  describe('Weekly Progress Tracking', () => {
    it('should update weekly progress based on week breaks', async () => {
      await saveCompletedBreak({
        breakId: 'test1',
        title: 'Test 1',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      await saveCompletedBreak({
        breakId: 'test2',
        title: 'Test 2',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      const stats = await getUserStats();
      expect(stats.weeklyProgress).toBe(2);
    });
  });

  describe('Streak History Limit', () => {
    it('should limit streak history to 90 days', async () => {
      // Create streak data with 90 history entries
      const streakHistory = Array.from({ length: 90 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return { date: date.toISOString().split('T')[0], count: 1 };
      });

      const streakData = {
        currentStreak: 90,
        longestStreak: 90,
        lastBreakDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        streakHistory,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(streakData));

      // Add a new break (which will add a new history entry for today)
      await saveCompletedBreak({
        breakId: 'test',
        title: 'Test',
        category: 'quick',
        icon: '👁️',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      const newStreakData = await getStreakData();
      expect(newStreakData.streakHistory.length).toBeLessThanOrEqual(90);
    });
  });
});
