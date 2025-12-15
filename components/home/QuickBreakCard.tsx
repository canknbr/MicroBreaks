/**
 * Quick Break Card Component
 * Glassmorphism card for break type selection
 * Enhanced with clear "Start" action and recommended badge
 */

import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

interface QuickBreakCardProps {
  icon: string;
  title: string;
  duration: string;
  color: string;
  onPress: () => void;
  isRecommended?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function QuickBreakCard({
  icon,
  title,
  duration,
  color,
  onPress,
  isRecommended = false,
  accessibilityLabel,
  accessibilityHint,
}: QuickBreakCardProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withTiming(0.95, { duration: 100, easing: Easing.out(Easing.cubic) });
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pressed.value * 0.3,
  }));

  const playButtonStyle = useAnimatedStyle(() => ({
    opacity: 0.8 + pressed.value * 0.2,
    transform: [{ scale: 1 + pressed.value * 0.1 }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.isDark ? 0 : 0.1,
            shadowRadius: 8,
            elevation: theme.isDark ? 0 : 4,
          },
          animatedStyle,
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `Start ${title} break, ${duration}`}
        accessibilityHint={accessibilityHint || 'Double tap to start this break exercise'}
      >
        {/* BlurView only for dark mode */}
        {theme.isDark && (
          Platform.OS === 'ios' ? (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
          )
        )}

        {/* Top highlight - only for dark mode */}
        {theme.isDark && (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'transparent']}
            style={styles.highlight}
          />
        )}

        {/* Glow effect on press - only for dark mode */}
        {theme.isDark && <Animated.View style={[styles.glow, { backgroundColor: color }, glowStyle]} />}

        {/* Recommended badge */}
        {isRecommended && (
          <View style={[styles.recommendedBadge, { backgroundColor: color }]}>
            <Text style={styles.recommendedText}>FOR YOU</Text>
          </View>
        )}

        {/* Content */}
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
        <View style={styles.actionRow}>
          <Animated.View style={[styles.playButton, { backgroundColor: color }, playButtonStyle]}>
            <Ionicons name="play" size={10} color="#000" />
          </Animated.View>
          <Text style={[styles.duration, { color }]}>{duration}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 130,
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginRight: 12,
  },
  androidFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
    borderRadius: 20,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: -20,
    paddingHorizontal: 20,
    paddingVertical: 2,
    transform: [{ rotate: '45deg' }],
  },
  recommendedText: {
    fontSize: 6,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
  },
});
