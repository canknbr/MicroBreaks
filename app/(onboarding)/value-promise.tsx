/**
 * ONB_003: Value Promise & Expectation Setting
 * Sets expectations for onboarding and highlights key benefits
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

const BENEFITS = [
  {
    icon: '🎯',
    title: 'Personalized exercises',
    description: 'Tailored for your specific pain points',
  },
  {
    icon: '🔔',
    title: 'Smart reminders',
    description: 'That respect your flow state',
  },
  {
    icon: '📊',
    title: 'Track improvements',
    description: 'Monitor your health progress',
  },
];

export default function ValuePromiseScreen() {
  const router = useRouter();

  useEffect(() => {
    // Track analytics: onb_value_prop_viewed
    console.log('[Analytics] onb_value_prop_viewed');
  }, []);

  const handlePersonalize = () => {
    // Track analytics: onb_personalization_started
    console.log('[Analytics] onb_personalization_started');
    router.push('/(onboarding)/work-role');
  };

  return (
    <OnboardingLayout currentStep={3}>
      <View style={styles.container}>
        <Text style={styles.headline}>3 minutes to a healthier workday</Text>

        <Text style={styles.subhead}>
          Quick setup to personalize your break experience
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Text style={styles.benefitIconText}>{benefit.icon}</Text>
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Trust signals */}
        <View style={styles.trustSignals}>
          <Text style={styles.trustText}>✓ Quick setup</Text>
          <Text style={styles.trustText}>✓ No spam</Text>
          <Text style={styles.trustText}>✓ Cancel anytime</Text>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton title="Personalize My Plan" onPress={handlePersonalize} />
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
  subhead: {
    ...Typography.bodyLarge,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  benefitsContainer: {
    marginBottom: Spacing.lg,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.background.secondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.xs,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.light.background.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  benefitIconText: {
    fontSize: 24,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...Typography.bodyLargeBold,
    color: Colors.light.text.primary,
    marginBottom: 2,
  },
  benefitDescription: {
    ...Typography.bodyMedium,
    color: Colors.light.text.secondary,
  },
  trustSignals: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  trustText: {
    ...Typography.bodySmall,
    color: Colors.light.text.secondary,
  },
  spacer: {
    flex: 1,
  },
});
