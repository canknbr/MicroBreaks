/**
 * Unwind — editorial splash.
 *
 * Type-forward: the wordmark is the hero, born from opacity 0 with a staggered
 * per-letter rise and underlined by the brand pink em-dash. The old concentric
 * ring-logo, centre dot and ambient glow circles were removed — the splash is
 * now just the photo backdrop + the name.
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PhotoBackdrop } from '@/components/ui/PhotoBackdrop';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  primary: '#FF2472',
  text: '#FFFFFF',
  textSecondary: '#808080',
  bg: '#000000',
};

// ==================== Animated Letter ====================
interface AnimatedLetterProps {
  letter: string;
  animation: SharedValue<number>;
}

function AnimatedLetter({ letter, animation }: AnimatedLetterProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
    transform: [
      { translateY: interpolate(animation.value, [0, 1], [34, 0]) },
      { scale: interpolate(animation.value, [0, 0.6, 1], [0.88, 1.04, 1]) },
    ],
  }));

  return (
    <Animated.Text style={[styles.appNameLetter, animatedStyle]}>
      {letter}
    </Animated.Text>
  );
}

// ==================== Main ====================
interface SplashScreenProps {
  onAnimationComplete?: () => void;
  minimumDuration?: number;
}

export function SplashScreen({
  onAnimationComplete,
  minimumDuration = 3000,
}: SplashScreenProps) {
  const reduceMotion = useReduceMotion();

  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const emDashWidth = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Per-letter entrance (up to 8 letters supported)
  const letter0 = useSharedValue(0);
  const letter1 = useSharedValue(0);
  const letter2 = useSharedValue(0);
  const letter3 = useSharedValue(0);
  const letter4 = useSharedValue(0);
  const letter5 = useSharedValue(0);
  const letter6 = useSharedValue(0);
  const letter7 = useSharedValue(0);
  const letterAnimations = useMemo(
    () => [letter0, letter1, letter2, letter3, letter4, letter5, letter6, letter7],
    [letter0, letter1, letter2, letter3, letter4, letter5, letter6, letter7]
  );

  const triggerHaptic = useCallback((style: 'light' | 'medium' = 'light') => {
    Haptics.impactAsync(
      style === 'light' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    );
  }, []);

  const handleComplete = useCallback(() => {
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  useEffect(() => {
    if (reduceMotion) {
      // Snap to the composed final state; keep the minimum-duration window.
      letterAnimations.forEach((anim) => {
        anim.value = 1;
      });
      emDashWidth.value = 1;
      taglineOpacity.value = 1;
      progressWidth.value = 1;

      const exitTimer = setTimeout(() => {
        containerOpacity.value = 0;
        runOnJS(handleComplete)();
      }, minimumDuration);

      return () => clearTimeout(exitTimer);
    }

    // Wordmark: each letter is born from opacity 0, rising with a crisp spring.
    letterAnimations.forEach((anim, i) => {
      anim.value = withDelay(120 + i * 60, withSpring(1, { damping: 15, stiffness: 110 }));
    });

    // Brand pink em-dash sweeps in beneath the wordmark.
    emDashWidth.value = withDelay(
      560,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })
    );

    // Tagline fades up.
    taglineOpacity.value = withDelay(820, withTiming(1, { duration: 400 }));

    // Progress bar.
    progressWidth.value = withDelay(
      1050,
      withTiming(1, { duration: 560, easing: Easing.out(Easing.cubic) })
    );

    // Haptics punctuate the entrance (setTimeout runs on the JS thread).
    setTimeout(() => triggerHaptic('light'), 180);
    setTimeout(() => triggerHaptic('medium'), 640);

    // Exit.
    const exitTimer = setTimeout(() => {
      containerScale.value = withTiming(1.02, { duration: 250 });
      containerOpacity.value = withTiming(
        0,
        { duration: 350, easing: Easing.in(Easing.ease) },
        (finished) => {
          if (finished) runOnJS(handleComplete)();
        }
      );
    }, minimumDuration);

    return () => clearTimeout(exitTimer);
  }, [
    containerOpacity,
    containerScale,
    emDashWidth,
    handleComplete,
    letterAnimations,
    minimumDuration,
    progressWidth,
    reduceMotion,
    taglineOpacity,
    triggerHaptic,
  ]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const emDashStyle = useAnimatedStyle(() => ({
    width: interpolate(emDashWidth.value, [0, 1], [0, 56]),
    opacity: emDashWidth.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: interpolate(taglineOpacity.value, [0, 1], [10, 0]) }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
    opacity: interpolate(progressWidth.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0.5]),
  }));

  const appName = 'Unwind';

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Base canvas */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={['#000000', '#0C0B0F', '#0C0B0F']} style={StyleSheet.absoluteFill} />
      </View>

      {/* Blurred + dimmed photo backdrop */}
      <PhotoBackdrop source={require('../../assets/images/backdrops/bg.jpg')} opacity={0.72} blurRadius={11} />

      {/* Wordmark hero */}
      <View style={styles.textContainer}>
        <View style={styles.appNameContainer}>
          {appName.split('').map((letter, index) => (
            <AnimatedLetter key={index} letter={letter} animation={letterAnimations[index]} />
          ))}
        </View>
        <Animated.View style={[styles.emDash, emDashStyle]} />
        <Animated.Text style={[styles.tagline, taglineStyle]}>Small breaks, big impact</Animated.Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressBarStyle]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  appNameLetter: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 54,
    color: COLORS.text,
    letterSpacing: -1,
  },
  emDash: {
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 24,
  },
  tagline: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 22,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    width: SCREEN_WIDTH,
    paddingHorizontal: 80,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1,
    overflow: 'hidden',
  },
});

export default SplashScreen;
