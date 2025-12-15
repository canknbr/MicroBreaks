/**
 * Stats Screen - Detailed statistics, charts, and history
 * Premium analytics dashboard
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Time period options
const TIME_PERIODS = ['Week', 'Month', 'Year'];

// Mock data
const MOCK_STATS = {
  totalBreaks: 156,
  totalMinutes: 312,
  avgPerDay: 5.2,
  longestStreak: 12,
  currentStreak: 5,
  weeklyData: [3, 5, 4, 6, 5, 2, 4], // Breaks per day
  breakTypes: [
    { type: 'Neck', count: 42, color: '#06FFA5' },
    { type: 'Eyes', count: 38, color: '#00E5FF' },
    { type: 'Stretch', count: 31, color: '#B47EFF' },
    { type: 'Walk', count: 28, color: '#FFD166' },
    { type: 'Breathe', count: 17, color: '#4ECDC4' },
  ],
  recentBreaks: [
    { id: 1, type: 'Neck Roll', duration: '2m', time: '2 hours ago', icon: '🧘' },
    { id: 2, type: 'Eye Rest', duration: '1m', time: '4 hours ago', icon: '👁️' },
    { id: 3, type: 'Deep Breath', duration: '1m', time: '6 hours ago', icon: '🌬️' },
    { id: 4, type: 'Upper Body', duration: '3m', time: 'Yesterday', icon: '💪' },
    { id: 5, type: 'Quick Walk', duration: '5m', time: 'Yesterday', icon: '🚶' },
  ],
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Animated Stat Card
function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const displayValue = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1));
    displayValue.value = withDelay(delay, withTiming(value, { duration: 1000 }));
  }, [delay, value]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.statCard, containerStyle]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
      )}
      <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>
        {Math.round(value)}{suffix}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// Bar Chart Component
function BarChart({ data, delay }: { data: number[]; delay: number }) {
  const maxValue = Math.max(...data);
  const barHeights = data.map(() => useSharedValue(0));

  useEffect(() => {
    data.forEach((value, index) => {
      const height = (value / maxValue) * 100;
      barHeights[index].value = withDelay(
        delay + index * 50,
        withSpring(height, { damping: 15 })
      );
    });
  }, [data, delay]);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barsContainer}>
        {data.map((_, index) => {
          const barStyle = useAnimatedStyle(() => ({
            height: `${barHeights[index].value}%`,
          }));

          const isToday = index === data.length - 1;

          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.bar, barStyle]}>
                  <LinearGradient
                    colors={isToday ? ['#06FFA5', '#00E5FF'] : ['#3A3A4A', '#2A2A3A']}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <Text style={[styles.barLabel, isToday && styles.barLabelActive]}>
                {DAYS[index]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Break Type Distribution
function BreakTypeItem({
  item,
  total,
  delay,
}: {
  item: typeof MOCK_STATS.breakTypes[0];
  total: number;
  delay: number;
}) {
  const percentage = (item.count / total) * 100;
  const width = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    width.value = withDelay(delay, withTiming(percentage, { duration: 800 }));
  }, [delay, percentage]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <Animated.View style={[styles.typeItem, containerStyle]}>
      <View style={styles.typeHeader}>
        <View style={styles.typeInfo}>
          <View style={[styles.typeDot, { backgroundColor: item.color }]} />
          <Text style={styles.typeName}>{item.type}</Text>
        </View>
        <Text style={styles.typeCount}>{item.count} breaks</Text>
      </View>
      <View style={styles.typeBarTrack}>
        <Animated.View style={[styles.typeBar, { backgroundColor: item.color }, barStyle]} />
      </View>
    </Animated.View>
  );
}

// Recent Break Item
function RecentBreakItem({
  item,
  index,
}: {
  item: typeof MOCK_STATS.recentBreaks[0];
  index: number;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(600 + index * 100, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(600 + index * 100, withTiming(0, { duration: 400 }));
  }, [index]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.recentItem, style]}>
      <View style={styles.recentIcon}>
        <Text style={styles.recentIconText}>{item.icon}</Text>
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentType}>{item.type}</Text>
        <Text style={styles.recentTime}>{item.time}</Text>
      </View>
      <Text style={styles.recentDuration}>{item.duration}</Text>
    </Animated.View>
  );
}

export default function StatsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [20, 0]) }],
  }));

  const handlePeriodChange = (period: string) => {
    Haptics.selectionAsync();
    setSelectedPeriod(period);
  };

  const totalBreakTypes = MOCK_STATS.breakTypes.reduce((sum, t) => sum + t.count, 0);

  return (
    <View style={styles.container}>
      {/* Ambient Background */}
      <View style={[styles.ambientGlow, styles.ambientBlue]} />
      <View style={[styles.ambientGlow, styles.ambientGreen]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Text style={styles.title}>Statistics</Text>
            <Text style={styles.subtitle}>Your wellness journey</Text>
          </Animated.View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {TIME_PERIODS.map((period) => (
              <Pressable
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => handlePeriodChange(period)}
              >
                <Text
                  style={[
                    styles.periodText,
                    selectedPeriod === period && styles.periodTextActive,
                  ]}
                >
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="fitness"
              label="Total Breaks"
              value={MOCK_STATS.totalBreaks}
              color="#06FFA5"
              delay={200}
            />
            <StatCard
              icon="time"
              label="Minutes"
              value={MOCK_STATS.totalMinutes}
              color="#00E5FF"
              delay={300}
            />
            <StatCard
              icon="trending-up"
              label="Avg/Day"
              value={MOCK_STATS.avgPerDay}
              suffix=""
              color="#B47EFF"
              delay={400}
            />
            <StatCard
              icon="flame"
              label="Best Streak"
              value={MOCK_STATS.longestStreak}
              suffix=" days"
              color="#FFD166"
              delay={500}
            />
          </View>

          {/* Weekly Chart */}
          <View style={styles.chartCard}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
            )}
            <Text style={styles.chartTitle}>This Week</Text>
            <BarChart data={MOCK_STATS.weeklyData} delay={400} />
          </View>

          {/* Break Types Distribution */}
          <View style={styles.sectionCard}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
            )}
            <Text style={styles.sectionTitle}>Break Types</Text>
            {MOCK_STATS.breakTypes.map((item, index) => (
              <BreakTypeItem
                key={item.type}
                item={item}
                total={totalBreakTypes}
                delay={500 + index * 100}
              />
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionCard}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
            )}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {MOCK_STATS.recentBreaks.map((item, index) => (
              <RecentBreakItem key={item.id} item={item} index={index} />
            ))}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  ambientBlue: {
    top: -100,
    right: -100,
    width: 350,
    height: 350,
    backgroundColor: '#00E5FF',
  },
  ambientGreen: {
    bottom: 50,
    left: -150,
    width: 400,
    height: 400,
    backgroundColor: '#06FFA5',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  periodTextActive: {
    color: '#06FFA5',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - 12) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    alignItems: 'center',
  },
  androidCardFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  chartCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  chartContainer: {
    height: 150,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: 24,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 8,
  },
  barLabelActive: {
    color: '#06FFA5',
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: Spacing.md,
  },
  typeItem: {
    marginBottom: 16,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  typeName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  typeCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  typeBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  typeBar: {
    height: '100%',
    borderRadius: 3,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentIconText: {
    fontSize: 18,
  },
  recentInfo: {
    flex: 1,
  },
  recentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  recentDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06FFA5',
  },
  bottomSpacer: {
    height: 120,
  },
});
