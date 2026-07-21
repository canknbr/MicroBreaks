import { ThemeColors } from '@/hooks/useTheme';
import { SettingItem } from './SettingItem';
import { SettingsGroup } from './SettingsGroup';

export function AboutSection({
  onPressSupport,
  onPressPrivacyPolicy,
  onPressTermsOfService,
  theme,
}: {
  onPressSupport: () => void;
  onPressPrivacyPolicy: () => void;
  onPressTermsOfService: () => void;
  theme: ThemeColors;
}) {
  return (
    <SettingsGroup label="ABOUT" theme={theme}>
      <SettingItem
        icon="help-circle"
        label="Help & Support"
        type="arrow"
        onPress={onPressSupport}
        delay={600}
        index={0}
        theme={theme}
      />
      <SettingItem
        icon="shield-checkmark"
        label="Privacy Policy"
        type="arrow"
        onPress={onPressPrivacyPolicy}
        delay={600}
        index={1}
        theme={theme}
      />
      <SettingItem
        icon="document-text"
        label="Terms of Service"
        type="arrow"
        onPress={onPressTermsOfService}
        delay={600}
        index={2}
        theme={theme}
      />
      <SettingItem
        icon="information-circle"
        label="Version"
        type="value"
        value="1.0.0"
        delay={600}
        index={3}
        theme={theme}
      />
    </SettingsGroup>
  );
}
