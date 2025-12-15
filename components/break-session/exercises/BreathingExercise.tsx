/**
 * Breathing Exercise Animation
 * Zen master level expanding/contracting circle for breath guidance
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimationType } from '@/data/exercises';
import { useTheme } from '@/hooks/useTheme';

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
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const innerScale = useSharedValue(0.6);
  const glowIntensity = useSharedValue(0);
  const ringRotation = useSharedValue(0);
  const particleOffset = useSharedValue(0);

  useEffect(() => {
    const duration = 4000; // 4 seconds per phase

    // Continuous subtle ring rotation
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );

    // Particle animation
    particleOffset.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    switch (animation) {
      case 'breathe-in':
        // Expand with glow
        scale.value = withTiming(1.35, { duration, easing: Easing.inOut(Easing.ease) });
        innerScale.value = withTiming(0.95, { duration, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.9, { duration, easing: Easing.inOut(Easing.ease) });
        glowIntensity.value = withTiming(1, { duration, easing: Easing.inOut(Easing.ease) });
        break;

      case 'breathe-hold':
        // Subtle pulse while holding
        scale.value = withRepeat(
          withSequence(
            withTiming(1.38, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.32, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        glowIntensity.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.9, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'breathe-out':
        // Contract
        scale.value = withTiming(1, { duration, easing: Easing.inOut(Easing.ease) });
        innerScale.value = withTiming(0.5, { duration, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.4, { duration, easing: Easing.inOut(Easing.ease) });
        glowIntensity.value = withTiming(0.2, { duration, easing: Easing.inOut(Easing.ease) });
        break;

      default:
        // Gentle idle animation
        scale.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        glowIntensity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, { duration: 2500, easing: Easing.inOut(Easing.ease) })
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

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowIntensity.value, [0, 1], [0.1, 0.4]),
    transform: [{ scale: interpolate(glowIntensity.value, [0, 1], [1, 1.5]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  const particle1Style = useAnimatedStyle(() => ({
    opacity: interpolate(particleOffset.value, [0, 0.5, 1], [0.2, 0.8, 0.2]),
    transform: [
      { translateY: interpolate(particleOffset.value, [0, 1], [0, -30]) },
      { scale: interpolate(particleOffset.value, [0, 0.5, 1], [0.5, 1, 0.5]) },
    ],
  }));

  const particle2Style = useAnimatedStyle(() => ({
    opacity: interpolate(particleOffset.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
    transform: [
      { translateY: interpolate(particleOffset.value, [0, 1], [0, -25]) },
      { translateX: interpolate(particleOffset.value, [0, 1], [-10, 10]) },
      { scale: interpolate(particleOffset.value, [0, 0.5, 1], [0.6, 0.9, 0.6]) },
    ],
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
      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlow, { backgroundColor: color }, glowStyle]} />

      {/* Floating particles */}
      <Animated.View style={[styles.particle, styles.particle1, { backgroundColor: color }, particle1Style]} />
      <Animated.View style={[styles.particle, styles.particle2, { backgroundColor: color }, particle2Style]} />

      {/* Outer rotating ring */}
      <Animated.View style={[styles.rotatingRing, { borderColor: color }, ringStyle]} />

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
      <Animated.View style={[styles.mainCircle, { borderColor: color, backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>
        <LinearGradient
          colors={[`${color}30`, `${color}08`]}
          style={StyleSheet.absoluteFill}
        />

        {/* Inner pulsing circle */}
        <Animated.View
          style={[styles.innerCircle, { backgroundColor: `${color}40` }, innerCircleStyle]}
        />

        {/* Center dot */}
        <View style={[styles.centerDot, { backgroundColor: color }]} />

        {/* Phase text */}
        <Text style={[styles.phaseText, { color }]}>{getPhaseText()}</Text>
      </Animated.View>

      {/* Instruction */}
      <Text style={[styles.instruction, { color: theme.text.secondary }]}>{instruction}</Text>
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
  ambientGlow: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    opacity: 0.15,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  particle1: {
    top: '35%',
    left: '30%',
  },
  particle2: {
    top: '40%',
    right: '32%',
  },
  rotatingRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.3,
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
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.8,
  },
  phaseText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    zIndex: 1,
    marginTop: 50,
  },
  instruction: {
    marginTop: 48,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
});
