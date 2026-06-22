import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/theme';
import { cardShadow } from '@/utils/cardShadow';
import { ThemeColors } from '@/hooks/useTheme';
import { SettingItem } from './SettingItem';

export function PreferencesSection({
  themeLabel,
  soundEnabled,
  hapticsEnabled,
  voiceGuidanceEnabled,
  appleHealthMirrorEnabled,
  onPressTheme,
  onToggleSound,
  onToggleHaptics,
  onToggleVoiceGuidance,
  onToggleAppleHealth,
  onPressStreakBuddies,
  theme,
}: {
  themeLabel: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  voiceGuidanceEnabled: boolean;
  appleHealthMirrorEnabled: boolean;
  onPressTheme: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onToggleVoiceGuidance: () => void;
  onToggleAppleHealth: () => void;
  onPressStreakBuddies: () => void;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">PREFERENCES</Text>
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
          icon="color-palette"
          label="App Theme"
          type="value"
          value={themeLabel}
          onPress={onPressTheme}
          delay={500}
          index={0}
          theme={theme}
        />
        <SettingItem
          icon="volume-high"
          label="Sounds"
          type="toggle"
          isEnabled={soundEnabled}
          onToggle={onToggleSound}
          delay={500}
          index={1}
          theme={theme}
        />
        <SettingItem
          icon="phone-portrait"
          label="Haptic Feedback"
          type="toggle"
          isEnabled={hapticsEnabled}
          onToggle={onToggleHaptics}
          delay={500}
          index={2}
          theme={theme}
        />
        <SettingItem
          icon="mic"
          label="Voice Guidance"
          type="toggle"
          isEnabled={voiceGuidanceEnabled}
          onToggle={onToggleVoiceGuidance}
          delay={500}
          index={3}
          theme={theme}
        />
        {Platform.OS === 'ios' && (
          <SettingItem
            icon="heart"
            label="Mirror to Apple Health"
            type="toggle"
            isEnabled={appleHealthMirrorEnabled}
            onToggle={onToggleAppleHealth}
            delay={500}
            index={4}
            theme={theme}
          />
        )}
        <SettingItem
          icon="people"
          label="Streak Buddies"
          type="arrow"
          onPress={onPressStreakBuddies}
          delay={500}
          index={5}
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
