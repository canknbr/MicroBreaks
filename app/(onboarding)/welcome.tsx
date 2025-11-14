/**
 * ONB_001: Welcome & Problem Recognition
 * First screen of onboarding - establishes pain point and value
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Track analytics: onb_welcome_viewed
    console.log('[Analytics] onb_welcome_viewed');
  }, []);

  const handleStart = () => {
    // Track analytics: onb_welcome_cta_tapped
    console.log('[Analytics] onb_welcome_cta_tapped');
    router.push('/(onboarding)/social-proof');
  };

  const handleBrowse = () => {
    // Track analytics: onb_welcome_dismissed
    console.log('[Analytics] onb_welcome_dismissed');
    router.push('/(tabs)');
  };

  return (
    <OnboardingLayout currentStep={1} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Illustration placeholder */}
          <View style={styles.illustrationContainer}>
            <Text style={styles.illustration}>🧘‍♀️</Text>
          </View>

          <Text style={styles.headline}>Your desk doesn't have to hurt</Text>

          <Text style={styles.subhead}>
            Join 100,000+ workers who've eliminated daily pain
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Start Feeling Better"
            onPress={handleStart}
            style={styles.primaryButton}
          />
          <SecondaryButton
            title="I'm just browsing"
            onPress={handleBrowse}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    marginBottom: Spacing.xxl,
  },
  illustration: {
    fontSize: 120,
  },
  headline: {
    ...Typography.headlineLarge,
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subhead: {
    ...Typography.bodyLarge,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: Spacing.xs,
  },
});
