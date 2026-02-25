/**
 * Animated Progress Ring Component
 * Apple Watch inspired activity ring - simplified version
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, Path, Skia, vec, Circle, LinearGradient } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  colors?: [string, string];
  backgroundColor?: string;
  delay?: number;
  showPulse?: boolean;
  children?: React.ReactNode;
}

export default function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 12,
  colors = ['#06FFA5', '#00E5FF'],
  backgroundColor = 'rgba(255, 255, 255, 0.08)',
  delay = 0,
  showPulse = true,
  children,
}: ProgressRingProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const animatedProgress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.2);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Update state from animated value
  const updateProgress = (val: number) => {
    setCurrentProgress(val);
  };

  useAnimatedReaction(
    () => animatedProgress.value,
    (value) => {
      runOnJS(updateProgress)(value);
    },
    [animatedProgress]
  );

  useEffect(() => {
    // Animate progress
    animatedProgress.value = withDelay(
      delay,
      withTiming(progress, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Subtle breathing pulse animation
    if (showPulse) {
      pulseScale.value = withDelay(
        delay + 800,
        withRepeat(
          withSequence(
            withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
      pulseOpacity.value = withDelay(
        delay + 800,
        withRepeat(
          withSequence(
            withTiming(0.15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.05, { duration: 3000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
    }
  }, [progress, delay, showPulse]);

  // Create arc path based on current progress
  const createArcPath = () => {
    const path = Skia.Path.Make();
    const startAngle = -90;
    const sweepAngle = (currentProgress / 100) * 360;

    if (sweepAngle > 0) {
      path.addArc(
        {
          x: strokeWidth / 2,
          y: strokeWidth / 2,
          width: size - strokeWidth,
          height: size - strokeWidth,
        },
        startAngle,
        sweepAngle
      );
    }

    return path;
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel={`Progress: ${Math.round(progress)} percent`}
      accessibilityRole="progressbar"
    >
      {/* Pulse glow effect */}
      {showPulse && (
        <Animated.View
          style={[
            styles.pulseGlow,
            {
              width: size + 30,
              height: size + 30,
              borderRadius: (size + 30) / 2,
              backgroundColor: colors[0],
            },
            pulseStyle,
          ]}
        />
      )}

      <Canvas style={{ width: size, height: size }}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          style="stroke"
          strokeWidth={strokeWidth}
          color={backgroundColor}
        />

        {/* Progress Arc */}
        {currentProgress > 0 && (
          <Path
            path={createArcPath()}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(size, size)}
              colors={colors}
            />
          </Path>
        )}
      </Canvas>

      {/* Center content */}
      {children && (
        <View style={styles.centerContent}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseGlow: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
