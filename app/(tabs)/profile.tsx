/**
 * Profile Screen - Settings, notifications, and premium
 * User profile and app configuration
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Switch,
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

// Mock user data
const USER_DATA = {
  name: 'User',
  level: 3,
  title: 'Committed Breaker',
  currentXP: 280,
  nextLevelXP: 500,
  totalBreaks: 156,
  memberSince: 'Dec 2024',
  isPremium: false,
};

// Level colors
const LEVEL_COLORS: Record<number, [string, string]> = {
  1: ['#9CA3AF', '#6B7280'],
  2: ['#06FFA5', '#00CC84'],
  3: ['#00E5FF', '#0099CC'],
  4: ['#B47EFF', '#9055E8'],
  5: ['#FFD166', '#FFAA00'],
};

// Settings sections
const SETTINGS_SECTIONS = [
  {
    title: 'Reminders',
    items: [
      { id: 'notifications', icon: 'notifications', label: 'Push Notifications', type: 'toggle' },
      { id: 'breakReminders', icon: 'alarm', label: 'Break Reminders', type: 'toggle' },
      { id: 'reminderInterval', icon: 'time', label: 'Reminder Interval', type: 'value', value: '25 min' },
      { id: 'quietHours', icon: 'moon', label: 'Quiet Hours', type: 'value', value: '10 PM - 8 AM' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'sounds', icon: 'volume-high', label: 'Sounds', type: 'toggle' },
      { id: 'haptics', icon: 'phone-portrait', label: 'Haptic Feedback', type: 'toggle' },
      { id: 'dailyGoal', icon: 'flag', label: 'Daily Goal', type: 'value', value: '8 breaks' },
      { id: 'workSchedule', icon: 'calendar', label: 'Work Schedule', type: 'arrow' },
    ],
  },
  {
    title: 'About',
    items: [
      { id: 'help', icon: 'help-circle', label: 'Help & Support', type: 'arrow' },
      { id: 'privacy', icon: 'shield-checkmark', label: 'Privacy Policy', type: 'arrow' },
      { id: 'terms', icon: 'document-text', label: 'Terms of Service', type: 'arrow' },
      { id: 'version', icon: 'information-circle', label: 'Version', type: 'value', value: '1.0.0' },
    ],
  },
];

// Setting Item Component
function SettingItem({
  item,
  index,
  delay,
  onToggle,
  isEnabled,
}: {
  item: typeof SETTINGS_SECTIONS[0]['items'][0];
  index: number;
  delay: number;
  onToggle?: (id: string) => void;
  isEnabled?: boolean;
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
    if (item.type !== 'toggle') {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (item.type !== 'toggle') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={item.type === 'toggle'}
    >
      <Animated.View style={[styles.settingItem, animatedStyle]}>
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon as any} size={20} color="rgba(255, 255, 255, 0.7)" />
        </View>
        <Text style={styles.settingLabel}>{item.label}</Text>
        {item.type === 'toggle' && (
          <Switch
            value={isEnabled}
            onValueChange={() => {
              Haptics.selectionAsync();
              onToggle?.(item.id);
            }}
            trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#06FFA5' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="rgba(255, 255, 255, 0.1)"
          />
        )}
        {item.type === 'value' && (
          <Text style={styles.settingValue}>{item.value}</Text>
        )}
        {item.type === 'arrow' && (
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.3)" />
        )}
      </Animated.View>
    </Pressable>
  );
}

// Settings Section Component
function SettingsSection({
  section,
  delay,
  toggleStates,
  onToggle,
}: {
  section: typeof SETTINGS_SECTIONS[0];
  delay: number;
  toggleStates: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, [delay]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.settingsSection}>
      <Animated.Text style={[styles.sectionHeader, headerStyle]}>
        {section.title}
      </Animated.Text>
      <View style={styles.sectionCard}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
        )}
        {section.items.map((item, index) => (
          <SettingItem
            key={item.id}
            item={item}
            index={index}
            delay={delay}
            onToggle={onToggle}
            isEnabled={toggleStates[item.id]}
          />
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    notifications: true,
    breakReminders: true,
    sounds: true,
    haptics: true,
  });

  const headerOpacity = useSharedValue(0);
  const profileScale = useSharedValue(0.9);
  const profileOpacity = useSharedValue(0);
  const premiumPulse = useSharedValue(1);

  const levelColors = LEVEL_COLORS[Math.min(USER_DATA.level, 5)] || LEVEL_COLORS[1];
  const progress = (USER_DATA.currentXP / USER_DATA.nextLevelXP) * 100;

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    profileOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    profileScale.value = withDelay(200, withSpring(1));

    // Premium card pulse
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

  const handleToggle = (id: string) => {
    setToggleStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePremiumPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Open premium');
  };

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
                  <Text style={styles.avatarText}>{USER_DATA.name[0]}</Text>
                </View>
                <View style={styles.levelBadge}>
                  <LinearGradient
                    colors={levelColors}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.levelText}>{USER_DATA.level}</Text>
                </View>
              </View>

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{USER_DATA.name}</Text>
                <Text style={styles.userTitle}>{USER_DATA.title}</Text>

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
                    {USER_DATA.currentXP}/{USER_DATA.nextLevelXP} XP
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.profileStats}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{USER_DATA.totalBreaks}</Text>
                <Text style={styles.profileStatLabel}>Total Breaks</Text>
              </View>
              <View style={styles.profileStatDivider} />
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatValue}>{USER_DATA.memberSince}</Text>
                <Text style={styles.profileStatLabel}>Member Since</Text>
              </View>
            </View>
          </Animated.View>

          {/* Premium Card */}
          {!USER_DATA.isPremium && (
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
          )}

          {/* Settings Sections */}
          {SETTINGS_SECTIONS.map((section, index) => (
            <SettingsSection
              key={section.title}
              section={section}
              delay={400 + index * 100}
              toggleStates={toggleStates}
              onToggle={handleToggle}
            />
          ))}

          {/* Sign Out Button */}
          <Pressable style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
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
  settingValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
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
});
