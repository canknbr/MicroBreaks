/**
 * Stats Screen - Detailed statistics, charts, and history
 * Premium analytics dashboard with real data
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';

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
import { useStatsData, StatsPeriod } from '@/hooks/useStatsData';
import { CompletedBreak } from '@/services/storage';
import { useTheme, ThemeColors } from '@/hooks/useTheme';

// Time period options
const TIME_PERIODS: { label: string; value: StatsPeriod }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

// Animated Stat Card
function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
  delay,
  theme,
  screenWidth,
}: {
  icon: string;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay: number;
  theme: ThemeColors;
  screenWidth: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1));
  }, [delay, value]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${Math.round(value)}${suffix || ''}`}
      style={[
      styles.statCard,
      {
        width: (screenWidth - Spacing.lg * 2 - 12) / 2,
        borderColor: theme.isDark ? theme.border.subtle : 'transparent',
        backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.isDark ? 0 : 0.08,
        shadowRadius: 10,
        elevation: theme.isDark ? 0 : 4,
      },
      containerStyle,
    ]}>
      {/* BlurView only for dark mode */}
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
        )
      )}
      <View style={[styles.statIconContainer, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon as IoniconsName} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text.primary }]}>
        {Math.round(value)}{suffix}
      </Text>
      <Text style={[styles.statLabel, { color: theme.text.muted }]}>{label}</Text>
    </Animated.View>
  );
}

// Single Animated Bar - extracted to avoid hooks-in-loop violation
function AnimatedBar({
  item,
  maxValue,
  delay,
  index,
  isToday,
  dataLength,
  showLabel,
  theme,
}: {
  item: { label: string; value: number; minutes: number };
  maxValue: number;
  delay: number;
  index: number;
  isToday: boolean;
  dataLength: number;
  showLabel: boolean;
  theme: ThemeColors;
}) {
  const barHeight = useSharedValue(0);

  useEffect(() => {
    const height = (item.value / maxValue) * 100;
    barHeight.value = withDelay(
      delay + index * 50,
      withSpring(height, { damping: 15 })
    );
  }, [item.value, maxValue, delay, index]);

  const barStyle = useAnimatedStyle(() => ({
    height: `${barHeight.value}%`,
  }));

  return (
    <View style={[styles.barWrapper, dataLength > 7 && styles.barWrapperSmall]} accessibilityLabel={`${item.label}: ${item.value} breaks, ${item.minutes} minutes`}>
      <View style={[styles.barTrack, dataLength > 7 && styles.barTrackSmall, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.border.subtle }]}>
        <Animated.View style={[styles.bar, barStyle]}>
          <LinearGradient
            colors={isToday ? (theme.isDark ? ['#06FFA5', '#00E5FF'] : [theme.accent.primary, theme.accent.secondary]) : (theme.isDark ? ['#3A3A4A', '#2A2A3A'] : [theme.border.strong, theme.border.medium])}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      {showLabel && (
        <Text
          style={[
            styles.barLabel,
            { color: theme.text.muted },
            isToday && [styles.barLabelActive, { color: theme.accent.primary }],
            dataLength > 14 && styles.barLabelSmall,
          ]}
        >
          {item.label}
        </Text>
      )}
    </View>
  );
}

