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
  TextInput,
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
import { useUserStore, useSettingsStore } from '@/store';
import { useAchievements } from '@/hooks/useAchievements';
import { useTheme } from '@/hooks/useTheme';

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

// Theme options
const THEME_OPTIONS: { label: string; value: 'dark' | 'light' | 'system' }[] = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
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
  theme,
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
  theme: ReturnType<typeof useTheme>;
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
      <Animated.View style={[
        styles.settingItem,
        { borderBottomColor: theme.border.subtle },
        animatedStyle,
        disabled && styles.settingItemDisabled,
      ]}>
        <View style={[styles.settingIcon, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border.subtle }]}>
          <Ionicons name={icon as any} size={20} color={disabled ? theme.text.muted : theme.text.secondary} />
        </View>
        <Text style={[styles.settingLabel, { color: theme.text.primary }, disabled && { color: theme.text.muted }]}>{label}</Text>
        {type === 'toggle' && (
          <Switch
            value={isEnabled}
            onValueChange={() => {
              Haptics.selectionAsync();
              onToggle?.();
            }}
            trackColor={{ false: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border.medium, true: theme.accent.primary }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border.medium}
            disabled={disabled}
          />
        )}
        {type === 'value' && (
          <Text style={[styles.settingValue, { color: theme.text.muted }]}>{value}</Text>
        )}
        {type === 'arrow' && (
          <Ionicons name="chevron-forward" size={20} color={theme.text.muted} />
        )}
      </Animated.View>
    </Pressable>
  );
}

// Avatar emoji options
const AVATAR_EMOJIS = ['😊', '😎', '🧘', '💪', '🌟', '🔥', '🎯', '🌈', '🦋', '🌸', '🍀', '⭐'];

