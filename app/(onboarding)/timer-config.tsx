/**
 * ONB_016: Timer Configuration
 * Choose work rhythm and break timing
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import OptionCard from './components/OptionCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';
import { TIMER_PRESETS } from '@/constants/onboarding';

export default function TimerConfigScreen() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<string>('deep_work');

  useEffect(() => {
    // Track analytics: onb_timer_config_viewed
    // console.log('[Analytics] onb_timer_config_viewed');
  }, []);

  const handleContinue = () => {
    // Track analytics: onb_timer_selected
    // console.log('[Analytics] onb_timer_selected:', selectedPreset);
    router.push('./notification-permission');
  };

  const selectedPresetData = TIMER_PRESETS.find((p) => p.id === selectedPreset);

  return (
    <OnboardingLayout currentStep={16}>
      <View style={styles.container}>
        <Text style={styles.question}>Choose your work rhythm</Text>

        {/* Smart Suggestion */}
        <View style={styles.suggestionBanner}>
          <Text style={styles.suggestionText}>
            💡 Based on your profile, we recommend{' '}
            <Text style={styles.suggestionBold}>Deep Work</Text>
          </Text>
        </View>

        {/* Presets */}
        <View style={styles.presets}>
          {TIMER_PRESETS.map((preset) => (
            <OptionCard
              key={preset.id}
              title={preset.label}
              description={preset.description}
              selected={selectedPreset === preset.id}
              onPress={() => setSelectedPreset(preset.id)}
            />
          ))}
        </View>

        {/* Time Commitment Display */}
        {selectedPresetData && (
          <View style={styles.commitmentCard}>
            <Text style={styles.commitmentLabel}>Daily commitment</Text>
            <Text style={styles.commitmentValue}>~16 breaks per day</Text>
            <Text style={styles.commitmentSubtext}>
              Based on 8-hour workday
            </Text>
          </View>
        )}

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
  question: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  suggestionBanner: {
    backgroundColor: Colors.dark.status.infoLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  suggestionText: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.primary,
  },
  suggestionBold: {
    ...Typography.bodyMediumBold,
    color: Colors.dark.brand.primary,
  },
  presets: {
    marginBottom: Spacing.sm,
  },
  commitmentCard: {
    backgroundColor: Colors.dark.background.secondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
  },
  commitmentLabel: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
  },
  commitmentValue: {
    ...Typography.titleMedium,
    color: Colors.dark.text.primary,
    marginVertical: Spacing.xxs,
  },
  commitmentSubtext: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
  },
  spacer: {
    flex: 1,
  },
});
