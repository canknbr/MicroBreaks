/**
 * Animated Stat Component
 * Count-up animation for statistics
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
  duration?: number;
  color?: string;
  icon?: string;
  comparison?: {
    value: number;
    isPositive: boolean;
  };
}

export default function AnimatedStat({
  value,
  suffix = '',
  label,
  delay = 0,
  duration = 1000,
  color = '#FFFFFF',
  icon,
  comparison,
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  // Update display value from animated value
  const updateDisplayValue = (val: number) => {
    setDisplayValue(Math.round(val));
  };

  useAnimatedReaction(
    () => animatedValue.value,
    (currentValue) => {
      runOnJS(updateDisplayValue)(currentValue);
    },
    [animatedValue]
  );

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
    animatedValue.value = withDelay(
      delay + 200,
      withTiming(value, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [value, delay, duration]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.valueContainer}>
        {icon && (
          <Ionicons name={icon as any} size={20} color={color} style={styles.icon} />
        )}
        <Text style={[styles.value, { color }]}>
          {displayValue}{suffix}
        </Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      {comparison && (
        <View style={styles.comparisonContainer}>
          <Text
            style={[
              styles.comparison,
              comparison.isPositive ? styles.comparisonPositive : styles.comparisonNegative,
            ]}
          >
            {comparison.isPositive ? '↑' : '↓'} {Math.abs(comparison.value)}%
          </Text>
          <Text style={styles.comparisonLabel}>vs yesterday</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  value: {
    fontSize: 36,
    fontWeight: '200',
    letterSpacing: -1,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  comparison: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  comparisonPositive: {
    color: '#06FFA5',
  },
  comparisonNegative: {
    color: '#EF476F',
  },
  comparisonLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
