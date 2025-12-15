/**
 * ONB_014: Immediate Value Display
 * Premium zen design with smooth animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { HeadlineText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';

const BENEFITS = [
  { icon: 'trending-down-outline', text: 'Reduced muscle tension by ~12%', color: ZenColors.primary.main },
  { icon: 'pulse-outline', text: 'Increased blood flow to your neck', color: ZenColors.secondary.main },
  { icon: 'eye-outline', text: 'Gave your eyes a needed rest', color: ZenColors.accent.main },
];

// Separate component to avoid hook violations
function BenefitItem({ benefit, index }: { benefit: typeof BENEFITS[0]; index: number }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      200 + index * 100,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: interpolate(opacity.value, [0, 1], [-20, 0]) }],
  }));

  return (
    <Animated.View style={[styles.benefitItem, animatedStyle]}>
      <View style={[styles.benefitIconContainer, { backgroundColor: benefit.color + '20' }]}>
        <Ionicons name={benefit.icon as any} size={24} color={benefit.color} />
      </View>
      <Text style={styles.benefitText}>{benefit.text}</Text>
    </Animated.View>
  );
}

export default function ValueDisplayScreen() {
  const router = useRouter();

  // Animation values
  const socialOpacity = useSharedValue(0);
  const progressOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    socialOpacity.value = withDelay(500, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    progressOpacity.value = withDelay(650, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const socialAnimatedStyle = useAnimatedStyle(() => ({
    opacity: socialOpacity.value,
    transform: [{ translateY: interpolate(socialOpacity.value, [0, 1], [10, 0]) }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progressOpacity.value,
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleContinue = () => {
    router.push('./impact-education');
  };

  return (
    <OnboardingLayout currentStep={14} ambientColor="teal">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          That 30-second break just...
        </HeadlineText>

        {/* Benefits with animated entries */}
        <View style={styles.benefitsContainer}>
          {BENEFITS.map((benefit, index) => (
            <BenefitItem key={index} benefit={benefit} index={index} />
          ))}
        </View>

        {/* Social proof */}
        <Animated.View style={[styles.socialProof, socialAnimatedStyle]}>
          <LinearGradient
            colors={[ZenColors.primary.glow, 'transparent']}
            style={styles.socialGlow}
          />
          <View style={styles.socialDot} />
          <Text style={styles.socialProofText}>
            You just joined <Text style={styles.highlight}>10,847 people</Text> taking a break right now
          </Text>
        </Animated.View>

        {/* Progress indicator */}
        <Animated.View style={[styles.progressCard, progressAnimatedStyle]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Your daily progress</Text>
            <Text style={styles.progressValue}>1/10</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[ZenColors.primary.main, ZenColors.secondary.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '10%' }]}
            />
          </View>
          <Text style={styles.progressText}>Great start! Keep it up</Text>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View style={buttonsAnimatedStyle}>
          <PrimaryButton title="Set Up My Breaks" onPress={handleContinue} size="large" />
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  benefitsContainer: {
    marginTop: ZenSpacing.lg,
    marginBottom: ZenSpacing.lg,
    gap: ZenSpacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZenColors.background.card,
    padding: ZenSpacing.md,
    borderRadius: ZenRadius.lg,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: ZenRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ZenSpacing.sm,
  },
  benefitText: {
    ...ZenTypography.body.large,
    color: ZenColors.text.primary,
    flex: 1,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ZenSpacing.md,
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    marginBottom: ZenSpacing.md,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
    overflow: 'hidden',
  },
  socialGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  socialDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ZenColors.primary.main,
    marginRight: ZenSpacing.sm,
  },
  socialProofText: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.primary,
    flex: 1,
  },
  highlight: {
    ...ZenTypography.label.medium,
    color: ZenColors.primary.main,
  },
  progressCard: {
    padding: ZenSpacing.md,
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ZenSpacing.sm,
  },
  progressLabel: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
  },
  progressValue: {
    ...ZenTypography.label.large,
    color: ZenColors.primary.main,
  },
  progressBar: {
    height: 8,
    backgroundColor: ZenColors.background.elevated,
    borderRadius: ZenRadius.full,
    marginBottom: ZenSpacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: ZenRadius.full,
  },
  progressText: {
    ...ZenTypography.body.small,
    color: ZenColors.text.secondary,
  },
  spacer: {
    flex: 1,
  },
});
