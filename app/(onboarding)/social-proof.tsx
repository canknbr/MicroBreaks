/**
 * ONB_002: Authority & Social Proof
 * Builds trust with testimonials and authority signals
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';
import { TESTIMONIALS } from '@/constants/onboarding';

export default function SocialProofScreen() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    // Track analytics: onb_social_proof_viewed
    // console.log('[Analytics] onb_social_proof_viewed');

    // Auto-advance after 8s if no interaction
    const timer = setTimeout(() => {
      handleContinue();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Rotate testimonials every 3 seconds
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    // Track analytics: onb_authority_badges_viewed
    // console.log('[Analytics] onb_authority_badges_viewed');
    router.push('./value-promise');
  };

  return (
    <OnboardingLayout currentStep={2}>
      <View style={styles.container}>
        <Text style={styles.headline}>Backed by science, loved by users</Text>

        {/* Authority Badges */}
        <View style={styles.badgesContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>⭐</Text>
            <Text style={styles.badgeText}>4.8 stars</Text>
            <Text style={styles.badgeSubtext}>10K+ reviews</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🏥</Text>
            <Text style={styles.badgeText}>Expert-designed</Text>
            <Text style={styles.badgeSubtext}>By physiotherapists</Text>
          </View>
        </View>

        {/* Success Metric */}
        <View style={styles.metricContainer}>
          <Text style={styles.metricValue}>89%</Text>
          <Text style={styles.metricLabel}>report less pain in 7 days</Text>
        </View>

        {/* Testimonial Carousel */}
        <View style={styles.testimonialContainer}>
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
        </View>

        {/* Real-time counter */}
        <View style={styles.liveCounter}>
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
  headline: {
    ...Typography.headlineMedium,
    color: Colors.dark.text.primary,
    textAlign: 'center',
    marginVertical: Spacing.lg,
    fontWeight: '700',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  badge: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.dark.card.background,
    borderRadius: BorderRadius.card,
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.dark.border.default,
  },
  badgeIcon: {
    fontSize: 36,
    marginBottom: Spacing.xs,
  },
  badgeText: {
    ...Typography.bodyMediumBold,
    color: Colors.dark.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xxs,
  },
  badgeSubtext: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
  },
  metricContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.dark.card.background,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.dark.text.primary,
  },
  metricValue: {
    ...Typography.displayMedium,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.xs,
    fontWeight: '700',
  },
  metricLabel: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.primary,
    textAlign: 'center',
  },
  testimonialContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.dark.card.background,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border.default,
  },
  testimonialQuote: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  testimonialAuthor: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.border.default,
  },
  dotActive: {
    backgroundColor: Colors.dark.text.primary,
    width: 18,
  },
  liveCounter: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  liveCounterText: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
  },
  spacer: {
    flex: 1,
  },
});
