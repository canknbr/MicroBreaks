/**
 * Break Progress — editorial. Mono step counter + a thin solid progress
 * line + mono percentage. No gradient.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface BreakProgressProps {
  currentStep: number;
  totalSteps: number;
  progress: number; // 0-100
  color: string;
}

export default function BreakProgress({
  currentStep,
  totalSteps,
  progress,
  color,
}: BreakProgressProps) {
  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress}%`, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    }),
  }));

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep + 1} of ${totalSteps}, ${Math.round(progress)} percent complete`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
    >
      <View style={styles.topRow} importantForAccessibility="no">
        <Text style={styles.stepLabel}>STEP</Text>
        <Text style={[styles.stepNumber, { color }]}>
          {currentStep + 1}
          <Text style={styles.stepTotal}>/{totalSteps}</Text>
        </Text>
        <View style={styles.spacer} />
        <Text style={styles.percentage}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.progressTrack} importantForAccessibility="no">
        <Animated.View style={[styles.progressFill, { backgroundColor: color }, progressStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  stepLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.4,
    marginRight: 8,
  },
  stepNumber: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    letterSpacing: -0.5,
  },
  stepTotal: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  spacer: {
    flex: 1,
  },
  percentage: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
