/**
 * Sync Merger Tests
 * Tests conflict resolution strategies for cloud sync
 */

import {
  mergeProfiles,
  mergeProgress,
  mergePreferences,
  mergeAchievements,
  mergeBreakHistories,
} from '@/services/sync/merger';
import type { UserProfile, UserProgress, UserPreferences, UserAchievements } from '@/store/userStore';
import type { CompletedBreak } from '@/services/storage';
import { MAX_BREAK_HISTORY } from '@/constants/config';

describe('Sync Merger', () => {
  // =============================================
  // mergeProfiles - Last-write-wins
  // =============================================
  describe('mergeProfiles', () => {
    const baseProfile: UserProfile = {
      name: 'Local User',
      avatar: null,
      email: null,
      emailVerified: false,
      joinedAt: '2024-01-01T00:00:00.000Z',
    };

    it('should use remote profile when remote is newer', () => {
      const local = { ...baseProfile, name: 'Local', updatedAt: 1000 };
      const remote = { ...baseProfile, name: 'Remote', updatedAt: 2000 };

      const result = mergeProfiles(local, remote);
      expect(result.name).toBe('Remote');
    });

    it('should use local profile when local is newer', () => {
      const local = { ...baseProfile, name: 'Local', updatedAt: 3000 };
      const remote = { ...baseProfile, name: 'Remote', updatedAt: 2000 };

      const result = mergeProfiles(local, remote);
      expect(result.name).toBe('Local');
    });

    it('should handle missing timestamps (default to 0)', () => {
      const local = { ...baseProfile, name: 'Local' };
      const remote = { ...baseProfile, name: 'Remote', updatedAt: 1000 };

      const result = mergeProfiles(local, remote);
      expect(result.name).toBe('Remote');
    });

    it('should use local when timestamps are equal', () => {
      const local = { ...baseProfile, name: 'Local', updatedAt: 1000 };
      const remote = { ...baseProfile, name: 'Remote', updatedAt: 1000 };

      const result = mergeProfiles(local, remote);
      expect(result.name).toBe('Local');
    });
  });

  // =============================================
  // mergeProgress - Max values
  // =============================================
  describe('mergeProgress', () => {
    const baseProgress: UserProgress = {
      level: 1,
      totalXP: 0,
      totalBreaks: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyGoal: 20,
      dailyGoal: 5,
      recoveryMinutes: 0,
      recoveryBankSince: null,
    };

    it('should take max values for cumulative stats', () => {
      const local: UserProgress = {
        ...baseProgress,
        level: 3,
        totalXP: 250,
        totalBreaks: 30,
        currentStreak: 5,
        longestStreak: 10,
      };
      const remote: UserProgress = {
        ...baseProgress,
        level: 2,
        totalXP: 180,
        totalBreaks: 40,
        currentStreak: 3,
        longestStreak: 12,
      };

      const result = mergeProgress(local, remote);
      expect(result.level).toBe(3); // local higher
      expect(result.totalXP).toBe(250); // local higher
      expect(result.totalBreaks).toBe(40); // remote higher
      expect(result.currentStreak).toBe(5); // local higher
      expect(result.longestStreak).toBe(12); // remote higher
    });

    it('should use remote values for goal settings', () => {
      const local: UserProgress = { ...baseProgress, weeklyGoal: 20, dailyGoal: 5 };
      const remote: UserProgress = { ...baseProgress, weeklyGoal: 35, dailyGoal: 7 };

      const result = mergeProgress(local, remote);
      expect(result.weeklyGoal).toBe(35);
      expect(result.dailyGoal).toBe(7);
    });

    it('should handle both sides being equal', () => {
      const result = mergeProgress(baseProgress, baseProgress);
      expect(result).toEqual(baseProgress);
    });

    it('should take max recovery minutes across devices', () => {
      const local: UserProgress = {
        ...baseProgress,
        recoveryMinutes: 120,
        recoveryBankSince: '2026-03-10T00:00:00.000Z',
      };
      const remote: UserProgress = {
        ...baseProgress,
        recoveryMinutes: 200,
        recoveryBankSince: '2026-02-01T00:00:00.000Z',
      };

      const result = mergeProgress(local, remote);
      expect(result.recoveryMinutes).toBe(200);
      // Earlier of the two start dates wins — the bank "started" on
      // whichever device logged the first break.
      expect(result.recoveryBankSince).toBe('2026-02-01T00:00:00.000Z');
    });

    it('should preserve the only available recoveryBankSince when one side is null', () => {
      const local: UserProgress = {
        ...baseProgress,
        recoveryMinutes: 50,
        recoveryBankSince: '2026-04-01T00:00:00.000Z',
      };
      const remote: UserProgress = {
        ...baseProgress,
        recoveryMinutes: 0,
        recoveryBankSince: null,
      };

      const result = mergeProgress(local, remote);
      expect(result.recoveryMinutes).toBe(50);
      expect(result.recoveryBankSince).toBe('2026-04-01T00:00:00.000Z');
    });

    it('should fall back to zero for an older client missing recovery fields', () => {
      const local: UserProgress = {
        ...baseProgress,
        recoveryMinutes: 30,
        recoveryBankSince: '2026-05-01T00:00:00.000Z',
      };
      // Simulate a remote payload from a pre-recovery-debt client.
      const remote = {
        ...baseProgress,
        recoveryMinutes: undefined as unknown as number,
        recoveryBankSince: undefined as unknown as string | null,
      } as UserProgress;

      const result = mergeProgress(local, remote);
      expect(result.recoveryMinutes).toBe(30);
      expect(result.recoveryBankSince).toBe('2026-05-01T00:00:00.000Z');
      // Must never propagate NaN into the store.
      expect(Number.isFinite(result.recoveryMinutes)).toBe(true);
    });
  });

  // =============================================
  // mergePreferences - Union merge
  // =============================================
  describe('mergePreferences', () => {
    it('should union favorite breaks', () => {
      const local: UserPreferences = {
        favoriteBreaks: ['a', 'b', 'c'],
        recentBreaks: ['a'],
      };
      const remote: UserPreferences = {
        favoriteBreaks: ['b', 'd', 'e'],
        recentBreaks: ['d'],
      };

      const result = mergePreferences(local, remote);
      expect(result.favoriteBreaks).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    it('should handle empty favorites', () => {
      const local: UserPreferences = { favoriteBreaks: [], recentBreaks: [] };
      const remote: UserPreferences = { favoriteBreaks: ['a'], recentBreaks: ['a'] };

      const result = mergePreferences(local, remote);
      expect(result.favoriteBreaks).toEqual(['a']);
    });

    it('should merge recent breaks maintaining limit', () => {
      const local: UserPreferences = {
        favoriteBreaks: [],
        recentBreaks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      };
      const remote: UserPreferences = {
        favoriteBreaks: [],
        recentBreaks: ['11', '12', '13'],
      };

      const result = mergePreferences(local, remote);
      expect(result.recentBreaks.length).toBeLessThanOrEqual(10);
    });

    it('should deduplicate recent breaks', () => {
      const local: UserPreferences = {
        favoriteBreaks: [],
        recentBreaks: ['a', 'b', 'c'],
      };
      const remote: UserPreferences = {
        favoriteBreaks: [],
        recentBreaks: ['b', 'c', 'd'],
      };

      const result = mergePreferences(local, remote);
      const unique = new Set(result.recentBreaks);
      expect(unique.size).toBe(result.recentBreaks.length);
    });
  });

  // =============================================
  // mergeAchievements - Union + max counters
  // =============================================
  describe('mergeAchievements', () => {
    it('should union unlocked IDs', () => {
      const local: UserAchievements = {
        unlockedIds: ['ach1', 'ach2'],
        unlockedAt: { ach1: '2024-01-01', ach2: '2024-01-02' },
        categoryBreaks: {},
        totalMinutes: 0,
      };
      const remote: UserAchievements = {
        unlockedIds: ['ach2', 'ach3'],
        unlockedAt: { ach2: '2024-01-03', ach3: '2024-01-04' },
        categoryBreaks: {},
        totalMinutes: 0,
      };

      const result = mergeAchievements(local, remote);
      expect(result.unlockedIds).toEqual(expect.arrayContaining(['ach1', 'ach2', 'ach3']));
      expect(result.unlockedIds.length).toBe(3);
    });

    it('should use earliest unlock timestamp', () => {
      const local: UserAchievements = {
        unlockedIds: ['ach1'],
        unlockedAt: { ach1: '2024-01-05' },
        categoryBreaks: {},
        totalMinutes: 0,
      };
      const remote: UserAchievements = {
        unlockedIds: ['ach1'],
        unlockedAt: { ach1: '2024-01-01' },
        categoryBreaks: {},
        totalMinutes: 0,
      };

      const result = mergeAchievements(local, remote);
      expect(result.unlockedAt.ach1).toBe('2024-01-01');
    });

    it('should take max category break counts', () => {
      const local: UserAchievements = {
        unlockedIds: [],
        unlockedAt: {},
        categoryBreaks: { stretching: 10, breathing: 5 },
        totalMinutes: 100,
      };
      const remote: UserAchievements = {
        unlockedIds: [],
        unlockedAt: {},
        categoryBreaks: { stretching: 8, eyeCare: 3 },
        totalMinutes: 120,
      };

      const result = mergeAchievements(local, remote);
      expect(result.categoryBreaks.stretching).toBe(10);
      expect(result.categoryBreaks.breathing).toBe(5);
      expect(result.categoryBreaks.eyeCare).toBe(3);
      expect(result.totalMinutes).toBe(120);
    });

    it('should handle empty achievements', () => {
      const empty: UserAchievements = {
        unlockedIds: [],
        unlockedAt: {},
        categoryBreaks: {},
        totalMinutes: 0,
      };

      const result = mergeAchievements(empty, empty);
      expect(result.unlockedIds).toEqual([]);
      expect(result.totalMinutes).toBe(0);
    });
  });

  // =============================================
  // mergeBreakHistories - Merge by ID, deduplicate
  // =============================================
  describe('mergeBreakHistories', () => {
    const makeBreak = (
      id: string,
      completedAt: string,
      updatedAt = completedAt
    ): CompletedBreak => ({
      id,
      breakId: 'b1',
      title: 'Test Break',
      category: 'stretching',
      icon: 'stretch',
      color: '#06FFA5',
      duration: 60,
      stepsCompleted: 3,
      totalSteps: 3,
      xpEarned: 10,
      rating: 'good',
      completedAt,
      updatedAt,
    });

    it('should merge and deduplicate breaks by ID', () => {
      const local = [
        makeBreak('break-1', '2024-01-03T10:00:00Z'),
        makeBreak('break-2', '2024-01-02T10:00:00Z'),
      ];
      const remote = [
        makeBreak('break-2', '2024-01-02T10:00:00Z'),
        makeBreak('break-3', '2024-01-01T10:00:00Z'),
      ];

      const result = mergeBreakHistories(local, remote);
      expect(result.length).toBe(3);
      // Verify IDs are unique
      const ids = result.map((b) => b.id);
      expect(new Set(ids).size).toBe(3);
    });

    it('should sort by completedAt descending', () => {
      const local = [makeBreak('break-old', '2024-01-01T10:00:00Z')];
      const remote = [makeBreak('break-new', '2024-01-05T10:00:00Z')];

      const result = mergeBreakHistories(local, remote);
      expect(result[0].id).toBe('break-new');
      expect(result[1].id).toBe('break-old');
    });

    it('should prefer local data when local copy is newer', () => {
      const local = [makeBreak('break-1', '2024-01-01T10:00:00Z', '2024-01-01T10:05:00Z')];
      local[0].rating = 'good';

      const remote = [makeBreak('break-1', '2024-01-01T10:00:00Z', '2024-01-01T10:00:00Z')];
      remote[0].rating = null;

      const result = mergeBreakHistories(local, remote);
      expect(result.length).toBe(1);
      expect(result[0].rating).toBe('good');
    });

    it('should prefer remote data when remote copy is newer', () => {
      const local = [makeBreak('break-1', '2024-01-01T10:00:00Z', '2024-01-01T10:00:00Z')];
      local[0].rating = null;

      const remote = [makeBreak('break-1', '2024-01-01T10:00:00Z', '2024-01-01T10:05:00Z')];
      remote[0].rating = 'good';

      const result = mergeBreakHistories(local, remote);
      expect(result.length).toBe(1);
      expect(result[0].rating).toBe('good');
    });

    it('should limit to MAX_BREAK_HISTORY', () => {
      const local = Array.from({ length: Math.ceil(MAX_BREAK_HISTORY / 2) }, (_, i) =>
        makeBreak(`local-${i}`, new Date(2024, 0, 1 + i).toISOString())
      );
      const remote = Array.from({ length: Math.ceil(MAX_BREAK_HISTORY / 2) }, (_, i) =>
        makeBreak(`remote-${i}`, new Date(2024, 0, 1 + i).toISOString())
      );

      const result = mergeBreakHistories(local, remote);
      expect(result.length).toBeLessThanOrEqual(MAX_BREAK_HISTORY);
    });

    it('should handle empty histories', () => {
      expect(mergeBreakHistories([], [])).toEqual([]);
      expect(mergeBreakHistories([makeBreak('b1', '2024-01-01')], []).length).toBe(1);
      expect(mergeBreakHistories([], [makeBreak('b1', '2024-01-01')]).length).toBe(1);
    });
  });
});
