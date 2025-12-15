/**
 * Level Badge Component
 * Gamification element showing user level and XP
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface LevelBadgeProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  title: string;
  delay?: number;
}

const LEVEL_COLORS: Record<number, [string, string]> = {
  1: ['#9CA3AF', '#6B7280'], // Gray - Beginner
  2: ['#06FFA5', '#00CC84'], // Green - Regular
  3: ['#00E5FF', '#0099CC'], // Cyan - Committed
  4: ['#B47EFF', '#9055E8'], // Purple - Dedicated
  5: ['#FFD166', '#FFAA00'], // Gold - Master
};

function LevelBadge({
  level,
  currentXP,
  nextLevelXP,
  title,
  delay = 0,
}: LevelBadgeProps) {
  const theme = useTheme();
  const colors = LEVEL_COLORS[Math.min(level, 5)] || LEVEL_COLORS[1];
  const progress = (currentXP / nextLevelXP) * 100;

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.05, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 200 })
      )
    );
    progressWidth.value = withDelay(delay + 300, withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [delay, progress]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View style={[
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
    ]}>
      {/* BlurView only for dark mode */}
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
        )
      )}

      <View style={styles.content}>
        {/* Level Circle */}
        <View style={styles.levelCircle}>
          <LinearGradient
            colors={colors}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.levelNumber}>{level}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          <View style={styles.xpContainer}>
            <View style={[styles.progressTrack, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border.medium }]}>
              <Animated.View style={[styles.progressFill, progressStyle]}>
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <Text style={[styles.xpText, { color: theme.text.muted }]}>{currentXP}/{nextLevelXP} XP</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default React.memo(LevelBadge);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  androidFallback: {
    backgroundColor: 'rgba(20, 20, 30, 0.9)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  levelCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  xpText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    minWidth: 55,
  },
});
