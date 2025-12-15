/**
 * Break Completion Component
 * Success screen with stats and celebration
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
  withSpring,
  withSequence,
} from 'react-native-reanimated';

interface BreakCompletionProps {
  title: string;
  icon: string;
  color: string;
  stats: {
    totalDuration: number;
    stepsCompleted: number;
    totalSteps: number;
    xpEarned: number;
  };
}

export default function BreakCompletion({
  title,
  icon,
  color,
  stats,
}: BreakCompletionProps) {
  const iconScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animation
    iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    statsOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    confettiOpacity.value = withSequence(
      withDelay(100, withTiming(1, { duration: 300 })),
      withDelay(2000, withTiming(0.3, { duration: 500 }))
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 20 }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: (1 - statsOpacity.value) * 20 }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <View style={styles.container}>
      {/* Confetti emojis */}
      <Animated.View style={[styles.confettiContainer, confettiStyle]}>
        <Text style={[styles.confetti, styles.confetti1]}>🎉</Text>
        <Text style={[styles.confetti, styles.confetti2]}>✨</Text>
        <Text style={[styles.confetti, styles.confetti3]}>🎊</Text>
        <Text style={[styles.confetti, styles.confetti4]}>⭐</Text>
      </Animated.View>

      {/* Success Icon */}
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <LinearGradient
          colors={[color, `${color}80`]}
          style={styles.iconGradient}
        />
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.checkBadge}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View style={titleStyle}>
        <Text style={styles.title}>Great Job!</Text>
        <Text style={styles.subtitle}>You completed {title}</Text>
      </Animated.View>

      {/* Stats Card */}
      <Animated.View style={[styles.statsCard, statsStyle]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(stats.totalDuration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.stepsCompleted}/{stats.totalSteps}</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color }]}>+{stats.xpEarned}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    fontSize: 40,
  },
  confetti1: {
    top: '10%',
    left: '15%',
  },
  confetti2: {
    top: '15%',
    right: '20%',
  },
  confetti3: {
    top: '25%',
    left: '25%',
  },
  confetti4: {
    top: '20%',
    right: '15%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  iconGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  icon: {
    fontSize: 60,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06FFA5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  checkMark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
