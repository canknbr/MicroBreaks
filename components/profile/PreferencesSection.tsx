import { Platform } from 'react-native';
import { ThemeColors } from '@/hooks/useTheme';
import { SettingItem } from './SettingItem';
import { SettingsGroup } from './SettingsGroup';

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
    <SettingsGroup label="PREFERENCES" theme={theme}>
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
    </SettingsGroup>
  );
}
