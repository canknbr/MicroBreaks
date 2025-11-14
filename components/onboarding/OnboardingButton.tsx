/**
 * Onboarding Button
 * Primary and secondary button variants for onboarding flow
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useColorScheme } from '../../hooks/useColorScheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface OnboardingButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getButtonStyle = () => {
    if (variant === 'primary') {
      return {
        backgroundColor: disabled ? colors.interactive.disabled : colors.brand.primary,
        ...Shadows.sm,
      };
    } else if (variant === 'secondary') {
      return {
        backgroundColor: colors.background.secondary,
        borderWidth: 2,
        borderColor: colors.border.default,
      };
    } else {
      return {
        backgroundColor: 'transparent',
      };
    }
  };

  const getTextStyle = () => {
    if (variant === 'primary') {
      return { color: '#FFFFFF' };
    } else if (variant === 'secondary') {
      return { color: colors.text.primary };
    } else {
      return { color: colors.text.secondary };
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        animatedStyle,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.brand.primary} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, Typography.buttonMedium, getTextStyle()]}>{title}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
});
