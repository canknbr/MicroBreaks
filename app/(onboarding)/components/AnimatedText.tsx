/**
 * Premium Animated Text Component
 * Clean, smooth fade animations
 */

import React, { useEffect } from 'react';
import { View, TextStyle, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { ZenColors, ZenTypography } from '../constants/design';

type AnimationVariant = 'fadeUp' | 'fadeIn';
type TypographyVariant = 'displayLarge' | 'displayMedium' | 'displaySmall' |
  'headlineLarge' | 'headlineMedium' | 'headlineSmall' |
  'titleLarge' | 'titleMedium' |
  'bodyLarge' | 'bodyMedium' | 'bodySmall' |
  'labelLarge' | 'labelMedium' | 'labelSmall' | 'caption';

interface AnimatedTextProps {
  children: string;
  variant?: TypographyVariant;
  animation?: AnimationVariant;
  delay?: number;
  duration?: number;
  color?: string;
  style?: TextStyle;
  containerStyle?: ViewStyle;
}

const TYPOGRAPHY_MAP: Record<TypographyVariant, TextStyle> = {
  displayLarge: ZenTypography.display.large,
  displayMedium: ZenTypography.display.medium,
  displaySmall: ZenTypography.display.small,
  headlineLarge: ZenTypography.headline.large,
  headlineMedium: ZenTypography.headline.medium,
  headlineSmall: ZenTypography.headline.small,
  titleLarge: ZenTypography.title.large,
  titleMedium: ZenTypography.title.medium,
  bodyLarge: ZenTypography.body.large,
  bodyMedium: ZenTypography.body.medium,
  bodySmall: ZenTypography.body.small,
  labelLarge: ZenTypography.label.large,
  labelMedium: ZenTypography.label.medium,
  labelSmall: ZenTypography.label.small,
  caption: ZenTypography.caption,
};

export default function AnimatedText({
  children,
  variant = 'bodyLarge',
  animation = 'fadeUp',
  delay = 0,
  duration = 500,
  color = ZenColors.text.primary,
  style,
  containerStyle,
}: AnimatedTextProps) {
  const progress = useSharedValue(0);
  // Calculate initial translateY based on animation type (outside worklet)
  const initialTranslateY = animation === 'fadeUp' ? 12 : 0;

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [initialTranslateY, 0]) }],
  }));

  const textStyle: TextStyle = {
    ...(TYPOGRAPHY_MAP[variant] || ZenTypography.body.large),
    color,
    ...style,
  };

  return (
    <View style={containerStyle}>
      <Animated.Text style={[textStyle, animatedStyle]}>
        {children}
      </Animated.Text>
    </View>
  );
}

// Pre-configured variants
export function HeadlineText({
  children,
  delay = 0,
  style,
  ...props
}: Omit<AnimatedTextProps, 'variant'>) {
  return (
    <AnimatedText
      variant="headlineLarge"
      animation="fadeUp"
      delay={delay}
      duration={600}
      {...props}
      style={style}
    >
      {children}
    </AnimatedText>
  );
}

export function SubheadText({
  children,
  delay = 100,
  style,
  ...props
}: Omit<AnimatedTextProps, 'variant'>) {
  return (
    <AnimatedText
      variant="bodyLarge"
      animation="fadeUp"
      delay={delay}
      duration={500}
      color={ZenColors.text.secondary}
      {...props}
      style={style}
    >
      {children}
    </AnimatedText>
  );
}

export function DisplayText({
  children,
  delay = 0,
  style,
  ...props
}: Omit<AnimatedTextProps, 'variant'>) {
  return (
    <AnimatedText
      variant="displayMedium"
      animation="fadeUp"
      delay={delay}
      duration={700}
      {...props}
      style={style}
    >
      {children}
    </AnimatedText>
  );
}
