/**
 * In-App Notification Store
 * Tracks app notifications like achievements, milestones, and tips
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateId } from '@/utils/generateId';

export type NotificationType =
  | 'achievement'
  | 'streak_milestone'
  | 'goal_complete'
  | 'level_up'
  | 'tip'
  | 'welcome';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  color: string;
  data?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];

  // Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Getters
  getUnreadCount: () => number;
  getUnreadNotifications: () => AppNotification[];
}

// generateId imported from @/utils/generateId

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: generateId(),
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50), // Keep last 50 notifications
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAllNotifications: () =>
        set({ notifications: [] }),

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      getUnreadNotifications: () => {
        return get().notifications.filter((n) => !n.read);
      },
    }),
    {
      name: 'microbreaks-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper functions to create common notifications
export function createAchievementNotification(
  title: string,
  description: string,
  icon: string,
  xpReward: number
): Omit<AppNotification, 'id' | 'createdAt' | 'read'> {
  return {
    type: 'achievement',
    title: `Achievement Unlocked!`,
    message: `${title}: ${description}. +${xpReward} XP`,
    icon,
    color: '#FFD166',
    data: { achievementTitle: title, xpReward },
  };
}

export function createStreakNotification(
  days: number
): Omit<AppNotification, 'id' | 'createdAt' | 'read'> {
  return {
    type: 'streak_milestone',
    title: `${days}-Day Streak!`,
    message: `Amazing! You've maintained your wellness streak for ${days} days!`,
    icon: '🔥',
    color: '#FF6B6B',
    data: { streakDays: days },
  };
}

export function createGoalNotification(): Omit<AppNotification, 'id' | 'createdAt' | 'read'> {
  return {
    type: 'goal_complete',
    title: 'Daily Goal Complete!',
    message: "Great job! You've reached your daily wellness goal.",
    icon: '🎯',
    color: '#06FFA5',
  };
}

export function createLevelUpNotification(
  level: number,
  title: string
): Omit<AppNotification, 'id' | 'createdAt' | 'read'> {
  return {
    type: 'level_up',
    title: `Level ${level}!`,
    message: `Congratulations! You've reached ${title}.`,
    icon: '⭐',
    color: '#B47EFF',
    data: { level, levelTitle: title },
  };
}

export default useNotificationStore;
