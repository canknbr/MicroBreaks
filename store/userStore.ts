/**
 * User Profile Store
 * Manages user profile data, preferences, and authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { createMmkvStorage } from '@/services/storage/zustandMmkv';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import { DEFAULT_WEEKLY_GOAL } from '@/constants/config';
import { syncService } from '@/services/sync';
import { syncStoredUserStatsFromProgress } from '@/services/storage';
import { calculateDailyGoal } from '@/utils/validation';

export interface UserProfile {
  name: string;
  avatar: string | null; // emoji or image URI
  email: string | null;
  emailVerified: boolean;
  joinedAt: string;
  updatedAt?: number;
}

export interface UserProgress {
  level: number;
  totalXP: number;
  totalBreaks: number;
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
  dailyGoal: number;
}

export interface UserPreferences {
  favoriteBreaks: string[]; // Array of break IDs
  recentBreaks: string[]; // Array of recently used break IDs
}

export interface UserAchievements {
  unlockedIds: string[]; // Array of unlocked achievement IDs
  unlockedAt: Record<string, string>; // Map of achievement ID to unlock timestamp
  categoryBreaks: Record<string, number>; // Track breaks per category
  totalMinutes: number;
}

interface UserState {
  // Profile
  profile: UserProfile;
  progress: UserProgress;
  preferences: UserPreferences;
  achievements: UserAchievements;
  isAuthenticated: boolean;

  // Actions
  updateProfile: (data: Partial<UserProfile>) => void;
  updateProgress: (data: Partial<UserProgress>) => void;
  setName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setWeeklyGoal: (goal: number) => void;
  setDailyGoal: (goal: number) => void;
  addXP: (amount: number) => void;
  incrementBreaks: () => void;
  updateStreak: (streak: number) => void;
  resetProgress: () => void;
  signOut: () => void;

  // Favorites Actions
  toggleFavorite: (breakId: string) => void;
  isFavorite: (breakId: string) => boolean;
  addRecentBreak: (breakId: string) => void;

  // Achievement Actions
  unlockAchievement: (achievementId: string) => void;
  isAchievementUnlocked: (achievementId: string) => boolean;
  trackBreakCompletion: (category: string, durationMinutes: number) => void;
}

export const initialUserProfile: UserProfile = {
  name: 'User',
  avatar: null,
  email: null,
  emailVerified: false,
  joinedAt: new Date().toISOString(),
};

export const initialUserProgress: UserProgress = {
  level: 1,
  totalXP: 0,
  totalBreaks: 0,
  currentStreak: 0,
  longestStreak: 0,
  weeklyGoal: DEFAULT_WEEKLY_GOAL,
  dailyGoal: calculateDailyGoal(DEFAULT_WEEKLY_GOAL),
};

export const initialUserPreferences: UserPreferences = {
  favoriteBreaks: [],
  recentBreaks: [],
};

export const initialUserAchievements: UserAchievements = {
  unlockedIds: [],
  unlockedAt: {},
  categoryBreaks: {},
  totalMinutes: 0,
};

// Pending side-effect promise. We coalesce repeated scheduling calls into a
// single microtask, but expose the underlying promise so critical callers
// (tests, the bootstrap unmount path, the account-delete flow) can wait for
// the side effects to actually finish before continuing.
let progressSideEffectsPromise: Promise<void> | null = null;

function scheduleProgressSideEffects(): Promise<void> {
  if (progressSideEffectsPromise) {
    return progressSideEffectsPromise;
  }

  progressSideEffectsPromise = new Promise<void>((resolve) => {
    const flush = async () => {
      try {
        const progress = useUserStore.getState().progress;
        const tasks: Promise<unknown>[] = [
          Promise.resolve(syncStoredUserStatsFromProgress(progress)).catch(() => undefined),
        ];

        if (!syncService.isSyncPulling()) {
          tasks.push(Promise.resolve(syncService.queueDataChange('progress')).catch(() => undefined));
        }

        await Promise.all(tasks);
      } finally {
        progressSideEffectsPromise = null;
        resolve();
      }
    };

    if (typeof queueMicrotask === 'function') {
      queueMicrotask(() => {
        void flush();
      });
    } else {
      setTimeout(() => {
        void flush();
      }, 0);
    }
  });

  return progressSideEffectsPromise;
}

/**
 * Await any pending progress side effects (sync push, stats projection).
 * Resolves immediately when nothing is queued. Use this from teardown paths
 * (sign out, account delete) to avoid losing the last mutation on crash.
 */
