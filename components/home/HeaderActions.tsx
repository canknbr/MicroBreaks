import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '@/hooks/useTheme';

const HeaderActionsComponent = ({
  onNotificationsPress,
  onSettingsPress,
  notificationCount = 0,
  theme,
}: {
  onNotificationsPress: () => void;
  onSettingsPress: () => void;
  notificationCount?: number;
  theme: ThemeColors;
}) => {
  return (
    <View style={styles.headerActions}>
      <Pressable
        style={[
          styles.headerActionButton,
          {
            backgroundColor: theme.isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
        onPress={onNotificationsPress}
        accessibilityRole="button"
        accessibilityLabel={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
      >
        <Ionicons name="notifications-outline" size={22} color={theme.text.secondary} />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </Pressable>
      <Pressable
        style={[
          styles.headerActionButton,
          {
            backgroundColor: theme.isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
        onPress={onSettingsPress}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <Ionicons name="settings-outline" size={22} color={theme.text.secondary} />
      </Pressable>
    </View>
  );
};

HeaderActionsComponent.displayName = 'HeaderActions';

export const HeaderActions = React.memo(HeaderActionsComponent);

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
