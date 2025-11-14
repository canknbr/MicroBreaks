/**
 * ONB_014: Immediate Value Display
 * Show benefits of the break just completed
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

export default function ValueDisplayScreen() {
  const router = useRouter();

  useEffect(() => {
    // Track analytics: onb_value_displayed
    // console.log('[Analytics] onb_value_displayed');
  }, []);

  const handleContinue = () => {
    // Track analytics: onb_benefits_viewed
    // console.log('[Analytics] onb_benefits_viewed');
    router.push('./impact-education');
  };

  return (
    <OnboardingLayout currentStep={14}>
      <View style={styles.container}>
        <Text style={styles.headline}>That 30-second break just...</Text>

        {/* Benefits with animated counters */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>↓</Text>
            <Text style={styles.benefitText}>
              Reduced muscle tension by ~12%
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>↑</Text>
            <Text style={styles.benefitText}>
              Increased blood flow to your neck
            </Text>
          </View>

          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👁</Text>
            <Text style={styles.benefitText}>Gave your eyes a needed rest</Text>
          </View>
        </View>

        {/* Social proof */}
        <View style={styles.socialProof}>
          <Text style={styles.socialProofText}>
            You just joined <Text style={styles.highlight}>10,847 people</Text>{' '}
            taking a break right now
          </Text>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Your daily progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '10%' }]} />
          </View>
          <Text style={styles.progressText}>1 of 10 daily breaks</Text>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton title="Set Up My Breaks" onPress={handleContinue} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headline: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  benefitsContainer: {
    marginBottom: Spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background.secondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  benefitIcon: {
    fontSize: 32,
    marginRight: Spacing.xs,
    color: Colors.dark.brand.secondary,
  },
  benefitText: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.primary,
    flex: 1,
  },
  socialProof: {
    padding: Spacing.md,
    backgroundColor: Colors.dark.status.infoLight,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
  },
  socialProofText: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.primary,
    textAlign: 'center',
  },
  highlight: {
    ...Typography.bodyLargeBold,
    color: Colors.dark.brand.primary,
  },
  progressCard: {
    padding: Spacing.sm,
    backgroundColor: Colors.dark.background.secondary,
    borderRadius: BorderRadius.card,
  },
  progressLabel: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    marginBottom: Spacing.xxs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.dark.progress.background,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xxs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.progress.fill,
  },
  progressText: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
  },
  spacer: {
    flex: 1,
  },
});
