/**
 * ONB_002: Authority & Social Proof
 * Premium zen design with smooth animations
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { HeadlineText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { TESTIMONIALS } from '@/constants/onboarding';

export default function SocialProofScreen() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Animation values
  const metricScale = useSharedValue(0.9);
  const metricOpacity = useSharedValue(0);
  const badgesOpacity = useSharedValue(0);
  const testimonialOpacity = useSharedValue(1);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    // Entrance animations
    badgesOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing }));
    metricOpacity.value = withDelay(350, withTiming(1, { duration: 600, easing }));
    metricScale.value = withDelay(350, withTiming(1, { duration: 700, easing }));

    // Auto-advance after 8s
    const timer = setTimeout(() => {
      handleContinue();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const advanceTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  useEffect(() => {
    // Rotate testimonials every 3 seconds
    const interval = setInterval(() => {
      testimonialOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(advanceTestimonial)();
        testimonialOpacity.value = withTiming(1, { duration: 300 });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const badgesAnimatedStyle = useAnimatedStyle(() => ({
    opacity: badgesOpacity.value,
    transform: [{ translateY: interpolate(badgesOpacity.value, [0, 1], [20, 0]) }],
  }));

  const metricAnimatedStyle = useAnimatedStyle(() => ({
    opacity: metricOpacity.value,
    transform: [{ scale: metricScale.value }],
  }));

  const testimonialAnimatedStyle = useAnimatedStyle(() => ({
    opacity: testimonialOpacity.value,
  }));

  const handleContinue = () => {
    router.push('./value-promise');
  };

  return (
    <OnboardingLayout currentStep={2} ambientColor="purple">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Backed by science, loved by users
        </HeadlineText>

        {/* Authority Badges */}
        <Animated.View style={[styles.badgesContainer, badgesAnimatedStyle]}>
          <View style={styles.badge}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
            )}
            <View style={styles.badgeIconContainer}>
              <Text style={styles.badgeIcon}>⭐</Text>
            </View>
            <Text style={styles.badgeText}>4.8 stars</Text>
            <Text style={styles.badgeSubtext}>10K+ reviews</Text>
          </View>
          <View style={styles.badge}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
            )}
            <View style={styles.badgeIconContainer}>
              <Text style={styles.badgeIcon}>🏥</Text>
            </View>
            <Text style={styles.badgeText}>Expert-designed</Text>
            <Text style={styles.badgeSubtext}>By physiotherapists</Text>
          </View>
        </Animated.View>

        {/* Success Metric */}
        <Animated.View style={[styles.metricContainer, metricAnimatedStyle]}>
          <LinearGradient
            colors={[ZenColors.primary.glow, 'transparent']}
            style={styles.metricGlow}
          />
          <Text style={styles.metricValue}>89%</Text>
          <Text style={styles.metricLabel}>report less pain in 7 days</Text>
        </Animated.View>

        {/* Testimonial Carousel */}
        <Animated.View style={[styles.testimonialContainer, testimonialAnimatedStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
          )}
          <Text style={styles.testimonialQuote}>
            "{TESTIMONIALS[currentTestimonial].quote}"
          </Text>
          <Text style={styles.testimonialAuthor}>
            — {TESTIMONIALS[currentTestimonial].author}
          </Text>
          <View style={styles.dotsContainer}>
            {TESTIMONIALS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentTestimonial && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Real-time counter */}
        <View style={styles.liveCounter}>
          <View style={styles.liveDot} />
          <Text style={styles.liveCounterText}>
            2,847 breaks taken today
          </Text>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ZenSpacing.lg,
    gap: ZenSpacing.sm,
    marginTop: ZenSpacing.md,
  },
  badge: {
    alignItems: 'center',
    padding: ZenSpacing.md,
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    borderRadius: ZenRadius.lg,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: 'rgba(18, 18, 26, 0.92)',
    borderRadius: ZenRadius.lg,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: ZenRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ZenSpacing.sm,
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeText: {
    ...ZenTypography.label.medium,
    color: ZenColors.text.primary,
    textAlign: 'center',
    marginBottom: ZenSpacing.xxs,
  },
  badgeSubtext: {
    ...ZenTypography.body.small,
    color: ZenColors.text.secondary,
    textAlign: 'center',
  },
  metricContainer: {
    alignItems: 'center',
    marginVertical: ZenSpacing.lg,
    padding: ZenSpacing.xl,
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    borderWidth: 1,
    borderColor: ZenColors.primary.main,
    overflow: 'hidden',
  },
  metricGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  metricValue: {
    ...ZenTypography.display.large,
    color: ZenColors.primary.main,
    marginBottom: ZenSpacing.xs,
  },
  metricLabel: {
    ...ZenTypography.body.large,
    color: ZenColors.text.primary,
    textAlign: 'center',
  },
  testimonialContainer: {
    padding: ZenSpacing.lg,
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    borderRadius: ZenRadius.lg,
    marginBottom: ZenSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  testimonialQuote: {
    ...ZenTypography.body.large,
    color: ZenColors.text.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: ZenSpacing.sm,
    lineHeight: 26,
  },
  testimonialAuthor: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
    textAlign: 'center',
    marginBottom: ZenSpacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: ZenSpacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ZenColors.border.default,
  },
  dotActive: {
    backgroundColor: ZenColors.primary.main,
    width: 20,
  },
  liveCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ZenSpacing.sm,
    gap: ZenSpacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ZenColors.primary.main,
  },
  liveCounterText: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
  },
  spacer: {
    flex: 1,
  },
});
