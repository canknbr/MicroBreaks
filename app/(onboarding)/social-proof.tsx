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
import { TESTIMONIALS } from './constants';

export default function SocialProofScreen() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    // Track analytics: onb_social_proof_viewed
    console.log('[Analytics] onb_social_proof_viewed');

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
    console.log('[Analytics] onb_authority_badges_viewed');
    router.push('/(onboarding)/value-promise');
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
            🟢 2,847 breaks taken today
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
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  badge: {
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.light.background.secondary,
    borderRadius: BorderRadius.card,
    flex: 1,
    marginHorizontal: Spacing.xxs,
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: Spacing.xxs,
  },
  badgeText: {
    ...Typography.bodyMediumBold,
    color: Colors.light.text.primary,
    textAlign: 'center',
  },
  badgeSubtext: {
    ...Typography.bodySmall,
    color: Colors.light.text.secondary,
    textAlign: 'center',
  },
  metricContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.light.status.successLight,
    borderRadius: BorderRadius.card,
  },
  metricValue: {
    ...Typography.displayMedium,
    color: Colors.light.status.success,
    marginBottom: Spacing.xxs,
  },
  metricLabel: {
    ...Typography.bodyLarge,
    color: Colors.light.text.primary,
    textAlign: 'center',
  },
  testimonialContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.light.background.secondary,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
  },
  testimonialQuote: {
    ...Typography.bodyLarge,
    color: Colors.light.text.primary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  testimonialAuthor: {
    ...Typography.bodyMedium,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xxs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.border.default,
  },
  dotActive: {
    backgroundColor: Colors.light.brand.primary,
    width: 18,
  },
  liveCounter: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  liveCounterText: {
    ...Typography.bodyMedium,
    color: Colors.light.text.secondary,
  },
  spacer: {
    flex: 1,
  },
});
