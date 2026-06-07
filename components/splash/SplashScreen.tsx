/**
 * Premium Animated Splash Screen
 * Stable version - Using React Native Animated + Linear Gradient
 */

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated as RNAnimated } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useReduceMotion } from '@/hooks/useReduceMotion';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium Color Palette
const COLORS = {
  primary: '#06FFA5',
  primaryMid: '#00E5FF',
  secondary: '#B47EFF',
  accent: '#FFD166',
  text: '#FFFFFF',
  textSecondary: '#808080',
  bg: '#000000',
};

// ==================== Animated Letter Component ====================
interface AnimatedLetterProps {
  letter: string;
  animation: SharedValue<number>;
  isAccent: boolean;
}

function AnimatedLetter({ letter, animation, isAccent }: AnimatedLetterProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animation.value,
    transform: [
      { translateY: interpolate(animation.value, [0, 1], [20, 0]) },
      { scale: interpolate(animation.value, [0, 0.5, 1], [0.7, 1.05, 1]) },
    ],
  }));

  return (
    <Animated.Text style={[styles.appNameLetter, isAccent && styles.appNameLetterAccent, animatedStyle]}>
      {letter}
    </Animated.Text>
  );
}

// ==================== Animated Ring Component ====================
interface AnimatedRingProps {
  size: number;
  strokeWidth: number;
  color: string;
  glowColor: string;
  progress: SharedValue<number>;
  delay: number;
}

