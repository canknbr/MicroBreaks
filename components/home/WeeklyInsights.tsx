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
import { useTheme } from '@/hooks/useTheme';

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

function WeeklyInsights({ insights, delay = 0 }: WeeklyInsightsProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [delay, opacity, translateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[
      styles.container,
      {
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
        backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: theme.isDark ? 0 : 0.1,
        shadowRadius: 12,
        elevation: theme.isDark ? 0 : 5,
      },
      containerStyle,
    ]}>
      {/* BlurView only for dark mode */}
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20, 20, 30, 0.9)' }]} />
        )
      )}

      {theme.isDark && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
          style={styles.headerGradient}
        />
      )}

      <View style={styles.header}>
        <Ionicons name="analytics" size={18} color={theme.accent.tertiary} />
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>This Week</Text>
      </View>

      <View style={styles.insightsGrid}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem} accessibilityLabel={`${insight.label}: ${insight.value}, ${insight.change >= 0 ? 'up' : 'down'} ${Math.abs(insight.change)} percent`}>
            <View style={[styles.insightIcon, { backgroundColor: `${insight.color}15` }]}>
              <Ionicons name={insight.icon as any} size={18} color={insight.color} />
            </View>
            <Text style={[styles.insightValue, { color: theme.text.primary }]}>{insight.value}</Text>
            <Text style={[styles.insightLabel, { color: theme.text.muted }]}>{insight.label}</Text>
            <View style={styles.changeContainer}>
              <Ionicons
                name={insight.change >= 0 ? 'trending-up' : 'trending-down'}
                size={12}
                color={insight.change >= 0 ? theme.accent.success : theme.accent.error}
              />
              <Text style={[
                styles.changeText,
                { color: insight.change >= 0 ? theme.accent.success : theme.accent.error }
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

export default React.memo(WeeklyInsights);

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
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
