/**
 * Weekly Insights Component
 * Smart analysis of user's break patterns
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface InsightItem {
  icon: string;
  label: string;
  value: string;
  change: number; // percentage change from last week
  color: string;
}

interface WeeklyInsightsProps {
  insights: InsightItem[];
  delay?: number;
}

export default function WeeklyInsights({ insights, delay = 0 }: WeeklyInsightsProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [delay]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
      )}

      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
        style={styles.headerGradient}
      />

      <View style={styles.header}>
        <Ionicons name="analytics" size={18} color="#B47EFF" />
        <Text style={styles.headerTitle}>This Week</Text>
      </View>

      <View style={styles.insightsGrid}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={[styles.insightIcon, { backgroundColor: `${insight.color}15` }]}>
              <Ionicons name={insight.icon as any} size={18} color={insight.color} />
            </View>
            <Text style={styles.insightValue}>{insight.value}</Text>
            <Text style={styles.insightLabel}>{insight.label}</Text>
            <View style={styles.changeContainer}>
              <Ionicons
                name={insight.change >= 0 ? 'trending-up' : 'trending-down'}
                size={12}
                color={insight.change >= 0 ? '#06FFA5' : '#FF6B6B'}
              />
              <Text style={[
                styles.changeText,
                { color: insight.change >= 0 ? '#06FFA5' : '#FF6B6B' }
              ]}>
                {insight.change >= 0 ? '+' : ''}{insight.change}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  androidFallback: {
    backgroundColor: 'rgba(20, 20, 30, 0.9)',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  insightItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  insightLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
});
