import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/theme';
import { cardShadow } from '@/utils/cardShadow';
import { ThemeColors } from '@/hooks/useTheme';
import type { ReminderDecisionRecord } from '@/services/notifications/diagnostics';
import { SettingItem } from './SettingItem';

export function NotificationsSection({
  enabled,
  breakReminders,
  reminderIntervalMinutes,
  streakAlerts,
  goalNotifications,
  quietHoursEnabled,
  reminderDecision,
  quietHoursLabel,
  onToggleNotifications,
  onToggleBreakReminders,
  onPressReminderInterval,
  onToggleStreakAlerts,
  onToggleGoalNotifications,
  onToggleQuietHours,
  theme,
}: {
  enabled: boolean;
  breakReminders: boolean;
  reminderIntervalMinutes: number;
  streakAlerts: boolean;
  goalNotifications: boolean;
  quietHoursEnabled: boolean;
  reminderDecision: ReminderDecisionRecord | null;
  quietHoursLabel: string;
  onToggleNotifications: () => void;
  onToggleBreakReminders: () => void;
  onPressReminderInterval: () => void;
  onToggleStreakAlerts: () => void;
  onToggleGoalNotifications: () => void;
  onToggleQuietHours: () => void;
  theme: ThemeColors;
}) {
  const notificationsDisabled = !enabled;

  return (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">NOTIFICATIONS</Text>
      <View style={[
        styles.sectionCard,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          ...cardShadow(theme.isDark, { height: 3, opacity: 0.06, radius: 12, elevation: 4 }),
        },
      ]}>
        {/* BlurView only for dark mode */}
        {theme.isDark ? (
          Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
          )
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background.card }]} />
        )}
        <SettingItem
          icon="notifications"
          label="Push Notifications"
          type="toggle"
          isEnabled={enabled}
          onToggle={onToggleNotifications}
          delay={400}
          index={0}
          theme={theme}
        />
        {notificationsDisabled && (
          <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
            <Text
              style={{
                fontSize: 12,
                color: theme.text.muted,
                fontStyle: 'italic',
              }}
              accessibilityRole="text"
            >
              Turn on Push Notifications to manage the options below.
            </Text>
          </View>
        )}
        <SettingItem
          icon="alarm"
          label="Break Reminders"
          type="toggle"
          isEnabled={breakReminders}
          onToggle={onToggleBreakReminders}
          delay={400}
          index={1}
          disabled={notificationsDisabled}
          theme={theme}
        />
        <SettingItem
          icon="time"
          label="Reminder Interval"
          type="value"
          value={`${reminderIntervalMinutes} min`}
          onPress={onPressReminderInterval}
          delay={400}
          index={2}
          disabled={notificationsDisabled || !breakReminders}
          theme={theme}
        />
        <SettingItem
          icon="flame"
          label="Streak Alerts"
          type="toggle"
          isEnabled={streakAlerts}
          onToggle={onToggleStreakAlerts}
          delay={400}
          index={3}
          disabled={notificationsDisabled}
          theme={theme}
        />
        <SettingItem
          icon="flag"
          label="Goal Notifications"
          type="toggle"
          isEnabled={goalNotifications}
          onToggle={onToggleGoalNotifications}
          delay={400}
          index={4}
          disabled={notificationsDisabled}
          theme={theme}
        />
        <SettingItem
          icon="moon"
          label="Quiet Hours"
          type="toggle"
          isEnabled={quietHoursEnabled}
          onToggle={onToggleQuietHours}
          delay={400}
          index={5}
          disabled={notificationsDisabled}
          theme={theme}
        />
        {quietHoursEnabled && !notificationsDisabled && (
          <View style={styles.quietHoursInfo}>
            <Text style={styles.quietHoursText}>
              No notifications {quietHoursLabel}
            </Text>
          </View>
        )}
        {reminderDecision && !notificationsDisabled && (
          <View
            style={styles.quietHoursInfo}
            accessibilityRole="text"
            accessibilityLabel={`Notification status: ${reminderDecision.summary}`}
          >
            <Text
              style={[
                styles.quietHoursText,
                { color: theme.text.secondary },
              ]}
            >
              {reminderDecision.summary}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quietHoursInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  quietHoursText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
});
