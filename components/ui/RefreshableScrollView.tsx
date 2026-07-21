/**
 * Refreshable ScrollView Component
 * Custom pull-to-refresh with animated indicator
 */

import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Platform,
  ScrollViewProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';

interface RefreshableScrollViewProps extends ScrollViewProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  backgroundColor?: string;
}

export function RefreshableScrollView({
  onRefresh,
  children,
  backgroundColor,
  ...scrollViewProps
}: RefreshableScrollViewProps) {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const rotation = useSharedValue(0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Start rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );

    try {
      await onRefresh();
    } finally {
      cancelAnimation(rotation);
      rotation.value = 0;
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [onRefresh, rotation]);

  const bgColor = backgroundColor || theme.background.primary;

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.accent.primary}
          colors={[theme.accent.primary, theme.accent.secondary]}
          progressBackgroundColor={theme.isDark ? '#1C1922' : '#ffffff'}
          progressViewOffset={Platform.OS === 'android' ? 20 : 0}
        />
      }
      style={[{ backgroundColor: bgColor }, scrollViewProps.style]}
    >
      {children}
    </ScrollView>
  );
}

// Animated ScrollView version with Reanimated
interface AnimatedRefreshableScrollViewProps extends RefreshableScrollViewProps {
  animatedStyle?: any;
}

export function AnimatedRefreshableScrollView({
  onRefresh,
  children,
  backgroundColor,
  animatedStyle,
  ...scrollViewProps
}: AnimatedRefreshableScrollViewProps) {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [onRefresh]);

  const bgColor = backgroundColor || theme.background.primary;

  return (
    <Animated.ScrollView
      {...scrollViewProps}
      style={[{ backgroundColor: bgColor }, scrollViewProps.style, animatedStyle]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.accent.primary}
          colors={[theme.accent.primary, theme.accent.secondary]}
          progressBackgroundColor={theme.isDark ? '#1C1922' : '#ffffff'}
        />
      }
    >
      {children}
    </Animated.ScrollView>
  );
}

// Custom animated refresh indicator
export function CustomRefreshIndicator({ refreshing }: { refreshing: boolean }) {
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  React.useEffect(() => {
    if (refreshing) {
      scale.value = withTiming(1, { duration: 200 });
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [refreshing, rotation, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.refreshContainer, containerStyle]}>
      <Animated.View style={[styles.refreshSpinner, spinStyle]}>
        <View style={[styles.spinnerArc, { borderTopColor: theme.accent.primary }]} />
      </Animated.View>
    </Animated.View>
  );
}

// Pulsing dots indicator
export function PulsingDotsIndicator({ active }: { active: boolean }) {
  const theme = useTheme();
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);

  React.useEffect(() => {
    if (active) {
      dot1Scale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        true
      );
      dot2Scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(1.3, { duration: 300 }),
          withTiming(1, { duration: 150 })
        ),
        -1,
        true
      );
      dot3Scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(1.3, { duration: 300 })
        ),
        -1,
        true
      );
    } else {
      dot1Scale.value = withTiming(1);
      dot2Scale.value = withTiming(1);
      dot3Scale.value = withTiming(1);
    }
  }, [active, dot1Scale, dot2Scale, dot3Scale]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[styles.dot, { backgroundColor: theme.accent.primary }, dot1Style]}
      />
      <Animated.View
        style={[styles.dot, { backgroundColor: theme.accent.secondary }, dot2Style]}
      />
      <Animated.View
        style={[styles.dot, { backgroundColor: theme.accent.tertiary }, dot3Style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  refreshContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  refreshSpinner: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerArc: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
});

export default RefreshableScrollView;
