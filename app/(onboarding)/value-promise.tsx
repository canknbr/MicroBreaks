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
    title: 'Personalized exercises',
    description: 'Tailored for your specific pain points',
  },
  {
    title: 'Smart reminders',
    description: 'That respect your flow state',
  },
  {
    title: 'Track improvements',
    description: 'Monitor your health progress',
  },
];

export default function ValuePromiseScreen() {
  const router = useRouter();

  useEffect(() => {
    // Track analytics: onb_value_prop_viewed
    // console.log('[Analytics] onb_value_prop_viewed');
  }, []);

  const handlePersonalize = () => {
    // Track analytics: onb_personalization_started
    // console.log('[Analytics] onb_personalization_started');
    router.push('./work-role');
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
          <Text style={styles.trustText}>Quick setup</Text>
          <Text style={styles.trustText}>No spam</Text>
          <Text style={styles.trustText}>Cancel anytime</Text>
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
    color: Colors.dark.text.primary,
    textAlign: 'center',
    marginVertical: Spacing.lg,
    fontWeight: '700',
  },
  subhead: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: Spacing.lg,
  },
  benefitCard: {
    backgroundColor: Colors.dark.card.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border.default,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...Typography.bodyLargeBold,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.xxs,
  },
  benefitDescription: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    lineHeight: 20,
  },
  trustSignals: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  trustText: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
  },
  spacer: {
    flex: 1,
  },
});
