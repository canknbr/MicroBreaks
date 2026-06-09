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
  Platform,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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
import { useUserStore, useSettingsStore, useHasActiveSubscription, useSubscriptionCustomer, useSubscriptionStatus, useSubscriptionStore, useBillingDiagnostics, useEntitlementHealth } from '@/store';
import { useTimerPreferences, useTimerActions } from '@/store/timerStore';
import { useAchievements } from '@/hooks/useAchievements';
import { useTheme } from '@/hooks/useTheme';
import { LEVEL_COLORS, LEVEL_TITLES } from '@/constants/levels';
import { getPremiumHealthSummary } from '@/services/billing/healthSummary';
import { replaceWithFreshAnonymousSession } from '@/services/account/sessionReset';
import { setFirebaseCollectionPreferences } from '@/services/firebase/config';
import {
  reloadCurrentUser,
  sendCurrentUserEmailVerification,
  sendPasswordResetEmail,
} from '@/services/firebase/auth';
import {
  AccountAccessModal,
  type AccountAccessMode,
  EditProfileModal,
  IntervalPickerModal,
  SettingItem,
  ThemePickerModal,
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
  const hasActiveSubscription = useHasActiveSubscription();

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

  const premiumTitle = hasActiveSubscription
    ? subscriptionCustomer.isPreview
      ? 'Preview Pro Active'
      : 'Pro Active'
    : 'Go Pro';
  const premiumDescription = hasActiveSubscription
    ? subscriptionCustomer.activeOfferId?.endsWith('_annual')
      ? 'Annual access is active on this device'
      : 'Monthly access is active on this device'
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

  const notificationsDisabled = !settings.enabled;
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
    Linking.openURL('mailto:support@microbreaks.app?subject=MicroBreaks%20Support%20Request').catch(() => {
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
      {/* Ambient Background */}
      <View style={[styles.ambientGlow, styles.ambientPurple]} />
      <View style={[styles.ambientGlow, styles.ambientGold]} />

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
          <Animated.View
            accessibilityRole="summary"
            accessibilityLabel={`${profile.name}, ${levelTitle}, Level ${level}, ${currentXP} of 100 XP`}
            style={[
            styles.profileCard,
            {
              borderColor: theme.isDark ? theme.border.subtle : 'transparent',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme.isDark ? 0 : 0.08,
              shadowRadius: 16,
              elevation: theme.isDark ? 0 : 5,
            },
            profileStyle,
          ]}>
            {/* BlurView only for dark mode */}
            {theme.isDark ? (
              Platform.OS === 'ios' ? (
                <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
              )
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background.card }]} />
            )}
            <LinearGradient
              colors={theme.isDark ? ['rgba(255, 255, 255, 0.08)', 'transparent'] : ['rgba(0, 0, 0, 0.03)', 'transparent']}
              style={styles.cardHighlight}
            />

            <View style={styles.profileContent}>
              {/* Avatar with Level */}
              <Pressable
                style={styles.avatarContainer}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowEditProfile(true);
                }}
              >
                <LinearGradient
                  colors={levelColors}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>
                    {profile.avatar || profile.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.levelBadge}>
                  <LinearGradient
                    colors={levelColors}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.levelText}>{level}</Text>
                </View>
                {/* Edit indicator */}
                <View style={styles.editIndicator}>
                  <Ionicons name="pencil" size={10} color="#FFF" />
                </View>
              </Pressable>

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.text.primary }]}>{profile.name}</Text>
                <Text style={[styles.userTitle, { color: theme.text.secondary }]}>{levelTitle}</Text>

                {/* XP Progress */}
                <View style={styles.xpContainer}>
                  <View style={[styles.xpTrack, { backgroundColor: theme.border.subtle }]}>
                    <View style={[styles.xpFill, { width: `${xpProgress}%` }]}>
                      <LinearGradient
                        colors={levelColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>
                  </View>
                  <Text style={[styles.xpText, { color: theme.text.muted }]}>
                    {currentXP}/100 XP
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={[styles.profileStats, { borderTopColor: theme.border.subtle }]}>
              <View style={styles.profileStatItem} accessibilityRole="text" accessibilityLabel={`${progress.totalBreaks} Total Breaks`}>
                <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.totalBreaks}</Text>
                <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Total Breaks</Text>
              </View>
              <View style={[styles.profileStatDivider, { backgroundColor: theme.border.subtle }]} />
              <View style={styles.profileStatItem} accessibilityRole="text" accessibilityLabel={`${progress.totalXP} Total XP`}>
                <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.totalXP}</Text>
                <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Total XP</Text>
              </View>
              <View style={[styles.profileStatDivider, { backgroundColor: theme.border.subtle }]} />
              <View style={styles.profileStatItem} accessibilityRole="text" accessibilityLabel={`${progress.currentStreak} Day Streak`}>
                <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.currentStreak}</Text>
                <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Day Streak</Text>
              </View>
            </View>
          </Animated.View>

          {/* Achievements Section */}
          <View style={styles.settingsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">ACHIEVEMENTS</Text>
              <Text style={[styles.achievementProgress, { color: theme.accent.primary }]}>
                {achievementStats.unlocked}/{achievementStats.total}
              </Text>
            </View>
            <View style={[
              styles.sectionCard,
              {
                borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 12,
                elevation: theme.isDark ? 0 : 4,
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

              {/* Recent Achievements */}
              {unlockedAchievements.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.achievementsList}
                >
                  {unlockedAchievements.slice(0, 5).map((achievement) => (
                    <View key={achievement.id} style={styles.achievementBadge} accessibilityRole="image" accessibilityLabel={`Achievement: ${achievement.title}`}>
                      <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}20` }]}>
                        <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                      </View>
                      <Text style={[styles.achievementTitle, { color: theme.text.primary }]} numberOfLines={1}>
                        {achievement.title}
                      </Text>
                    </View>
                  ))}
                  {achievementStats.unlocked > 5 && (
                    <View style={styles.achievementMore}>
                      <Text style={[styles.achievementMoreText, { color: theme.text.primary }]}>
                        +{achievementStats.unlocked - 5}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              ) : (
                <View style={styles.noAchievements}>
                  <Text style={styles.noAchievementsIcon}>🏆</Text>
                  <Text style={[styles.noAchievementsText, { color: theme.text.muted }]}>
                    Complete breaks to earn achievements!
                  </Text>
                </View>
              )}

              {/* Next to Unlock */}
              {nextToUnlock.length > 0 && (
                <View style={styles.nextToUnlock}>
                  <Text style={[styles.nextToUnlockLabel, { color: theme.text.muted }]}>Next to unlock:</Text>
                  <View style={styles.nextAchievement}>
                    <Text style={styles.nextAchievementIcon}>{nextToUnlock[0].icon}</Text>
                    <View style={styles.nextAchievementInfo}>
                      <Text style={[styles.nextAchievementTitle, { color: theme.text.primary }]}>{nextToUnlock[0].title}</Text>
                      <View style={[styles.nextProgressBar, { backgroundColor: theme.border.subtle }]}>
                        <View
                          style={[
                            styles.nextProgressFill,
                            { width: `${nextToUnlock[0].progress}%`, backgroundColor: nextToUnlock[0].color },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[styles.nextProgressText, { color: theme.text.muted }]}>
                      {Math.round(nextToUnlock[0].progress)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Premium Card */}
          <Pressable
            onPress={handlePremiumPress}
            accessibilityRole="button"
            accessibilityLabel={`${premiumTitle}. ${premiumDescription}. ${premiumHealthSummary.label}. ${premiumHealthSummary.detail}`}
          >
            <Animated.View style={[styles.premiumCard, premiumStyle]}>
              <LinearGradient
                colors={['#FFD166', '#FF9500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.premiumContent}>
                <View style={styles.premiumIcon}>
                  <Ionicons name="star" size={24} color="#000" />
                </View>
                <View style={styles.premiumInfo}>
                  <Text style={styles.premiumTitle}>{premiumTitle}</Text>
                  <Text style={styles.premiumDescription}>
                    {premiumDescription}
                  </Text>
                  <View style={styles.premiumHealthRow}>
                    <View style={styles.premiumHealthBadge}>
                      <Ionicons name={premiumHealthSummary.icon} size={14} color="#000" />
                      <Text style={styles.premiumHealthBadgeText}>
                        {premiumHealthSummary.label}
                      </Text>
                    </View>
                    <Text style={styles.premiumHealthText}>
                      {premiumHealthSummary.detail}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </View>
            </Animated.View>
          </Pressable>

          {/* Account Section */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">ACCOUNT</Text>
            <View style={[
              styles.sectionCard,
              {
                borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 12,
                elevation: theme.isDark ? 0 : 4,
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
                onPress={isAuthenticated ? undefined : () => {
                  setAccountAccessMode('link');
                  setShowAccountAccess(true);
                }}
                delay={350}
                index={1}
                theme={theme}
              />
              {isAuthenticated ? (
                <SettingItem
                  icon={profile.emailVerified ? 'checkmark-circle' : 'alert-circle'}
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
                  onPress={() => {
                    setAccountAccessMode('sign_in');
                    setShowAccountAccess(true);
                  }}
                  delay={350}
                  index={2}
                  theme={theme}
                />
              ) : null}
              {isAuthenticated && !profile.emailVerified ? (
                <SettingItem
                  icon="mail-open"
                  label="Resend Verification Email"
                  type="arrow"
                  onPress={() => {
                    void handleSendVerificationEmail();
                  }}
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
                  onPress={() => {
                    void handleRefreshVerificationStatus();
                  }}
                  delay={350}
                  index={profile.emailVerified ? 3 : 4}
                  theme={theme}
                />
              ) : null}
              {isAuthenticated ? (
                <SettingItem
                  icon="key"
                  label="Send Password Reset Email"
                  type="arrow"
                  onPress={() => {
                    void handleSendPasswordReset();
                  }}
                  delay={350}
                  index={profile.emailVerified ? 4 : 5}
                  theme={theme}
                />
              ) : null}
              <Text style={[styles.accountFootnote, { color: theme.text.muted }]}>
                {isAuthenticated
                  ? profile.emailVerified
                    ? 'This device is attached to a recoverable, verified email sign-in.'
                    : 'This device is attached to a recoverable email sign-in, but verification is still pending.'
                  : 'Link an email sign-in for this device, or sign in to restore a previously linked account.'}
              </Text>
            </View>
          </View>

          {/* Timer Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">FOCUS TIMER</Text>
            <View style={[
              styles.sectionCard,
              {
                borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 12,
                elevation: theme.isDark ? 0 : 4,
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
                icon="play-circle"
                label="Auto-start Break"
                type="toggle"
                isEnabled={timerPreferences.autoStartBreak}
                onToggle={() => timerAct.toggleAutoStartBreak()}
                delay={400}
                index={0}
                theme={theme}
              />
              <SettingItem
                icon="refresh-circle"
                label="Auto-start Work"
                type="toggle"
                isEnabled={timerPreferences.autoStartWork}
                onToggle={() => timerAct.toggleAutoStartWork()}
                delay={400}
                index={1}
                theme={theme}
              />
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">NOTIFICATIONS</Text>
            <View style={[
              styles.sectionCard,
              {
                borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 12,
                elevation: theme.isDark ? 0 : 4,
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
                icon="notifications"
                label="Push Notifications"
                type="toggle"
                isEnabled={settings.enabled}
                onToggle={handleNotificationToggle}
                delay={400}
                index={0}
                theme={theme}
              />
              {notificationsDisabled && (
                <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.text.muted,
                      fontStyle: 'italic',
                    }}
                    accessibilityRole="text"
                  >
                    Turn on Push Notifications to manage the options below.
                  </Text>
                </View>
              )}
              <SettingItem
                icon="alarm"
                label="Break Reminders"
                type="toggle"
                isEnabled={settings.breakReminders}
                onToggle={toggleBreakReminders}
                delay={400}
                index={1}
                disabled={notificationsDisabled}
                theme={theme}
              />
              <SettingItem
                icon="time"
                label="Reminder Interval"
                type="value"
                value={`${settings.reminderIntervalMinutes} min`}
                onPress={() => setShowIntervalPicker(true)}
                delay={400}
                index={2}
                disabled={notificationsDisabled || !settings.breakReminders}
                theme={theme}
              />
              <SettingItem
                icon="flame"
                label="Streak Alerts"
                type="toggle"
                isEnabled={settings.streakAlerts}
                onToggle={toggleStreakAlerts}
                delay={400}
                index={3}
                disabled={notificationsDisabled}
                theme={theme}
              />
              <SettingItem
                icon="flag"
                label="Goal Notifications"
                type="toggle"
                isEnabled={settings.goalNotifications}
                onToggle={toggleGoalNotifications}
                delay={400}
                index={4}
                disabled={notificationsDisabled}
                theme={theme}
              />
              <SettingItem
                icon="moon"
                label="Quiet Hours"
                type="toggle"
                isEnabled={settings.quietHoursEnabled}
                onToggle={toggleQuietHours}
                delay={400}
                index={5}
                disabled={notificationsDisabled}
                theme={theme}
              />
              {settings.quietHoursEnabled && !notificationsDisabled && (
                <View style={styles.quietHoursInfo}>
                  <Text style={styles.quietHoursText}>
                    No notifications {formatQuietHours()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">PREFERENCES</Text>
            <View style={[
              styles.sectionCard,
              {
                borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 12,
                elevation: theme.isDark ? 0 : 4,
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
                value={getThemeLabel(settingsStore.settings.theme)}
                onPress={() => setShowThemePicker(true)}
                delay={500}
                index={0}
                theme={theme}
              />
              <SettingItem
                icon="volume-high"
                label="Sounds"
                type="toggle"
                isEnabled={settingsStore.settings.soundEnabled}
                onToggle={() => settingsStore.toggleSound()}
                delay={500}
                index={1}
                theme={theme}
              />
              <SettingItem
                icon="phone-portrait"
                label="Haptic Feedback"
                type="toggle"
                isEnabled={settingsStore.settings.hapticsEnabled}
                onToggle={() => settingsStore.toggleHaptics()}
                delay={500}
                index={2}
                theme={theme}
              />
              <SettingItem
                icon="mic"
                label="Voice Guidance"
                type="toggle"
                isEnabled={settingsStore.settings.voiceGuidanceEnabled}
                onToggle={() => settingsStore.toggleVoiceGuidance()}
                delay={500}
                index={3}
                theme={theme}
              />
            </View>
          </View>

          {/* About Section */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">ABOUT</Text>
            <View style={[
              styles.sectionCard,
              {
                borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 12,
                elevation: theme.isDark ? 0 : 4,
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
                icon="help-circle"
                label="Help & Support"
                type="arrow"
                onPress={handleSupportPress}
                delay={600}
                index={0}
                theme={theme}
              />
              <SettingItem
                icon="shield-checkmark"
                label="Privacy Policy"
                type="arrow"
                onPress={() => router.push('/privacy-policy' as any)}
                delay={600}
                index={1}
                theme={theme}
              />
              <SettingItem
                icon="document-text"
                label="Terms of Service"
                type="arrow"
                onPress={() => router.push('/terms-of-service' as any)}
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
            </View>
          </View>

          {/* Data & Privacy Section */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">DATA & PRIVACY</Text>
            <View style={[
              styles.sectionCard,
              {
                borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 12,
                elevation: theme.isDark ? 0 : 4,
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
                onPress={async () => {
                  try {
                    const { exportUserData } = await import('@/services/data-export');
                    await exportUserData();
                  } catch (_error) {
                    Alert.alert('Export Failed', 'Could not export your data. Please try again.');
                  }
                }}
                delay={600}
                index={0}
                theme={theme}
              />
              <SettingItem
                icon="bar-chart"
                label="Usage Analytics"
                type="toggle"
                isEnabled={settingsStore.settings.analyticsEnabled}
                onToggle={() => {
                  void handleToggleAnalytics();
                }}
                delay={600}
                index={1}
                theme={theme}
              />
              <SettingItem
                icon="shield-checkmark"
                label="Crash Reporting"
                type="toggle"
                isEnabled={settingsStore.settings.crashReportingEnabled}
                onToggle={() => {
                  void handleToggleCrashReporting();
                }}
                delay={600}
                index={2}
                theme={theme}
              />
              <SettingItem
                icon="trash"
                label="Delete Account"
                type="arrow"
                onPress={() => {
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
                delay={600}
                index={3}
                theme={theme}
              />
            </View>
          </View>

          {/* Sign Out Button */}
          <Pressable
            style={styles.signOutButton}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
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
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

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
    backgroundColor: '#B47EFF',
  },
  ambientGold: {
    bottom: 100,
    left: -150,
    width: 350,
    height: 350,
    backgroundColor: '#FFD166',
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
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  profileCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.lg,
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    position: 'relative',
  },
  avatarGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
  },
  avatarInner: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 33,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
    marginHorizontal: Spacing.lg,
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  premiumCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  premiumDescription: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  premiumHealthRow: {
    marginTop: 10,
    gap: 8,
  },
  premiumHealthBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  premiumHealthBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  premiumHealthText: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(0, 0, 0, 0.72)',
  },
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
  quietHoursInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  quietHoursText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: Spacing.md,
  },
  signOutText: {
    fontSize: 15,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 120,
  },
  // Edit Profile Modal styles
  editIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 255, 165, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  // Achievements styles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06FFA5',
  },
  accountFootnote: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontSize: 13,
    lineHeight: 18,
  },
  achievementsList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  achievementBadge: {
    alignItems: 'center',
    width: 72,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  achievementMore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  achievementMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  noAchievements: {
    alignItems: 'center',
    padding: 24,
  },
  noAchievementsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noAchievementsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  nextToUnlock: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextToUnlockLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  nextAchievement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextAchievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  nextAchievementInfo: {
    flex: 1,
  },
  nextAchievementTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nextProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  nextProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  nextProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 12,
  },
});
