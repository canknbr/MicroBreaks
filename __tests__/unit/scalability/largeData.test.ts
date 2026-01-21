/**
 * Large Data Set Tests
 * Tests with 500+ favorites, 1000+ breaks, 100+ achievements, 90-day streak history
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from '@testing-library/react-native';
import { useUserStore } from '@/store/userStore';
import {
  getBreakHistory,
  getBreaksByDateRange,
  getWeeklyChartData,
  getMonthlyChartData,
  getBreakTypeDistribution,
  getTimePatterns,
  getRecentBreaks,
  getStreakData,
  saveCompletedBreak,
} from '@/services/breakHistory';
import { STORAGE_KEYS, CompletedBreak } from '@/services/storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Helper to create mock break data
function createMockBreak(overrides: Partial<CompletedBreak> = {}): CompletedBreak {
  return {
    id: overrides.id || `break_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

// Helper to generate breaks over a date range
function generateBreaksOverDays(count: number, daysSpan: number): CompletedBreak[] {
  const breaks: CompletedBreak[] = [];
  const categories = ['quick', 'stretch', 'mindfulness', 'breathing', 'movement'];
  const colors = ['#06FFA5', '#B47EFF', '#FFD166', '#00E5FF', '#FF6B6B'];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * daysSpan);
    const hour = Math.floor(Math.random() * 24);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    const categoryIndex = i % categories.length;
    breaks.push(
      createMockBreak({
        id: `break-${i}`,
        category: categories[categoryIndex],
        color: colors[categoryIndex],
        duration: 60 + Math.floor(Math.random() * 240), // 1-5 minutes
        xpEarned: 10 + Math.floor(Math.random() * 40),
        completedAt: date.toISOString(),
      })
    );
  }

  return breaks;
}

// Helper to measure async execution time
async function measureTimeAsync(fn: () => Promise<unknown>): Promise<number> {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}

describe('Large Data Set Tests', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    act(() => {
      useUserStore.getState().signOut();
    });
    jest.clearAllMocks();
  });

  describe('500+ Favorites', () => {
    it('should handle 500 favorites without issues', () => {
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
      });

      const favorites = useUserStore.getState().preferences.favoriteBreaks;
      expect(favorites).toHaveLength(500);
    });

    it('should correctly identify favorites in large list', () => {
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
      });

      // Check first, middle, and last
      expect(useUserStore.getState().isFavorite('break-0')).toBe(true);
      expect(useUserStore.getState().isFavorite('break-250')).toBe(true);
      expect(useUserStore.getState().isFavorite('break-499')).toBe(true);
      expect(useUserStore.getState().isFavorite('break-500')).toBe(false);
    });

    it('should toggle favorites correctly in large list', () => {
      // Add 500 favorites
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
      });

      // Remove every other one
      act(() => {
        for (let i = 0; i < 500; i += 2) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
      });

      const favorites = useUserStore.getState().preferences.favoriteBreaks;
      expect(favorites).toHaveLength(250);

      // Even numbers should be removed, odd numbers should remain
      expect(useUserStore.getState().isFavorite('break-0')).toBe(false);
      expect(useUserStore.getState().isFavorite('break-1')).toBe(true);
      expect(useUserStore.getState().isFavorite('break-2')).toBe(false);
      expect(useUserStore.getState().isFavorite('break-3')).toBe(true);
    });
  });

  describe('1000+ Breaks', () => {
    it('should handle 1000 breaks in history', async () => {
      const breaks = generateBreaksOverDays(1000, 90);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const history = await getBreakHistory();
      expect(history).toHaveLength(1000);
    });

    it('should filter 1000 breaks by date range efficiently', async () => {
      const breaks = generateBreaksOverDays(1000, 90);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const time = await measureTimeAsync(async () => {
        await getBreaksByDateRange(thirtyDaysAgo, now);
      });

      // Should complete filtering in reasonable time
      expect(time).toBeLessThan(100);
    });

    it('should get weekly chart data with 1000 breaks in < 100ms', async () => {
      const breaks = generateBreaksOverDays(1000, 30);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const time = await measureTimeAsync(async () => {
        await getWeeklyChartData();
      });

      expect(time).toBeLessThan(100);
    });

    it('should get monthly chart data with 1000 breaks in < 200ms', async () => {
      const breaks = generateBreaksOverDays(1000, 90);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const time = await measureTimeAsync(async () => {
        await getMonthlyChartData();
      });

      expect(time).toBeLessThan(200);
    });

    it('should get break type distribution with 1000 breaks in < 50ms', async () => {
      const breaks = generateBreaksOverDays(1000, 90);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const time = await measureTimeAsync(async () => {
        await getBreakTypeDistribution('all');
      });

      expect(time).toBeLessThan(50);

      const distribution = await getBreakTypeDistribution('all');
      const totalCount = distribution.reduce((sum, d) => sum + d.count, 0);
      expect(totalCount).toBe(1000);
    });

    it('should get time patterns with 1000 breaks in < 50ms', async () => {
      const breaks = generateBreaksOverDays(1000, 90);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const time = await measureTimeAsync(async () => {
        await getTimePatterns('all');
      });

      expect(time).toBeLessThan(50);

      const patterns = await getTimePatterns('all');
      const totalCount = patterns.reduce((sum, p) => sum + p.count, 0);
      expect(totalCount).toBe(1000);
    });

    it('should enforce 500 break limit correctly', async () => {
      // Create 500 existing breaks
      const existingBreaks = Array.from({ length: 500 }, (_, i) =>
        createMockBreak({ id: `existing-${i}` })
      );
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(existingBreaks));

      // Add 10 more
      for (let i = 0; i < 10; i++) {
        await saveCompletedBreak({
          breakId: `new-${i}`,
          title: 'New Break',
          category: 'quick',
          icon: '',
          color: '#06FFA5',
          duration: 60,
          stepsCompleted: 1,
          totalSteps: 1,
          xpEarned: 10,
          rating: null,
          completedAt: new Date().toISOString(),
        });
      }

      const history = await getBreakHistory();
      expect(history.length).toBe(500);
      // New breaks should be at the front
      expect(history[0].breakId).toBe('new-9');
    });

    it('should get recent breaks efficiently from large history', async () => {
      const breaks = generateBreaksOverDays(1000, 90);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const time = await measureTimeAsync(async () => {
        await getRecentBreaks(10);
      });

      expect(time).toBeLessThan(50);

      const recent = await getRecentBreaks(10);
      expect(recent).toHaveLength(10);
    });
  });

  describe('100+ Achievements', () => {
    it('should handle 100 unlocked achievements', () => {
      act(() => {
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }
      });

      const achievements = useUserStore.getState().achievements;
      expect(achievements.unlockedIds).toHaveLength(100);
      expect(Object.keys(achievements.unlockedAt)).toHaveLength(100);
    });

    it('should check achievement status correctly in large list', () => {
      act(() => {
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }
      });

      // Check first, middle, last
      expect(useUserStore.getState().isAchievementUnlocked('achievement-0')).toBe(true);
      expect(useUserStore.getState().isAchievementUnlocked('achievement-50')).toBe(true);
      expect(useUserStore.getState().isAchievementUnlocked('achievement-99')).toBe(true);
      expect(useUserStore.getState().isAchievementUnlocked('achievement-100')).toBe(false);
    });

    it('should prevent duplicate achievements in large list', () => {
      act(() => {
        // Try to unlock same achievements twice
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
          useUserStore.getState().unlockAchievement(`achievement-${i}`); // Duplicate
        }
      });

      const achievements = useUserStore.getState().achievements;
      expect(achievements.unlockedIds).toHaveLength(100);
    });

    it('should preserve unlock timestamps when trying to re-unlock', () => {
      act(() => {
        useUserStore.getState().unlockAchievement('achievement-0');
      });

      const firstUnlockTime = useUserStore.getState().achievements.unlockedAt['achievement-0'];

      // Wait a bit and try to unlock again
      act(() => {
        useUserStore.getState().unlockAchievement('achievement-0');
      });

      const secondUnlockTime = useUserStore.getState().achievements.unlockedAt['achievement-0'];
      expect(secondUnlockTime).toBe(firstUnlockTime);
    });
  });

  describe('90-Day Streak History', () => {
    it('should handle 90 days of streak history', async () => {
      const streakHistory: { date: string; count: number }[] = [];
      const now = new Date();

      for (let i = 0; i < 90; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        streakHistory.push({
          date: date.toISOString().split('T')[0],
          count: 3 + Math.floor(Math.random() * 5), // 3-7 breaks per day
        });
      }

      const streakData = {
        currentStreak: 90,
        longestStreak: 90,
        lastBreakDate: now.toISOString().split('T')[0],
        streakHistory,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(streakData));

      const data = await getStreakData();
      expect(data.streakHistory).toHaveLength(90);
      expect(data.currentStreak).toBe(90);
      expect(data.longestStreak).toBe(90);
    });

    it('should enforce 90-day streak history limit', async () => {
      // Create 95 days of streak history
      const streakHistory: { date: string; count: number }[] = [];
      const now = new Date();

      for (let i = 0; i < 95; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        streakHistory.push({
          date: date.toISOString().split('T')[0],
          count: 1,
        });
      }

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const streakData = {
        currentStreak: 95,
        longestStreak: 95,
        lastBreakDate: yesterday.toISOString().split('T')[0],
        streakHistory,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.STREAK_DATA, JSON.stringify(streakData));

      // Save a new break which should trim history to 90
      await saveCompletedBreak({
        breakId: 'test',
        title: 'Test',
        category: 'quick',
        icon: '',
        color: '#06FFA5',
        duration: 60,
        stepsCompleted: 1,
        totalSteps: 1,
        xpEarned: 10,
        rating: null,
        completedAt: new Date().toISOString(),
      });

      const data = await getStreakData();
      expect(data.streakHistory.length).toBeLessThanOrEqual(90);
    });

    it('should correctly aggregate daily counts in streak history', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Save multiple breaks today
      for (let i = 0; i < 5; i++) {
        await saveCompletedBreak({
          breakId: `test-${i}`,
          title: 'Test',
          category: 'quick',
          icon: '',
          color: '#06FFA5',
          duration: 60,
          stepsCompleted: 1,
          totalSteps: 1,
          xpEarned: 10,
          rating: null,
          completedAt: new Date().toISOString(),
        });
      }

      const data = await getStreakData();
      const todayEntry = data.streakHistory.find((h) => h.date === today);
      expect(todayEntry?.count).toBe(5);
    });
  });

  describe('Combined Large Data Scenarios', () => {
    it('should handle full-scale data simultaneously', async () => {
      // 500 favorites
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
      });

      // 100 achievements
      act(() => {
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }
      });

      // Large XP
      act(() => {
        useUserStore.getState().addXP(500000);
      });

      // 1000 breaks in history
      const breaks = generateBreaksOverDays(1000, 90);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      // Verify all data is intact
      const state = useUserStore.getState();
      expect(state.preferences.favoriteBreaks).toHaveLength(500);
      expect(state.achievements.unlockedIds).toHaveLength(100);
      expect(state.progress.totalXP).toBe(500000);

      const history = await getBreakHistory();
      expect(history).toHaveLength(1000);
    });

    it('should perform operations on full-scale data quickly', async () => {
      // Setup large state
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }
      });

      const breaks = generateBreaksOverDays(1000, 90);
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      // Test multiple operations
      const operations = await Promise.all([
        measureTimeAsync(async () => getWeeklyChartData()),
        measureTimeAsync(async () => getBreakTypeDistribution('all')),
        measureTimeAsync(async () => getTimePatterns('all')),
        measureTimeAsync(async () => {
          return useUserStore.getState().isFavorite('break-250');
        }),
        measureTimeAsync(async () => {
          return useUserStore.getState().isAchievementUnlocked('achievement-50');
        }),
      ]);

      // All operations should complete in reasonable time
      operations.forEach((time) => {
        expect(time).toBeLessThan(200);
      });
    });
  });

  describe('Edge Cases with Large Data', () => {
    it('should handle empty favorites after having 500', () => {
      // Add 500 favorites
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
      });

      // Remove all
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
      });

      expect(useUserStore.getState().preferences.favoriteBreaks).toHaveLength(0);
    });

    it('should handle sign out with large state', () => {
      // Build up large state
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
        }
        for (let i = 0; i < 100; i++) {
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }
        useUserStore.getState().addXP(1000000);
      });

      // Sign out
      act(() => {
        useUserStore.getState().signOut();
      });

      const state = useUserStore.getState();
      expect(state.preferences.favoriteBreaks).toHaveLength(0);
      expect(state.achievements.unlockedIds).toHaveLength(0);
      expect(state.progress.totalXP).toBe(0);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle category distribution with 1000 breaks all same category', async () => {
      const breaks = Array.from({ length: 1000 }, (_, i) =>
        createMockBreak({
          id: `break-${i}`,
          category: 'quick',
          color: '#06FFA5',
        })
      );
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const distribution = await getBreakTypeDistribution('all');
      expect(distribution).toHaveLength(1);
      expect(distribution[0].category).toBe('Quick');
      expect(distribution[0].count).toBe(1000);
      expect(distribution[0].percentage).toBe(100);
    });

    it('should handle time patterns with 1000 breaks at same hour', async () => {
      const now = new Date();
      now.setHours(10, 0, 0, 0); // All at 10 AM (morning)

      const breaks = Array.from({ length: 1000 }, (_, i) =>
        createMockBreak({
          id: `break-${i}`,
          completedAt: now.toISOString(),
        })
      );
      await AsyncStorage.setItem(STORAGE_KEYS.BREAK_HISTORY, JSON.stringify(breaks));

      const patterns = await getTimePatterns('all');
      const morning = patterns.find((p) => p.period === 'morning');
      expect(morning?.count).toBe(1000);
      expect(morning?.percentage).toBe(100);
    });
  });
});
