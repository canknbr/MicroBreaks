/**
 * Lottie Animation Component
 * Reusable wrapper for Lottie animations with fallback support
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { AnimationType } from '@/data/exercises';

// Lottie source type - compatible with LottieView's source prop
export type LottieSource = string | AnimationObject | { uri: string };

interface LottieAnimationProps {
  source: LottieSource;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: ViewStyle;
  onAnimationFinish?: () => void;
}

// Animation category mapping for Lottie files
export type LottieAnimationCategory =
  | 'breathing'
  | 'stretching'
  | 'eye'
  | 'mindfulness'
  | 'celebration'
  | 'loading'
  | 'active';

// Map exercise animation types to Lottie categories
export function getAnimationCategory(animationType: AnimationType): LottieAnimationCategory {
  const categoryMap: Record<AnimationType, LottieAnimationCategory> = {
    'breathe-in': 'breathing',
    'breathe-hold': 'breathing',
    'breathe-out': 'breathing',
    'eye-move-circle': 'eye',
    'eye-move-horizontal': 'eye',
    'eye-move-vertical': 'eye',
    'eye-move-figure8': 'eye',
    'eye-focus-near': 'eye',
    'eye-focus-far': 'eye',
    'eye-palming': 'eye',
    'eye-rest': 'eye',
    'rotate-left': 'stretching',
    'rotate-right': 'stretching',
    'tilt-left': 'stretching',
    'tilt-right': 'stretching',
    'tilt-forward': 'stretching',
    'tilt-back': 'stretching',
    'stretch-up': 'stretching',
    'stretch-side': 'stretching',
    'stretch-forward': 'stretching',
    'stretch-back': 'stretching',
    'cat-cow': 'stretching',
    'seated-twist': 'stretching',
    'hip-opener': 'stretching',
    'hold': 'mindfulness',
    'rest': 'mindfulness',
    'walk': 'active',
    'active': 'active',
    // New animation types
    'shoulder-shrug': 'stretching',
    'wrist-circle': 'stretching',
    'jaw-release': 'stretching',
    'ear-massage': 'mindfulness',
    'hand-stretch': 'stretching',
    'hip-flexor': 'stretching',
    'chest-opener': 'stretching',
    'hamstring-stretch': 'stretching',
    'spine-twist': 'stretching',
    'grounding': 'mindfulness',
    'affirmation': 'mindfulness',
    'tension-scan': 'mindfulness',
    'stair-climb': 'active',
    'dance': 'active',
    'balance': 'active',
  };

  return categoryMap[animationType] || 'mindfulness';
}

// Get fallback animation type based on exercise animation
export function getFallbackAnimationType(
  animationType: AnimationType
): 'pulse' | 'breathe' | 'bounce' | 'rotate' {
  const category = getAnimationCategory(animationType);

  switch (category) {
    case 'breathing':
      return 'breathe';
    case 'stretching':
      return 'pulse';
    case 'eye':
      return 'pulse';
    case 'mindfulness':
      return 'breathe';
    case 'celebration':
      return 'bounce';
    case 'active':
      return 'bounce';
    default:
      return 'pulse';
  }
}

export default function LottieAnimation({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
  onAnimationFinish,
}: LottieAnimationProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <LottieView
      ref={animationRef}
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      speed={speed}
      style={[styles.animation, style]}
      onAnimationFinish={onAnimationFinish}
    />
  );
}

// Fallback animated placeholder when Lottie isn't available
export function AnimatedPlaceholder({
  size = 200,
  color = '#FF2472',
  type = 'pulse',
}: {
  size?: number;
  color?: string;
  type?: 'pulse' | 'breathe' | 'bounce' | 'rotate';
}) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    switch (type) {
      case 'pulse':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'breathe':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        opacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.4, { duration: 4000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'bounce':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(2)) }),
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'rotate':
        rotation.value = withRepeat(
          withTiming(360, { duration: 3000, easing: Easing.linear }),
          -1,
          false
        );
        break;
    }
  }, [opacity, rotation, scale, type]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.placeholderContainer, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.placeholderCircle,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            backgroundColor: `${color}30`,
            borderColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Exercise-specific Lottie Animation component with automatic fallback
interface ExerciseLottieAnimationProps {
  animationType: AnimationType;
  color?: string;
  size?: number;
  lottieSource?: LottieSource;
  style?: ViewStyle;
}

export function ExerciseLottieAnimation({
  animationType,
  color = '#FF2472',
  size = 200,
  lottieSource,
  style,
}: ExerciseLottieAnimationProps) {
  // If a Lottie source is provided, use it
  if (lottieSource) {
    return (
      <LottieAnimation
        source={lottieSource}
        autoPlay
        loop
        style={{ width: size, height: size, ...style }}
      />
    );
  }

  // Otherwise, use the fallback animation
  const fallbackType = getFallbackAnimationType(animationType);

  return (
    <AnimatedPlaceholder
      size={size}
      color={color}
      type={fallbackType}
    />
  );
}

const styles = StyleSheet.create({
  animation: {
    width: 200,
    height: 200,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderCircle: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
