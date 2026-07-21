import { ThemeColors } from '@/hooks/useTheme';
import { SettingItem } from './SettingItem';
import { SettingsGroup } from './SettingsGroup';

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
    <SettingsGroup label="DATA & PRIVACY" theme={theme}>
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
    </SettingsGroup>
  );
}