// Bar Chart Component
function BarChart({
  data,
  delay,
  theme,
}: {
  data: { label: string; value: number; minutes: number }[];
  delay: number;
  theme: ThemeColors;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  // Determine which labels to show based on data density
  const shouldShowLabel = (index: number) => {
    if (data.length <= 7) return true;
    if (data.length <= 14) return index % 2 === 0;
    return index % 5 === 0;
  };

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barsContainer}>
        {data.map((item, index) => (
          <AnimatedBar
            key={`${index}-${item.label}`}
            item={item}
            maxValue={maxValue}
            delay={delay}
            index={index}
            isToday={index === data.length - 1}
            dataLength={data.length}
            showLabel={shouldShowLabel(index)}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

// Break Type Distribution
function BreakTypeItem({
  item,
  delay,
  theme,
}: {
  item: { category: string; count: number; percentage: number; color: string };
  delay: number;
  theme: ThemeColors;
}) {
  const percentage = item.percentage;
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
    <Animated.View style={[styles.typeItem, containerStyle]} accessibilityLabel={`${item.category}: ${item.count} breaks, ${item.percentage} percent`}>
      <View style={styles.typeHeader}>
        <View style={styles.typeInfo}>
          <View style={[styles.typeDot, { backgroundColor: item.color }]} />
          <Text style={[styles.typeName, { color: theme.text.primary }]}>{item.category}</Text>
        </View>
        <Text style={[styles.typeCount, { color: theme.text.muted }]}>{item.count} breaks</Text>
      </View>
      <View style={[styles.typeBarTrack, { backgroundColor: theme.border.subtle }]}>
        <Animated.View style={[styles.typeBar, { backgroundColor: item.color }, barStyle]} />
      </View>
    </Animated.View>
  );
}

// Time Pattern Item
function TimePatternItem({
  item,
  delay,
  isTop,
  theme,
}: {
  item: { period: string; label: string; count: number; percentage: number; timeRange: string; color: string; icon: string };
  delay: number;
  isTop: boolean;
  theme: ThemeColors;
}) {
  const opacity = useSharedValue(0);
  const width = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    width.value = withDelay(delay, withTiming(item.percentage, { duration: 800 }));
  }, [delay, item.percentage]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <Animated.View style={[styles.timePatternItem, containerStyle]} accessibilityLabel={`${item.label} ${item.timeRange}: ${item.count} breaks, ${item.percentage} percent${isTop ? ', most active time' : ''}`}>
      <View style={styles.timePatternHeader}>
        <View style={styles.timePatternInfo}>
          <Text style={styles.timePatternIcon}>{item.icon}</Text>
          <View>
            <Text style={[styles.timePatternLabel, { color: theme.text.primary }, isTop && { color: item.color }]}>
              {item.label}
            </Text>
            <Text style={[styles.timePatternRange, { color: theme.text.muted }]}>{item.timeRange}</Text>
          </View>
        </View>
        <View style={styles.timePatternStats}>
          <Text style={[styles.timePatternCount, { color: theme.text.primary }]}>{item.count}</Text>
          <Text style={[styles.timePatternPercent, { color: theme.text.muted }]}>{item.percentage}%</Text>
        </View>
      </View>
      <View style={[styles.timePatternBarTrack, { backgroundColor: theme.border.subtle }]}>
        <Animated.View
          style={[
            styles.timePatternBar,
            { backgroundColor: item.color },
            barStyle,
          ]}
        />
      </View>
      {isTop && (
        <View style={[styles.topTimeBadge, { backgroundColor: `${item.color}20` }]}>
          <Text style={[styles.topTimeBadgeText, { color: item.color }]}>Most Active</Text>
        </View>
      )}
    </Animated.View>
  );
}

// Recent Break Item
function RecentBreakItem({
  item,
  index,
  theme,
}: {
  item: CompletedBreak;
  index: number;
  theme: ThemeColors;
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Animated.View style={[styles.recentItem, { borderBottomColor: theme.border.medium }, style]} accessibilityLabel={`${item.title}, ${formatDuration(item.duration)}, ${formatTime(item.completedAt)}`}>
      <View style={[styles.recentIcon, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border.subtle }]}>
        <Text style={styles.recentIconText}>{item.icon}</Text>
      </View>
      <View style={styles.recentInfo}>
        <Text style={[styles.recentType, { color: theme.text.primary }]}>{item.title}</Text>
        <Text style={[styles.recentTime, { color: theme.text.muted }]}>{formatTime(item.completedAt)}</Text>
      </View>
      <Text style={[styles.recentDuration, { color: theme.accent.primary }]}>{formatDuration(item.duration)}</Text>
    </Animated.View>
  );
}

// Empty State Component
function EmptyState({ theme }: { theme: ThemeColors }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>📊</Text>
      <Text style={[styles.emptyStateTitle, { color: theme.text.primary }]}>No Data Yet</Text>
      <Text style={[styles.emptyStateText, { color: theme.text.muted }]}>
        Complete your first break to start tracking your progress
      </Text>
    </View>
  );
}

