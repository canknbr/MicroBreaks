/**
 * ONB_020: Premium Soft Pitch
 * Value comparison and trial offer
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';
import { PREMIUM_FEATURES } from '@/constants/onboarding';

export default function PremiumPitchScreen() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(24 * 60); // 24 hours in minutes

  useEffect(() => {
    // Track analytics: onb_paywall_displayed
    // console.log('[Analytics] onb_paywall_displayed');
  }, []);

  const handleStartTrial = () => {
    // Track analytics: onb_trial_started
    // console.log('[Analytics] onb_trial_started');
    router.push('./completion');
  };

  const handleContinueFree = () => {
    // Track analytics: onb_paywall_dismissed
    // console.log('[Analytics] onb_paywall_dismissed');
    router.push('./completion');
  };

  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 60);
    return `${hours} hours`;
  };

  return (
    <OnboardingLayout currentStep={20}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.badge}>LIMITED TIME OFFER</Text>
          <Text style={styles.headline}>Your personalized plan is ready!</Text>
        </View>

        {/* Comparison Table */}
        <View style={styles.comparison}>
          <View style={styles.comparisonHeader}>
            <View style={styles.comparisonLabel} />
            <View style={styles.comparisonColumn}>
              <Text style={styles.columnTitle}>Free</Text>
            </View>
            <View style={[styles.comparisonColumn, styles.premiumColumn]}>
              <Text style={[styles.columnTitle, styles.premiumTitle]}>
                Premium
              </Text>
            </View>
          </View>

          {PREMIUM_FEATURES.map((item, index) => (
            <View key={index} style={styles.comparisonRow}>
              <View style={styles.featureLabel}>
                <Text style={styles.featureName}>{item.feature}</Text>
              </View>
              <View style={styles.comparisonColumn}>
                <Text style={styles.featureValue}>
                  {typeof item.free === 'boolean'
                    ? item.free
                      ? '✅'
                      : '❌'
                    : item.free}
                </Text>
              </View>
              <View style={styles.comparisonColumn}>
                <Text style={styles.featureValue}>
                  {typeof item.premium === 'boolean'
                    ? item.premium
                      ? '✅'
                      : '❌'
                    : item.premium}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Special Offer */}
        <View style={styles.offerCard}>
          <Text style={styles.offerTitle}>🎉 Special Offer</Text>
          <Text style={styles.offerPrice}>7-day free trial</Text>
          <Text style={styles.offerDetails}>
            Then $4.99/month • Cancel anytime
          </Text>
          <View style={styles.urgencyBadge}>
            <Text style={styles.urgencyText}>
              50% off first month - Expires in {formatTimeLeft()}
            </Text>
          </View>
        </View>

        {/* Social Proof */}
        <View style={styles.socialProof}>
          <Text style={styles.socialProofText}>
            Join <Text style={styles.highlight}>100,000+</Text> users who chose
            Premium
          </Text>
        </View>

        <PrimaryButton
          title="Start 7-Day Free Trial"
          onPress={handleStartTrial}
          style={styles.primaryButton}
        />
        <SecondaryButton
          title="Continue with Free"
          onPress={handleContinueFree}
        />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingBottom: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  badge: {
    ...Typography.labelSmall,
    color: Colors.dark.status.error,
    backgroundColor: Colors.dark.status.errorLight,
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
  comparison: {
    backgroundColor: Colors.dark.background.secondary,
    borderRadius: BorderRadius.card,
    padding: Spacing.xs,
    marginBottom: Spacing.md,
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.border.default,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border.light,
  },
  comparisonLabel: {
    flex: 2,
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumColumn: {
    backgroundColor: Colors.dark.status.infoLight,
    borderRadius: BorderRadius.sm,
    marginVertical: -Spacing.xxs,
  },
  columnTitle: {
    ...Typography.bodyMediumBold,
    color: Colors.dark.text.primary,
  },
  premiumTitle: {
    color: Colors.dark.brand.primary,
  },
  featureLabel: {
    flex: 2,
    justifyContent: 'center',
  },
  featureName: {
    ...Typography.bodySmall,
    color: Colors.dark.text.primary,
  },
  featureValue: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.primary,
  },
  offerCard: {
    backgroundColor: Colors.dark.brand.primary,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  offerTitle: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.inverse,
    marginBottom: Spacing.xxs,
  },
  offerPrice: {
    ...Typography.headlineMedium,
    color: Colors.dark.text.inverse,
    fontWeight: 'bold',
    marginBottom: Spacing.xxs,
  },
  offerDetails: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.inverse,
    marginBottom: Spacing.sm,
  },
  urgencyBadge: {
    backgroundColor: Colors.dark.status.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.full,
  },
  urgencyText: {
    ...Typography.bodySmall,
    color: Colors.dark.text.primary,
    fontWeight: 'bold',
  },
  socialProof: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  socialProofText: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
  },
  highlight: {
    ...Typography.bodyMediumBold,
    color: Colors.dark.brand.primary,
  },
  primaryButton: {
    marginBottom: Spacing.xs,
  },
});
