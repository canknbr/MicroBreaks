/**
 * ONB_012: AI Recommendation
 * Premium zen design with animated personalized plan
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { useOnboardingStore } from '@/store/onboardingStore';
import { generatePersonalizedPlan } from '@/services/recommendations/engine';

export default function RecommendationScreen() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state.data);
  const plan = generatePersonalizedPlan(onboardingData);

  const PLAN_ITEMS = [
    { icon: 'flag-outline', label: 'Primary concern', value: plan.primaryConcern },
    { icon: 'fitness-outline', label: 'Recommended focus', value: plan.recommendedFocus },
    { icon: 'time-outline', label: 'Optimal schedule', value: plan.optimalSchedule },
    { icon: 'trophy-outline', label: 'First week goal', value: plan.weekGoal },
  ];

  // Animation values
  const badgeScale = useSharedValue(0.9);
  const matchScale = useSharedValue(0.9);
  const matchGlow = useSharedValue(0);
  const planOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    badgeScale.value = withDelay(100, withTiming(1, { duration: 500, easing }));
    matchScale.value = withDelay(250, withTiming(1, { duration: 600, easing }));
    matchGlow.value = withDelay(400, withTiming(1, { duration: 700 }));
    planOpacity.value = withDelay(500, withTiming(1, { duration: 400, easing }));
    buttonsOpacity.value = withDelay(750, withTiming(1, { duration: 400, easing }));
  }, []);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
  }));

  const matchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: matchScale.value }],
  }));

  const matchGlowStyle = useAnimatedStyle(() => ({
    opacity: matchGlow.value * 0.6,
  }));

  const planAnimatedStyle = useAnimatedStyle(() => ({
    opacity: planOpacity.value,
    transform: [{ translateY: interpolate(planOpacity.value, [0, 1], [20, 0]) }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleTryBreak = () => {
    router.push('./break-demo');
  };

  const handleAdjust = () => {
    router.back();
  };

  return (
    <OnboardingLayout currentStep={12} ambientColor="gold">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
              <Ionicons name="sparkles" size={14} color={ZenColors.accent.main} />
              <Text style={styles.badgeText}>PERSONALIZED FOR YOU</Text>
            </Animated.View>
            <Text style={styles.headline}>
              Based on your profile, we recommend...
            </Text>
          </View>

          {/* Personalization Match */}
          <Animated.View style={[styles.matchContainer, matchAnimatedStyle]}>
            <Animated.View style={[styles.matchGlow, matchGlowStyle]}>
              <LinearGradient
                colors={[ZenColors.primary.main, 'transparent']}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <LinearGradient
              colors={[ZenColors.primary.glow, 'transparent']}
              style={styles.matchInnerGlow}
            />
            <Text style={styles.matchValue}>{plan.matchScore}%</Text>
            <Text style={styles.matchLabel}>match score</Text>
          </Animated.View>

          {/* Plan Details */}
          <Animated.View style={[styles.planContainer, planAnimatedStyle]}>
            {PLAN_ITEMS.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.planItem,
                  index === PLAN_ITEMS.length - 1 && styles.planItemLast,
                ]}
              >
                <View style={styles.planIconContainer}>
                  <Ionicons name={item.icon as any} size={20} color={ZenColors.primary.main} />
                </View>
                <View style={styles.planContent}>
                  <Text style={styles.planLabel}>{item.label}</Text>
                  <Text style={styles.planValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={buttonsAnimatedStyle}>
            <PrimaryButton
              title="Try Your First Break"
              onPress={handleTryBreak}
              size="large"
              variant="primary"
            />
            <SecondaryButton title="Adjust Plan" onPress={handleAdjust} variant="muted" />
          </Animated.View>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: ZenSpacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: ZenSpacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ZenSpacing.xxs,
    backgroundColor: ZenColors.background.card,
    paddingHorizontal: ZenSpacing.sm,
    paddingVertical: ZenSpacing.xs,
    borderRadius: ZenRadius.full,
    marginBottom: ZenSpacing.sm,
    borderWidth: 1,
    borderColor: ZenColors.accent.glow,
  },
  badgeText: {
    ...ZenTypography.caption,
    color: ZenColors.accent.main,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headline: {
    ...ZenTypography.headline.medium,
    color: ZenColors.text.primary,
    textAlign: 'center',
  },
  matchContainer: {
    alignItems: 'center',
    padding: ZenSpacing.xl,
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    marginBottom: ZenSpacing.lg,
    borderWidth: 2,
    borderColor: ZenColors.primary.main,
    overflow: 'hidden',
  },
  matchGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    height: 150,
    borderRadius: 75,
  },
  matchInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  matchValue: {
    ...ZenTypography.display.large,
    color: ZenColors.primary.main,
  },
  matchLabel: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
  },
  planContainer: {
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    padding: ZenSpacing.md,
    marginBottom: ZenSpacing.lg,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ZenSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ZenColors.border.subtle,
  },
  planItemLast: {
    borderBottomWidth: 0,
  },
  planIconContainer: {
    width: 40,
    height: 40,
    borderRadius: ZenRadius.md,
    backgroundColor: ZenColors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ZenSpacing.sm,
  },
  planContent: {
    flex: 1,
  },
  planLabel: {
    ...ZenTypography.caption,
    color: ZenColors.text.secondary,
  },
  planValue: {
    ...ZenTypography.title.medium,
    color: ZenColors.text.primary,
  },
});
