/**
 * ONB_012: AI Recommendation
 * Show personalized plan based on user profile
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

export default function RecommendationScreen() {
  const router = useRouter();

  useEffect(() => {
    // Track analytics: onb_recommendation_viewed
    // console.log('[Analytics] onb_recommendation_viewed');
  }, []);

  const handleTryBreak = () => {
    // Track analytics: onb_recommendation_accepted
    // console.log('[Analytics] onb_recommendation_accepted');
    router.push('./break-demo');
  };

  const handleAdjust = () => {
    // Track analytics: onb_recommendation_adjusted
    // console.log('[Analytics] onb_recommendation_adjusted');
    // Navigate back to adjust settings
    router.back();
  };

  return (
    <OnboardingLayout currentStep={12}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.badge}>✨ PERSONALIZED FOR YOU</Text>
          <Text style={styles.headline}>
            Based on your profile, we recommend...
          </Text>
        </View>

        {/* Personalization Match */}
        <View style={styles.matchContainer}>
          <Text style={styles.matchValue}>87%</Text>
          <Text style={styles.matchLabel}>match score</Text>
        </View>

        {/* Plan Details */}
        <View style={styles.planContainer}>
          <View style={styles.planItem}>
            <Text style={styles.planIcon}>🎯</Text>
            <View style={styles.planContent}>
              <Text style={styles.planLabel}>Primary concern</Text>
              <Text style={styles.planValue}>Neck & shoulder pain</Text>
            </View>
          </View>

          <View style={styles.planItem}>
            <Text style={styles.planIcon}>💪</Text>
            <View style={styles.planContent}>
              <Text style={styles.planLabel}>Recommended focus</Text>
              <Text style={styles.planValue}>Posture exercises</Text>
            </View>
          </View>

          <View style={styles.planItem}>
            <Text style={styles.planIcon}>⏱️</Text>
            <View style={styles.planContent}>
              <Text style={styles.planLabel}>Optimal schedule</Text>
              <Text style={styles.planValue}>25-min work, 2-min breaks</Text>
            </View>
          </View>

          <View style={styles.planItem}>
            <Text style={styles.planIcon}>🎯</Text>
            <View style={styles.planContent}>
              <Text style={styles.planLabel}>First week goal</Text>
              <Text style={styles.planValue}>Build consistency</Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton title="Try Your First Break" onPress={handleTryBreak} />
        <SecondaryButton title="Adjust Plan" onPress={handleAdjust} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  badge: {
    ...Typography.labelSmall,
    color: Colors.dark.brand.accent,
    backgroundColor: Colors.dark.background.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
    fontWeight: 'bold',
  },
  headline: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  matchContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.dark.card.background,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.dark.brand.primary,
  },
  matchValue: {
    ...Typography.displayLarge,
    color: Colors.dark.status.success,
    fontWeight: 'bold',
  },
  matchLabel: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
  },
  planContainer: {
    backgroundColor: Colors.dark.card.background,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border.default,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border.light,
  },
  planIcon: {
    fontSize: 32,
    marginRight: Spacing.xs,
  },
  planContent: {
    flex: 1,
  },
  planLabel: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
  },
  planValue: {
    ...Typography.bodyLargeBold,
    color: Colors.dark.text.primary,
  },
  spacer: {
    flex: 1,
  },
});
