import { Text, StyleSheet } from 'react-native';
import { ThemeColors } from '@/hooks/useTheme';
import type { ReminderDecisionRecord } from '@/services/notifications/diagnostics';
import { SettingItem } from './SettingItem';
import { SettingsGroup } from './SettingsGroup';

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
    <SettingsGroup label="NOTIFICATIONS" theme={theme}>
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
        <Text style={[styles.note, { color: theme.text.muted }]} accessibilityRole="text">
          Turn on Push Notifications to manage the options below.
        </Text>
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
        <Text style={[styles.note, { color: theme.text.muted }]}>
          No notifications {quietHoursLabel}
        </Text>
      )}
      {reminderDecision && !notificationsDisabled && (
        <Text
          style={[styles.note, { color: theme.text.secondary }]}
          accessibilityRole="text"
          accessibilityLabel={`Notification status: ${reminderDecision.summary}`}
        >
          {reminderDecision.summary}
        </Text>
      )}
    </SettingsGroup>
  );
}

const styles = StyleSheet.create({
  note: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 10,
  },
});
