/**
 * Home Screen Skeleton
 * Loading placeholder with shimmer animation
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Spacing } from '@/theme';

function ShimmerBox({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export default function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <ShimmerBox width={120} height={14} borderRadius={4} />
        <ShimmerBox width={200} height={32} borderRadius={6} style={{ marginTop: 8 }} />
        <ShimmerBox width={180} height={16} borderRadius={4} style={{ marginTop: 8 }} />
      </View>

      {/* Level Badge Skeleton */}
      <View style={styles.levelBadge}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.cardFallback]} />
        )}
        <View style={styles.levelContent}>
          <ShimmerBox width={44} height={44} borderRadius={22} />
          <View style={styles.levelInfo}>
            <ShimmerBox width={120} height={16} borderRadius={4} />
            <ShimmerBox width={180} height={6} borderRadius={3} style={{ marginTop: 8 }} />
          </View>
        </View>
      </View>

      {/* Smart Insight Skeleton */}
      <View style={styles.insightCard}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.cardFallback]} />
        )}
        <View style={styles.insightContent}>
          <ShimmerBox width={40} height={40} borderRadius={12} />
          <View style={styles.insightText}>
            <ShimmerBox width={140} height={14} borderRadius={4} />
            <ShimmerBox width={200} height={12} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>

      {/* Progress Ring Skeleton */}
      <View style={styles.progressSection}>
        <ShimmerBox width={180} height={180} borderRadius={90} />
      </View>

      {/* Stats Card Skeleton */}
      <View style={styles.statsCard}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.cardFallback]} />
        )}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ShimmerBox width={40} height={28} borderRadius={4} />
            <ShimmerBox width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statItem}>
            <ShimmerBox width={50} height={28} borderRadius={4} />
            <ShimmerBox width={40} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statItem}>
            <ShimmerBox width={45} height={28} borderRadius={4} />
            <ShimmerBox width={45} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>

      {/* Quick Breaks Skeleton */}
      <View style={styles.section}>
        <ShimmerBox width={100} height={18} borderRadius={4} />
        <View style={styles.quickBreaksRow}>
          {[1, 2, 3, 4].map((i) => (
            <ShimmerBox key={i} width={72} height={90} borderRadius={16} style={{ marginRight: 12 }} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  levelBadge: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  cardFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  levelInfo: {
    flex: 1,
    marginLeft: 12,
  },
  insightCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  statsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  quickBreaksRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
});