export function flushProgressSideEffects(): Promise<void> {
  return progressSideEffectsPromise ?? Promise.resolve();
}

function sanitizeProfile(value: unknown): UserProfile {
  const profile = value && typeof value === 'object' ? value as Partial<UserProfile> : {};

  return {
    name: typeof profile.name === 'string' && profile.name.trim().length > 0
      ? profile.name
      : initialUserProfile.name,
    avatar: typeof profile.avatar === 'string' ? profile.avatar : null,
    email: typeof profile.email === 'string' ? profile.email : null,
    emailVerified: profile.emailVerified === true,
    joinedAt:
      typeof profile.joinedAt === 'string' && !Number.isNaN(Date.parse(profile.joinedAt))
        ? profile.joinedAt
        : new Date().toISOString(),
    updatedAt:
      typeof profile.updatedAt === 'number' && Number.isFinite(profile.updatedAt)
        ? profile.updatedAt
        : undefined,
  };
}

function sanitizeProgress(value: unknown): UserProgress {
  const progress = value && typeof value === 'object' ? value as Partial<UserProgress> : {};
  const weeklyGoal =
    typeof progress.weeklyGoal === 'number' && Number.isFinite(progress.weeklyGoal) && progress.weeklyGoal > 0
      ? Math.round(progress.weeklyGoal)
      : initialUserProgress.weeklyGoal;

  return {
    level:
      typeof progress.level === 'number' && Number.isFinite(progress.level)
        ? Math.max(1, Math.round(progress.level))
        : initialUserProgress.level,
    totalXP:
      typeof progress.totalXP === 'number' && Number.isFinite(progress.totalXP)
        ? Math.max(0, Math.round(progress.totalXP))
        : initialUserProgress.totalXP,
    totalBreaks:
      typeof progress.totalBreaks === 'number' && Number.isFinite(progress.totalBreaks)
        ? Math.max(0, Math.round(progress.totalBreaks))
        : initialUserProgress.totalBreaks,
    currentStreak:
      typeof progress.currentStreak === 'number' && Number.isFinite(progress.currentStreak)
        ? Math.max(0, Math.round(progress.currentStreak))
        : initialUserProgress.currentStreak,
    longestStreak:
      typeof progress.longestStreak === 'number' && Number.isFinite(progress.longestStreak)
        ? Math.max(
            typeof progress.currentStreak === 'number' && Number.isFinite(progress.currentStreak)
              ? Math.max(0, Math.round(progress.currentStreak))
              : initialUserProgress.currentStreak,
            Math.round(progress.longestStreak)
          )
        : initialUserProgress.longestStreak,
    weeklyGoal,
    dailyGoal:
      typeof progress.dailyGoal === 'number' && Number.isFinite(progress.dailyGoal) && progress.dailyGoal > 0
        ? Math.round(progress.dailyGoal)
        : calculateDailyGoal(weeklyGoal),
  };
}

function sanitizePreferences(value: unknown): UserPreferences {
  const preferences = value && typeof value === 'object' ? value as Partial<UserPreferences> : {};

  return {
    favoriteBreaks: Array.isArray(preferences.favoriteBreaks)
      ? Array.from(new Set(preferences.favoriteBreaks.filter((id): id is string => typeof id === 'string')))
      : [],
    recentBreaks: Array.isArray(preferences.recentBreaks)
      ? preferences.recentBreaks
          .filter((id): id is string => typeof id === 'string')
          .slice(0, 10)
      : [],
  };
}

