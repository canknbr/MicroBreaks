/**
 * Smart Insight Component
 * Context-aware messages and recommendations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
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

type InsightType = 'warning' | 'suggestion' | 'achievement' | 'motivation';

interface SmartInsightProps {
  type: InsightType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  delay?: number;
}

const INSIGHT_CONFIG: Record<InsightType, { icon: IoniconsName; colors: [string, string]; iconColor: string }> = {
  warning: {
    icon: 'alert-circle',
    colors: ['rgba(255, 107, 107, 0.15)', 'rgba(255, 107, 107, 0.05)'],
    iconColor: '#EB3E38',
  },
  suggestion: {
    icon: 'bulb',
    colors: ['rgba(6, 255, 165, 0.15)', 'rgba(6, 255, 165, 0.05)'],
    iconColor: '#FF2472',
  },
  achievement: {
    icon: 'trophy',
    colors: ['rgba(255, 209, 102, 0.15)', 'rgba(255, 209, 102, 0.05)'],
    iconColor: '#FAE34B',
  },
  motivation: {
    icon: 'sparkles',
    colors: ['rgba(180, 126, 255, 0.15)', 'rgba(180, 126, 255, 0.05)'],
    iconColor: '#BC26F4',
  },
};

function SmartInsight({
  type,
  title,
  message,
  actionLabel,
  onAction,
  delay = 0,
}: SmartInsightProps) {
  const theme = useTheme();
  const config = INSIGHT_CONFIG[type];
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const iconPulse = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));

    // Pulse animation for warning type
    if (type === 'warning') {
      iconPulse.value = withDelay(
        delay + 500,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration: 500 }),
            withTiming(1, { duration: 500 })
          ),
          3,
          false
        )
      );
    }
  }, [delay, iconPulse, opacity, translateY, type]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconPulse.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAction?.();
  };

  const accessibilityTypeMap: Record<InsightType, string> = {
    warning: 'Alert',
    suggestion: 'Tip',
    achievement: 'Achievement',
    motivation: 'Motivation',
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0 : 0.08,
          shadowRadius: 8,
          elevation: theme.isDark ? 0 : 4,
        },
        containerStyle,
      ]}
      accessible
      accessibilityRole={type === 'warning' ? 'alert' : 'text'}
      accessibilityLabel={`${accessibilityTypeMap[type]}: ${title}. ${message}`}
    >
      {/* BlurView only for dark mode */}
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20, 20, 30, 0.9)' }]} />
        )
      )}

      {/* Gradient overlay - subtle for light mode */}
      <LinearGradient
        colors={theme.isDark ? config.colors : [`${config.iconColor}08`, `${config.iconColor}02`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { backgroundColor: `${config.iconColor}20` }, iconStyle]} accessibilityElementsHidden>
          <Ionicons name={config.icon} size={20} color={config.iconColor} />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>
        </View>

        {actionLabel && (
          <Pressable
            style={styles.actionButton}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            accessibilityHint="Takes action based on the insight"
          >
            <Text style={[styles.actionLabel, { color: config.iconColor }]}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={16} color={config.iconColor} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export default React.memo(SmartInsight);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
