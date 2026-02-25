/**
 * User Profile Store
 * Manages user profile data, preferences, and authentication state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  avatar: string | null; // emoji or image URI
  email: string | null;
  joinedAt: string;
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

const initialProfile: UserProfile = {
  name: 'User',
  avatar: null,
  email: null,
  joinedAt: new Date().toISOString(),
};

const initialProgress: UserProgress = {
  level: 1,
  totalXP: 0,
  totalBreaks: 0,
  currentStreak: 0,
  longestStreak: 0,
  weeklyGoal: 35,
  dailyGoal: 5,
};

const initialPreferences: UserPreferences = {
  favoriteBreaks: [],
  recentBreaks: [],
};

const initialAchievements: UserAchievements = {
  unlockedIds: [],
  unlockedAt: {},
  categoryBreaks: {},
  totalMinutes: 0,
};

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
      profile: initialProfile,
      progress: initialProgress,
      preferences: initialPreferences,
      achievements: initialAchievements,
      isAuthenticated: false,

      // Profile Actions
      updateProfile: (data) =>
        set((state) => ({
          profile: { ...state.profile, ...data },
        })),

      setName: (name) =>
        set((state) => ({
          profile: { ...state.profile, name },
        })),

      setAvatar: (avatar) =>
        set((state) => ({
          profile: { ...state.profile, avatar },
        })),

      // Progress Actions
      updateProgress: (data) =>
        set((state) => ({
          progress: { ...state.progress, ...data },
        })),

      setWeeklyGoal: (goal) =>
        set((state) => ({
          progress: { ...state.progress, weeklyGoal: goal, dailyGoal: Math.max(Math.round(goal / 7), 3) },
        })),

      setDailyGoal: (goal) =>
        set((state) => ({
          progress: { ...state.progress, dailyGoal: goal },
        })),

      addXP: (amount) =>
        set((state) => {
          const newTotalXP = state.progress.totalXP + amount;
          const newLevel = Math.floor(newTotalXP / 100) + 1;
          return {
            progress: {
              ...state.progress,
              totalXP: newTotalXP,
              level: newLevel,
            },
          };
        }),

      incrementBreaks: () =>
        set((state) => ({
          progress: {
            ...state.progress,
            totalBreaks: state.progress.totalBreaks + 1,
          },
        })),

      updateStreak: (streak) =>
        set((state) => ({
          progress: {
            ...state.progress,
            currentStreak: streak,
            longestStreak: Math.max(state.progress.longestStreak, streak),
          },
        })),

      resetProgress: () =>
        set({
          progress: initialProgress,
        }),

      signOut: () =>
        set({
          profile: initialProfile,
          progress: initialProgress,
          preferences: initialPreferences,
          achievements: initialAchievements,
          isAuthenticated: false,
        }),

      // Favorites Actions
      toggleFavorite: (breakId) =>
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
        }),

      isFavorite: (breakId) => {
        return get().preferences.favoriteBreaks.includes(breakId);
      },

      addRecentBreak: (breakId) =>
        set((state) => {
          const recents = state.preferences.recentBreaks.filter((id) => id !== breakId);
          return {
            preferences: {
              ...state.preferences,
              recentBreaks: [breakId, ...recents].slice(0, 10), // Keep only last 10
            },
          };
        }),

      // Achievement Actions
      unlockAchievement: (achievementId) =>
        set((state) => {
          if (state.achievements.unlockedIds.includes(achievementId)) {
            return state; // Already unlocked
          }
          return {
            achievements: {
              ...state.achievements,
              unlockedIds: [...state.achievements.unlockedIds, achievementId],
              unlockedAt: {
                ...state.achievements.unlockedAt,
                [achievementId]: new Date().toISOString(),
              },
            },
          };
        }),

      isAchievementUnlocked: (achievementId) => {
        return get().achievements.unlockedIds.includes(achievementId);
      },

      trackBreakCompletion: (category, durationMinutes) =>
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
        }),
    }),
    {
      name: 'microbreaks-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
