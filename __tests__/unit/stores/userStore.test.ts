/**
 * User Store Unit Tests
 * Comprehensive tests for user state management
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useUserStore,
  userStoreTestUtils,
  useUserProfile,
  useUserProgress,
  useUserLevel,
  useUserXP,
  useUserStreak,
  useFavoriteBreaks,
} from '@/store/userStore';
import { STORAGE_KEYS } from '@/services/storage';

describe('UserStore', () => {
  // Reset store before each test
  beforeEach(async () => {
    await AsyncStorage.clear();
    act(() => {
      useUserStore.getState().signOut();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial profile', () => {
      const state = useUserStore.getState();

      expect(state.profile.name).toBe('User');
      expect(state.profile.avatar).toBeNull();
      expect(state.profile.email).toBeNull();
      expect(state.profile.joinedAt).toBeDefined();
    });

    it('should have correct initial progress', () => {
      const state = useUserStore.getState();

      expect(state.progress.level).toBe(1);
      expect(state.progress.totalXP).toBe(0);
      expect(state.progress.totalBreaks).toBe(0);
      expect(state.progress.currentStreak).toBe(0);
      expect(state.progress.longestStreak).toBe(0);
      expect(state.progress.weeklyGoal).toBe(35);
      expect(state.progress.dailyGoal).toBe(5);
    });

    it('should have empty preferences', () => {
      const state = useUserStore.getState();

      expect(state.preferences.favoriteBreaks).toEqual([]);
      expect(state.preferences.recentBreaks).toEqual([]);
    });

    it('should have empty achievements', () => {
      const state = useUserStore.getState();

      expect(state.achievements.unlockedIds).toEqual([]);
      expect(state.achievements.unlockedAt).toEqual({});
      expect(state.achievements.categoryBreaks).toEqual({});
      expect(state.achievements.totalMinutes).toBe(0);
    });
  });

  describe('Profile Actions', () => {
    it('should update profile with partial data', () => {
      act(() => {
        useUserStore.getState().updateProfile({ name: 'John Doe' });
      });

      expect(useUserStore.getState().profile.name).toBe('John Doe');
    });

    it('should set name', () => {
      act(() => {
        useUserStore.getState().setName('Jane Doe');
      });

      expect(useUserStore.getState().profile.name).toBe('Jane Doe');
    });

    it('should set avatar', () => {
      act(() => {
        useUserStore.getState().setAvatar('🧘');
      });

      expect(useUserStore.getState().profile.avatar).toBe('🧘');
    });
  });

  describe('Progress Actions', () => {
    it('should add XP and calculate level correctly', () => {
      act(() => {
        useUserStore.getState().addXP(50);
      });

      expect(useUserStore.getState().progress.totalXP).toBe(50);
      expect(useUserStore.getState().progress.level).toBe(1);

      act(() => {
        useUserStore.getState().addXP(60);
      });

      expect(useUserStore.getState().progress.totalXP).toBe(110);
      expect(useUserStore.getState().progress.level).toBe(2); // 110 / 100 + 1 = 2
    });

    it('should increment breaks', () => {
      act(() => {
        useUserStore.getState().incrementBreaks();
        useUserStore.getState().incrementBreaks();
        useUserStore.getState().incrementBreaks();
      });

      expect(useUserStore.getState().progress.totalBreaks).toBe(3);
    });

    it('should update streak and track longest streak', () => {
      act(() => {
        useUserStore.getState().updateStreak(5);
      });

      expect(useUserStore.getState().progress.currentStreak).toBe(5);
      expect(useUserStore.getState().progress.longestStreak).toBe(5);

      act(() => {
        useUserStore.getState().updateStreak(3);
      });

      expect(useUserStore.getState().progress.currentStreak).toBe(3);
      expect(useUserStore.getState().progress.longestStreak).toBe(5); // Should keep highest
    });

    it('should set weekly goal and calculate daily goal', async () => {
      act(() => {
        useUserStore.getState().setWeeklyGoal(42);
      });

      expect(useUserStore.getState().progress.weeklyGoal).toBe(42);
      expect(useUserStore.getState().progress.dailyGoal).toBe(6); // 42 / 7 = 6

      await waitFor(async () => {
        const storedStats = JSON.parse((await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS)) ?? '{}');
        expect(storedStats.weeklyGoal).toBe(42);
      });
    });

    it('should set daily goal independently', () => {
      act(() => {
        useUserStore.getState().setDailyGoal(10);
      });

      expect(useUserStore.getState().progress.dailyGoal).toBe(10);
    });

    it('should reset progress to initial values', async () => {
      act(() => {
        useUserStore.getState().addXP(500);
        useUserStore.getState().incrementBreaks();
        useUserStore.getState().updateStreak(10);
        useUserStore.getState().resetProgress();
      });

      const progress = useUserStore.getState().progress;
      expect(progress.level).toBe(1);
      expect(progress.totalXP).toBe(0);
      expect(progress.totalBreaks).toBe(0);
      expect(progress.currentStreak).toBe(0);

      await waitFor(async () => {
        const storedStats = JSON.parse((await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS)) ?? '{}');
        expect(storedStats.totalXP).toBe(0);
        expect(storedStats.totalBreaks).toBe(0);
        expect(storedStats.weeklyGoal).toBe(35);
      });
    });
  });

  describe('Favorites Actions', () => {
    it('should toggle favorite on', () => {
      act(() => {
        useUserStore.getState().toggleFavorite('break-1');
      });

      expect(useUserStore.getState().preferences.favoriteBreaks).toContain('break-1');
    });

    it('should toggle favorite off', () => {
      act(() => {
        useUserStore.getState().toggleFavorite('break-1');
        useUserStore.getState().toggleFavorite('break-1');
      });

      expect(useUserStore.getState().preferences.favoriteBreaks).not.toContain('break-1');
    });

    it('should check if break is favorite', () => {
      act(() => {
        useUserStore.getState().toggleFavorite('break-1');
      });

      expect(useUserStore.getState().isFavorite('break-1')).toBe(true);
      expect(useUserStore.getState().isFavorite('break-2')).toBe(false);
    });

    it('should add recent breaks with limit of 10', () => {
      act(() => {
        for (let i = 1; i <= 15; i++) {
          useUserStore.getState().addRecentBreak(`break-${i}`);
        }
      });

      const recents = useUserStore.getState().preferences.recentBreaks;
      expect(recents).toHaveLength(10);
      expect(recents[0]).toBe('break-15'); // Most recent first
      expect(recents[9]).toBe('break-6');
    });

    it('should move existing break to front of recents', () => {
      act(() => {
        useUserStore.getState().addRecentBreak('break-1');
        useUserStore.getState().addRecentBreak('break-2');
        useUserStore.getState().addRecentBreak('break-3');
        useUserStore.getState().addRecentBreak('break-1'); // Add again
      });

      const recents = useUserStore.getState().preferences.recentBreaks;
      expect(recents[0]).toBe('break-1');
      expect(recents).toHaveLength(3); // No duplicates
    });
  });

  describe('Achievement Actions', () => {
    it('should unlock achievement', () => {
      act(() => {
        useUserStore.getState().unlockAchievement('first-break');
      });

      const achievements = useUserStore.getState().achievements;
      expect(achievements.unlockedIds).toContain('first-break');
      expect(achievements.unlockedAt['first-break']).toBeDefined();
    });

    it('should not duplicate already unlocked achievement', () => {
      act(() => {
        useUserStore.getState().unlockAchievement('first-break');
        useUserStore.getState().unlockAchievement('first-break');
      });

      const achievements = useUserStore.getState().achievements;
      expect(achievements.unlockedIds.filter((id) => id === 'first-break')).toHaveLength(1);
    });

    it('should check if achievement is unlocked', () => {
      act(() => {
        useUserStore.getState().unlockAchievement('first-break');
      });

      expect(useUserStore.getState().isAchievementUnlocked('first-break')).toBe(true);
      expect(useUserStore.getState().isAchievementUnlocked('other-achievement')).toBe(false);
    });

    it('should track break completion by category', () => {
      act(() => {
        useUserStore.getState().trackBreakCompletion('quick', 2);
        useUserStore.getState().trackBreakCompletion('quick', 3);
        useUserStore.getState().trackBreakCompletion('stretch', 5);
      });

      const achievements = useUserStore.getState().achievements;
      expect(achievements.categoryBreaks['quick']).toBe(2);
      expect(achievements.categoryBreaks['stretch']).toBe(1);
      expect(achievements.totalMinutes).toBe(10);
    });

    it('should accumulate recovery minutes on every break completion', () => {
      expect(useUserStore.getState().progress.recoveryMinutes).toBe(0);
      expect(useUserStore.getState().progress.recoveryBankSince).toBeNull();

      act(() => {
        useUserStore.getState().trackBreakCompletion('quick', 2);
        useUserStore.getState().trackBreakCompletion('stretch', 5);
      });

      const progress = useUserStore.getState().progress;
      expect(progress.recoveryMinutes).toBe(7);
      expect(progress.recoveryBankSince).not.toBeNull();
    });

    it('should stamp recoveryBankSince only on the first break, not every call', () => {
      act(() => {
        useUserStore.getState().trackBreakCompletion('quick', 1);
      });
      const firstStamp = useUserStore.getState().progress.recoveryBankSince;
      expect(firstStamp).not.toBeNull();

      act(() => {
        useUserStore.getState().trackBreakCompletion('quick', 4);
      });
      const secondStamp = useUserStore.getState().progress.recoveryBankSince;
      expect(secondStamp).toBe(firstStamp);
    });

    it('should treat a NaN duration as zero recovery minutes', () => {
      act(() => {
        useUserStore.getState().trackBreakCompletion('quick', Number.NaN);
      });
      const progress = useUserStore.getState().progress;
      expect(progress.recoveryMinutes).toBe(0);
      // The bank still kicks on — a logged break is a logged break,
      // even if its duration was malformed.
      expect(progress.recoveryBankSince).not.toBeNull();
    });
  });

  describe('Sign Out', () => {
    it('should reset all state on sign out', () => {
      act(() => {
        useUserStore.getState().setName('Test User');
        useUserStore.getState().addXP(500);
        useUserStore.getState().toggleFavorite('break-1');
        useUserStore.getState().unlockAchievement('first-break');
        useUserStore.getState().signOut();
      });

      const state = useUserStore.getState();
      expect(state.profile.name).toBe('User');
      expect(state.progress.totalXP).toBe(0);
      expect(state.preferences.favoriteBreaks).toEqual([]);
      expect(state.achievements.unlockedIds).toEqual([]);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('Persistence Safety', () => {
    it('should sanitize malformed persisted user state', () => {
      const snapshot = userStoreTestUtils.sanitizePersistedUserState({
        profile: {
          name: '',
          avatar: 42,
          email: ['user@example.com'],
          joinedAt: 'not-a-date',
          updatedAt: 'later',
        },
        progress: {
          level: 0,
          totalXP: -10,
          totalBreaks: -5,
          currentStreak: 6,
          longestStreak: 2,
          weeklyGoal: 0,
          dailyGoal: -2,
        },
        preferences: {
          favoriteBreaks: ['neck-reset', 'neck-reset', null],
          recentBreaks: ['latest', 3, 'older'],
        },
        achievements: {
          unlockedIds: ['starter', 'starter', 3],
          unlockedAt: {
            starter: '2026-01-01T00:00:00.000Z',
            broken: 'nope',
          },
          categoryBreaks: {
            mobility: 4,
            broken: -2,
          },
          totalMinutes: -50,
        },
        isAuthenticated: 'yes',
      });

      expect(snapshot.profile.name).toBe('User');
      expect(snapshot.profile.avatar).toBeNull();
      expect(snapshot.profile.email).toBeNull();
      expect(snapshot.profile.joinedAt).toBeDefined();

      expect(snapshot.progress.level).toBe(1);
      expect(snapshot.progress.totalXP).toBe(0);
      expect(snapshot.progress.totalBreaks).toBe(0);
      expect(snapshot.progress.currentStreak).toBe(6);
      expect(snapshot.progress.longestStreak).toBe(6);
      expect(snapshot.progress.weeklyGoal).toBe(35);
      expect(snapshot.progress.dailyGoal).toBe(5);

      expect(snapshot.preferences.favoriteBreaks).toEqual(['neck-reset']);
      expect(snapshot.preferences.recentBreaks).toEqual(['latest', 'older']);

      expect(snapshot.achievements.unlockedIds).toEqual(['starter']);
      expect(snapshot.achievements.unlockedAt).toEqual({
        starter: '2026-01-01T00:00:00.000Z',
      });
      expect(snapshot.achievements.categoryBreaks).toEqual({ mobility: 4 });
      expect(snapshot.achievements.totalMinutes).toBe(0);
      expect(snapshot.isAuthenticated).toBe(false);
    });
  });

  describe('Selectors', () => {
    it('should return profile via useUserProfile hook', () => {
      act(() => {
        useUserStore.getState().setName('Hook Test');
      });

      const { result } = renderHook(() => useUserProfile());
      expect(result.current.name).toBe('Hook Test');
    });

    it('should return progress via useUserProgress hook', () => {
      act(() => {
        useUserStore.getState().addXP(250);
      });

      const { result } = renderHook(() => useUserProgress());
      expect(result.current.totalXP).toBe(250);
      expect(result.current.level).toBe(3);
    });

    it('should return individual values via granular hooks', () => {
      act(() => {
        useUserStore.getState().addXP(150);
        useUserStore.getState().updateStreak(7);
        useUserStore.getState().toggleFavorite('break-1');
      });

      const { result: levelResult } = renderHook(() => useUserLevel());
      const { result: xpResult } = renderHook(() => useUserXP());
      const { result: streakResult } = renderHook(() => useUserStreak());
      const { result: favoritesResult } = renderHook(() => useFavoriteBreaks());

      expect(levelResult.current).toBe(2);
      expect(xpResult.current).toBe(150);
      expect(streakResult.current).toBe(7);
      expect(favoritesResult.current).toContain('break-1');
    });
  });

  describe('Edge Cases', () => {
    describe('Profile Edge Cases', () => {
      it('should handle empty string name', () => {
        act(() => {
          useUserStore.getState().setName('');
        });

        expect(useUserStore.getState().profile.name).toBe('');
      });

      it('should handle very long name', () => {
        const longName = 'A'.repeat(1000);
        act(() => {
          useUserStore.getState().setName(longName);
        });

        expect(useUserStore.getState().profile.name).toBe(longName);
      });

      it('should handle special characters in name', () => {
        act(() => {
          useUserStore.getState().setName('J@hn D0e! 123 #$%');
        });

        expect(useUserStore.getState().profile.name).toBe('J@hn D0e! 123 #$%');
      });

      it('should handle unicode characters in name', () => {
        act(() => {
          useUserStore.getState().setName('محمد 你好 🎉');
        });

        expect(useUserStore.getState().profile.name).toBe('محمد 你好 🎉');
      });

      it('should handle empty avatar', () => {
        act(() => {
          useUserStore.getState().setAvatar('');
        });

        expect(useUserStore.getState().profile.avatar).toBe('');
      });

      it('should handle image URI as avatar', () => {
        act(() => {
          useUserStore.getState().setAvatar('file:///path/to/image.jpg');
        });

        expect(useUserStore.getState().profile.avatar).toBe('file:///path/to/image.jpg');
      });

      it('should preserve other profile fields when updating one', () => {
        act(() => {
          useUserStore.getState().updateProfile({ name: 'First' });
        });
        const joinedAt = useUserStore.getState().profile.joinedAt;

        act(() => {
          useUserStore.getState().updateProfile({ avatar: '🎉' });
        });

        expect(useUserStore.getState().profile.name).toBe('First');
        expect(useUserStore.getState().profile.joinedAt).toBe(joinedAt);
      });
    });

    describe('Progress Edge Cases', () => {
      it('should handle zero XP', () => {
        act(() => {
          useUserStore.getState().addXP(0);
        });

        expect(useUserStore.getState().progress.totalXP).toBe(0);
        expect(useUserStore.getState().progress.level).toBe(1);
      });

      it('should handle very large XP values', () => {
        act(() => {
          useUserStore.getState().addXP(999999);
        });

        expect(useUserStore.getState().progress.totalXP).toBe(999999);
        expect(useUserStore.getState().progress.level).toBe(10000);
      });

      it('should level up correctly at exact boundaries', () => {
        act(() => {
          useUserStore.getState().addXP(99);
        });
        expect(useUserStore.getState().progress.level).toBe(1);

        act(() => {
          useUserStore.getState().addXP(1);
        });
        expect(useUserStore.getState().progress.level).toBe(2);
      });

      it('should handle zero weekly goal', () => {
        act(() => {
          useUserStore.getState().setWeeklyGoal(0);
        });

        expect(useUserStore.getState().progress.weeklyGoal).toBe(0);
        expect(useUserStore.getState().progress.dailyGoal).toBe(3); // minimum
      });

      it('should enforce minimum daily goal of 3', () => {
        act(() => {
          useUserStore.getState().setWeeklyGoal(7);
        });

        expect(useUserStore.getState().progress.dailyGoal).toBe(3);
      });

      it('should round daily goal correctly', () => {
        act(() => {
          useUserStore.getState().setWeeklyGoal(50);
        });

        expect(useUserStore.getState().progress.dailyGoal).toBe(7); // 50/7 = 7.14 -> 7
      });

      it('should handle zero streak', () => {
        act(() => {
          useUserStore.getState().updateStreak(5);
          useUserStore.getState().updateStreak(0);
        });

        expect(useUserStore.getState().progress.currentStreak).toBe(0);
        expect(useUserStore.getState().progress.longestStreak).toBe(5);
      });

      it('should handle streak equal to longest', () => {
        act(() => {
          useUserStore.getState().updateStreak(10);
          useUserStore.getState().updateStreak(0);
          useUserStore.getState().updateStreak(10);
        });

        expect(useUserStore.getState().progress.longestStreak).toBe(10);
      });
    });

    describe('Favorites Edge Cases', () => {
      it('should handle many favorites', () => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            useUserStore.getState().toggleFavorite(`break-${i}`);
          }
        });

        expect(useUserStore.getState().preferences.favoriteBreaks).toHaveLength(100);
      });

      it('should handle toggling same favorite multiple times', () => {
        act(() => {
          useUserStore.getState().toggleFavorite('break-1');
          useUserStore.getState().toggleFavorite('break-1');
          useUserStore.getState().toggleFavorite('break-1');
        });

        expect(useUserStore.getState().preferences.favoriteBreaks).toContain('break-1');
      });

      it('should handle empty break ID', () => {
        act(() => {
          useUserStore.getState().toggleFavorite('');
        });

        expect(useUserStore.getState().preferences.favoriteBreaks).toContain('');
      });

      it('should handle special characters in break ID', () => {
        act(() => {
          useUserStore.getState().toggleFavorite('break-@#$%');
        });

        expect(useUserStore.getState().isFavorite('break-@#$%')).toBe(true);
      });
    });

    describe('Recents Edge Cases', () => {
      it('should handle adding same break multiple times', () => {
        act(() => {
          useUserStore.getState().addRecentBreak('break-1');
          useUserStore.getState().addRecentBreak('break-1');
          useUserStore.getState().addRecentBreak('break-1');
        });

        expect(useUserStore.getState().preferences.recentBreaks).toHaveLength(1);
        expect(useUserStore.getState().preferences.recentBreaks[0]).toBe('break-1');
      });

      it('should maintain order correctly when moving to front', () => {
        act(() => {
          useUserStore.getState().addRecentBreak('break-1');
          useUserStore.getState().addRecentBreak('break-2');
          useUserStore.getState().addRecentBreak('break-3');
          useUserStore.getState().addRecentBreak('break-2');
        });

        const recents = useUserStore.getState().preferences.recentBreaks;
        expect(recents[0]).toBe('break-2');
        expect(recents[1]).toBe('break-3');
        expect(recents[2]).toBe('break-1');
      });
    });

    describe('Achievement Edge Cases', () => {
      it('should preserve original unlock time when trying to unlock again', () => {
        act(() => {
          useUserStore.getState().unlockAchievement('first-break');
        });
        const firstUnlock = useUserStore.getState().achievements.unlockedAt['first-break'];

        // Wait a bit
        act(() => {
          useUserStore.getState().unlockAchievement('first-break');
        });

        expect(useUserStore.getState().achievements.unlockedAt['first-break']).toBe(firstUnlock);
      });

      it('should handle many achievements', () => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            useUserStore.getState().unlockAchievement(`achievement-${i}`);
          }
        });

        expect(useUserStore.getState().achievements.unlockedIds).toHaveLength(100);
      });

      it('should handle empty category in trackBreakCompletion', () => {
        act(() => {
          useUserStore.getState().trackBreakCompletion('', 5);
        });

        expect(useUserStore.getState().achievements.categoryBreaks['']).toBe(1);
      });

      it('should handle zero duration in trackBreakCompletion', () => {
        act(() => {
          useUserStore.getState().trackBreakCompletion('quick', 0);
        });

        expect(useUserStore.getState().achievements.categoryBreaks['quick']).toBe(1);
        expect(useUserStore.getState().achievements.totalMinutes).toBe(0);
      });

      it('should accumulate minutes correctly', () => {
        act(() => {
          useUserStore.getState().trackBreakCompletion('quick', 5);
          useUserStore.getState().trackBreakCompletion('stretch', 10);
          useUserStore.getState().trackBreakCompletion('quick', 3);
        });

        expect(useUserStore.getState().achievements.totalMinutes).toBe(18);
      });
    });

    describe('Concurrent Updates', () => {
      it('should handle concurrent XP updates', () => {
        act(() => {
          useUserStore.getState().addXP(10);
          useUserStore.getState().addXP(20);
          useUserStore.getState().addXP(30);
        });

        expect(useUserStore.getState().progress.totalXP).toBe(60);
      });

      it('should handle concurrent break increments', () => {
        act(() => {
          for (let i = 0; i < 100; i++) {
            useUserStore.getState().incrementBreaks();
          }
        });

        expect(useUserStore.getState().progress.totalBreaks).toBe(100);
      });

      it('should handle mixed concurrent updates', () => {
        act(() => {
          useUserStore.getState().addXP(50);
          useUserStore.getState().incrementBreaks();
          useUserStore.getState().toggleFavorite('break-1');
          useUserStore.getState().updateStreak(3);
          useUserStore.getState().unlockAchievement('test');
        });

        const state = useUserStore.getState();
        expect(state.progress.totalXP).toBe(50);
        expect(state.progress.totalBreaks).toBe(1);
        expect(state.preferences.favoriteBreaks).toContain('break-1');
        expect(state.progress.currentStreak).toBe(3);
        expect(state.achievements.unlockedIds).toContain('test');
      });
    });
  });
});
