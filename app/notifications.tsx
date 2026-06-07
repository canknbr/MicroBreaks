/**
 * Notifications Screen
 * Shows in-app notifications with achievements, milestones, and updates
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useNotificationStore, AppNotification } from '@/store';
import { Spacing } from '@/theme';
import { useTheme, ThemeColors } from '@/hooks/useTheme';
import i18n from 'i18next';

function localeBcp47(): string {
  // i18next's language code (e.g. "en", "tr") maps 1:1 to BCP-47 here.
  return i18n.language || 'en';
}

// Get color based on notification type
function getNotificationColor(type: AppNotification['type']): string {
  switch (type) {
    case 'achievement':
      return '#FFD166';
    case 'streak_milestone':
      return '#FF6B6B';
    case 'goal_complete':
      return '#06FFA5';
    case 'level_up':
      return '#B47EFF';
    case 'tip':
      return '#00E5FF';
    case 'welcome':
      return '#06FFA5';
    default:
      return '#06FFA5';
  }
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  // D-I18N3: explicit locale so the date format matches the active app
  // language, even when the device's locale differs.
  return date.toLocaleDateString(localeBcp47());
}

// Notification Item Component
function NotificationItem({
  notification,
  onPress,
  index,
  theme,
}: {
  notification: AppNotification;
  onPress: () => void;
  index: number;
  theme: ThemeColors;
}) {
  const color = getNotificationColor(notification.type);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      layout={Layout.springify()}
    >
      <Pressable
        style={[
          styles.notificationItem,
          {
            borderColor: theme.isDark ? theme.border.subtle : 'transparent',
            backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.isDark ? 0 : 0.06,
            shadowRadius: 8,
            elevation: theme.isDark ? 0 : 3,
          },
          !notification.read && styles.notificationItemUnread,
        ]}
        onPress={onPress}
      >
        {/* BlurView only for dark mode */}
        {theme.isDark && (
          Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
          )
        )}

        {/* Unread indicator */}
        {!notification.read && (
          <View style={[styles.unreadDot, { backgroundColor: color }]} />
        )}

        {/* Icon */}
        <View style={[styles.notificationIcon, { backgroundColor: `${color}20` }]}>
          <Text style={styles.notificationIconText}>{notification.icon}</Text>
        </View>

        {/* Content */}
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color }]}>
            {notification.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: theme.text.secondary }]} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={[styles.notificationTime, { color: theme.text.muted }]}>
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// Empty State Component
function EmptyState({ theme }: { theme: ThemeColors }) {
  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(400)}
      style={styles.emptyState}
    >
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.border.subtle }]}>
        <Ionicons name="notifications-outline" size={60} color={theme.text.muted} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>No Notifications</Text>
      <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
        Complete breaks to earn achievements and unlock notifications
      </Text>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = useTheme();

  // Notification store
  const notifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearAllNotifications = useNotificationStore((state) => state.clearAllNotifications);

  // Unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { title: string; data: AppNotification[] }[] = [];
    const todayNotifications: AppNotification[] = [];
    const yesterdayNotifications: AppNotification[] = [];
    const olderNotifications: AppNotification[] = [];

    notifications.forEach((n) => {
      const date = new Date(n.createdAt);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        todayNotifications.push(n);
      } else if (date.getTime() === yesterday.getTime()) {
        yesterdayNotifications.push(n);
      } else {
        olderNotifications.push(n);
      }
    });

    if (todayNotifications.length > 0) {
      groups.push({ title: 'Today', data: todayNotifications });
    }
    if (yesterdayNotifications.length > 0) {
      groups.push({ title: 'Yesterday', data: yesterdayNotifications });
    }
    if (olderNotifications.length > 0) {
      groups.push({ title: 'Earlier', data: olderNotifications });
    }

    return groups;
  }, [notifications]);

  // Flatten grouped notifications into a single FlashList feed. Section
  // headers become row entries so the virtualizer can recycle them like any
  // other cell.
  type FeedItem =
    | { kind: 'header'; title: string }
    | { kind: 'item'; notification: AppNotification; positionalIndex: number };

  const feedData = useMemo<FeedItem[]>(() => {
    const rows: FeedItem[] = [];
    let positional = 0;
    for (const group of groupedNotifications) {
      rows.push({ kind: 'header', title: group.title });
      for (const notification of group.data) {
        rows.push({ kind: 'item', notification, positionalIndex: positional });
        positional += 1;
      }
    }
    return rows;
  }, [groupedNotifications]);

  // Handlers
  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (!notification.read) {
        markAsRead(notification.id);
      }
    },
    [markAsRead]
  );

  const handleMarkAllRead = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    clearAllNotifications();
  }, [clearAllNotifications]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Background */}
      <View style={[styles.ambientGlow, styles.ambientPurple]} />
      <View style={[styles.ambientGlow, styles.ambientTeal]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.header, { borderBottomColor: theme.border.subtle }]}
        >
          <View style={styles.headerLeft}>
            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }]}
              onPress={handleClose}
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
            </Pressable>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Notifications</Text>
              {unreadCount > 0 && (
                <Text style={[styles.headerSubtitle, { color: theme.accent.primary }]}>
                  {unreadCount} unread
                </Text>
              )}
            </View>
          </View>

          {notifications.length > 0 && (
            <View style={styles.headerActions}>
              {unreadCount > 0 && (
                <Pressable
                  style={[styles.headerAction, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }]}
                  onPress={handleMarkAllRead}
                >
                  <Ionicons name="checkmark-done" size={20} color={theme.accent.primary} />
                </Pressable>
              )}
              <Pressable
                style={[styles.headerAction, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }]}
                onPress={handleClearAll}
              >
                <Ionicons name="trash-outline" size={20} color={theme.text.muted} />
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* Content */}
        {notifications.length === 0 ? (
          <EmptyState theme={theme} />
        ) : (
          <FlashList
            data={feedData}
            renderItem={(({ item }) => {
              if (item.kind === 'header') {
                return (
                  <View style={styles.group}>
                    <Text
                      style={[styles.groupTitle, { color: theme.text.muted }]}
                      accessibilityRole="header"
                    >
                      {item.title}
                    </Text>
                  </View>
                );
              }
              return (
                <NotificationItem
                  notification={item.notification}
                  onPress={() => handleNotificationPress(item.notification)}
                  index={item.positionalIndex}
                  theme={theme}
                />
              );
            }) as ListRenderItem<FeedItem>}
            keyExtractor={(item, index) =>
              item.kind === 'header' ? `header-${item.title}` : item.notification.id ?? `row-${index}`
            }
            getItemType={(item) => item.kind}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={<View style={styles.bottomSpacer} />}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  ambientPurple: {
    top: -100,
    right: -100,
    width: 350,
    height: 350,
    backgroundColor: '#B47EFF',
  },
  ambientTeal: {
    bottom: 100,
    left: -150,
    width: 400,
    height: 400,
    backgroundColor: '#06FFA5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#06FFA5',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  group: {
    marginBottom: Spacing.lg,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  notificationItem: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    padding: 16,
    position: 'relative',
  },
  notificationItemUnread: {
    borderColor: 'rgba(6, 255, 165, 0.2)',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 16,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
