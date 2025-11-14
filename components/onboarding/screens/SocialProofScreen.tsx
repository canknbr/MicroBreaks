/**
 * Social Proof Screen (Screen 2)
 * Authority & Social Proof
 * Phase 1: Hook
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { OnboardingContainer } from '../OnboardingContainer';
import { OnboardingButton } from '../OnboardingButton';
import { ScreenHeader } from '../ScreenHeader';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { useColorScheme } from '../../../hooks/useColorScheme';

const TESTIMONIALS = [
  {
    id: 1,
    text: "My neck pain is gone after just one week!",
    author: "Sarah, Developer",
    rating: 5,
  },
  {
    id: 2,
    text: "Finally an app that actually works for desk workers.",
    author: "Mike, Designer",
    rating: 5,
  },
  {
    id: 3,
    text: "The reminders are gentle but effective.",
    author: "Emma, Manager",
    rating: 5,
  },
];

export const SocialProofScreen: React.FC = () => {
  const { goToNextScreen, progress } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const counterValue = useSharedValue(0);

  useEffect(() => {
    // Animate counter
    counterValue.value = withTiming(2847, { duration: 2000 });

    // Auto-advance after 8 seconds
    const timer = setTimeout(() => {
      goToNextScreen();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader
          emoji="⭐"
          title="Backed by science, loved by users"
          subtitle="Designed with physiotherapists"
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Rating Display */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={[
              styles.ratingCard,
              { backgroundColor: colors.background.secondary },
              Shadows.md,
            ]}
          >
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, index) => (
                <Text key={index} style={styles.star}>
                  ⭐
                </Text>
              ))}
            </View>
            <Text
              style={[
                styles.ratingText,
                Typography.headlineMedium,
                { color: colors.text.primary },
              ]}
            >
              4.8 out of 5
            </Text>
            <Text
              style={[
                styles.reviewCount,
                Typography.bodyMedium,
                { color: colors.text.secondary },
              ]}
            >
              Based on 10,000+ reviews
            </Text>
          </Animated.View>

          {/* Live Counter */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={[
              styles.counterCard,
              { backgroundColor: `${colors.brand.primary}15` },
              Shadows.sm,
            ]}
          >
            <Text
              style={[
                styles.counterNumber,
                Typography.displaySmall,
                { color: colors.brand.primary },
              ]}
            >
              2,847
            </Text>
            <Text
              style={[
                styles.counterLabel,
                Typography.bodyMedium,
                { color: colors.text.secondary },
              ]}
            >
              breaks taken today
            </Text>
          </Animated.View>

          {/* Success Metric */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(600)}
            style={[
              styles.metricCard,
              { backgroundColor: colors.background.secondary },
              Shadows.sm,
            ]}
          >
            <Text
              style={[
                styles.percentage,
                Typography.displaySmall,
                { color: colors.status.success },
              ]}
            >
              89%
            </Text>
            <Text
              style={[
                styles.metricText,
                Typography.bodyMedium,
                { color: colors.text.primary },
              ]}
            >
              report less pain in 7 days
            </Text>
          </Animated.View>

          {/* Testimonials */}
          <View style={styles.testimonials}>
            {TESTIMONIALS.map((testimonial, index) => (
              <Animated.View
                key={testimonial.id}
                entering={FadeInDown.delay(800 + index * 200).duration(600)}
                style={[
                  styles.testimonialCard,
                  { backgroundColor: colors.background.secondary },
                  Shadows.sm,
                ]}
              >
                <Text
                  style={[
                    styles.testimonialText,
                    Typography.bodyMedium,
                    { color: colors.text.primary },
                  ]}
                >
                  "{testimonial.text}"
                </Text>
                <Text
                  style={[
                    styles.testimonialAuthor,
                    Typography.bodySmall,
                    { color: colors.text.secondary },
                  ]}
                >
                  — {testimonial.author}
                </Text>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        <Animated.View
          entering={FadeInDown.delay(1400).duration(600)}
          style={styles.actions}
        >
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
          />
        </Animated.View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  ratingCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  star: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  ratingText: {
    marginBottom: 4,
  },
  reviewCount: {
    opacity: 0.7,
  },
  counterCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  counterNumber: {
    marginBottom: 4,
  },
  counterLabel: {
    opacity: 0.8,
  },
  metricCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  percentage: {
    marginBottom: 4,
  },
  metricText: {},
  testimonials: {
    gap: Spacing.sm,
  },
  testimonialCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
  },
  testimonialText: {
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  testimonialAuthor: {
    textAlign: 'right',
    opacity: 0.7,
  },
  actions: {
    marginTop: Spacing.lg,
  },
});