function sanitizeAchievements(value: unknown): UserAchievements {
  const achievements = value && typeof value === 'object'
    ? value as Partial<UserAchievements>
    : {};
  const unlockedIds = Array.isArray(achievements.unlockedIds)
    ? Array.from(new Set(achievements.unlockedIds.filter((id): id is string => typeof id === 'string')))
    : [];
  const unlockedAtSource =
    achievements.unlockedAt && typeof achievements.unlockedAt === 'object' && !Array.isArray(achievements.unlockedAt)
      ? achievements.unlockedAt
      : {};
  const categoryBreaksSource =
    achievements.categoryBreaks &&
    typeof achievements.categoryBreaks === 'object' &&
    !Array.isArray(achievements.categoryBreaks)
      ? achievements.categoryBreaks
      : {};

  const unlockedAt: Record<string, string> = {};
  for (const id of unlockedIds) {
    const value = (unlockedAtSource as Record<string, unknown>)[id];
    if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
      unlockedAt[id] = value;
    }
  }

  const categoryBreaks: Record<string, number> = {};
  for (const [key, value] of Object.entries(categoryBreaksSource as Record<string, unknown>)) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      categoryBreaks[key] = Math.round(value);
    }
  }

  return {
    unlockedIds,
    unlockedAt,
    categoryBreaks,
    totalMinutes:
      typeof achievements.totalMinutes === 'number' && Number.isFinite(achievements.totalMinutes)
        ? Math.max(0, Math.round(achievements.totalMinutes))
        : initialUserAchievements.totalMinutes,
  };
}

function sanitizePersistedUserState(state: unknown): Pick<
  UserState,
  'profile' | 'progress' | 'preferences' | 'achievements' | 'isAuthenticated'
> {
  const persisted = state && typeof state === 'object' ? state as Partial<UserState> : {};

  return {
    profile: sanitizeProfile(persisted.profile),
    progress: sanitizeProgress(persisted.progress),
    preferences: sanitizePreferences(persisted.preferences),
    achievements: sanitizeAchievements(persisted.achievements),
    isAuthenticated: persisted.isAuthenticated === true,
  };
}

// Granular selectors for performance optimization
export const useUserProfile = () => useUserStore((state) => state.profile);
export const useUserProgress = () => useUserStore((state) => state.progress);
export const useUserPreferences = () => useUserStore((state) => state.preferences);
export const useUserAchievements = () => useUserStore((state) => state.achievements);

// Individual progress selectors
export const useUserLevel = () => useUserStore((state) => state.progress.level);
export const useUserXP = () => useUserStore((state) => state.progress.totalXP);
export const useUserStreak = () => useUserStore((state) => state.progress.currentStreak);
export const useUserTotalBreaks = () => useUserStore((state) => state.progress.totalBreaks);
export const useUserWeeklyGoal = () => useUserStore((state) => state.progress.weeklyGoal);
export const useUserDailyGoal = () => useUserStore((state) => state.progress.dailyGoal);

// Individual profile selectors
export const useUserName = () => useUserStore((state) => state.profile.name);
export const useUserAvatar = () => useUserStore((state) => state.profile.avatar);

// Favorites selectors
export const useFavoriteBreaks = () => useUserStore((state) => state.preferences.favoriteBreaks);
export const useRecentBreaks = () => useUserStore((state) => state.preferences.recentBreaks);

