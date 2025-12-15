/**
 * Premium Zen Secondary Button
 * Subtle, elegant text button
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ZenColors, ZenSpacing, ZenTypography } from '../constants/design';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'muted' | 'accent';
  style?: any;
}

export default function SecondaryButton({
  title,
  onPress,
  disabled = false,
  variant = 'default',
  style,
}: SecondaryButtonProps) {
  const opacity = useSharedValue(1);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      opacity.value = withTiming(0.5, { duration: 100 });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onFinalize(() => {
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const textColors = {
    default: ZenColors.text.secondary,
    muted: ZenColors.text.muted,
    accent: ZenColors.primary.main,
  };

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.button, animatedStyle, style]}>
        <Text
          style={[
            styles.buttonText,
            { color: textColors[variant] },
            disabled && styles.buttonTextDisabled,
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: ZenSpacing.md,
    paddingHorizontal: ZenSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    ...ZenTypography.label.medium,
    fontWeight: '500',
  },
  buttonTextDisabled: {
    color: ZenColors.text.muted,
  },
});
