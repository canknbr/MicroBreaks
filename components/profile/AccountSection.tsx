import { Text, StyleSheet } from 'react-native';
import { ThemeColors } from '@/hooks/useTheme';
import { SettingItem } from './SettingItem';
import { SettingsGroup } from './SettingsGroup';

export function AccountSection({
  accountTypeLabel,
  isAuthenticated,
  emailVerified,
  accountRecoveryLabel,
  accountVerificationLabel,
  onLinkEmail,
  onSignIn,
  onResendVerification,
  onRefreshVerification,
  onSendPasswordReset,
  theme,
}: {
  accountTypeLabel: string;
  isAuthenticated: boolean;
  emailVerified: boolean;
  accountRecoveryLabel: string;
  accountVerificationLabel: string;
  onLinkEmail: () => void;
  onSignIn: () => void;
  onResendVerification: () => void;
  onRefreshVerification: () => void;
  onSendPasswordReset: () => void;
  theme: ThemeColors;
}) {
  return (
    <SettingsGroup label="ACCOUNT" theme={theme}>
      <SettingItem
        icon="person-circle"
        label="Account Type"
        type="value"
        value={accountTypeLabel}
        delay={350}
        index={0}
        theme={theme}
      />
      <SettingItem
        icon={isAuthenticated ? 'mail' : 'lock-closed'}
        label={isAuthenticated ? 'Linked Email' : 'Secure My Progress'}
        type={isAuthenticated ? 'value' : 'arrow'}
        value={isAuthenticated ? accountRecoveryLabel : undefined}
        onPress={isAuthenticated ? undefined : onLinkEmail}
        delay={350}
        index={1}
        theme={theme}
      />
      {isAuthenticated ? (
        <SettingItem
          icon={emailVerified ? 'checkmark-circle' : 'alert-circle'}
          label="Email Status"
          type="value"
          value={accountVerificationLabel}
          delay={350}
          index={2}
          theme={theme}
        />
      ) : null}
      {!isAuthenticated ? (
        <SettingItem
          icon="log-in"
          label="Restore Linked Account"
          type="arrow"
          onPress={onSignIn}
          delay={350}
          index={2}
          theme={theme}
        />
      ) : null}
      {isAuthenticated && !emailVerified ? (
        <SettingItem
          icon="mail-open"
          label="Resend Verification Email"
          type="arrow"
          onPress={onResendVerification}
          delay={350}
          index={3}
          theme={theme}
        />
      ) : null}
      {isAuthenticated ? (
        <SettingItem
          icon="refresh-circle"
          label="Refresh Verification Status"
          type="arrow"
          onPress={onRefreshVerification}
          delay={350}
          index={emailVerified ? 3 : 4}
          theme={theme}
        />
      ) : null}
      {isAuthenticated ? (
        <SettingItem
          icon="key"
          label="Send Password Reset Email"
          type="arrow"
          onPress={onSendPasswordReset}
          delay={350}
          index={emailVerified ? 4 : 5}
          theme={theme}
        />
      ) : null}
      <Text style={[styles.accountFootnote, { color: theme.text.muted }]}>
        {isAuthenticated
          ? emailVerified
            ? 'This device is attached to a recoverable, verified email sign-in.'
            : 'This device is attached to a recoverable email sign-in, but verification is still pending.'
          : 'Link an email sign-in for this device, or sign in to restore a previously linked account.'}
      </Text>
    </SettingsGroup>
  );
}

const styles = StyleSheet.create({
  accountFootnote: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    paddingTop: 14,
  },
});
