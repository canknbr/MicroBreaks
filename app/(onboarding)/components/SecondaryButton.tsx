/**
 * Secondary Button Component
 * Simple text button inspired by "How We Feel" design
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
  const opacity = useSharedValue(1);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      opacity.value = withSpring(0.5, { damping: 15 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    })
    .onFinalize(() => {
      opacity.value = withSpring(1, { damping: 15 });
    })
    .onEnd(() => {
      onPress();
    });

  const animatedStyle = useAnimatedStyle(() => ({
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    ...Typography.buttonMedium,
    color: Colors.dark.text.secondary,
    fontWeight: '500',
  },
  buttonTextDisabled: {
    color: Colors.dark.text.tertiary,
  },
});
