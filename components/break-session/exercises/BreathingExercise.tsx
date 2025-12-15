/**
 * Breathing Exercise Animation
 * Expanding/contracting circle for breath guidance
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimationType } from '@/data/exercises';

interface BreathingExerciseProps {
  animation: AnimationType;
  instruction: string;
  color: string;
}

export default function BreathingExercise({
  animation,
  instruction,
  color,
}: BreathingExerciseProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const innerScale = useSharedValue(0.6);

  useEffect(() => {
    const duration = 4000; // 4 seconds per phase

    switch (animation) {
      case 'breathe-in':
        // Expand
        scale.value = withTiming(1.3, { duration, easing: Easing.inOut(Easing.ease) });
        innerScale.value = withTiming(0.9, { duration, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.8, { duration, easing: Easing.inOut(Easing.ease) });
        break;

      case 'breathe-hold':
        // Subtle pulse while holding
        scale.value = withRepeat(
          withSequence(
            withTiming(1.32, { duration: 500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.28, { duration: 500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'breathe-out':
        // Contract
        scale.value = withTiming(1, { duration, easing: Easing.inOut(Easing.ease) });
        innerScale.value = withTiming(0.6, { duration, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.5, { duration, easing: Easing.inOut(Easing.ease) });
        break;

      default:
        // Gentle idle animation
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
    }
  }, [animation]);

  const outerCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const innerCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const getPhaseText = () => {
    switch (animation) {
      case 'breathe-in':
        return 'Breathe In';
      case 'breathe-hold':
        return 'Hold';
      case 'breathe-out':
        return 'Breathe Out';
      default:
        return 'Relax';
    }
  };

  return (
    <View style={styles.container}>
      {/* Outer glow ring */}
      <Animated.View style={[styles.outerCircle, outerCircleStyle]}>
        <LinearGradient
          colors={[`${color}60`, `${color}20`, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Main circle */}
      <Animated.View style={[styles.mainCircle, { borderColor: color }]}>
        <LinearGradient
          colors={[`${color}40`, `${color}10`]}
          style={StyleSheet.absoluteFill}
        />

        {/* Inner pulsing circle */}
        <Animated.View
          style={[styles.innerCircle, { backgroundColor: `${color}30` }, innerCircleStyle]}
        />

        {/* Phase text */}
        <Text style={[styles.phaseText, { color }]}>{getPhaseText()}</Text>
      </Animated.View>

      {/* Instruction */}
      <Text style={styles.instruction}>{instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  outerCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  mainCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    zIndex: 1,
  },
  instruction: {
    marginTop: 40,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
});
