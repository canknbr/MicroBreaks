/**
 * Premium Zen Option Card
 * Glassmorphism selection card with smooth animations
 */

import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  ZenColors,
  ZenSpacing,
  ZenRadius,
  ZenTypography,
} from '../constants/design';

interface OptionCardProps {
  icon?: string;
  title: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  variant?: 'default' | 'compact';
  style?: any;
}

export default function OptionCard({
  icon,
  title,
  description,
  selected = false,
  onPress,
  variant = 'default',
  style,
}: OptionCardProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.98, { duration: 100, easing: Easing.out(Easing.cubic) });
      pressed.value = withTiming(1, { duration: 100 });
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onFinalize(() => {
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
      pressed.value = withTiming(0, { duration: 200 });
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedBorderStyle = useAnimatedStyle(() => ({
    opacity: selected ? 1 : interpolate(pressed.value, [0, 1], [0, 0.5]),
  }));

  const isCompact = variant === 'compact';

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.container, style, animatedContainerStyle]}>
        {/* Gradient Border (visible when selected) */}
        <Animated.View style={[styles.gradientBorder, animatedBorderStyle]}>
          <LinearGradient
            colors={[ZenColors.primary.main, ZenColors.secondary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Glassmorphism Background */}
        <View style={[styles.card, isCompact && styles.cardCompact, selected && styles.cardSelected]}>
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={selected ? 40 : 25}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
          )}

          {/* Glass highlight (top edge shine) */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'transparent']}
            style={styles.glassHighlight}
          />

          {/* Content wrapper */}
          <View style={styles.cardContent}>
            {/* Icon */}
            {icon && (
              <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Text style={styles.icon}>{icon}</Text>
              </View>
            )}

            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  isCompact && styles.titleCompact,
                  selected && styles.titleSelected,
                ]}
                numberOfLines={2}
              >
                {title}
              </Text>
              {description && !isCompact && (
                <Text style={styles.description} numberOfLines={2}>
                  {description}
                </Text>
              )}
            </View>

            {/* Checkbox */}
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
              {selected && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={ZenColors.text.inverse}
                />
              )}
            </View>
          </View>

          {/* Selection glow effect */}
          {selected && (
            <LinearGradient
              colors={[ZenColors.primary.glow, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.selectionGlow}
            />
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: ZenSpacing.sm,
    borderRadius: ZenRadius.lg,
    overflow: 'hidden',
  },
  gradientBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ZenRadius.lg,
  },
  card: {
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: ZenRadius.lg - 1,
    margin: 1,
    minHeight: 72,
    overflow: 'hidden',
  },
  cardCompact: {
    minHeight: 56,
  },
  cardSelected: {
    backgroundColor: 'rgba(6, 255, 165, 0.12)',
    borderColor: 'rgba(6, 255, 165, 0.4)',
  },
  androidFallback: {
    backgroundColor: 'rgba(18, 18, 26, 0.92)',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ZenSpacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: ZenRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ZenSpacing.md,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: ZenSpacing.sm,
  },
  title: {
    ...ZenTypography.title.medium,
    color: ZenColors.text.primary,
    marginBottom: 2,
  },
  titleCompact: {
    ...ZenTypography.body.medium,
    fontWeight: '600',
    marginBottom: 0,
  },
  titleSelected: {
    color: ZenColors.primary.main,
  },
  description: {
    ...ZenTypography.body.small,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: ZenRadius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkboxSelected: {
    borderColor: ZenColors.primary.main,
    backgroundColor: ZenColors.primary.main,
    shadowColor: ZenColors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  selectionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    opacity: 0.5,
  },
});