export default function StatsScreen() {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>('week');
  const [refreshing, setRefreshing] = useState(false);
  const headerOpacity = useSharedValue(0);

  const stats = useStatsData(selectedPeriod);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [20, 0]) }],
  }));

  const handlePeriodChange = (period: StatsPeriod) => {
    Haptics.selectionAsync();
    setSelectedPeriod(period);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await stats.refresh();
    setRefreshing(false);
  }, [stats.refresh]);

    const hasData = stats.totalBreaks > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Ambient Background */}
      <View style={[styles.ambientGlow, styles.ambientBlue]} />
      <View style={[styles.ambientGlow, styles.ambientGreen]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent.primary}
            />
          }
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Statistics</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>Your wellness journey</Text>
          </Animated.View>

          {/* Period Selector */}
          <View
            style={[styles.periodSelector, {
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme.isDark ? 0 : 0.05,
              shadowRadius: 8,
              elevation: theme.isDark ? 0 : 2,
            }]}
            accessibilityRole="tablist"
            accessibilityLabel="Statistics time period selector"
          >
            {TIME_PERIODS.map((period) => (
              <Pressable
                key={period.value}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.value && [
                    styles.periodButtonActive,
                    { backgroundColor: theme.isDark ? 'rgba(6, 255, 165, 0.15)' : `${theme.accent.primary}12` },
                  ],
                ]}
                onPress={() => handlePeriodChange(period.value)}
                accessibilityRole="tab"
                accessibilityLabel={`View ${period.label.toLowerCase()} statistics`}
                accessibilityState={{ selected: selectedPeriod === period.value }}
              >
                <Text
                  style={[
                    styles.periodText,
                    { color: theme.text.muted },
                    selectedPeriod === period.value && styles.periodTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {stats.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent.primary} />
            </View>
          ) : !hasData ? (
            <EmptyState theme={theme} />
          ) : (
            <>
              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <StatCard
                  icon="fitness"
                  label="Total Breaks"
                  value={stats.totalBreaks}
                  color="#06FFA5"
                  delay={200}
                  theme={theme}
                  screenWidth={screenWidth}
                />
                <StatCard
                  icon="time"
                  label="Minutes"
                  value={stats.totalMinutes}
                  color="#00E5FF"
                  delay={300}
                  theme={theme}
                  screenWidth={screenWidth}
                />
                <StatCard
                  icon="flame"
                  label="Current Streak"
                  value={stats.currentStreak}
                  suffix=" days"
                  color="#FFD166"
                  delay={400}
                  theme={theme}
                  screenWidth={screenWidth}
                />
                <StatCard
                  icon="trophy"
                  label="Best Streak"
                  value={stats.longestStreak}
                  suffix=" days"
                  color="#B47EFF"
                  delay={500}
                  theme={theme}
                  screenWidth={screenWidth}
                />
              </View>

              {/* Chart */}
              {stats.chartData.length > 0 && (
                <View style={[
                  styles.chartCard,
                  {
                    borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                    backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: theme.isDark ? 0 : 0.08,
                    shadowRadius: 12,
                    elevation: theme.isDark ? 0 : 5,
                  },
                ]}>
                  {/* BlurView only for dark mode */}
                  {theme.isDark && (
                    Platform.OS === 'ios' ? (
                      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
                    )
                  )}
                  <Text style={[styles.chartTitle, { color: theme.text.primary }]}>
                    {selectedPeriod === 'week'
                      ? 'This Week'
                      : selectedPeriod === 'month'
                      ? 'Last 30 Days'
                      : 'This Year'}
                  </Text>
                  <BarChart data={stats.chartData} delay={400} theme={theme} />
                </View>
              )}

              {/* Break Types Distribution */}
              {stats.breakTypes.length > 0 && (
                <View style={[
                  styles.sectionCard,
                  {
                    borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                    backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: theme.isDark ? 0 : 0.08,
                    shadowRadius: 12,
                    elevation: theme.isDark ? 0 : 5,
                  },
                ]}>
                  {/* BlurView only for dark mode */}
                  {theme.isDark && (
                    Platform.OS === 'ios' ? (
                      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
                    )
                  )}
                  <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Break Types</Text>
                  {stats.breakTypes.map((item, index) => (
                    <BreakTypeItem
                      key={item.category}
                      item={item}
                      delay={500 + index * 100}
                      theme={theme}
                    />
                  ))}
                </View>
              )}

              {/* Time Patterns */}
              {stats.timePatterns.length > 0 && (
                <View style={[
                  styles.sectionCard,
                  {
                    borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                    backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: theme.isDark ? 0 : 0.08,
                    shadowRadius: 12,
                    elevation: theme.isDark ? 0 : 5,
                  },
                ]}>
                  {/* BlurView only for dark mode */}
                  {theme.isDark && (
                    Platform.OS === 'ios' ? (
                      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
                    )
                  )}
                  <View style={styles.sectionTitleRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Time Patterns</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>When you take breaks</Text>
                  </View>
                  {stats.timePatterns.map((item, index) => (
                    <TimePatternItem
                      key={item.period}
                      item={item}
                      delay={600 + index * 100}
                      isTop={index === 0}
                      theme={theme}
                    />
                  ))}
                </View>
              )}

              {/* Recent Activity */}
              {stats.recentBreaks.length > 0 && (
                <View style={[
                  styles.sectionCard,
                  {
                    borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                    backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: theme.isDark ? 0 : 0.08,
                    shadowRadius: 12,
                    elevation: theme.isDark ? 0 : 5,
                  },
                ]}>
                  {/* BlurView only for dark mode */}
                  {theme.isDark && (
                    Platform.OS === 'ios' ? (
                      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
                    )
                  )}
                  <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recent Activity</Text>
                  {stats.recentBreaks.map((item, index) => (
                    <RecentBreakItem key={item.id} item={item} index={index} theme={theme} />
                  ))}
                </View>
              )}

              {/* XP & Level Card */}
              <View style={[
                styles.xpCard,
                {
                  borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                  backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: theme.isDark ? 0 : 0.08,
                  shadowRadius: 12,
                  elevation: theme.isDark ? 0 : 5,
                },
              ]}>
                {/* BlurView only for dark mode */}
                {theme.isDark && (
                  Platform.OS === 'ios' ? (
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                  ) : (
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
                  )
                )}
                <View style={styles.xpContent}>
                  <View style={styles.xpLeft}>
                    <Text style={[styles.xpLabel, { color: theme.text.secondary }]}>Level {stats.level}</Text>
                    <Text style={[styles.xpValue, { color: theme.accent.primary }]}>{stats.xpEarned} XP</Text>
                  </View>
                  <View style={styles.xpRight}>
                    <Text style={[styles.xpNextLevel, { color: theme.text.muted }]}>
                      {100 - (stats.xpEarned % 100)} XP to next level
                    </Text>
                    <View style={[styles.xpProgressTrack, { backgroundColor: theme.border.subtle }]}>
                      <View
                        style={[
                          styles.xpProgressBar,
                          { width: `${stats.xpEarned % 100}%`, backgroundColor: theme.accent.primary },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}

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
  loadingContainer: {
    flex: 1,
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  statCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    alignItems: 'center',
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
  barWrapperSmall: {
    paddingHorizontal: 1,
  },
  barTrack: {
    width: 24,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barTrackSmall: {
    width: 8,
    borderRadius: 4,
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
  barLabelSmall: {
    fontSize: 9,
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
  sectionTitleRow: {
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
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
  xpCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.lg,
  },
  xpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  xpLeft: {
    marginRight: 20,
  },
  xpLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  xpValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#06FFA5',
  },
  xpRight: {
    flex: 1,
  },
  xpNextLevel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  xpProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressBar: {
    height: '100%',
    backgroundColor: '#06FFA5',
    borderRadius: 4,
  },
  bottomSpacer: {
    height: 120,
  },
  // Time Pattern styles
  timePatternItem: {
    marginBottom: 16,
    position: 'relative',
  },
  timePatternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timePatternInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timePatternIcon: {
    fontSize: 24,
  },
  timePatternLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timePatternRange: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  timePatternStats: {
    alignItems: 'flex-end',
  },
  timePatternCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timePatternPercent: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  timePatternBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timePatternBar: {
    height: '100%',
    borderRadius: 3,
  },
  topTimeBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  topTimeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
