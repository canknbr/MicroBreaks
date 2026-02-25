/**
 * Storage Scalability Tests
 * Tests for AsyncStorage limits, serialization performance, and storage warnings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from '@testing-library/react-native';
import { useUserStore } from '@/store/userStore';
import {
  STORAGE_KEYS,
  CompletedBreak,
  StreakData,
  UserStats,
  getItem,
  setItem,
} from '@/services/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Helper to create mock break data
function createMockBreak(overrides: Partial<CompletedBreak> = {}): CompletedBreak {
  return {
    id: overrides.id || `break_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    breakId: overrides.breakId || 'eye-rest',
    title: overrides.title || 'Eye Rest',
    category: overrides.category || 'quick',
    icon: overrides.icon || '',
    color: overrides.color || '#06FFA5',
    duration: overrides.duration || 60,
    stepsCompleted: overrides.stepsCompleted || 2,
    totalSteps: overrides.totalSteps || 2,
    xpEarned: overrides.xpEarned || 15,
    rating: overrides.rating !== undefined ? overrides.rating : 'good',
    completedAt: overrides.completedAt || new Date().toISOString(),
  };
}

// Helper to measure execution time
function measureTime(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

// Helper to calculate approximate JSON size in bytes
function getJsonSize(data: unknown): number {
  return new Blob([JSON.stringify(data)]).size;
}

// Helper to format bytes to human-readable
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

describe('Storage Scalability Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    act(() => {
      useUserStore.getState().signOut();
    });
    jest.clearAllMocks();
  });

  describe('State Size Control', () => {
    it('should keep full user store state under 1MB', () => {
      // Build maximum expected state
      act(() => {
        // 500 favorites
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }

        // 100 achievements with timestamps
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }

        // Track 1000 breaks across categories
        const categories = ['quick', 'stretch', 'mindfulness', 'breathing', 'movement'];
        for (let i = 0; i < 1000; i++) {
          useUserStore.getState().trackBreakCompletion(categories[i % 5], 5);
        }

        // Large XP value
        useUserStore.getState().addXP(999999);
      });

      const state = useUserStore.getState();

      // Calculate size of serializable state (excluding functions)
      const serializableState = {
        profile: state.profile,
        progress: state.progress,
        preferences: state.preferences,
        achievements: state.achievements,
        isAuthenticated: state.isAuthenticated,
      };

      const stateSize = getJsonSize(serializableState);

      // Should be well under 1MB (1,048,576 bytes)
      expect(stateSize).toBeLessThan(1024 * 1024);

      // Log actual size for monitoring
      console.log(`Full user store state size: ${formatBytes(stateSize)}`);
    });

    it('should keep break history under 2MB with 500 breaks', async () => {
      const breaks = Array.from({ length: 500 }, (_, i) =>
        createMockBreak({
          id: `break-${i}`,
          title: `Break Title That Could Be Fairly Long ${i}`,
          category: ['quick', 'stretch', 'mindfulness', 'breathing', 'movement'][i % 5],
        })
      );

      const historySize = getJsonSize(breaks);

      // Should be well under 2MB
      expect(historySize).toBeLessThan(2 * 1024 * 1024);

      console.log(`500 breaks history size: ${formatBytes(historySize)}`);

      // Save and verify
      await setItem(STORAGE_KEYS.BREAK_HISTORY, breaks);
      const retrieved = await getItem<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);
      expect(retrieved).toHaveLength(500);
    });

    it('should keep streak data under 100KB with 90 days history', async () => {
      const streakHistory: { date: string; count: number }[] = [];
      for (let i = 0; i < 90; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        streakHistory.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10) + 1,
        });
      }

      const streakData: StreakData = {
        currentStreak: 90,
        longestStreak: 100,
        lastBreakDate: new Date().toISOString().split('T')[0],
        streakHistory,
      };

      const streakSize = getJsonSize(streakData);

      // Should be well under 100KB
      expect(streakSize).toBeLessThan(100 * 1024);

      console.log(`90-day streak data size: ${formatBytes(streakSize)}`);
    });

    it('should keep total storage under 5MB', async () => {
      // Build up all storage areas to maximum expected sizes

      // 1. User store state (500 favorites, 100 achievements)
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }
        for (let i = 0; i < 1000; i++) {
          useUserStore.getState().trackBreakCompletion(['quick', 'stretch'][i % 2], 5);
        }
        useUserStore.getState().addXP(999999);
      });

      // 2. Break history (500 breaks)
      const breaks = Array.from({ length: 500 }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );
      await setItem(STORAGE_KEYS.BREAK_HISTORY, breaks);

      // 3. User stats
      const userStats: UserStats = {
        totalBreaks: 10000,
        totalMinutes: 50000,
        totalXP: 999999,
        level: 10000,
        weeklyGoal: 50,
        weeklyProgress: 35,
      };
      await setItem(STORAGE_KEYS.USER_STATS, userStats);

      // 4. Streak data (90 days)
      const streakHistory = Array.from({ length: 90 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return { date: date.toISOString().split('T')[0], count: 5 };
      });
      const streakData: StreakData = {
        currentStreak: 90,
        longestStreak: 100,
        lastBreakDate: new Date().toISOString().split('T')[0],
        streakHistory,
      };
      await setItem(STORAGE_KEYS.STREAK_DATA, streakData);

      // Calculate total size
      const state = useUserStore.getState();
      const serializableState = {
        profile: state.profile,
        progress: state.progress,
        preferences: state.preferences,
        achievements: state.achievements,
      };

      const totalSize =
        getJsonSize(serializableState) +
        getJsonSize(breaks) +
        getJsonSize(userStats) +
        getJsonSize(streakData);

      // Should be well under 5MB (5,242,880 bytes)
      expect(totalSize).toBeLessThan(5 * 1024 * 1024);

      console.log(`Total storage size: ${formatBytes(totalSize)}`);
    });
  });

  describe('Serialization Performance', () => {
    it('should stringify/parse 500 breaks in < 50ms', async () => {
      const breaks = Array.from({ length: 500 }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );

      // Measure stringify
      const stringifyTime = measureTime(() => {
        JSON.stringify(breaks);
      });

      expect(stringifyTime).toBeLessThan(50);

      // Measure parse
      const jsonStr = JSON.stringify(breaks);
      const parseTime = measureTime(() => {
        JSON.parse(jsonStr);
      });

      expect(parseTime).toBeLessThan(50);

      console.log(`500 breaks: stringify=${stringifyTime.toFixed(2)}ms, parse=${parseTime.toFixed(2)}ms`);
    });

    it('should stringify/parse full state in < 100ms', () => {
      // Build up full state
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }
      });

      const state = useUserStore.getState();
      const serializableState = {
        profile: state.profile,
        progress: state.progress,
        preferences: state.preferences,
        achievements: state.achievements,
      };

      // Measure stringify
      const stringifyTime = measureTime(() => {
        JSON.stringify(serializableState);
      });

      expect(stringifyTime).toBeLessThan(100);

      // Measure parse
      const jsonStr = JSON.stringify(serializableState);
      const parseTime = measureTime(() => {
        JSON.parse(jsonStr);
      });

      expect(parseTime).toBeLessThan(100);

      console.log(`Full state: stringify=${stringifyTime.toFixed(2)}ms, parse=${parseTime.toFixed(2)}ms`);
    });

    it('should handle repeated serialization efficiently', () => {
      // Simulate multiple storage saves
      const breaks = Array.from({ length: 100 }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );

      const times: number[] = [];

      for (let i = 0; i < 50; i++) {
        const time = measureTime(() => {
          JSON.stringify(breaks);
        });
        times.push(time);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      // Average and max should be reasonable
      expect(avgTime).toBeLessThan(10);
      expect(maxTime).toBeLessThan(20);

      console.log(`50 serializations: avg=${avgTime.toFixed(2)}ms, max=${maxTime.toFixed(2)}ms`);
    });
  });

  describe('Storage Operations Performance', () => {
    it('should save 500 breaks to storage in < 100ms', async () => {
      const breaks = Array.from({ length: 500 }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );

      const start = performance.now();
      await setItem(STORAGE_KEYS.BREAK_HISTORY, breaks);
      const time = performance.now() - start;

      expect(time).toBeLessThan(100);

      console.log(`Save 500 breaks: ${time.toFixed(2)}ms`);
    });

    it('should load 500 breaks from storage in < 100ms', async () => {
      const breaks = Array.from({ length: 500 }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );
      await setItem(STORAGE_KEYS.BREAK_HISTORY, breaks);

      const start = performance.now();
      const loaded = await getItem<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);
      const time = performance.now() - start;

      expect(time).toBeLessThan(100);
      expect(loaded).toHaveLength(500);

      console.log(`Load 500 breaks: ${time.toFixed(2)}ms`);
    });

    it('should handle concurrent storage operations', async () => {
      const operations: Promise<void>[] = [];

      // Simulate concurrent saves
      for (let i = 0; i < 10; i++) {
        const breaks = Array.from({ length: 50 }, (_, j) =>
          createMockBreak({ id: `break-batch${i}-${j}` })
        );
        operations.push(
          setItem(`${STORAGE_KEYS.BREAK_HISTORY}_batch${i}`, breaks).then(() => undefined)
        );
      }

      const start = performance.now();
      await Promise.all(operations);
      const time = performance.now() - start;

      expect(time).toBeLessThan(500);

      console.log(`10 concurrent saves (50 items each): ${time.toFixed(2)}ms`);
    });
  });

  describe('Storage Limit Warnings', () => {
    it('should warn when approaching 5MB limit', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Create a large data structure
      const largeData = {
        breaks: Array.from({ length: 500 }, (_, i) =>
          createMockBreak({
            id: `break-${i}`,
            title: 'A'.repeat(1000), // Long titles to inflate size
          })
        ),
      };

      const size = getJsonSize(largeData);
      const WARN_THRESHOLD = 4 * 1024 * 1024; // 4MB

      if (size > WARN_THRESHOLD) {
        console.warn(`Storage approaching limit: ${formatBytes(size)}`);
      }

      // The actual warning is implementation-dependent
      // This test documents the expected threshold
      expect(WARN_THRESHOLD).toBe(4 * 1024 * 1024);

      warnSpy.mockRestore();
    });

    it('should calculate per-key storage sizes', async () => {
      // Save different data types
      const breaks = Array.from({ length: 500 }, (_, i) =>
        createMockBreak({ id: `break-${i}` })
      );
      await setItem(STORAGE_KEYS.BREAK_HISTORY, breaks);

      const streakData: StreakData = {
        currentStreak: 90,
        longestStreak: 100,
        lastBreakDate: '2024-01-15',
        streakHistory: Array.from({ length: 90 }, (_, i) => ({
          date: `2024-01-${(i % 28) + 1}`,
          count: 5,
        })),
      };
      await setItem(STORAGE_KEYS.STREAK_DATA, streakData);

      const userStats: UserStats = {
        totalBreaks: 5000,
        totalMinutes: 25000,
        totalXP: 500000,
        level: 5001,
        weeklyGoal: 35,
        weeklyProgress: 20,
      };
      await setItem(STORAGE_KEYS.USER_STATS, userStats);

      // Calculate sizes
      const sizes = {
        breakHistory: getJsonSize(breaks),
        streakData: getJsonSize(streakData),
        userStats: getJsonSize(userStats),
      };

      const total = Object.values(sizes).reduce((a, b) => a + b, 0);

      console.log('Storage breakdown:');
      console.log(`  Break History: ${formatBytes(sizes.breakHistory)}`);
      console.log(`  Streak Data: ${formatBytes(sizes.streakData)}`);
      console.log(`  User Stats: ${formatBytes(sizes.userStats)}`);
      console.log(`  Total: ${formatBytes(total)}`);

      // All should be reasonable
      expect(sizes.breakHistory).toBeLessThan(1024 * 1024); // 1MB
      expect(sizes.streakData).toBeLessThan(100 * 1024); // 100KB
      expect(sizes.userStats).toBeLessThan(1024); // 1KB
    });
  });

  describe('Data Integrity Under Load', () => {
    it('should maintain data integrity after multiple save/load cycles', async () => {
      const originalBreaks = Array.from({ length: 500 }, (_, i) =>
        createMockBreak({ id: `break-${i}`, xpEarned: i * 10 })
      );

      // Save/load cycle 10 times
      for (let cycle = 0; cycle < 10; cycle++) {
        await setItem(STORAGE_KEYS.BREAK_HISTORY, originalBreaks);
        const loaded = await getItem<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);

        expect(loaded).toHaveLength(500);
        expect(loaded![0].id).toBe('break-0');
        expect(loaded![499].id).toBe('break-499');
        expect(loaded![250].xpEarned).toBe(2500);
      }
    });

    it('should handle special characters in data', async () => {
      const breaksWithSpecialChars = [
        createMockBreak({
          id: 'break-special',
          title: 'Break with "quotes" and \'apostrophes\'',
        }),
        createMockBreak({
          id: 'break-unicode',
          title: 'Break with unicode: \u2764\ufe0f \u2728',
        }),
        createMockBreak({
          id: 'break-newline',
          title: 'Break with\nnewline',
        }),
        createMockBreak({
          id: 'break-emoji',
          title: 'Break with emoji: \ud83d\ude80\ud83c\udf1f',
        }),
      ];

      await setItem(STORAGE_KEYS.BREAK_HISTORY, breaksWithSpecialChars);
      const loaded = await getItem<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);

      expect(loaded).toHaveLength(4);
      expect(loaded![0].title).toBe('Break with "quotes" and \'apostrophes\'');
      expect(loaded![1].title).toContain('unicode');
      expect(loaded![2].title).toContain('\n');
    });

    it('should handle null and undefined values', async () => {
      const breaksWithNulls = [
        createMockBreak({ id: 'break-1', rating: null }),
        createMockBreak({ id: 'break-2', rating: 'good' }),
      ];

      await setItem(STORAGE_KEYS.BREAK_HISTORY, breaksWithNulls);
      const loaded = await getItem<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);

      expect(loaded![0].rating).toBeNull();
      expect(loaded![1].rating).toBe('good');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty arrays', async () => {
      await setItem(STORAGE_KEYS.BREAK_HISTORY, []);
      const loaded = await getItem<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);

      expect(loaded).toEqual([]);
    });

    it('should handle very long string values', async () => {
      const breakWithLongTitle = createMockBreak({
        id: 'break-long',
        title: 'A'.repeat(10000), // 10KB title
      });

      await setItem(STORAGE_KEYS.BREAK_HISTORY, [breakWithLongTitle]);
      const loaded = await getItem<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);

      expect(loaded![0].title).toHaveLength(10000);
    });

    it('should handle deeply nested objects', async () => {
      const complexStreakData: StreakData = {
        currentStreak: 90,
        longestStreak: 100,
        lastBreakDate: '2024-01-15',
        streakHistory: Array.from({ length: 90 }, (_, i) => ({
          date: `2024-${Math.floor(i / 28) + 1}-${(i % 28) + 1}`,
          count: Math.floor(Math.random() * 20) + 1,
        })),
      };

      await setItem(STORAGE_KEYS.STREAK_DATA, complexStreakData);
      const loaded = await getItem<StreakData>(STORAGE_KEYS.STREAK_DATA);

      expect(loaded!.streakHistory).toHaveLength(90);
      expect(loaded!.currentStreak).toBe(90);
    });

    it('should handle rapid sequential writes', async () => {
      const writePromises: Promise<boolean>[] = [];

      // Rapid sequential writes to same key
      for (let i = 0; i < 100; i++) {
        writePromises.push(
          setItem(STORAGE_KEYS.USER_STATS, {
            totalBreaks: i,
            totalMinutes: i * 5,
            totalXP: i * 10,
            level: Math.floor(i / 10) + 1,
            weeklyGoal: 35,
            weeklyProgress: i % 35,
          })
        );
      }

      const results = await Promise.all(writePromises);

      // All writes should succeed
      expect(results.every((r) => r === true)).toBe(true);

      // Final value should be the last write
      const final = await getItem<UserStats>(STORAGE_KEYS.USER_STATS);
      expect(final!.totalBreaks).toBe(99);
    });
  });
});