// Edit Profile Modal
function EditProfileModal({
  visible,
  currentName,
  currentAvatar,
  onSave,
  onClose,
}: {
  visible: boolean;
  currentName: string;
  currentAvatar: string | null;
  onSave: (name: string, avatar: string | null) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState<string | null>(currentAvatar);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setAvatar(currentAvatar);
    }
  }, [visible, currentName, currentAvatar]);

  const handleSave = () => {
    if (name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave(name.trim(), avatar);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.editModalContent} onPress={(e) => e.stopPropagation()}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidModalFallback]} />
          )}
          <Text style={styles.modalTitle}>Edit Profile</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              maxLength={20}
              autoCapitalize="words"
            />
          </View>

          {/* Avatar Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Avatar</Text>
            <View style={styles.avatarGrid}>
              <Pressable
                style={[styles.avatarOption, !avatar && styles.avatarOptionActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAvatar(null);
                }}
              >
                <Text style={styles.avatarInitialOption}>{name.charAt(0).toUpperCase() || 'U'}</Text>
              </Pressable>
              {AVATAR_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[styles.avatarOption, avatar === emoji && styles.avatarOptionActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAvatar(emoji);
                  }}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
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

// Theme Picker Modal
function ThemePickerModal({
  visible,
  currentValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentValue: 'dark' | 'light' | 'system';
  onSelect: (value: 'dark' | 'light' | 'system') => void;
  onClose: () => void;
}) {
  const themeIcons: Record<string, string> = {
    dark: 'moon',
    light: 'sunny',
    system: 'phone-portrait',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidModalFallback]} />
          )}
          <Text style={styles.modalTitle}>App Theme</Text>
          <Text style={styles.modalSubtitle}>Choose your preferred appearance</Text>
          <View style={styles.intervalOptions}>
            {THEME_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.intervalOption,
                  styles.themeOption,
                  currentValue === option.value && styles.intervalOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Ionicons
                  name={themeIcons[option.value] as any}
                  size={20}
                  color={currentValue === option.value ? '#06FFA5' : 'rgba(255, 255, 255, 0.6)'}
                  style={styles.themeOptionIcon}
                />
                <Text
                  style={[
                    styles.intervalOptionText,
                    currentValue === option.value && styles.intervalOptionTextActive,
                  ]}
                >
                  {option.label}
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
  const updateProfile = useUserStore((state) => state.updateProfile);
  const signOut = useUserStore((state) => state.signOut);

  // Settings store
  const settingsStore = useSettingsStore();

  // Achievements
  const { unlockedAchievements, stats: achievementStats, nextToUnlock } = useAchievements();

  const [showIntervalPicker, setShowIntervalPicker] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const headerOpacity = useSharedValue(0);
  const profileScale = useSharedValue(0.9);
  const profileOpacity = useSharedValue(0);
  const premiumPulse = useSharedValue(1);

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

  const getThemeLabel = (theme: 'dark' | 'light' | 'system') => {
    switch (theme) {
      case 'dark': return 'Dark';
      case 'light': return 'Light';
      case 'system': return 'System';
    }
  };

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
          <Animated.View style={[
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
            {Platform.OS === 'ios' ? (
              <BlurView intensity={theme.isDark ? 25 : 80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card }]} />
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
              <View style={styles.profileStatItem}>
                <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.totalBreaks}</Text>
                <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Total Breaks</Text>
              </View>
              <View style={[styles.profileStatDivider, { backgroundColor: theme.border.subtle }]} />
              <View style={styles.profileStatItem}>
                <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.totalXP}</Text>
                <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Total XP</Text>
              </View>
              <View style={[styles.profileStatDivider, { backgroundColor: theme.border.subtle }]} />
              <View style={styles.profileStatItem}>
                <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.currentStreak}</Text>
                <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Day Streak</Text>
              </View>
            </View>
          </Animated.View>

          {/* Achievements Section */}
          <View style={styles.settingsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeader, { color: theme.text.muted }]}>ACHIEVEMENTS</Text>
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
              {Platform.OS === 'ios' ? (
                <BlurView intensity={theme.isDark ? 20 : 80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card }]} />
              )}

              {/* Recent Achievements */}
              {unlockedAchievements.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.achievementsList}
                >
                  {unlockedAchievements.slice(0, 5).map((achievement) => (
                    <View key={achievement.id} style={styles.achievementBadge}>
                      <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}20` }]}>
                        <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                      </View>
                      <Text style={styles.achievementTitle} numberOfLines={1}>
                        {achievement.title}
                      </Text>
                    </View>
                  ))}
                  {achievementStats.unlocked > 5 && (
                    <View style={styles.achievementMore}>
                      <Text style={styles.achievementMoreText}>
                        +{achievementStats.unlocked - 5}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              ) : (
                <View style={styles.noAchievements}>
                  <Text style={styles.noAchievementsIcon}>🏆</Text>
                  <Text style={styles.noAchievementsText}>
                    Complete breaks to earn achievements!
                  </Text>
                </View>
              )}

              {/* Next to Unlock */}
              {nextToUnlock.length > 0 && (
                <View style={styles.nextToUnlock}>
                  <Text style={styles.nextToUnlockLabel}>Next to unlock:</Text>
                  <View style={styles.nextAchievement}>
                    <Text style={styles.nextAchievementIcon}>{nextToUnlock[0].icon}</Text>
                    <View style={styles.nextAchievementInfo}>
                      <Text style={styles.nextAchievementTitle}>{nextToUnlock[0].title}</Text>
                      <View style={styles.nextProgressBar}>
                        <View
                          style={[
                            styles.nextProgressFill,
                            { width: `${nextToUnlock[0].progress}%`, backgroundColor: nextToUnlock[0].color },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.nextProgressText}>
                      {Math.round(nextToUnlock[0].progress)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

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
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]}>NOTIFICATIONS</Text>
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
              {Platform.OS === 'ios' ? (
                <BlurView intensity={theme.isDark ? 20 : 80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card }]} />
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
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]}>PREFERENCES</Text>
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
              {Platform.OS === 'ios' ? (
                <BlurView intensity={theme.isDark ? 20 : 80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card }]} />
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
            <Text style={[styles.sectionHeader, { color: theme.text.muted }]}>ABOUT</Text>
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
              {Platform.OS === 'ios' ? (
                <BlurView intensity={theme.isDark ? 20 : 80} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card }]} />
              )}
              <SettingItem
                icon="help-circle"
                label="Help & Support"
                type="arrow"
                delay={600}
                index={0}
                theme={theme}
              />
              <SettingItem
                icon="shield-checkmark"
                label="Privacy Policy"
                type="arrow"
                delay={600}
                index={1}
                theme={theme}
              />
              <SettingItem
                icon="document-text"
                label="Terms of Service"
                type="arrow"
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

          {/* Sign Out Button */}
          <Pressable
            style={styles.signOutButton}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out? Your progress will be reset.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      signOut();
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
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  themeOptionIcon: {
    marginRight: 12,
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
  editModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.lg,
  },
  inputContainer: {
    marginTop: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionActive: {
    borderColor: '#06FFA5',
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
  },
  avatarInitialOption: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#06FFA5',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(6, 255, 165, 0.3)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
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
