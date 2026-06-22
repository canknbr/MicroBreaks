import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/theme';
import { cardShadow } from '@/utils/cardShadow';
import { ThemeColors } from '@/hooks/useTheme';
import { SettingItem } from './SettingItem';

export function DataPrivacySection({
  analyticsEnabled,
  crashReportingEnabled,
  onPressDownloadData,
  onToggleAnalytics,
  onToggleCrashReporting,
  onPressDeleteAccount,
  theme,
}: {
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  onPressDownloadData: () => void;
  onToggleAnalytics: () => void;
  onToggleCrashReporting: () => void;
  onPressDeleteAccount: () => void;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">DATA & PRIVACY</Text>
      <View style={[
        styles.sectionCard,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          ...cardShadow(theme.isDark, { height: 3, opacity: 0.06, radius: 12, elevation: 4 }),
        },
      ]}>
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
          icon="download"
          label="Download My Data"
          type="arrow"
          onPress={onPressDownloadData}
          delay={600}
          index={0}
          theme={theme}
        />
        <SettingItem
          icon="bar-chart"
          label="Usage Analytics"
          type="toggle"
          isEnabled={analyticsEnabled}
          onToggle={onToggleAnalytics}
          delay={600}
          index={1}
          theme={theme}
        />
        <SettingItem
          icon="shield-checkmark"
          label="Crash Reporting"
          type="toggle"
          isEnabled={crashReportingEnabled}
          onToggle={onToggleCrashReporting}
          delay={600}
          index={2}
          theme={theme}
        />
        <SettingItem
          icon="trash"
          label="Delete Account"
          type="arrow"
          onPress={onPressDeleteAccount}
          delay={600}
          index={3}
          theme={theme}
        />
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
});
