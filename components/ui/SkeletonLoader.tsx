/**
 * SkeletonLoader
 *
 * Pulse-shimmer placeholder used while data hydrates. Always prefer this
 * over a spinner: spinners say "we are working"; skeletons say "your
 * content is loading and here is roughly what it will look like" — the
 * difference between feeling like an iOS first-party app and a 2018 web
 * port.
 *
 * Respects Reduce Motion: with the system preference on, the shimmer is
 * replaced by a steady static fill so users who opt out of motion still
 * get the layout hint without the pulse.
 *
 * Variants:
 *   <Skeleton.Line width={120} />
 *   <Skeleton.Block style={{ height: 80, borderRadius: 16 }} />
 *   <Skeleton.Avatar size={48} />
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useReduceMotion } from '@/hooks/useReduceMotion';

interface SkeletonBaseProps {
  style?: StyleProp<ViewStyle>;
}

function useShimmerOpacity(): SharedValue<number> {
  const reduceMotion = useReduceMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 0.5;
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress, reduceMotion]);

  return progress;
}

function SkeletonBlock({ style }: SkeletonBaseProps) {
  const theme = useTheme();
  const progress = useShimmerOpacity();

  const baseColor = theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const highlightOpacity = 0.18;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 1],
      [highlightOpacity * 0.4, highlightOpacity],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View
      style={[styles.block, { backgroundColor: baseColor }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.isDark ? '#FFFFFF' : '#000000' },
          animatedStyle,
        ]}
      />
    </View>
  );
}

function SkeletonLine({ width = '100%', style }: SkeletonBaseProps & { width?: number | `${number}%` }) {
  return <SkeletonBlock style={[{ height: 14, borderRadius: 7, width }, style]} />;
}

function SkeletonAvatar({ size = 40, style }: SkeletonBaseProps & { size?: number }) {
  return <SkeletonBlock style={[{ width: size, height: size, borderRadius: size / 2 }, style]} />;
}

/**
 * `Skeleton` exposes the variants as named subcomponents so call sites
 * read like `<Skeleton.Line width="80%" />` — consistent with the
 * convention used by other component namespaces in this app.
 */
export const Skeleton = {
  Block: SkeletonBlock,
  Line: SkeletonLine,
  Avatar: SkeletonAvatar,
};

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
});

export default Skeleton;
