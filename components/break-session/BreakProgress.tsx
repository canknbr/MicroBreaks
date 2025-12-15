/**
 * Break Progress Component
 * Step indicators and progress bar
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
    <View style={styles.container}>
      {/* Step Counter */}
      <View style={styles.stepCounter}>
        <Text style={styles.stepLabel}>Step</Text>
        <Text style={[styles.stepNumber, { color }]}>
          {currentStep + 1}
          <Text style={styles.stepTotal}>/{totalSteps}</Text>
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]}>
            <LinearGradient
              colors={[color, `${color}80`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>

      {/* Percentage */}
      <Text style={styles.percentage}>{Math.round(progress)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  stepCounter: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: '600',
  },
  stepTotal: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  progressBar: {
    flex: 1,
    marginRight: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    minWidth: 40,
    textAlign: 'right',
  },
});
