/**
 * Primary Button Component
 * Modern CTA button with gradient and animations
 */

import React from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing, BorderRadius, Gradients } from '@/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  const tap = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => {
      scale.value = withSpring(0.95, { damping: 15 });
      glowOpacity.value = withTiming(1, { duration: 150 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15 });
      glowOpacity.value = withTiming(0.6, { duration: 300 });
    })
    .onEnd(() => {
      onPress();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        {/* Glow effect */}
        <Animated.View
          style={[styles.glow, animatedGlowStyle, disabled && styles.glowDisabled]}
        />

        <LinearGradient
          colors={
            disabled
              ? ['#1A3D47', '#0F2A33']
              : Gradients.primary.cyan
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}>
          <BlurView intensity={10} tint="dark" style={styles.blurContainer}>
            {loading ? (
              <ActivityIndicator color={Colors.dark.text.primary} size="small" />
            ) : (
              <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
                {title}
              </Text>
            )}
          </BlurView>
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 56,
    borderRadius: BorderRadius.button,
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#00D9FF',
    borderRadius: BorderRadius.button + 4,
    opacity: 0.6,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  glowDisabled: {
    backgroundColor: '#1A3D47',
    shadowColor: '#1A3D47',
    opacity: 0.2,
  },
  gradient: {
    flex: 1,
    borderRadius: BorderRadius.button,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    ...Typography.buttonMedium,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: Colors.dark.text.tertiary,
  },
});
