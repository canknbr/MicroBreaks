/**
 * Primary Button — "Outsiders" redesign.
 * Flat pill, no gradient/glow. `primary` = white pill (dark label),
 * `accent` = brand pink, `secondary` = subtle dark pill.
 */

import React from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'default' | 'large';
  style?: any;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const PRESS_DURATION = 100;
const RELEASE_DURATION = 200;

const VARIANT_BG: Record<string, string> = {
  primary: '#FFFFFF',
  accent: '#FF2472',
  secondary: 'rgba(255,255,255,0.08)',
};
const VARIANT_FG: Record<string, string> = {
  primary: '#0B0A0D',
  accent: '#FFFFFF',
  secondary: '#FFFFFF',
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'default',
  style,
  icon,
  iconPosition = 'left',
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const tap = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => {
      scale.value = withTiming(0.98, { duration: PRESS_DURATION, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(0.92, { duration: PRESS_DURATION });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onFinalize(() => {
      scale.value = withTiming(1, { duration: RELEASE_DURATION, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: RELEASE_DURATION });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const fg = VARIANT_FG[variant] ?? '#0B0A0D';
  const bg = disabled ? 'rgba(255,255,255,0.12)' : VARIANT_BG[variant] ?? '#FFFFFF';
  const height = size === 'large' ? 58 : 54;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[styles.button, { height, backgroundColor: bg }, animatedStyle, style]}
      >
        {loading ? (
          <ActivityIndicator color={disabled ? 'rgba(255,255,255,0.5)' : fg} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
            <Text style={[styles.text, { color: disabled ? 'rgba(255,255,255,0.5)' : fg }]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    letterSpacing: 0,
    textAlign: 'center',
  },
  iconLeft: {},
  iconRight: {},
});
