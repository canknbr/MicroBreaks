/**
 * Swipeable Container Component
 * Gesture-based navigation for break sessions
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const VELOCITY_THRESHOLD = 500;

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;   // Skip / Previous
  onSwipeRight?: () => void;  // Next / Complete
  onSwipeUp?: () => void;     // End session
  leftLabel?: string;
  rightLabel?: string;
  upLabel?: string;
  enabled?: boolean;
  showIndicators?: boolean;
}

export function SwipeableContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  leftLabel = 'Previous',
  rightLabel = 'Next',
  upLabel = 'End',
  enabled = true,
  showIndicators = true,
}: SwipeableContainerProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const context = useSharedValue({ x: 0, y: 0 });

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleSwipeLeft = useCallback(() => {
    triggerHaptic();
    onSwipeLeft?.();
  }, [onSwipeLeft, triggerHaptic]);

  const handleSwipeRight = useCallback(() => {
    triggerHaptic();
    onSwipeRight?.();
  }, [onSwipeRight, triggerHaptic]);

  const handleSwipeUp = useCallback(() => {
    triggerHaptic();
    onSwipeUp?.();
  }, [onSwipeUp, triggerHaptic]);

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value };
    })
    .onUpdate((event) => {
      // Allow horizontal movement
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        translateX.value = event.translationX;
        translateY.value = 0;
      } else if (event.translationY < 0 && onSwipeUp) {
        // Only allow upward swipe
        translateY.value = event.translationY;
        translateX.value = 0;
      }
    })
    .onEnd((event) => {
      const velocityX = Math.abs(event.velocityX);
      const velocityY = Math.abs(event.velocityY);

      // Check horizontal swipe
      if (
        Math.abs(translateX.value) > SWIPE_THRESHOLD ||
        velocityX > VELOCITY_THRESHOLD
      ) {
        if (translateX.value > 0 && onSwipeRight) {
          translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 }, () => {
            runOnJS(handleSwipeRight)();
            translateX.value = 0;
          });
        } else if (translateX.value < 0 && onSwipeLeft) {
          translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
            runOnJS(handleSwipeLeft)();
            translateX.value = 0;
          });
        } else {
          translateX.value = withSpring(0, { damping: 15 });
        }
      } else {
        translateX.value = withSpring(0, { damping: 15 });
      }

      // Check upward swipe
      if (
        translateY.value < -SWIPE_THRESHOLD ||
        (velocityY > VELOCITY_THRESHOLD && event.translationY < 0)
      ) {
        if (onSwipeUp) {
          translateY.value = withTiming(-200, { duration: 200 }, () => {
            runOnJS(handleSwipeUp)();
            translateY.value = 0;
          });
        } else {
          translateY.value = withSpring(0, { damping: 15 });
        }
      } else {
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const leftIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD * 2, -SWIPE_THRESHOLD, 0],
      [1, 0.8, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [-SWIPE_THRESHOLD * 2, -SWIPE_THRESHOLD, 0],
          [1.2, 1, 0.8],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const rightIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD * 2],
      [0, 0.8, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateX.value,
          [0, SWIPE_THRESHOLD, SWIPE_THRESHOLD * 2],
          [0.8, 1, 1.2],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const upIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD * 2, -SWIPE_THRESHOLD, 0],
      [1, 0.8, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        scale: interpolate(
          translateY.value,
          [-SWIPE_THRESHOLD * 2, -SWIPE_THRESHOLD, 0],
          [1.2, 1, 0.8],
          Extrapolation.CLAMP
        ),
      },
      {
        translateY: interpolate(
          translateY.value,
          [-SWIPE_THRESHOLD * 2, 0],
          [-20, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={styles.wrapper}>
      {/* Swipe indicators */}
      {showIndicators && (
        <>
          {/* Left indicator */}
          {onSwipeLeft && (
            <Animated.View style={[styles.indicator, styles.leftIndicator, leftIndicatorStyle]}>
              <View style={[styles.indicatorCircle, { backgroundColor: `${theme.accent.warning}30` }]}>
                <Ionicons name="arrow-back" size={24} color={theme.accent.warning} />
              </View>
              <Text style={[styles.indicatorLabel, { color: theme.accent.warning }]}>{leftLabel}</Text>
            </Animated.View>
          )}

          {/* Right indicator */}
          {onSwipeRight && (
            <Animated.View style={[styles.indicator, styles.rightIndicator, rightIndicatorStyle]}>
              <View style={[styles.indicatorCircle, { backgroundColor: `${theme.accent.primary}30` }]}>
                <Ionicons name="arrow-forward" size={24} color={theme.accent.primary} />
              </View>
              <Text style={[styles.indicatorLabel, { color: theme.accent.primary }]}>{rightLabel}</Text>
            </Animated.View>
          )}

          {/* Up indicator */}
          {onSwipeUp && (
            <Animated.View style={[styles.indicator, styles.upIndicator, upIndicatorStyle]}>
              <View style={[styles.indicatorCircle, { backgroundColor: `${theme.accent.error}30` }]}>
                <Ionicons name="close" size={24} color={theme.accent.error} />
              </View>
              <Text style={[styles.indicatorLabel, { color: theme.accent.error }]}>{upLabel}</Text>
            </Animated.View>
          )}
        </>
      )}

      {/* Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, containerStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// Swipe hint animation
export function SwipeHint({ direction = 'horizontal' }: { direction?: 'horizontal' | 'vertical' }) {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const animate = () => {
      opacity.value = withTiming(1, { duration: 500 });

      if (direction === 'horizontal') {
        translateX.value = withTiming(20, { duration: 600 }, () => {
          translateX.value = withTiming(-20, { duration: 600 }, () => {
            translateX.value = withTiming(0, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 });
          });
        });
      } else {
        translateY.value = withTiming(-20, { duration: 600 }, () => {
          translateY.value = withTiming(0, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 });
        });
      }
    };

    const timeout = setTimeout(animate, 2000);
    return () => clearTimeout(timeout);
  }, [direction, opacity, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.swipeHint, style]}>
      <Ionicons
        name={direction === 'horizontal' ? 'swap-horizontal' : 'chevron-up'}
        size={32}
        color={theme.text.muted}
      />
      <Text style={[styles.swipeHintText, { color: theme.text.muted }]}>
        {direction === 'horizontal' ? 'Swipe to navigate' : 'Swipe up to end'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  indicator: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  leftIndicator: {
    left: 20,
    top: '45%',
  },
  rightIndicator: {
    right: 20,
    top: '45%',
  },
  upIndicator: {
    top: 40,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -30,
  },
  indicatorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  swipeHintText: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default SwipeableContainer;
