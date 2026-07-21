/**
 * Profile Screen - Settings, notifications, and premium
 * User profile and app configuration with real notification settings
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';
import { router } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import { useUserStore, useSettingsStore, useSubscriptionCustomer, useSubscriptionStatus, useSubscriptionStore, useBillingDiagnostics, useEntitlementHealth } from '@/store';
import { useEffectiveTier } from '@/hooks/useEffectiveTier';
import { TIER_LABELS, tierIncludes } from '@/services/subscription/tiers';
import { useTimerPreferences, useTimerActions } from '@/store/timerStore';
import { useAchievements } from '@/hooks/useAchievements';
import { useTheme } from '@/hooks/useTheme';
import { LEVEL_COLORS, LEVEL_TITLES } from '@/constants/levels';
import { getPremiumHealthSummary } from '@/services/billing/healthSummary';
import { replaceWithFreshAnonymousSession } from '@/services/account/sessionReset';
import { setFirebaseCollectionPreferences } from '@/services/firebase/config';
import { requestMindfulSessionPermission } from '@/services/health/healthKitSource';
import {
  getLastReminderDecision,
  type ReminderDecisionRecord,
} from '@/services/notifications/diagnostics';
import {
  reloadCurrentUser,
  sendCurrentUserEmailVerification,
  sendPasswordResetEmail,
} from '@/services/firebase/auth';
import {
  AboutSection,
  AccountAccessModal,
  type AccountAccessMode,
  AccountSection,
  AchievementsSection,
  DataPrivacySection,
  EditProfileModal,
  IntervalPickerModal,
  NotificationsSection,
  PreferencesSection,
  PremiumCard,
  ProfileCard,
  SignOutButton,
  ThemePickerModal,
  TimerSettingsSection,
} from '@/components/profile';

export default function ProfileScreen() {
  const theme = useTheme();
  const {
    settings,
    hasPermission,
    requestPermission,
    toggleNotifications,
    toggleBreakReminders,
    toggleStreakAlerts,
    toggleGoalNotifications,
    setReminderInterval,
    toggleQuietHours,
  } = useNotifications();

  // User store
  const profile = useUserStore((state) => state.profile);
  const progress = useUserStore((state) => state.progress);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const billingDiagnostics = useBillingDiagnostics();
  const entitlementHealth = useEntitlementHealth();
  const subscriptionLastSyncedAt = useSubscriptionStore((state) => state.lastSyncedAt);
  const subscriptionCustomer = useSubscriptionCustomer();
  const subscriptionStatus = useSubscriptionStatus();

  // Settings store
  const settingsStore = useSettingsStore();

  // Achievements
  const { unlockedAchievements, stats: achievementStats, nextToUnlock } = useAchievements();

  // Timer preferences
  const timerPreferences = useTimerPreferences();
  const timerAct = useTimerActions();

  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAccountAccess, setShowAccountAccess] = useState(false);
  const [accountAccessMode, setAccountAccessMode] = useState<AccountAccessMode>('link');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [reminderDecision, setReminderDecision] =
    useState<ReminderDecisionRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getLastReminderDecision().then((rec) => {
      if (!cancelled) setReminderDecision(rec);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const headerOpacity = useSharedValue(0);
  const profileScale = useSharedValue(0.9);
  const profileOpacity = useSharedValue(0);
  const premiumPulse = useSharedValue(1);

  const handleToggleAnalytics = useCallback(async () => {
    const nextAnalyticsEnabled = !settingsStore.settings.analyticsEnabled;
    settingsStore.updateSettings({ analyticsEnabled: nextAnalyticsEnabled });

    try {
      await setFirebaseCollectionPreferences({
        analyticsEnabled: nextAnalyticsEnabled,
        crashReportingEnabled: settingsStore.settings.crashReportingEnabled,
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to update analytics collection preference:', error);
      }
    }
  }, [settingsStore]);

  const handleToggleCrashReporting = useCallback(async () => {
    const nextCrashReportingEnabled = !settingsStore.settings.crashReportingEnabled;
    settingsStore.updateSettings({ crashReportingEnabled: nextCrashReportingEnabled });

    try {
      await setFirebaseCollectionPreferences({
        analyticsEnabled: settingsStore.settings.analyticsEnabled,
        crashReportingEnabled: nextCrashReportingEnabled,
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to update crash reporting preference:', error);
      }
    }
  }, [settingsStore]);

  const level = Math.min(progress.level, 5);
  const levelColors = LEVEL_COLORS[level] || LEVEL_COLORS[1];
  const levelTitle = LEVEL_TITLES[level] || LEVEL_TITLES[1];
  const currentXP = progress.totalXP % 100;
  const xpProgress = currentXP;

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    profileOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    profileScale.value = withDelay(200, withSpring(1));

    premiumPulse.value = withDelay(
      1000,
      withSequence(
        withTiming(1.02, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      )
    );
  }, [headerOpacity, premiumPulse, profileOpacity, profileScale]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [20, 0]) }],
  }));

  const profileStyle = useAnimatedStyle(() => ({
    opacity: profileOpacity.value,
    transform: [{ scale: profileScale.value }],
  }));

  const premiumStyle = useAnimatedStyle(() => ({
    transform: [{ scale: premiumPulse.value }],
  }));

  const handleNotificationToggle = useCallback(async () => {
    if (!settings.enabled && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive break reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    await toggleNotifications();
  }, [settings.enabled, hasPermission, requestPermission, toggleNotifications]);

  const handlePremiumPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/subscription',
      params: { placement: 'profile' },
    } as any);
  };

  const { tier: effectiveTier } = useEffectiveTier();

  const handleAppleHealthToggle = useCallback(async () => {
    const currentlyOn = settingsStore.settings.appleHealthMirrorEnabled;
    // Pro+ gated. Sending them to upgrade flow on toggle-on if they
    // aren't on a qualifying tier so they understand why the writes
    // would never land.
    if (!currentlyOn && !tierIncludes(effectiveTier, 'apple_health_export')) {
      router.push({
        pathname: '/subscription',
        params: { placement: 'profile' },
      } as any);
      return;
    }
    if (!currentlyOn) {
      const granted = await requestMindfulSessionPermission();
      if (!granted) {
        Alert.alert(
          'Apple Health unavailable',
          "We couldn't get Mindful Sessions write access. Enable it in Settings → Health → Data Access → Unwind.",
          [{ text: 'OK' }],
        );
        return;
      }
    }
    settingsStore.updateSettings({ appleHealthMirrorEnabled: !currentlyOn });
  }, [effectiveTier, settingsStore]);
  const tierLabel = TIER_LABELS[effectiveTier];
  // Derive "subscribed" from the server-resolved effective tier rather
  // than raw local store status, so a refunded/churned user whose local
  // SDK still claims premium sees the upgrade CTA, not "Active".
  const hasActiveSubscription = effectiveTier !== 'free';
  const billingPeriodLabel = subscriptionCustomer.activeOfferId?.endsWith('_annual')
    ? 'Annual'
    : 'Monthly';
  const premiumTitle = hasActiveSubscription
    ? subscriptionCustomer.isPreview
      ? `Preview ${tierLabel} Active`
      : `${tierLabel} Active`
    : `Go ${effectiveTier === 'free' ? 'Pro' : tierLabel}`;
  const premiumDescription = hasActiveSubscription
    ? `${billingPeriodLabel} ${tierLabel} access is active on this device`
    : subscriptionStatus === 'expired'
      ? 'Re-activate advanced insights, guided programs & more'
      : 'Advanced insights, guided programs & more';
  const premiumHealthSummary = getPremiumHealthSummary(
    billingDiagnostics,
    entitlementHealth,
    subscriptionLastSyncedAt
  );

  const formatQuietHours = () => {
    const formatHour = (hour: number) => {
      if (hour === 0) return '12 AM';
      if (hour === 12) return '12 PM';
      if (hour < 12) return `${hour} AM`;
      return `${hour - 12} PM`;
    };
    return `${formatHour(settings.quietHoursStart)} - ${formatHour(settings.quietHoursEnd)}`;
  };

  const accountTypeLabel = isAuthenticated ? 'Linked' : 'Anonymous';
  const accountRecoveryLabel = isAuthenticated
    ? profile.email ?? 'Email sign-in active'
    : 'Secure My Progress';
  const accountVerificationLabel = profile.emailVerified ? 'Verified' : 'Verification Needed';

  const getThemeLabel = (theme: 'dark' | 'light' | 'system') => {
    switch (theme) {
      case 'dark': return 'Dark';
      case 'light': return 'Light';
      case 'system': return 'System';
    }
  };

  const handleSupportPress = useCallback(() => {
    Linking.openURL('mailto:support@microbreaks.app?subject=Unwind%20Support%20Request').catch(() => {
      Alert.alert('Unable to Open Email', 'Please email us at support@microbreaks.app');
    });
  }, []);

  const handleRefreshVerificationStatus = useCallback(async () => {
    try {
      const user = await reloadCurrentUser();
      updateProfile({
        email: user?.email ?? profile.email,
        emailVerified: user?.emailVerified === true,
        updatedAt: Date.now(),
      });
      Alert.alert(
        user?.emailVerified
          ? 'Email Verified'
          : 'Verification Still Pending',
        user?.emailVerified
          ? 'Your linked email is now verified on this device.'
          : 'We still have not seen a completed email verification for this account.'
      );
    } catch (_error) {
      Alert.alert('Unable to Refresh', 'Could not refresh verification status right now.');
    }
  }, [profile.email, updateProfile]);

  const handleSendVerificationEmail = useCallback(async () => {
    try {
      await sendCurrentUserEmailVerification();
      Alert.alert(
        'Verification Email Sent',
        'Check your inbox and then return here to refresh the verification status.'
      );
    } catch (_error) {
      Alert.alert('Unable to Send', 'Could not send a verification email right now.');
    }
  }, []);

  const handleSendPasswordReset = useCallback(async () => {
    if (!profile.email) {
      Alert.alert('No Linked Email', 'Link an email first before requesting a password reset.');
      return;
    }

    try {
      await sendPasswordResetEmail(profile.email);
      Alert.alert(
        'Reset Email Sent',
        'If this linked email is active, a password reset link is on its way.'
      );
    } catch (_error) {
      Alert.alert('Unable to Send', 'Could not send a password reset email right now.');
    }
  }, [profile.email]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Profile</Text>
          </Animated.View>

          {/* Profile Card */}
          <ProfileCard
            profile={profile}
            progress={progress}
            level={level}
            levelTitle={levelTitle}
            levelColors={levelColors}
            currentXP={currentXP}
            xpProgress={xpProgress}
            profileStyle={profileStyle}
            onEditPress={() => setShowEditProfile(true)}
            theme={theme}
          />

          {/* Achievements Section */}
          <AchievementsSection
            achievementStats={achievementStats}
            unlockedAchievements={unlockedAchievements}
            nextToUnlock={nextToUnlock}
            theme={theme}
          />

          {/* Premium Card */}
          <PremiumCard
            premiumTitle={premiumTitle}
            premiumDescription={premiumDescription}
            premiumHealthSummary={premiumHealthSummary}
            premiumStyle={premiumStyle}
            onPress={handlePremiumPress}
          />

          {/* Account Section */}
          <AccountSection
            accountTypeLabel={accountTypeLabel}
            isAuthenticated={isAuthenticated}
            emailVerified={profile.emailVerified}
            accountRecoveryLabel={accountRecoveryLabel}
            accountVerificationLabel={accountVerificationLabel}
            onLinkEmail={() => {
              setAccountAccessMode('link');
              setShowAccountAccess(true);
            }}
            onSignIn={() => {
              setAccountAccessMode('sign_in');
              setShowAccountAccess(true);
            }}
            onResendVerification={() => {
              void handleSendVerificationEmail();
            }}
            onRefreshVerification={() => {
              void handleRefreshVerificationStatus();
            }}
            onSendPasswordReset={() => {
              void handleSendPasswordReset();
            }}
            theme={theme}
          />

          {/* Timer Settings Section */}
          <TimerSettingsSection
            autoStartBreak={timerPreferences.autoStartBreak}
            autoStartWork={timerPreferences.autoStartWork}
            onToggleAutoStartBreak={() => timerAct.toggleAutoStartBreak()}
            onToggleAutoStartWork={() => timerAct.toggleAutoStartWork()}
            theme={theme}
          />

          {/* Notifications Section */}
          <NotificationsSection
            enabled={settings.enabled}
            breakReminders={settings.breakReminders}
            reminderIntervalMinutes={settings.reminderIntervalMinutes}
            streakAlerts={settings.streakAlerts}
            goalNotifications={settings.goalNotifications}
            quietHoursEnabled={settings.quietHoursEnabled}
            reminderDecision={reminderDecision}
            quietHoursLabel={formatQuietHours()}
            onToggleNotifications={handleNotificationToggle}
            onToggleBreakReminders={toggleBreakReminders}
            onPressReminderInterval={() => setShowIntervalPicker(true)}
            onToggleStreakAlerts={toggleStreakAlerts}
            onToggleGoalNotifications={toggleGoalNotifications}
            onToggleQuietHours={toggleQuietHours}
            theme={theme}
          />

          {/* Preferences Section */}
          <PreferencesSection
            themeLabel={getThemeLabel(settingsStore.settings.theme)}
            soundEnabled={settingsStore.settings.soundEnabled}
            hapticsEnabled={settingsStore.settings.hapticsEnabled}
            voiceGuidanceEnabled={settingsStore.settings.voiceGuidanceEnabled}
            appleHealthMirrorEnabled={settingsStore.settings.appleHealthMirrorEnabled}
            onPressTheme={() => setShowThemePicker(true)}
            onToggleSound={() => settingsStore.toggleSound()}
            onToggleHaptics={() => settingsStore.toggleHaptics()}
            onToggleVoiceGuidance={() => settingsStore.toggleVoiceGuidance()}
            onToggleAppleHealth={handleAppleHealthToggle}
            onPressStreakBuddies={() => router.push('/buddies' as any)}
            theme={theme}
          />

          {/* About Section */}
          <AboutSection
            onPressSupport={handleSupportPress}
            onPressPrivacyPolicy={() => router.push('/privacy-policy' as any)}
            onPressTermsOfService={() => router.push('/terms-of-service' as any)}
            theme={theme}
          />

          {/* Data & Privacy Section */}
          <DataPrivacySection
            analyticsEnabled={settingsStore.settings.analyticsEnabled}
            crashReportingEnabled={settingsStore.settings.crashReportingEnabled}
            onPressDownloadData={async () => {
              try {
                const { exportUserData } = await import('@/services/data-export');
                await exportUserData();
              } catch (_error) {
                Alert.alert('Export Failed', 'Could not export your data. Please try again.');
              }
            }}
            onToggleAnalytics={() => {
              void handleToggleAnalytics();
            }}
            onToggleCrashReporting={() => {
              void handleToggleCrashReporting();
            }}
            onPressDeleteAccount={() => {
              // Two-step confirmation (B-UX11): a single Alert tap is too
              // easy to fire accidentally. The first dialog explains the
              // consequences in plain language; only after the user
              // acknowledges those does the second dialog ask for an
              // explicit destructive confirmation.
              Alert.alert(
                'Delete Account?',
                'This permanently removes:\n\n' +
                  '• Your profile, streaks, achievements\n' +
                  '• Every break in your history\n' +
                  '• Your subscription state on this device\n\n' +
                  'You cannot recover any of this. Continue?',
                [
                  { text: 'Keep my account', style: 'cancel' },
                  {
                    text: 'Continue',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        'Final confirmation',
                        'Tap "Delete forever" to permanently erase your account. There is no undo.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete forever',
                            style: 'destructive',
                            onPress: async () => {
                              Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Warning
                              );
                              try {
                                await replaceWithFreshAnonymousSession({
                                  deleteRemoteUserData: true,
                                });
                                router.replace('/');
                              } catch (_error) {
                                Alert.alert(
                                  'Error',
                                  'Could not delete account. Please try again.'
                                );
                              }
                            },
                          },
                        ]
                      );
                    },
                  },
                ]
              );
            }}
            theme={theme}
          />

          {/* Sign Out Button */}
          <SignOutButton
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out? Your progress will be reset.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      try {
                        await replaceWithFreshAnonymousSession();
                        router.replace('/');
                      } catch (_error) {
                        Alert.alert('Error', 'Could not sign out. Please try again.');
                      }
                    },
                  },
                ]
              );
            }}
          />

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      {/* Interval Picker Modal */}
      <IntervalPickerModal
        visible={showIntervalPicker}
        currentValue={settings.reminderIntervalMinutes}
        onSelect={setReminderInterval}
        onClose={() => setShowIntervalPicker(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfile}
        currentName={profile.name}
        currentAvatar={profile.avatar}
        onSave={(name, avatar) => {
          updateProfile({ name, avatar });
        }}
        onClose={() => setShowEditProfile(false)}
      />

      <AccountAccessModal
        visible={showAccountAccess}
        mode={accountAccessMode}
        onModeChange={setAccountAccessMode}
        onClose={() => setShowAccountAccess(false)}
      />

      {/* Theme Picker Modal */}
      <ThemePickerModal
        visible={showThemePicker}
        currentValue={settingsStore.settings.theme}
        onSelect={(theme) => settingsStore.setTheme(theme)}
        onClose={() => setShowThemePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  ambientPurple: {
    top: -150,
    right: -100,
    width: 400,
    height: 400,
    backgroundColor: '#BC26F4',
  },
  ambientGold: {
    bottom: 100,
    left: -150,
    width: 350,
    height: 350,
    backgroundColor: '#FAE34B',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  bottomSpacer: {
    height: 120,
  },
});
