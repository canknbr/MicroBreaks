/**
 * ONB_021: Completion Celebration
 * Premium zen celebration screen with animations
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { useOnboardingStore, useUserStore, useNotificationStore } from '@/store';

export default function CompletionScreen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const onboardingData = useOnboardingStore((s) => s.data);

  // User store actions
  const setWeeklyGoal = useUserStore((s) => s.setWeeklyGoal);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const unlockAchievement = useUserStore((s) => s.unlockAchievement);
  const addXP = useUserStore((s) => s.addXP);

  // Notification store
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Animation values
  const celebrationScale = useSharedValue(0.9);
  const celebrationOpacity = useSharedValue(0);
  const badgeRotate = useSharedValue(0);
  const badgeScale = useSharedValue(0.9);
  const ringProgress = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  // Confetti animation
  const confettiAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);

    // Celebration emoji - smooth entrance
    celebrationOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing }));
    celebrationScale.value = withDelay(200, withTiming(1, { duration: 600, easing }));

    // Badge entrance with subtle rotation
    badgeScale.value = withDelay(400, withTiming(1, { duration: 600, easing }));
    badgeRotate.value = withDelay(
      400,
      withSequence(
        withTiming(-5, { duration: 150 }),
        withTiming(0, { duration: 300, easing })
      )
    );

    // Ring progress animation
    ringProgress.value = withDelay(600, withTiming(100, { duration: 1200, easing }));

    // Cards fade in
    cardsOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));

    // Buttons fade in
    buttonsOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));

    // Confetti loop
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(confettiAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => confettiAnim.stopAnimation();
  }, [
    badgeRotate,
    badgeScale,
    buttonsOpacity,
    cardsOpacity,
    celebrationOpacity,
    celebrationScale,
    confettiAnim,
    ringProgress,
  ]);

  const celebrationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: celebrationOpacity.value,
    transform: [{ scale: celebrationScale.value }],
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotate.value}deg` },
    ],
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: interpolate(cardsOpacity.value, [0, 1], [20, 0]) }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(ringProgress.value, [0, 20], [0, 1]),
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleGoToDashboard = () => {
    // Sync onboarding data with user store
    syncOnboardingData();

    // Mark onboarding as complete
    completeOnboarding();

    // Navigate to main app
    router.replace('/(tabs)');
  };

  const syncOnboardingData = () => {
    // Calculate weekly goal based on break interval
    // Default: 25 min interval = ~16 breaks per 8-hour day = ~80 breaks per week
    // We'll use a more reasonable 5 breaks per day as default
    const breakInterval = onboardingData.breakInterval || 25;
    const breaksPerHour = 60 / breakInterval;
    const breaksPerDay = Math.round(breaksPerHour * 8); // 8-hour workday
    const weeklyGoal = Math.max(breaksPerDay * 5, 20); // 5 work days, minimum 20

    setWeeklyGoal(weeklyGoal);

    // Update profile with joined date
    updateProfile({
      joinedAt: new Date().toISOString(),
    });

    // Unlock first achievement - "Health Pioneer" for completing onboarding
    unlockAchievement('health-pioneer');
    addXP(25); // Bonus XP for completing onboarding

    // Create welcome notification
    addNotification({
      type: 'welcome',
      title: 'Welcome to MicroBreaks!',
      message: 'Your wellness journey starts now. Take your first break to earn XP!',
      icon: '🎉',
      color: '#06FFA5',
    });

    // Create achievement notification
    addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'Health Pioneer: Completed your wellness setup. +25 XP',
      icon: '🏆',
      color: '#FFD166',
      data: { achievementTitle: 'Health Pioneer', xpReward: 25 },
    });
  };

  return (
    <OnboardingLayout currentStep={21} showProgress={false} ambientColor="gold">
      <View style={styles.container}>
        {/* Celebration */}
        <View style={styles.celebrationContainer}>
          <Animated.Text style={[styles.celebration, celebrationAnimatedStyle]}>
            🎉
          </Animated.Text>
          <Text style={styles.headline}>You&apos;re all set!</Text>
          <Text style={styles.subheadline}>Your wellness journey begins now</Text>
        </View>

        {/* Achievement Badge */}
        <Animated.View style={[styles.badgeContainer, badgeAnimatedStyle]}>
          <LinearGradient
            colors={[ZenColors.accent.glow, 'transparent']}
            style={styles.badgeGlow}
          />
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🏆</Text>
            <Text style={styles.badgeTitle}>Health Pioneer</Text>
            <Text style={styles.badgeSubtext}>First badge earned</Text>
          </View>
        </Animated.View>

        {/* Summary Cards */}
        <Animated.View style={[styles.summaryContainer, cardsAnimatedStyle]}>
          <View style={styles.summaryCard}>
            <Ionicons name="time-outline" size={28} color={ZenColors.primary.main} />
            <Text style={styles.summaryValue}>50 min</Text>
            <Text style={styles.summaryLabel}>First break in</Text>
          </View>

          <View style={styles.summaryCard}>
            <Ionicons name="trending-up-outline" size={28} color={ZenColors.secondary.main} />
            <Text style={styles.summaryValue}>Starting</Text>
            <Text style={styles.summaryLabel}>Health score</Text>
          </View>

          <View style={styles.summaryCard}>
            <Ionicons name="flag-outline" size={28} color={ZenColors.accent.main} />
            <Text style={styles.summaryValue}>10</Text>
            <Text style={styles.summaryLabel}>Weekly goal</Text>
          </View>
        </Animated.View>

        {/* Progress Ring */}
        <Animated.View style={[styles.progressContainer, ringAnimatedStyle]}>
          <View style={styles.progressRing}>
            <LinearGradient
              colors={[ZenColors.primary.main, ZenColors.secondary.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ringGradient}
            />
            <View style={styles.ringInner}>
              <Text style={styles.progressValue}>0%</Text>
              <Text style={styles.progressSubtext}>Complete</Text>
            </View>
          </View>
          <Text style={styles.progressLabel}>
            Your journey to better health starts now
          </Text>
        </Animated.View>

        {/* Tip */}
        <View style={styles.tipContainer}>
          <Ionicons name="bulb-outline" size={18} color={ZenColors.accent.main} />
          <Text style={styles.tipText}>Keep the app open for best results</Text>
        </View>

        <View style={styles.spacer} />

        <Animated.View style={buttonsAnimatedStyle}>
          <PrimaryButton
            title="Go to Dashboard"
            onPress={handleGoToDashboard}
            size="large"
            variant="primary"
          />
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginTop: ZenSpacing.lg,
    marginBottom: ZenSpacing.lg,
  },
  celebration: {
    fontSize: 72,
    marginBottom: ZenSpacing.sm,
  },
  headline: {
    ...ZenTypography.display.medium,
    color: ZenColors.text.primary,
    marginBottom: ZenSpacing.xs,
  },
  subheadline: {
    ...ZenTypography.body.large,
    color: ZenColors.text.secondary,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: ZenSpacing.lg,
  },
  badgeGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -40,
  },
  badge: {
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    padding: ZenSpacing.lg,
    alignItems: 'center',
    width: '80%',
    borderWidth: 2,
    borderColor: ZenColors.accent.main,
    shadowColor: ZenColors.accent.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: ZenSpacing.xs,
  },
  badgeTitle: {
    ...ZenTypography.title.large,
    color: ZenColors.text.primary,
    marginBottom: ZenSpacing.xxs,
  },
  badgeSubtext: {
    ...ZenTypography.body.small,
    color: ZenColors.text.secondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ZenSpacing.lg,
    gap: ZenSpacing.xs,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.lg,
    padding: ZenSpacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  summaryValue: {
    ...ZenTypography.title.medium,
    color: ZenColors.text.primary,
    marginTop: ZenSpacing.xs,
    marginBottom: 2,
  },
  summaryLabel: {
    ...ZenTypography.caption,
    color: ZenColors.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: ZenSpacing.md,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    marginBottom: ZenSpacing.sm,
  },
  ringGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
  },
  ringInner: {
    flex: 1,
    backgroundColor: ZenColors.background.pure,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    ...ZenTypography.headline.large,
    color: ZenColors.text.primary,
  },
  progressSubtext: {
    ...ZenTypography.caption,
    color: ZenColors.text.muted,
  },
  progressLabel: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: ZenSpacing.md,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ZenColors.background.card,
    padding: ZenSpacing.sm,
    borderRadius: ZenRadius.md,
    gap: ZenSpacing.xs,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  tipText: {
    ...ZenTypography.body.small,
    color: ZenColors.text.primary,
  },
  spacer: {
    flex: 1,
  },
});
