/**
 * ONB_005: Daily Screen Time
 * Collect user's daily screen hours
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

export default function ScreenTimeScreen() {
  const router = useRouter();
  const [hours, setHours] = useState(8);
  const [trackWidth, setTrackWidth] = useState(0);

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
    if (value <= 4) return Colors.dark.text.primary;
    if (value <= 8) return Colors.dark.text.secondary;
    return Colors.dark.text.primary;
  };

  const getFeedback = (value: number) => {
    if (value <= 4) return "That's within recommended limits";
    if (value <= 8) return "That's about average for desk workers";
    if (value <= 10) return `That's ${Math.round((value / 8 - 1) * 100)}% more than recommended`;
    return 'Consider taking extra breaks';
  };

  const handleHourSelect = (value: number) => {
    // Only updates the selection - does NOT auto-advance to next screen
    // User must press "Continue" button to proceed
    if (isNaN(value) || value < 0 || value > 14) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHours(Math.round(value));
  };

  const handleTrackPress = (e: any) => {
    if (!trackWidth) return;
    const { locationX } = e.nativeEvent;
    if (locationX === undefined || isNaN(locationX)) return;
    
    const percentage = Math.max(0, Math.min(1, locationX / trackWidth));
    const newValue = Math.round(percentage * 14);
    handleHourSelect(newValue);
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
            {isNaN(hours) ? 8 : hours}
          </Text>
          <Text style={styles.hoursLabel}>hours per day</Text>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Pressable
            style={styles.sliderTrack}
            onLayout={(e) => {
              const { width } = e.nativeEvent.layout;
              if (width && !isNaN(width)) {
                setTrackWidth(width);
              }
            }}
            onPress={handleTrackPress}>
            <View
              style={[
                styles.sliderFill,
                {
                  width: `${Math.max(0, Math.min(100, (hours / 14) * 100))}%`,
                  backgroundColor: getColor(hours),
                },
              ]}
            />
          </Pressable>
          <View style={styles.sliderButtons}>
            {[...Array(15)].map((_, i) => (
              <Pressable
                key={i}
                style={styles.sliderButton}
                onPress={() => handleHourSelect(i)}>
                <Text
                  style={[
                    styles.sliderButtonText,
                    hours === i && styles.sliderButtonTextActive,
                  ]}>
                  {i}
                </Text>
              </Pressable>
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
    paddingVertical: Spacing.xs,
  },
  sliderButtonText: {
    ...Typography.bodySmall,
    color: Colors.dark.text.tertiary,
  },
  sliderButtonTextActive: {
    color: Colors.dark.text.primary,
    fontWeight: '600',
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
