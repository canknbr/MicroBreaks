/**
 * ONB_005: Daily Screen Time
 * Collect user's daily screen hours
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

export default function ScreenTimeScreen() {
  const router = useRouter();
  const [hours, setHours] = useState(8);

  useEffect(() => {
    // Track analytics: onb_screen_time_viewed
    // console.log('[Analytics] onb_screen_time_viewed');
  }, []);

  const handleContinue = () => {
    // Track analytics: onb_screen_time_set
    // console.log('[Analytics] onb_screen_time_set:', hours);
    router.push('./pain-assessment');
  };

  const handleSkip = () => {
    // Track analytics: onb_screen_time_skipped
    // console.log('[Analytics] onb_screen_time_skipped');
    router.push('./pain-assessment');
  };

  const getColor = (value: number) => {
    if (value <= 4) return Colors.dark.brand.primary;
    if (value <= 8) return Colors.dark.brand.secondary;
    return Colors.dark.status.error;
  };

  const getFeedback = (value: number) => {
    if (value <= 4) return "That's within recommended limits";
    if (value <= 8) return "That's about average for desk workers";
    if (value <= 10) return `That's ${Math.round((value / 8 - 1) * 100)}% more than recommended`;
    return 'Consider taking extra breaks';
  };

  return (
    <OnboardingLayout currentStep={5}>
      <View style={styles.container}>
        <Text style={styles.question}>
          How many hours at your screen daily?
        </Text>

        {/* Character showing fatigue level */}
        <View style={styles.characterContainer}>
          <Text style={styles.character}>
            {hours <= 4 ? '😊' : hours <= 8 ? '😐' : hours <= 10 ? '😓' : '😵'}
          </Text>
        </View>

        {/* Hour Display */}
        <View style={styles.displayContainer}>
          <Text style={[styles.hoursDisplay, { color: getColor(hours) }]}>
            {hours}
          </Text>
          <Text style={styles.hoursLabel}>hours per day</Text>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderFill,
                {
                  width: `${(hours / 14) * 100}%`,
                  backgroundColor: getColor(hours),
                },
              ]}
            />
          </View>
          <View style={styles.sliderButtons}>
            {[...Array(15)].map((_, i) => (
              <View key={i} style={styles.sliderButton}>
                <Text
                  style={styles.sliderButtonText}
                  onPress={() => setHours(i)}>
                  {i}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Feedback */}
        <Text style={styles.feedback}>{getFeedback(hours)}</Text>

        <View style={styles.spacer} />

        <PrimaryButton title="Continue" onPress={handleContinue} />
        <SecondaryButton title="It varies" onPress={handleSkip} />
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
    marginBottom: Spacing.lg,
    fontWeight: '700',
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  character: {
    fontSize: 100,
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  hoursDisplay: {
    ...Typography.displayLarge,
    fontWeight: '700',
  },
  hoursLabel: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.secondary,
    marginTop: Spacing.xs,
  },
  sliderContainer: {
    marginBottom: Spacing.lg,
  },
  sliderTrack: {
    height: 10,
    backgroundColor: Colors.dark.background.secondary,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  sliderFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    flex: 1,
    alignItems: 'center',
  },
  sliderButtonText: {
    ...Typography.bodySmall,
    color: Colors.dark.text.tertiary,
  },
  feedback: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
});
