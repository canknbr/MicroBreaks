/**
 * useAchievements Hook
 * Checks for newly unlocked achievements and provides achievement data
 */

import { useCallback, useMemo } from 'react';
import { useUserStore, useNotificationStore, createAchievementNotification } from '@/store';
import { ACHIEVEMENTS, Achievement, AchievementCategory } from '@/data/achievements';

export interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number; // 0-100 percentage
}

export function useAchievements() {
  const progress = useUserStore((state) => state.progress);
  const preferences = useUserStore((state) => state.preferences);
  const achievements = useUserStore((state) => state.achievements);
  const unlockAchievement = useUserStore((state) => state.unlockAchievement);
  const addXP = useUserStore((state) => state.addXP);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Calculate progress for each achievement
  const getAchievementProgress = useCallback((achievement: Achievement): number => {
    const { type, value, category } = achievement.criteria;

    switch (type) {
      case 'total_breaks':
        return Math.min((progress.totalBreaks / value) * 100, 100);
      case 'streak':
        return Math.min((progress.currentStreak / value) * 100, 100);
      case 'total_minutes':
        return Math.min((achievements.totalMinutes / value) * 100, 100);
      case 'category_breaks':
        const catBreaks = achievements.categoryBreaks[category || ''] || 0;
        return Math.min((catBreaks / value) * 100, 100);
      case 'level':
        return Math.min((progress.level / value) * 100, 100);
      case 'favorites':
        return Math.min((preferences.favoriteBreaks.length / value) * 100, 100);
      default:
        return 0;
    }
  }, [progress, achievements, preferences]);

  // Check if achievement criteria is met
  const isCriteriaMet = useCallback((achievement: Achievement): boolean => {
    const { type, value, category } = achievement.criteria;

    switch (type) {
      case 'total_breaks':
        return progress.totalBreaks >= value;
      case 'streak':
        return progress.currentStreak >= value;
      case 'total_minutes':
        return achievements.totalMinutes >= value;
      case 'category_breaks':
        const catBreaks = achievements.categoryBreaks[category || ''] || 0;
        return catBreaks >= value;
      case 'level':
        return progress.level >= value;
      case 'favorites':
        return preferences.favoriteBreaks.length >= value;
      default:
        return false;
    }
  }, [progress, achievements, preferences]);

  // Get all achievements with status
  const achievementsWithStatus = useMemo((): AchievementWithStatus[] => {
    return ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      isUnlocked: achievements.unlockedIds.includes(achievement.id),
      unlockedAt: achievements.unlockedAt[achievement.id] || null,
      progress: getAchievementProgress(achievement),
    }));
  }, [achievements, getAchievementProgress]);

  // Get unlocked achievements
  const unlockedAchievements = useMemo(() => {
    return achievementsWithStatus.filter((a) => a.isUnlocked);
  }, [achievementsWithStatus]);

  // Get locked achievements
  const lockedAchievements = useMemo(() => {
    return achievementsWithStatus.filter((a) => !a.isUnlocked);
  }, [achievementsWithStatus]);

  // Get achievements by category
  const getByCategory = useCallback((category: AchievementCategory) => {
    return achievementsWithStatus.filter((a) => a.category === category);
  }, [achievementsWithStatus]);

  // Check for newly unlockable achievements and unlock them
  const checkAndUnlockAchievements = useCallback((): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach((achievement) => {
      // Skip already unlocked
      if (achievements.unlockedIds.includes(achievement.id)) {
        return;
      }

      // Check if criteria is met
      if (isCriteriaMet(achievement)) {
        unlockAchievement(achievement.id);
        addXP(achievement.xpReward);
        newlyUnlocked.push(achievement);

        // Create in-app notification for the unlocked achievement
        addNotification(
          createAchievementNotification(
            achievement.title,
            achievement.description,
            achievement.icon,
            achievement.xpReward
          )
        );
      }
    });

    return newlyUnlocked;
  }, [achievements.unlockedIds, isCriteriaMet, unlockAchievement, addXP, addNotification]);

  // Get stats
  const stats = useMemo(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = achievements.unlockedIds.length;
    const totalXP = ACHIEVEMENTS.reduce((sum, a) => sum + a.xpReward, 0);
    const earnedXP = unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0);

    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100),
      totalXP,
      earnedXP,
    };
  }, [achievements.unlockedIds.length, unlockedAchievements]);

  // Get next achievements to unlock (closest to completion)
  const nextToUnlock = useMemo(() => {
    return lockedAchievements
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  }, [lockedAchievements]);

  return {
    achievements: achievementsWithStatus,
    unlockedAchievements,
    lockedAchievements,
    getByCategory,
    checkAndUnlockAchievements,
    stats,
    nextToUnlock,
  };
}

export default useAchievements;
