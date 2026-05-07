/**
 * Shimmer Placeholder Component
 * Premium wave shimmer effect for loading states
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShimmerPlaceholderProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function ShimmerPlaceholder({
  width,
  height,
  borderRadius = 8,
  style,
}: ShimmerPlaceholderProps) {
  const theme = useTheme();
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [shimmerPosition]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmerPosition.value, [-1, 1], [-SCREEN_WIDTH, SCREEN_WIDTH]) },
    ],
  }));

  const baseColor = theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const shimmerColor = theme.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', shimmerColor, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

// Skeleton components for different use cases
interface SkeletonProps {
  style?: ViewStyle;
}

export function TextSkeleton({ style, lines = 1, width = '100%' as const }: SkeletonProps & { lines?: number; width?: number | `${number}%` }) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerPlaceholder
          key={i}
          width={i === lines - 1 && lines > 1 ? '60%' : width}
          height={14}
          borderRadius={4}
          style={i > 0 ? { marginTop: 8 } : undefined}
        />
      ))}
    </View>
  );
}

export function AvatarSkeleton({ size = 48, style }: SkeletonProps & { size?: number }) {
  return (
    <ShimmerPlaceholder
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

export function CardSkeleton({ style }: SkeletonProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : theme.background.card,
          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        },
        style,
      ]}
    >
      <View style={styles.cardRow}>
        <AvatarSkeleton size={40} />
        <View style={styles.cardTextContainer}>
          <ShimmerPlaceholder width={120} height={14} borderRadius={4} />
          <ShimmerPlaceholder width={180} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  );
}

export function ListItemSkeleton({ style }: SkeletonProps) {
  return (
    <View style={[styles.listItem, style]}>
      <AvatarSkeleton size={44} />
      <View style={styles.listItemContent}>
        <ShimmerPlaceholder width="70%" height={14} borderRadius={4} />
        <ShimmerPlaceholder width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <ShimmerPlaceholder width={60} height={24} borderRadius={12} />
    </View>
  );
}

export function StatCardSkeleton({ style }: SkeletonProps) {
  return (
    <View style={[styles.statCard, style]}>
      <ShimmerPlaceholder width={32} height={32} borderRadius={8} />
      <ShimmerPlaceholder width={50} height={24} borderRadius={4} style={{ marginTop: 8 }} />
      <ShimmerPlaceholder width={40} height={12} borderRadius={4} style={{ marginTop: 4 }} />
    </View>
  );
}

export function BreakCardSkeleton({ style }: SkeletonProps) {
  return (
    <View style={[styles.breakCard, style]}>
      <ShimmerPlaceholder width={48} height={48} borderRadius={16} />
      <ShimmerPlaceholder width={60} height={14} borderRadius={4} style={{ marginTop: 8 }} />
      <ShimmerPlaceholder width={40} height={20} borderRadius={10} style={{ marginTop: 6 }} />
    </View>
  );
}

// Full skeleton screens
export function HomeScreenSkeletonV2() {
  const theme = useTheme();

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <ShimmerPlaceholder width={100} height={12} borderRadius={4} />
        <ShimmerPlaceholder width={180} height={28} borderRadius={6} style={{ marginTop: 8 }} />
        <ShimmerPlaceholder width={150} height={14} borderRadius={4} style={{ marginTop: 8 }} />
      </View>

      {/* Level Card */}
      <CardSkeleton style={{ marginBottom: 12 }} />

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <ShimmerPlaceholder width={140} height={140} borderRadius={70} />
      </View>

      {/* Quick Breaks */}
      <View style={styles.section}>
        <ShimmerPlaceholder width={100} height={18} borderRadius={4} />
        <View style={styles.breaksRow}>
          {[1, 2, 3, 4].map((i) => (
            <BreakCardSkeleton key={i} style={{ marginRight: 12 }} />
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        {[1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} style={{ flex: 1, marginHorizontal: 4 }} />
        ))}
      </View>
    </View>
  );
}

export function BreaksScreenSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background.primary }]}>
      {/* Search */}
      <ShimmerPlaceholder width="100%" height={48} borderRadius={12} style={{ marginBottom: 16 }} />

      {/* Filter chips */}
      <View style={styles.chipsRow}>
        {[1, 2, 3, 4].map((i) => (
          <ShimmerPlaceholder
            key={i}
            width={70}
            height={32}
            borderRadius={16}
            style={{ marginRight: 8 }}
          />
        ))}
      </View>

      {/* Categories */}
      {[1, 2, 3].map((cat) => (
        <View key={cat} style={styles.categorySection}>
          <ShimmerPlaceholder width={120} height={20} borderRadius={4} />
          <ShimmerPlaceholder width={80} height={14} borderRadius={4} style={{ marginTop: 4 }} />
          <View style={styles.categoryItems}>
            {[1, 2, 3].map((item) => (
              <ListItemSkeleton key={item} style={{ marginTop: 12 }} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function StatsScreenSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background.primary }]}>
      {/* Period selector */}
      <View style={styles.chipsRow}>
        {[1, 2, 3, 4].map((i) => (
          <ShimmerPlaceholder
            key={i}
            width={60}
            height={32}
            borderRadius={16}
            style={{ marginRight: 8 }}
          />
        ))}
      </View>

      {/* Chart */}
      <ShimmerPlaceholder width="100%" height={200} borderRadius={16} style={{ marginTop: 16 }} />

      {/* Stats grid */}
      <View style={[styles.statsSection, { marginTop: 16 }]}>
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} style={{ width: '48%', marginBottom: 8 }} />
        ))}
      </View>

      {/* Recent breaks */}
      <ShimmerPlaceholder width={120} height={18} borderRadius={4} style={{ marginTop: 16 }} />
      {[1, 2, 3].map((i) => (
        <ListItemSkeleton key={i} style={{ marginTop: 12 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  textContainer: {
    width: '100%',
  },
  card: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  breakCard: {
    width: 100,
    alignItems: 'center',
    padding: 12,
  },
  screenContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  progressSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  breaksRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryItems: {
    marginTop: 8,
  },
});

export default ShimmerPlaceholder;
