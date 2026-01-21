/**
 * Empty State Component
 * Displayed when user has no breaks/data
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

type EmptyStateType = 'no_breaks_today' | 'no_streak' | 'new_user' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, {
  icon: IoniconsName;
  title: string;
  message: string;
  actionLabel: string;
  gradient: [string, string];
}> = {
  no_breaks_today: {
    icon: 'sunny',
    title: 'Start Your Day Right',
    message: "You haven't taken any breaks yet today. Your body will thank you!",
    actionLabel: 'Take First Break',
    gradient: ['#06FFA5', '#00E5FF'],
  },
  no_streak: {
    icon: 'flame',
    title: 'Build Your Streak',
    message: 'Complete your daily goal to start a streak. Consistency is key!',
    actionLabel: 'Start Now',
    gradient: ['#FFD166', '#FF9500'],
  },
  new_user: {
    icon: 'sparkles',
    title: 'Welcome to MicroBreaks',
    message: 'Take regular breaks to boost your productivity and well-being.',
    actionLabel: 'Take Your First Break',
    gradient: ['#B47EFF', '#9055E8'],
  },
  error: {
    icon: 'cloud-offline',
    title: 'Something Went Wrong',
    message: "We couldn't load your data. Please try again.",
    actionLabel: 'Retry',
    gradient: ['#FF6B6B', '#FF4757'],
  },
};

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const theme = useTheme();
  const config = EMPTY_STATE_CONFIG[type];
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const iconPulse = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    iconPulse.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAction?.();
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme.isDark ? 0 : 0.12,
        shadowRadius: 16,
        elevation: theme.isDark ? 0 : 6,
      },
      containerStyle,
    ]}>
      {/* BlurView only for dark mode */}
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.95)' }]} />
        )
      )}

      {/* Gradient overlay - subtle for light mode */}
      <LinearGradient
        colors={[`${config.gradient[0]}${theme.isDark ? '15' : '08'}`, 'transparent']}
        style={styles.gradientOverlay}
      />

      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <LinearGradient
          colors={config.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Ionicons name={config.icon} size={32} color="#000" />
      </Animated.View>

      <Text style={[styles.title, { color: theme.text.primary }]}>{config.title}</Text>
      <Text style={[styles.message, { color: theme.text.secondary }]}>{config.message}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={config.actionLabel}
      >
        <LinearGradient
          colors={config.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <Text style={styles.actionLabel}>{config.actionLabel}</Text>
        <Ionicons name="arrow-forward" size={18} color="#000" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 32,
    alignItems: 'center',
    marginVertical: 20,
  },
  androidFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.95)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
});
