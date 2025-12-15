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
  Switch,
  Alert,
  Modal,
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
import { useNotifications } from '@/hooks/useNotifications';
import { getUserStats } from '@/services/breakHistory';

// Level colors
const LEVEL_COLORS: Record<number, [string, string]> = {
  1: ['#9CA3AF', '#6B7280'],
  2: ['#06FFA5', '#00CC84'],
  3: ['#00E5FF', '#0099CC'],
  4: ['#B47EFF', '#9055E8'],
  5: ['#FFD166', '#FFAA00'],
};

// Level titles
const LEVEL_TITLES: Record<number, string> = {
  1: 'Wellness Beginner',
  2: 'Break Enthusiast',
  3: 'Committed Breaker',
  4: 'Wellness Warrior',
  5: 'Break Master',
};

// Reminder interval options
const REMINDER_INTERVALS = [
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

// Setting Item Component
function SettingItem({
  icon,
  label,
  type,
  value,
  isEnabled,
  onToggle,
  onPress,
  delay,
  index,
  disabled,
}: {
  icon: string;
  label: string;
  type: 'toggle' | 'value' | 'arrow';
  value?: string;
  isEnabled?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
  delay: number;
  index: number;
  disabled?: boolean;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay + index * 50, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(delay + index * 50, withTiming(0, { duration: 400 }));
  }, [delay, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (type !== 'toggle') {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (type !== 'toggle' && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={type === 'toggle' || disabled}
    >
      <Animated.View style={[styles.settingItem, animatedStyle, disabled && styles.settingItemDisabled]}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon as any} size={20} color={disabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.7)'} />
        </View>
        <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>{label}</Text>
        {type === 'toggle' && (
          <Switch
            value={isEnabled}
            onValueChange={() => {
              Haptics.selectionAsync();
              onToggle?.();
            }}
            trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#06FFA5' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="rgba(255, 255, 255, 0.1)"
            disabled={disabled}
          />
        )}
        {type === 'value' && (
          <Text style={styles.settingValue}>{value}</Text>
        )}
        {type === 'arrow' && (
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
        )}
      </Animated.View>
    </Pressable>
  );
}

// Interval Picker Modal
function IntervalPickerModal({
  visible,
  currentValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentValue: number;
  onSelect: (value: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidModalFallback]} />
          )}
          <Text style={styles.modalTitle}>Reminder Interval</Text>
          <Text style={styles.modalSubtitle}>How often should we remind you?</Text>
          <View style={styles.intervalOptions}>
            {REMINDER_INTERVALS.map((interval) => (
              <Pressable
                key={interval.value}
                style={[
                  styles.intervalOption,
                  currentValue === interval.value && styles.intervalOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(interval.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.intervalOptionText,
                    currentValue === interval.value && styles.intervalOptionTextActive,
                  ]}
                >
                  {interval.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

export default function ProfileScreen() {
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

  const [userStats, setUserStats] = useState({ level: 1, totalXP: 0, totalBreaks: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);

  const headerOpacity = useSharedValue(0);
  const profileScale = useSharedValue(0.9);
  const profileOpacity = useSharedValue(0);
  const premiumPulse = useSharedValue(1);

  const level = Math.min(userStats.level, 5);
  const levelColors = LEVEL_COLORS[level] || LEVEL_COLORS[1];
  const levelTitle = LEVEL_TITLES[level] || LEVEL_TITLES[1];
  const currentXP = userStats.totalXP % 100;
  const progress = currentXP;

  // Load user stats
  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    const stats = await getUserStats();
    setUserStats({
      level: stats.level,
      totalXP: stats.totalXP,
      totalBreaks: stats.totalBreaks,
    });
  };

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
  }, []);

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
    console.log('Open premium');
  };

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

  return (
    <View style={styles.container}>
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
            <Text style={styles.title}>Profile</Text>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View style={[styles.profileCard, profileStyle]}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
            )}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'transparent']}
              style={styles.cardHighlight}
            />

            <View style={styles.profileContent}>
              {/* Avatar with Level */}
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={levelColors}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>C</Text>
                </View>
                <View style={styles.levelBadge}>
                  <LinearGradient
                    colors={levelColors}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.levelText}>{level}</Text>
                </View>
              </View>

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Can</Text>
                <Text style={styles.userTitle}>{levelTitle}</Text>

                {/* XP Progress */}
                <View style={styles.xpContainer}>
                  <View style={styles.xpTrack}>
                    <View style={[styles.xpFill, { width: `${progress}%` }]}>
                      <LinearGradient
                        colors={levelColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>
                  </View>
                  <Text style={styles.xpText}>
                    {currentXP}/100 XP
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.profileStats}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{userStats.totalBreaks}</Text>
                <Text style={styles.profileStatLabel}>Total Breaks</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{userStats.totalXP}</Text>
                <Text style={styles.profileStatLabel}>Total XP</Text>
              </View>
            </View>
          </Animated.View>

          {/* Premium Card */}
          <Pressable onPress={handlePremiumPress}>
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
                  <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumDescription}>
                    Unlock all breaks, advanced stats & more
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </View>
            </Animated.View>
          </Pressable>

          {/* Notifications Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
            <View style={styles.sectionCard}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
              )}
              <SettingItem
                icon="notifications"
                label="Push Notifications"
                type="toggle"
                isEnabled={settings.enabled}
                onToggle={handleNotificationToggle}
                delay={400}
                index={0}
              />
              <SettingItem
                icon="alarm"
                label="Break Reminders"
                type="toggle"
                isEnabled={settings.breakReminders}
                onToggle={toggleBreakReminders}
                delay={400}
                index={1}
                disabled={notificationsDisabled}
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
            <Text style={styles.sectionHeader}>PREFERENCES</Text>
            <View style={styles.sectionCard}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
              )}
              <SettingItem
                icon="volume-high"
                label="Sounds"
                type="toggle"
                isEnabled={soundEnabled}
                onToggle={() => setSoundEnabled(!soundEnabled)}
                delay={500}
                index={0}
              />
              <SettingItem
                icon="phone-portrait"
                label="Haptic Feedback"
                type="toggle"
                isEnabled={hapticsEnabled}
                onToggle={() => setHapticsEnabled(!hapticsEnabled)}
                delay={500}
                index={1}
              />
            </View>
          </View>

          {/* About Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionHeader}>ABOUT</Text>
            <View style={styles.sectionCard}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
              )}
              <SettingItem
                icon="help-circle"
                label="Help & Support"
                type="arrow"
                delay={600}
                index={0}
              />
              <SettingItem
                icon="shield-checkmark"
                label="Privacy Policy"
                type="arrow"
                delay={600}
                index={1}
              />
              <SettingItem
                icon="document-text"
                label="Terms of Service"
                type="arrow"
                delay={600}
                index={2}
              />
              <SettingItem
                icon="information-circle"
                label="Version"
                type="value"
                value="1.0.0"
                delay={600}
                index={3}
              />
            </View>
          </View>

          {/* Sign Out Button */}
          <Pressable style={styles.signOutButton}>
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
  androidCardFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  settingLabelDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  settingValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.lg,
  },
  androidModalFallback: {
    backgroundColor: 'rgba(30, 30, 40, 0.98)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  intervalOptions: {
    gap: 10,
  },
  intervalOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  intervalOptionActive: {
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    borderWidth: 1,
    borderColor: '#06FFA5',
  },
  intervalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  intervalOptionTextActive: {
    color: '#06FFA5',
  },
});
