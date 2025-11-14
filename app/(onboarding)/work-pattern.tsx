/**
 * ONB_007: Work Pattern
 * Understand how the user typically works
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import OptionCard from './components/OptionCard';
import { Colors, Typography, Spacing } from '@/theme';
import { WORK_PATTERNS } from './constants';

export default function WorkPatternScreen() {
  const router = useRouter();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  useEffect(() => {
    // Track analytics: onb_work_pattern_viewed
    console.log('[Analytics] onb_work_pattern_viewed');
  }, []);

  const handleContinue = () => {
    if (selectedPattern) {
      // Track analytics: onb_work_pattern_selected
      console.log('[Analytics] onb_work_pattern_selected:', selectedPattern);
      router.push('/(onboarding)/ergonomic-setup');
    }
  };

  const handleSkip = () => {
    // Track analytics: onb_work_pattern_skipped
    console.log('[Analytics] onb_work_pattern_skipped');
    router.push('/(onboarding)/ergonomic-setup');
  };

  return (
    <OnboardingLayout currentStep={7}>
      <View style={styles.container}>
        <Text style={styles.question}>How do you typically work?</Text>

        <View style={styles.grid}>
          {WORK_PATTERNS.map((pattern) => (
            <View key={pattern.id} style={styles.gridItem}>
              <OptionCard
                title={pattern.label}
                description={pattern.description}
                selected={selectedPattern === pattern.id}
                onPress={() => setSelectedPattern(pattern.id)}
              />
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedPattern}
        />
        <SecondaryButton title="Skip this" onPress={handleSkip} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    ...Typography.titleLarge,
    color: Colors.light.text.primary,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  gridItem: {
    width: '100%',
  },
  spacer: {
    flex: 1,
  },
});
