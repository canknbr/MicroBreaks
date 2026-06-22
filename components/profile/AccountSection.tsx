import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/theme';
import { cardShadow } from '@/utils/cardShadow';
import { ThemeColors } from '@/hooks/useTheme';
import { SettingItem } from './SettingItem';

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
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">ACCOUNT</Text>
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
  accountFootnote: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 13,
    lineHeight: 18,
  },
});