function AnimatedRing({ size, strokeWidth, color, glowColor, progress }: AnimatedRingProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.5, 1]);
    const opacity = progress.value;
    const rotation = interpolate(progress.value, [0, 1], [-90, 180]);
    return {
      opacity,
      transform: [{ scale }, { rotate: `${rotation}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
        },
        animatedStyle,
      ]}
    />
  );
}

// ==================== Main Component ====================
interface SplashScreenProps {
  onAnimationComplete?: () => void;
  minimumDuration?: number;
}

export function SplashScreen({
  onAnimationComplete,
  minimumDuration = 3000,
}: SplashScreenProps) {
  const reduceMotion = useReduceMotion();
  // Animation Values
  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const ring1Progress = useSharedValue(0);
  const ring2Progress = useSharedValue(0);
  const ring3Progress = useSharedValue(0);
  const centerDotScale = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const taglineOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  // Letter animations
  const letter0 = useSharedValue(0);
  const letter1 = useSharedValue(0);
  const letter2 = useSharedValue(0);
  const letter3 = useSharedValue(0);
  const letter4 = useSharedValue(0);
  const letter5 = useSharedValue(0);
  const letter6 = useSharedValue(0);
  const letter7 = useSharedValue(0);
  const letter8 = useSharedValue(0);
  const letter9 = useSharedValue(0);
  const letter10 = useSharedValue(0);
  const letterAnimations = useMemo(
    () => [letter0, letter1, letter2, letter3, letter4, letter5, letter6, letter7, letter8, letter9, letter10],
    [letter0, letter1, letter2, letter3, letter4, letter5, letter6, letter7, letter8, letter9, letter10]
  );

  // Glow animation (RN Animated for smoother performance)
  const glowAnim = useRef(new RNAnimated.Value(0)).current;

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
      // Snap to the final composed state and skip the multi-phase
      // entrance choreography. The minimum-duration timer below still
      // gives bootstrap work the same window to complete.
      logoOpacity.value = 1;
      logoScale.value = 1;
      ring1Progress.value = 1;
      ring2Progress.value = 1;
      ring3Progress.value = 1;
      centerDotScale.value = 1;
      pulseScale.value = 1;
      letterAnimations.forEach((anim) => {
        anim.value = 1;
      });
      taglineOpacity.value = 1;
      progressWidth.value = 1;

      const exitTimer = setTimeout(() => {
        containerOpacity.value = 0;
        runOnJS(handleComplete)();
      }, minimumDuration);

      return () => clearTimeout(exitTimer);
    }

    // Glow pulse animation
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        RNAnimated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Phase 1: Logo fade in
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 80 });

    // Phase 2: Rings animate in
    ring1Progress.value = withDelay(200, withSpring(1, { damping: 14, stiffness: 60 }));
    ring2Progress.value = withDelay(350, withSpring(1, { damping: 14, stiffness: 60 }));
    ring3Progress.value = withDelay(500, withSpring(1, { damping: 14, stiffness: 60 }));

    // Phase 3: Center dot
    centerDotScale.value = withDelay(700, withSpring(1, { damping: 10, stiffness: 100 }));

    // Phase 4: Breathing pulse
    pulseScale.value = withDelay(1000,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
        ),
        -1, true
      )
    );

    // Phase 5: Letters
    letterAnimations.forEach((anim, i) => {
      anim.value = withDelay(1100 + i * 50, withSpring(1, { damping: 14, stiffness: 100 }));
    });

    // Phase 6: Tagline
    taglineOpacity.value = withDelay(1700, withTiming(1, { duration: 400 }));

    // Phase 7: Progress
    progressWidth.value = withDelay(2000, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));

    // Haptics - setTimeout runs on JS thread, no need for runOnJS
    setTimeout(() => triggerHaptic('light'), 300);
    setTimeout(() => triggerHaptic('medium'), 800);
    setTimeout(() => triggerHaptic('light'), 2600);

    // Phase 8: Exit
    const exitTimer = setTimeout(() => {
      containerScale.value = withTiming(1.02, { duration: 250 });
      containerOpacity.value = withTiming(0, { duration: 350, easing: Easing.in(Easing.ease) }, (finished) => {
        if (finished) runOnJS(handleComplete)();
      });
    }, minimumDuration);

    return () => {
      clearTimeout(exitTimer);
      glowAnim.stopAnimation();
    };
  }, [
    centerDotScale,
    containerOpacity,
    containerScale,
    glowAnim,
    handleComplete,
    letterAnimations,
    logoOpacity,
    logoScale,
    minimumDuration,
    progressWidth,
    pulseScale,
    reduceMotion,
    ring1Progress,
    ring2Progress,
    ring3Progress,
    taglineOpacity,
    triggerHaptic,
  ]);

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * pulseScale.value }],
  }));

  const centerDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerDotScale.value }],
    opacity: centerDotScale.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: interpolate(taglineOpacity.value, [0, 1], [10, 0]) }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
    opacity: interpolate(progressWidth.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0.5]),
  }));

  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] });

  const appName = 'MicroBreaks';

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={['#000000', '#050510', '#0A0A18']} style={StyleSheet.absoluteFill} />
      </View>

      {/* Ambient Glows */}
      <RNAnimated.View style={[styles.ambientGlow, styles.ambientTeal, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
      <RNAnimated.View style={[styles.ambientGlow, styles.ambientPurple, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
        {/* Center Glow */}
        <RNAnimated.View style={[styles.centerGlow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

        {/* Rings */}
        <AnimatedRing size={104} strokeWidth={4} color={COLORS.primary} glowColor={COLORS.primary} progress={ring1Progress} delay={200} />
        <AnimatedRing size={80} strokeWidth={4} color={COLORS.secondary} glowColor={COLORS.secondary} progress={ring2Progress} delay={350} />
        <AnimatedRing size={56} strokeWidth={3} color={COLORS.accent} glowColor={COLORS.accent} progress={ring3Progress} delay={500} />

        {/* Center Dot */}
        <Animated.View style={[styles.centerDot, centerDotStyle]}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryMid]} style={styles.centerDotGradient} />
        </Animated.View>
      </Animated.View>

      {/* Text */}
      <View style={styles.textContainer}>
        <View style={styles.appNameContainer}>
          {appName.split('').map((letter, index) => (
            <AnimatedLetter
              key={index}
              letter={letter}
              animation={letterAnimations[index]}
              isAccent={index >= 5}
            />
          ))}
        </View>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Small breaks, big impact
        </Animated.Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressBarStyle]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryMid]}
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
  ambientGlow: {
    position: 'absolute',
    borderRadius: 200,
  },
  ambientTeal: {
    top: '5%',
    right: '-10%',
    width: 300,
    height: 300,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  ambientPurple: {
    bottom: '5%',
    left: '-10%',
    width: 350,
    height: 350,
    backgroundColor: COLORS.secondary,
    opacity: 0.1,
  },
  logoContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  centerGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  centerDotGradient: {
    flex: 1,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appNameLetter: {
    fontSize: 32,
    fontWeight: '200',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  appNameLetterAccent: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 16,
    letterSpacing: 2,
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
