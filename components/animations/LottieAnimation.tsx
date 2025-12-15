/**
 * Lottie Animation Component
 * Reusable wrapper for Lottie animations with fallback support
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface LottieAnimationProps {
  source: any; // Lottie JSON source
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  style?: any;
  onAnimationFinish?: () => void;
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
  color = '#06FFA5',
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
  }, [type]);

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
