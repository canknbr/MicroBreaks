/**
 * Notification Store Unit Tests
 * 100% coverage with all edge cases
 */

import { act, renderHook } from '@testing-library/react-native';
import {
  useNotificationStore,
  createAchievementNotification,
  createStreakNotification,
  createGoalNotification,
  createLevelUpNotification,
  NotificationType,
  AppNotification,
} from '@/store/notificationStore';

describe('NotificationStore', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useNotificationStore.getState().clearAllNotifications();
    });
  });

  describe('Initial State', () => {
    it('should have empty notifications array initially', () => {
      const state = useNotificationStore.getState();
      expect(state.notifications).toEqual([]);
    });

    it('should return 0 for unread count initially', () => {
      const count = useNotificationStore.getState().getUnreadCount();
      expect(count).toBe(0);
    });

    it('should return empty array for unread notifications initially', () => {
      const unread = useNotificationStore.getState().getUnreadNotifications();
      expect(unread).toEqual([]);
    });
  });

  describe('addNotification', () => {
    it('should add a notification with generated id and timestamp', () => {
      const notification = {
        type: 'achievement' as NotificationType,
        title: 'Test Title',
        message: 'Test Message',
        icon: '🏆',
        color: '#FFD166',
      };

      act(() => {
        useNotificationStore.getState().addNotification(notification);
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBeDefined();
      expect(notifications[0].id).toMatch(/^\d+-[a-z0-9]+$/);
      expect(notifications[0].createdAt).toBeDefined();
      expect(notifications[0].read).toBe(false);
      expect(notifications[0].title).toBe('Test Title');
      expect(notifications[0].message).toBe('Test Message');
      expect(notifications[0].icon).toBe('🏆');
      expect(notifications[0].color).toBe('#FFD166');
      expect(notifications[0].type).toBe('achievement');
    });

    it('should add notification with optional data field', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'level_up',
          title: 'Level Up!',
          message: 'You reached level 5',
          icon: '⭐',
          color: '#B47EFF',
          data: { level: 5, xpRequired: 500 },
        });
      });

      const notification = useNotificationStore.getState().notifications[0];
      expect(notification.data).toEqual({ level: 5, xpRequired: 500 });
    });

    it('should add notification without data field', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Tip',
          message: 'Remember to stretch!',
          icon: '💡',
          color: '#00E5FF',
        });
      });

      const notification = useNotificationStore.getState().notifications[0];
      expect(notification.data).toBeUndefined();
    });

    it('should prepend new notifications (most recent first)', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'First',
          message: 'First notification',
          icon: '1️⃣',
          color: '#000000',
        });
      });

      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Second',
          message: 'Second notification',
          icon: '2️⃣',
          color: '#000000',
        });
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications[0].title).toBe('Second');
      expect(notifications[1].title).toBe('First');
    });

    it('should limit notifications to 50', () => {
      act(() => {
        for (let i = 0; i < 55; i++) {
          useNotificationStore.getState().addNotification({
            type: 'tip',
            title: `Notification ${i}`,
            message: `Message ${i}`,
            icon: '📝',
            color: '#000000',
          });
        }
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(50);
      expect(notifications[0].title).toBe('Notification 54');
      expect(notifications[49].title).toBe('Notification 5');
    });

    it('should handle all notification types', () => {
      const types: NotificationType[] = [
        'achievement',
        'streak_milestone',
        'goal_complete',
        'level_up',
        'tip',
        'welcome',
      ];

      types.forEach((type, index) => {
        act(() => {
          useNotificationStore.getState().addNotification({
            type,
            title: `Type ${type}`,
            message: `Message for ${type}`,
            icon: '📌',
            color: '#000000',
          });
        });
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(6);
      types.reverse().forEach((type, index) => {
        expect(notifications[index].type).toBe(type);
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Test',
          message: 'Test',
          icon: '📝',
          color: '#000000',
        });
      });

      const id = useNotificationStore.getState().notifications[0].id;

      act(() => {
        useNotificationStore.getState().markAsRead(id);
      });

      const notification = useNotificationStore.getState().notifications[0];
      expect(notification.read).toBe(true);
    });

    it('should not affect other notifications when marking one as read', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'First',
          message: 'First',
          icon: '1️⃣',
          color: '#000000',
        });
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Second',
          message: 'Second',
          icon: '2️⃣',
          color: '#000000',
        });
      });

      const notifications = useNotificationStore.getState().notifications;
      const firstId = notifications[1].id; // "First" is at index 1 due to prepend

      act(() => {
        useNotificationStore.getState().markAsRead(firstId);
      });

      const updatedNotifications = useNotificationStore.getState().notifications;
      expect(updatedNotifications[0].read).toBe(false); // Second
      expect(updatedNotifications[1].read).toBe(true); // First
    });

    it('should handle marking non-existent notification', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Test',
          message: 'Test',
          icon: '📝',
          color: '#000000',
        });
      });

      act(() => {
        useNotificationStore.getState().markAsRead('non-existent-id');
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].read).toBe(false);
    });

    it('should handle marking already read notification', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Test',
          message: 'Test',
          icon: '📝',
          color: '#000000',
        });
      });

      const id = useNotificationStore.getState().notifications[0].id;

      act(() => {
        useNotificationStore.getState().markAsRead(id);
        useNotificationStore.getState().markAsRead(id);
      });

      expect(useNotificationStore.getState().notifications[0].read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      act(() => {
        for (let i = 0; i < 5; i++) {
          useNotificationStore.getState().addNotification({
            type: 'tip',
            title: `Notification ${i}`,
            message: `Message ${i}`,
            icon: '📝',
            color: '#000000',
          });
        }
      });

      act(() => {
        useNotificationStore.getState().markAllAsRead();
      });

      const notifications = useNotificationStore.getState().notifications;
      notifications.forEach((notification) => {
        expect(notification.read).toBe(true);
      });
    });

    it('should work with empty notifications array', () => {
      act(() => {
        useNotificationStore.getState().markAllAsRead();
      });

      expect(useNotificationStore.getState().notifications).toEqual([]);
    });

    it('should work when some are already read', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'First',
          message: 'First',
          icon: '1️⃣',
          color: '#000000',
        });
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Second',
          message: 'Second',
          icon: '2️⃣',
          color: '#000000',
        });
      });

      const firstId = useNotificationStore.getState().notifications[0].id;

      act(() => {
        useNotificationStore.getState().markAsRead(firstId);
        useNotificationStore.getState().markAllAsRead();
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications[0].read).toBe(true);
      expect(notifications[1].read).toBe(true);
    });
  });

  describe('clearNotification', () => {
    it('should remove a specific notification', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'To Remove',
          message: 'Remove me',
          icon: '🗑️',
          color: '#000000',
        });
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'To Keep',
          message: 'Keep me',
          icon: '✅',
          color: '#000000',
        });
      });

      const notifications = useNotificationStore.getState().notifications;
      const toRemoveId = notifications.find((n) => n.title === 'To Remove')!.id;

      act(() => {
        useNotificationStore.getState().clearNotification(toRemoveId);
      });

      const remaining = useNotificationStore.getState().notifications;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe('To Keep');
    });

    it('should handle clearing non-existent notification', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Test',
          message: 'Test',
          icon: '📝',
          color: '#000000',
        });
      });

      act(() => {
        useNotificationStore.getState().clearNotification('non-existent-id');
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });

    it('should handle clearing from empty notifications', () => {
      act(() => {
        useNotificationStore.getState().clearNotification('any-id');
      });

      expect(useNotificationStore.getState().notifications).toEqual([]);
    });
  });

  describe('clearAllNotifications', () => {
    it('should remove all notifications', () => {
      act(() => {
        for (let i = 0; i < 10; i++) {
          useNotificationStore.getState().addNotification({
            type: 'tip',
            title: `Notification ${i}`,
            message: `Message ${i}`,
            icon: '📝',
            color: '#000000',
          });
        }
      });

      act(() => {
        useNotificationStore.getState().clearAllNotifications();
      });

      expect(useNotificationStore.getState().notifications).toEqual([]);
    });

    it('should work on empty notifications', () => {
      act(() => {
        useNotificationStore.getState().clearAllNotifications();
      });

      expect(useNotificationStore.getState().notifications).toEqual([]);
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct count of unread notifications', () => {
      act(() => {
        for (let i = 0; i < 5; i++) {
          useNotificationStore.getState().addNotification({
            type: 'tip',
            title: `Notification ${i}`,
            message: `Message ${i}`,
            icon: '📝',
            color: '#000000',
          });
        }
      });

      expect(useNotificationStore.getState().getUnreadCount()).toBe(5);

      const firstId = useNotificationStore.getState().notifications[0].id;
      const secondId = useNotificationStore.getState().notifications[1].id;

      act(() => {
        useNotificationStore.getState().markAsRead(firstId);
        useNotificationStore.getState().markAsRead(secondId);
      });

      expect(useNotificationStore.getState().getUnreadCount()).toBe(3);
    });

    it('should return 0 when all are read', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Test',
          message: 'Test',
          icon: '📝',
          color: '#000000',
        });
      });

      act(() => {
        useNotificationStore.getState().markAllAsRead();
      });

      expect(useNotificationStore.getState().getUnreadCount()).toBe(0);
    });

    it('should return 0 for empty notifications', () => {
      expect(useNotificationStore.getState().getUnreadCount()).toBe(0);
    });
  });

  describe('getUnreadNotifications', () => {
    it('should return only unread notifications', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Unread 1',
          message: 'Unread',
          icon: '📝',
          color: '#000000',
        });
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Unread 2',
          message: 'Unread',
          icon: '📝',
          color: '#000000',
        });
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'To Read',
          message: 'Read',
          icon: '📝',
          color: '#000000',
        });
      });

      const toReadId = useNotificationStore.getState().notifications.find(
        (n) => n.title === 'To Read'
      )!.id;

      act(() => {
        useNotificationStore.getState().markAsRead(toReadId);
      });

      const unread = useNotificationStore.getState().getUnreadNotifications();
      expect(unread).toHaveLength(2);
      expect(unread.every((n) => !n.read)).toBe(true);
    });

    it('should return empty array when all are read', () => {
      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'tip',
          title: 'Test',
          message: 'Test',
          icon: '📝',
          color: '#000000',
        });
        useNotificationStore.getState().markAllAsRead();
      });

      expect(useNotificationStore.getState().getUnreadNotifications()).toEqual([]);
    });

    it('should return empty array for empty notifications', () => {
      expect(useNotificationStore.getState().getUnreadNotifications()).toEqual([]);
    });
  });

  describe('Helper Functions', () => {
    describe('createAchievementNotification', () => {
      it('should create correct achievement notification', () => {
        const notification = createAchievementNotification(
          'First Break',
          'Complete your first break',
          '🏆',
          50
        );

        expect(notification.type).toBe('achievement');
        expect(notification.title).toBe('Achievement Unlocked!');
        expect(notification.message).toBe('First Break: Complete your first break. +50 XP');
        expect(notification.icon).toBe('🏆');
        expect(notification.color).toBe('#FFD166');
        expect(notification.data).toEqual({ achievementTitle: 'First Break', xpReward: 50 });
      });

      it('should handle zero XP reward', () => {
        const notification = createAchievementNotification('Test', 'Test Desc', '🎯', 0);
        expect(notification.message).toContain('+0 XP');
      });

      it('should handle large XP values', () => {
        const notification = createAchievementNotification('Master', 'Master level', '👑', 1000);
        expect(notification.message).toContain('+1000 XP');
      });

      it('should handle special characters in title and description', () => {
        const notification = createAchievementNotification(
          "Developer's Choice",
          "You've earned it!",
          '💻',
          100
        );
        expect(notification.message).toContain("Developer's Choice");
        expect(notification.message).toContain("You've earned it!");
      });
    });

    describe('createStreakNotification', () => {
      it('should create correct streak notification for single day', () => {
        const notification = createStreakNotification(1);

        expect(notification.type).toBe('streak_milestone');
        expect(notification.title).toBe('1-Day Streak!');
        expect(notification.message).toContain('1 days');
        expect(notification.icon).toBe('🔥');
        expect(notification.color).toBe('#FF6B6B');
        expect(notification.data).toEqual({ streakDays: 1 });
      });

      it('should create correct streak notification for 7 days', () => {
        const notification = createStreakNotification(7);

        expect(notification.title).toBe('7-Day Streak!');
        expect(notification.message).toContain('7 days');
        expect(notification.data).toEqual({ streakDays: 7 });
      });

      it('should create correct streak notification for 100 days', () => {
        const notification = createStreakNotification(100);

        expect(notification.title).toBe('100-Day Streak!');
        expect(notification.message).toContain('100 days');
      });

      it('should handle zero days', () => {
        const notification = createStreakNotification(0);
        expect(notification.title).toBe('0-Day Streak!');
      });
    });

    describe('createGoalNotification', () => {
      it('should create correct goal notification', () => {
        const notification = createGoalNotification();

        expect(notification.type).toBe('goal_complete');
        expect(notification.title).toBe('Daily Goal Complete!');
        expect(notification.message).toContain('daily wellness goal');
        expect(notification.icon).toBe('🎯');
        expect(notification.color).toBe('#06FFA5');
        expect(notification.data).toBeUndefined();
      });
    });

    describe('createLevelUpNotification', () => {
      it('should create correct level up notification', () => {
        const notification = createLevelUpNotification(5, 'Break Master');

        expect(notification.type).toBe('level_up');
        expect(notification.title).toBe('Level 5!');
        expect(notification.message).toBe("Congratulations! You've reached Break Master.");
        expect(notification.icon).toBe('⭐');
        expect(notification.color).toBe('#B47EFF');
        expect(notification.data).toEqual({ level: 5, levelTitle: 'Break Master' });
      });

      it('should handle level 1', () => {
        const notification = createLevelUpNotification(1, 'Beginner');
        expect(notification.title).toBe('Level 1!');
      });

      it('should handle level 10', () => {
        const notification = createLevelUpNotification(10, 'Zen Master');
        expect(notification.title).toBe('Level 10!');
        expect(notification.message).toContain('Zen Master');
      });

      it('should handle special characters in title', () => {
        const notification = createLevelUpNotification(3, "Wellness Warrior (Pro)");
        expect(notification.message).toContain("Wellness Warrior (Pro)");
      });
    });
  });

  describe('Integration with Helper Functions', () => {
    it('should add achievement notification via helper', () => {
      const notification = createAchievementNotification('First Step', 'Complete first break', '🏆', 50);

      act(() => {
        useNotificationStore.getState().addNotification(notification);
      });

      const stored = useNotificationStore.getState().notifications[0];
      expect(stored.type).toBe('achievement');
      expect(stored.data).toEqual({ achievementTitle: 'First Step', xpReward: 50 });
    });

    it('should add all helper notifications', () => {
      act(() => {
        useNotificationStore.getState().addNotification(
          createAchievementNotification('Test', 'Test', '🏆', 10)
        );
        useNotificationStore.getState().addNotification(createStreakNotification(7));
        useNotificationStore.getState().addNotification(createGoalNotification());
        useNotificationStore.getState().addNotification(createLevelUpNotification(5, 'Master'));
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(4);
      expect(notifications.map((n) => n.type)).toContain('achievement');
      expect(notifications.map((n) => n.type)).toContain('streak_milestone');
      expect(notifications.map((n) => n.type)).toContain('goal_complete');
      expect(notifications.map((n) => n.type)).toContain('level_up');
    });
  });
});
