/**
 * Premium Zen Primary Button
 * Smooth, elegant press interactions
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
import { LinearGradient } from 'expo-linear-gradient';
import {
  ZenColors,
  ZenSpacing,
  ZenRadius,
  ZenSizes,
  ZenTypography,
} from '../constants/design';

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
      opacity.value = withTiming(0.9, { duration: PRESS_DURATION });
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

  const gradientColors = {
    primary: [ZenColors.primary.main, ZenColors.primary.dark] as [string, string],
    secondary: [ZenColors.secondary.main, ZenColors.secondary.dark] as [string, string],
    accent: [ZenColors.accent.main, ZenColors.accent.dark] as [string, string],
  };

  const shadowColors = {
    primary: ZenColors.primary.main,
    secondary: ZenColors.secondary.main,
    accent: ZenColors.accent.main,
  };

  const isLarge = size === 'large';
  const buttonHeight = isLarge ? 64 : ZenSizes.button.height;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.button,
          { height: buttonHeight },
          !disabled && {
            shadowColor: shadowColors[variant],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 8,
          },
          disabled && styles.buttonDisabled,
          animatedStyle,
          style,
        ]}
      >
        <LinearGradient
          colors={
            disabled
              ? [ZenColors.border.default, ZenColors.border.subtle]
              : gradientColors[variant]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator
              color={disabled ? ZenColors.text.muted : ZenColors.text.inverse}
              size="small"
            />
          ) : (
            <View style={styles.content}>
              {icon && iconPosition === 'left' && (
                <View style={styles.iconLeft}>{icon}</View>
              )}
              <Text
                style={[
                  styles.text,
                  isLarge && styles.textLarge,
                  disabled && styles.textDisabled,
                ]}
              >
                {title}
              </Text>
              {icon && iconPosition === 'right' && (
                <View style={styles.iconRight}>{icon}</View>
              )}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: ZenRadius.full,
    overflow: 'hidden',
    minWidth: ZenSizes.button.minWidth,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ZenSpacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ZenSpacing.sm,
  },
  text: {
    ...ZenTypography.label.large,
    color: ZenColors.text.inverse,
    textAlign: 'center',
  },
  textLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  textDisabled: {
    color: ZenColors.text.muted,
  },
  iconLeft: {
    marginRight: ZenSpacing.xs,
  },
  iconRight: {
    marginLeft: ZenSpacing.xs,
  },
});