// Action selectors (stable references via useShallow)
export const useUserActions = () => useUserStore(useShallow((state) => ({
  updateProfile: state.updateProfile,
  updateProgress: state.updateProgress,
  setName: state.setName,
  setAvatar: state.setAvatar,
  setWeeklyGoal: state.setWeeklyGoal,
  setDailyGoal: state.setDailyGoal,
  addXP: state.addXP,
  incrementBreaks: state.incrementBreaks,
  updateStreak: state.updateStreak,
  toggleFavorite: state.toggleFavorite,
  addRecentBreak: state.addRecentBreak,
  unlockAchievement: state.unlockAchievement,
  trackBreakCompletion: state.trackBreakCompletion,
})));

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial State
      profile: initialUserProfile,
      progress: initialUserProgress,
      preferences: initialUserPreferences,
      achievements: initialUserAchievements,
      isAuthenticated: false,

      // Profile Actions
      updateProfile: (data) => {
        set((state) => ({
          profile: { ...state.profile, ...data, updatedAt: Date.now() },
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueDataChange('profile');
        }
      },

      setName: (name) => {
        set((state) => ({
          profile: { ...state.profile, name, updatedAt: Date.now() },
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueDataChange('profile');
        }
      },

      setAvatar: (avatar) => {
        set((state) => ({
          profile: { ...state.profile, avatar, updatedAt: Date.now() },
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueDataChange('profile');
        }
      },

      // Progress Actions
      updateProgress: (data) => {
        set((state) => ({
          progress: { ...state.progress, ...data },
        }));
        scheduleProgressSideEffects();
      },

      setWeeklyGoal: (goal) => {
        set((state) => ({
          progress: {
            ...state.progress,
            weeklyGoal: goal,
            dailyGoal: calculateDailyGoal(goal),
          },
        }));
        scheduleProgressSideEffects();
      },

      setDailyGoal: (goal) => {
        set((state) => ({
          progress: { ...state.progress, dailyGoal: goal },
        }));
        scheduleProgressSideEffects();
      },

      addXP: (amount) => {
        set((state) => {
          const newTotalXP = Math.max(0, state.progress.totalXP + amount);
          const newLevel = Math.max(1, Math.floor(newTotalXP / 100) + 1);
          return {
            progress: {
              ...state.progress,
              totalXP: newTotalXP,
              level: newLevel,
            },
          };
        });
        scheduleProgressSideEffects();
      },

      incrementBreaks: () => {
        set((state) => ({
          progress: {
            ...state.progress,
            totalBreaks: state.progress.totalBreaks + 1,
          },
        }));
        scheduleProgressSideEffects();
      },

      updateStreak: (streak) => {
        set((state) => ({
          progress: {
            ...state.progress,
            currentStreak: streak,
            longestStreak: Math.max(state.progress.longestStreak, streak),
          },
        }));
        scheduleProgressSideEffects();
      },

      resetProgress: () => {
        set({
          progress: initialUserProgress,
        });
        scheduleProgressSideEffects();
      },

      signOut: () =>
        set({
          profile: initialUserProfile,
          progress: initialUserProgress,
          preferences: initialUserPreferences,
          achievements: initialUserAchievements,
          isAuthenticated: false,
        }),

      // Favorites Actions
      toggleFavorite: (breakId) => {
        set((state) => {
          const favorites = state.preferences.favoriteBreaks;
          const isFav = favorites.includes(breakId);
          return {
            preferences: {
              ...state.preferences,
              favoriteBreaks: isFav
                ? favorites.filter((id) => id !== breakId)
                : [...favorites, breakId],
            },
          };
        });
        if (!syncService.isSyncPulling()) {
          syncService.queueDataChange('preferences');
        }
      },

      isFavorite: (breakId) => {
        return get().preferences.favoriteBreaks.includes(breakId);
      },

      addRecentBreak: (breakId) => {
        set((state) => {
          const recents = state.preferences.recentBreaks.filter((id) => id !== breakId);
          return {
            preferences: {
              ...state.preferences,
              recentBreaks: [breakId, ...recents].slice(0, 10), // Keep only last 10
            },
          };
        });
        if (!syncService.isSyncPulling()) {
          syncService.queueDataChange('preferences');
        }
      },

      // Achievement Actions
      unlockAchievement: (achievementId) => {
        const alreadyUnlocked = get().achievements.unlockedIds.includes(achievementId);
        if (alreadyUnlocked) return;
        set((state) => ({
          achievements: {
            ...state.achievements,
            unlockedIds: [...state.achievements.unlockedIds, achievementId],
            unlockedAt: {
              ...state.achievements.unlockedAt,
              [achievementId]: new Date().toISOString(),
            },
          },
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueDataChange('achievements');
        }
      },

      isAchievementUnlocked: (achievementId) => {
        return get().achievements.unlockedIds.includes(achievementId);
      },

      trackBreakCompletion: (category, durationMinutes) => {
        set((state) => {
          const categoryBreaks = state.achievements.categoryBreaks;
          return {
            achievements: {
              ...state.achievements,
              categoryBreaks: {
                ...categoryBreaks,
                [category]: (categoryBreaks[category] || 0) + 1,
              },
              totalMinutes: state.achievements.totalMinutes + durationMinutes,
            },
          };
        });
        if (!syncService.isSyncPulling()) {
          syncService.queueDataChange('achievements');
        }
      },
    }),
    {
      name: ZUSTAND_PERSIST_KEYS.USER,
      storage: createMmkvStorage(),
      version: 1,
      migrate: (persistedState) => sanitizePersistedUserState(persistedState),
    }
  )
);

export const userStoreTestUtils = {
  sanitizePersistedUserState,
};

export default useUserStore;
