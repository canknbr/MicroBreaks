/**
 * Primary Button Component
 * Clean white button inspired by "How We Feel" design
 */

import React from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

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

  const tap = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => {
      scale.value = withSpring(0.97, { damping: 15 });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15 });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          style,
          animatedStyle,
        ]}>
        {loading ? (
          <ActivityIndicator color={Colors.dark.text.inverse} size="small" />
        ) : (
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
            {title}
          </Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.dark.interactive.primary,
    minHeight: 56,
    borderRadius: 28, // Fully rounded like "How We Feel"
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: Colors.dark.interactive.primaryDisabled,
    shadowOpacity: 0,
  },
  buttonText: {
    ...Typography.buttonMedium,
    color: Colors.dark.text.inverse,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: Colors.dark.text.tertiary,
  },
});
