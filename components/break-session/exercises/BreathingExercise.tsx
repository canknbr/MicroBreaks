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
import { AnimationType } from '@/data/exercises';
import { useTheme } from '@/hooks/useTheme';
import { useHapticChoreography } from '@/hooks/useHapticChoreography';
import { breakSounds } from '@/services/audio/breakSounds';
import SkiaBreathingCircle from './SkiaBreathingCircle';

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
  const { breathingPulse, cancel: cancelHaptics } = useHapticChoreography();
  // The orb's scale / opacity / inner-fill are owned by SkiaBreathingCircle
  // now; we only keep the ambient layers (glow, particles, dashed ring)
  // that surround the Skia canvas.
  const glowIntensity = useSharedValue(0);
  const ringRotation = useSharedValue(0);
  const particleOffset = useSharedValue(0);

  useEffect(() => {
    const duration = 4000; // 4 seconds per phase

    // Sync haptic + sound with the visual breath phase. The phone now
    // breathes WITH the user — this is the single biggest visceral
    // upgrade in Sprint 9 (Quality Roadmap). The sound layer is a stub
    // until the audio assets ship; the haptic chain is real today.
    if (animation === 'breathe-in' || animation === 'breathe-hold' || animation === 'breathe-out') {
      const phaseKey = animation === 'breathe-in' ? 'in' : animation === 'breathe-out' ? 'out' : 'hold';
      breathingPulse({ phase: phaseKey, durationMs: duration });
      void breakSounds.play(animation === 'breathe-in'
        ? 'breathe-in'
        : animation === 'breathe-out'
          ? 'breathe-out'
          : 'breathe-hold');
    }

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

    // Drive only the ambient glow with the breath phase; the Skia orb has
    // its own internal phase progress so it stays in sync without us
    // re-piping any of the orb-shape values.
    switch (animation) {
      case 'breathe-in':
        glowIntensity.value = withTiming(1, { duration, easing: Easing.inOut(Easing.ease) });
        break;
      case 'breathe-hold':
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
        glowIntensity.value = withTiming(0.2, { duration, easing: Easing.inOut(Easing.ease) });
        break;
      default:
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
    return () => {
      cancelHaptics();
      if (animation === 'breathe-in' || animation === 'breathe-out' || animation === 'breathe-hold') {
        void breakSounds.stop(animation === 'breathe-in'
          ? 'breathe-in'
          : animation === 'breathe-out'
            ? 'breathe-out'
            : 'breathe-hold');
      }
    };
  }, [animation, breathingPulse, cancelHaptics, glowIntensity, particleOffset, ringRotation]);

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

      {/* Skia-rendered breathing orb — replaces the prior layered Linear
          gradient stack. Owns its own phase-progress animation. */}
      <View style={styles.skiaWrapper} pointerEvents="none">
        <SkiaBreathingCircle animation={animation} color={color} size={280} />
      </View>

      {/* Phase text — same position the previous mainCircle text held,
          rendered above the canvas so the user reads the cue clearly. */}
      <View
        style={styles.phaseTextWrapper}
        pointerEvents="none"
        accessible
        accessibilityRole="text"
        accessibilityLabel={getPhaseText()}
      >
        <Text style={[styles.phaseText, { color }]}>{getPhaseText()}</Text>
      </View>

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
  skiaWrapper: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTextWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instruction: {
    marginTop: 48,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
});
