/**
 * ONB_010: Energy Pattern
 * Understand user's energy levels throughout the day
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import OptionCard from './components/OptionCard';
import { Colors, Typography, Spacing } from '@/theme';
import { ENERGY_PATTERNS } from '@/constants/onboarding';

export default function EnergyPatternScreen() {
  const router = useRouter();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  useEffect(() => {
    // Track analytics: onb_energy_pattern_viewed
    // console.log('[Analytics] onb_energy_pattern_viewed');
  }, []);

  const handleContinue = () => {
    if (selectedPattern) {
      // Track analytics: onb_energy_preset
      // console.log('[Analytics] onb_energy_preset:', selectedPattern);
      router.push('./break-style');
    }
  };

  const handleSkip = () => {
    // Track analytics: onb_energy_skipped
    // console.log('[Analytics] onb_energy_skipped');
    router.push('./break-style');
  };

  return (
    <OnboardingLayout currentStep={10}>
      <View style={styles.container}>
        <Text style={styles.question}>
          When do you feel most/least energetic?
        </Text>
        <Text style={styles.subtext}>
          This helps us time your breaks optimally
        </Text>

        <View style={styles.patterns}>
          {ENERGY_PATTERNS.map((pattern) => (
            <OptionCard
              key={pattern.id}
              icon={pattern.icon}
              title={pattern.label}
              selected={selectedPattern === pattern.id}
              onPress={() => setSelectedPattern(pattern.id)}
            />
          ))}
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedPattern}
        />
        <SecondaryButton title="I'm not sure" onPress={handleSkip} />
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
    color: Colors.dark.text.primary,
    fontWeight: '700',
    marginBottom: Spacing.xxs,
  },
  subtext: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    marginBottom: Spacing.md,
  },
  patterns: {
    marginBottom: Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
});
