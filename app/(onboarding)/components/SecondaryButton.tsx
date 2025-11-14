/**
 * Secondary Button Component
 * Modern secondary action button with subtle animations
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing } from '@/theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export default function SecondaryButton({
  title,
  onPress,
  disabled = false,
  style,
}: SecondaryButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(0.96, { damping: 15 });
      opacity.value = withSpring(0.6, { damping: 15 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withSpring(1, { damping: 15 });
    })
    .onEnd(() => {
      onPress();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.button, style, animatedStyle]}>
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          {title}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    ...Typography.buttonMedium,
    color: Colors.dark.text.secondary,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: Colors.dark.text.tertiary,
  },
});
