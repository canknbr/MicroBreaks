import { ThemeColors } from '@/hooks/useTheme';
import { SettingItem } from './SettingItem';
import { SettingsGroup } from './SettingsGroup';

export function TimerSettingsSection({
  autoStartBreak,
  autoStartWork,
  onToggleAutoStartBreak,
  onToggleAutoStartWork,
  theme,
}: {
  autoStartBreak: boolean;
  autoStartWork: boolean;
  onToggleAutoStartBreak: () => void;
  onToggleAutoStartWork: () => void;
  theme: ThemeColors;
}) {
  return (
    <SettingsGroup label="FOCUS TIMER" theme={theme}>
      <SettingItem
        icon="play-circle"
        label="Auto-start Break"
        type="toggle"
        isEnabled={autoStartBreak}
        onToggle={onToggleAutoStartBreak}
        delay={400}
        index={0}
        theme={theme}
      />
      <SettingItem
        icon="refresh-circle"
        label="Auto-start Work"
        type="toggle"
        isEnabled={autoStartWork}
        onToggle={onToggleAutoStartWork}
        delay={400}
        index={1}
        theme={theme}
      />
    </SettingsGroup>
  );
}
