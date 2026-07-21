import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';
import {
  getAuthErrorMessage,
  linkCurrentAnonymousUserWithEmail,
  sendCurrentUserEmailVerification,
  sendPasswordResetEmail,
} from '@/services/firebase/auth';
import { signInWithRecoveredAccount } from '@/services/account/sessionReset';
import { syncService } from '@/services/sync';
import { useUserStore } from '@/store/userStore';

export type AccountAccessMode = 'link' | 'sign_in';

export function AccountAccessModal({
  visible,
  mode,
  onModeChange,
  onSuccess,
  onClose,
}: {
  visible: boolean;
  mode: AccountAccessMode;
  onModeChange: (_mode: AccountAccessMode) => void;
  onSuccess?: (_mode: AccountAccessMode) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setIsSubmitting(false);
      setIsSendingResetLink(false);
    }
  }, [visible, mode]);

  const isLinkMode = mode === 'link';
  const canSubmit = useMemo(
    () =>
      email.trim().length > 0 &&
      password.length >= 6 &&
      (!isLinkMode || confirmPassword.length >= 6) &&
      !isSubmitting,
    [confirmPassword.length, email, isLinkMode, isSubmitting, password.length]
  );

  const title = isLinkMode ? 'Secure Your Progress' : 'Restore Linked Account';
  const subtitle = isLinkMode
    ? 'Add an email sign-in so you can recover this same account later without losing your streak, stats, or history.'
    : 'Sign in with the email you already linked on another device. This will replace the current local session on this device.';

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleLinkAccount = async () => {
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const linkedUser = await linkCurrentAnonymousUserWithEmail(email, password);
      useUserStore.setState((state) => ({
        profile: {
          ...state.profile,
          email: linkedUser.email ?? state.profile.email,
          emailVerified: linkedUser.emailVerified === true,
          updatedAt: Date.now(),
        },
        isAuthenticated: !linkedUser.isAnonymous,
      }));
      await syncService.queueDataChange('profile');
      let verificationEmailSent = linkedUser.emailVerified === true;
      if (!linkedUser.emailVerified) {
        try {
          await sendCurrentUserEmailVerification();
          verificationEmailSent = true;
        } catch {
          verificationEmailSent = false;
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Account Linked',
        linkedUser.emailVerified
          ? 'Your progress is now tied to this email sign-in.'
          : verificationEmailSent
            ? 'Your progress is now tied to this email sign-in. We also sent a verification email so you can confirm it.'
            : 'Your progress is now tied to this email sign-in. Verify the email later from the Account section if needed.'
      );
      onSuccess?.('link');
      onClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(getAuthErrorMessage(error, 'link'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetLink = async () => {
    setIsSendingResetLink(true);
    setErrorMessage(null);

    try {
      await sendPasswordResetEmail(email);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Reset Link Sent',
        'If this email is linked to an Unwind account, a password reset email is on its way.'
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(getAuthErrorMessage(error, 'sign_in'));
    } finally {
      setIsSendingResetLink(false);
    }
  };

  const performSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signInWithRecoveredAccount(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Account Restored',
        'This device is now signed in to your linked account.'
      );
      onSuccess?.('sign_in');
      onClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(getAuthErrorMessage(error, 'sign_in'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    if (isLinkMode) {
      void handleLinkAccount();
      return;
    }

    Alert.alert(
      'Replace Current Session?',
      'Signing in will replace the current local session on this device. Continue only if you want to restore a previously linked account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            void performSignIn();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable
          style={styles.modalContent}
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal={true}
        >
          <View style={styles.modeSwitcher}>
            <Pressable
              style={[styles.modeButton, isLinkMode && styles.modeButtonActive]}
              onPress={() => onModeChange('link')}
              disabled={isSubmitting}
            >
              <Text style={[styles.modeButtonText, isLinkMode && styles.modeButtonTextActive]}>
                Secure Current
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, !isLinkMode && styles.modeButtonActive]}
              onPress={() => onModeChange('sign_in')}
              disabled={isSubmitting}
            >
              <Text style={[styles.modeButtonText, !isLinkMode && styles.modeButtonTextActive]}>
                Restore Existing
              </Text>
            </Pressable>
          </View>

          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSubtitle}>{subtitle}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType={isLinkMode ? 'newPassword' : 'password'}
              placeholder={isLinkMode ? 'At least 6 characters' : 'Enter your password'}
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
            />
          </View>

          {isLinkMode ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="password"
                placeholder="Repeat your password"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isSubmitting}
              />
            </View>
          ) : null}

          {!isLinkMode ? (
            <Pressable
              style={styles.secondaryTextButton}
              onPress={() => {
                void handleSendResetLink();
              }}
              disabled={isSubmitting || isSendingResetLink || email.trim().length === 0}
            >
              <Text style={styles.secondaryTextButtonLabel}>
                {isSendingResetLink ? 'Sending reset link...' : 'Send password reset link'}
              </Text>
            </Pressable>
          ) : null}

          {errorMessage ? (
            <Text style={styles.errorText} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.linkButton, !canSubmit && styles.linkButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.linkButtonText}>
                  {isLinkMode ? 'Link Account' : 'Sign In'}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1C1922',
    padding: 24,
  },
  modeSwitcher: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeButtonActive: {
    borderBottomColor: '#FF2472',
  },
  modeButtonText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 15,
    letterSpacing: -0.2,
    color: 'rgba(255, 255, 255, 0.34)',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  modalTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 24,
    letterSpacing: -0.6,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: Spacing.md,
  },
  inputContainer: {
    marginTop: 18,
  },
  inputLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryTextButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  secondaryTextButtonLabel: {
    fontFamily: 'GeneralSans-Semibold',
    color: '#FF2472',
    fontSize: 13,
  },
  errorText: {
    marginTop: Spacing.md,
    fontFamily: 'GeneralSans-Medium',
    color: '#EB3E38',
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  linkButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  linkButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  linkButtonText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 16,
    color: '#0B0A0D',
  },
});
