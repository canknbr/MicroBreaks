/**
 * Stats Screen - Detailed statistics, charts, and history
 * Premium analytics dashboard with real data
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import i18n from 'i18next';
import { Spacing } from '@/theme';
import { formatDuration, formatRelativeTime } from '@/utils/format';
import {
  useStatsData,
  StatsPeriod,
  WeeklyRecoveryReport,
} from '@/hooks/useStatsData';
import { CompletedBreak } from '@/services/storage';
import { useTheme, ThemeColors } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store';
import { useTierFeature } from '@/hooks/useTierFeature';
import { PRO_STATS_HIGHLIGHTS } from '@/constants/subscription';
import { UpgradePrompt } from '@/components/subscription';
import {
  RecoveryEmptyState,
  RecoveryInsightCard,
  RecoveryStoryCard,
  WeeklyRecoveryReportCard,
} from '@/components/recovery';
import {
  buildRecoveryStory,
  getPrimaryNeedLabel,
} from '@/features/recovery/statsStory';
import { analytics } from '@/services/analytics';

// Time period options
const TIME_PERIODS: { label: string; value: StatsPeriod }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

// Animated Stat Card
function StatCard({
  label,
  value,
  suffix,
  color,
  delay,
  screenWidth,
}: {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay: number;
  screenWidth: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1));
  }, [delay, opacity, scale, value]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${Math.round(value)}${suffix || ''}`}
      style={[styles.statCard, { width: (screenWidth - Spacing.lg * 2 - 12) / 2 }, containerStyle]}
    >
      <Text style={[styles.statValue, { color }]}>
        {Math.round(value)}
        {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  }, [barHeight, item.value, maxValue, delay, index]);

  const barStyle = useAnimatedStyle(() => ({
    height: `${barHeight.value}%`,
  }));

  return (
    <View style={[styles.barWrapper, dataLength > 7 && styles.barWrapperSmall]} accessibilityLabel={`${item.label}: ${item.value} breaks, ${item.minutes} minutes`}>
      <View style={[styles.barTrack, dataLength > 7 && styles.barTrackSmall, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : theme.border.subtle }]}>
        <Animated.View style={[styles.bar, barStyle]}>
          <LinearGradient
            colors={isToday ? (theme.isDark ? ['#FF2472', '#FF2472'] : [theme.accent.primary, theme.accent.secondary]) : (theme.isDark ? ['#3A3A4A', '#2A2A3A'] : [theme.border.strong, theme.border.medium])}
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
  }, [delay, opacity, percentage, width]);

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
  }, [delay, item.percentage, opacity, width]);

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
          <View>
            <Text style={[styles.timePatternLabel, { color: theme.text.primary }, isTop && { color: item.color }]}>
              {item.label}
            </Text>
            <Text style={[styles.timePatternRange, { color: theme.text.muted }]}>
              {item.timeRange}{isTop ? '  ·  MOST ACTIVE' : ''}
            </Text>
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
  }, [index, opacity, translateX]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  // D-I18N3: use the active i18n language for the formatted date so the
  // stats screen and notification card agree across locales.
  const locale = i18n.language || 'en';

  return (
    <Animated.View style={[styles.recentItem, { borderBottomColor: theme.border.subtle }, style]} accessibilityLabel={`${item.title}, ${formatDuration(item.duration)}, ${formatRelativeTime(item.completedAt, { locale })}`}>
      <View style={styles.recentInfo}>
        <Text style={[styles.recentType, { color: theme.text.primary }]}>{item.title}</Text>
        <Text style={[styles.recentTime, { color: theme.text.muted }]}>{formatRelativeTime(item.completedAt, { locale })}</Text>
      </View>
      <Text style={[styles.recentDuration, { color: theme.accent.primary }]}>{formatDuration(item.duration)}</Text>
    </Animated.View>
  );
}

export default function StatsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const onboardingData = useOnboardingStore((state) => state.data);
  const [selectedPeriod, setSelectedPeriod] = useState<StatsPeriod>('week');
  const [refreshing, setRefreshing] = useState(false);
  const headerOpacity = useSharedValue(0);
  // Tier-aware gate for the chart / mix / pattern sections AND the
  // period switcher. Routes through the server-resolved effective tier
  // so a stale/spoofed local "premium" status can't unlock advanced
  // stats the server ledger hasn't granted.
  const advancedStats = useTierFeature('advanced_stats');

  const stats = useStatsData(selectedPeriod);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
  }, [headerOpacity]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [20, 0]) }],
  }));

  const handlePeriodChange = (period: StatsPeriod) => {
    Haptics.selectionAsync();
    if (!advancedStats.hasFeature && period !== 'week') {
      router.push({
        pathname: '/subscription',
        params: { placement: 'stats' },
      } as any);
      return;
    }
    setSelectedPeriod(period);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await stats.refresh();
    setRefreshing(false);
  }, [stats]);

  const hasData = stats.totalBreaks > 0;
  const weeklyGoalProgress = Math.min(
    100,
    Math.round((stats.weeklyProgress / Math.max(stats.weeklyGoal, 1)) * 100)
  );
  const primaryNeedLabel = useMemo(
    () => getPrimaryNeedLabel(onboardingData.painAreas, onboardingData.breakStyle),
    [onboardingData.breakStyle, onboardingData.painAreas]
  );
  const recoveryStory = useMemo(
    () =>
      buildRecoveryStory({
        report: stats.weeklyRecoveryReport,
        weekBreaks: stats.weekBreaks,
        todayBreaks: stats.todayBreaks,
        totalMinutes: stats.totalMinutes,
        currentStreak: stats.currentStreak,
        primaryNeedLabel,
      }),
    [
      stats.weeklyRecoveryReport,
      stats.weekBreaks,
      stats.todayBreaks,
      stats.totalMinutes,
      stats.currentStreak,
      primaryNeedLabel,
    ]
  );

  const handleUpgradePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/subscription',
      params: { placement: 'stats' },
    } as any);
  }, [router]);

  const handleShareRecoveryReport = useCallback(async (report: WeeklyRecoveryReport) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await Share.share({
        title: 'My Weekly Recovery Report',
        message: report.shareMessage,
      });

      if (result.action === Share.sharedAction) {
        analytics.track('weekly_report_shared', {
          report_score: report.score,
          report_active_days: report.activeDays,
          report_completion_rate: report.completionRate,
          share_surface: 'stats',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown share error';
      analytics.trackError('weekly_report_share_failed', message, {
        share_surface: 'stats',
      });
      Alert.alert(
        'Share Unavailable',
        'Could not open the share sheet right now. Please try again.'
      );
    }
  }, []);

  const handleBrowseStarterResets = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/breaks');
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
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
            <Text style={[styles.title, { color: theme.text.primary }]}>Recovery</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              See whether your work rhythm is supporting recovery or letting strain build up.
            </Text>
          </Animated.View>

          {/* Period — type-menu */}
          <View style={styles.periodRow} accessibilityRole="tablist">
            {TIME_PERIODS.map((period) => {
              const on = selectedPeriod === period.value;
              return (
                <Pressable
                  key={period.value}
                  onPress={() => handlePeriodChange(period.value)}
                  style={styles.periodItem}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`View ${period.label.toLowerCase()} statistics`}
                >
                  <Text style={[styles.periodText, on ? styles.periodOn : styles.periodOff]}>
                    {period.label}
                  </Text>
                  <View style={[styles.periodBar, { opacity: on ? 1 : 0 }]} />
                </Pressable>
              );
            })}
          </View>

          {stats.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent.primary} />
            </View>
          ) : !hasData ? (
            <RecoveryEmptyState
              theme={theme}
              primaryNeedLabel={primaryNeedLabel}
              onStart={handleBrowseStarterResets}
            />
          ) : (
            <>
              <RecoveryStoryCard
                story={recoveryStory}
                theme={theme}
                delay={180}
              />

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <StatCard
                  label="Guided Resets"
                  value={stats.totalBreaks}
                  color="#FF2472"
                  delay={200}
                  screenWidth={screenWidth}
                />
                <StatCard
                  label="Recovery Minutes"
                  value={stats.totalMinutes}
                  color="#FF2472"
                  delay={300}
                  screenWidth={screenWidth}
                />
                <StatCard
                  label="Current Rhythm"
                  value={stats.currentStreak}
                  suffix=" days"
                  color="#FAE34B"
                  delay={400}
                  screenWidth={screenWidth}
                />
                <StatCard
                  label="Best Rhythm"
                  value={stats.longestStreak}
                  suffix=" days"
                  color="#BC26F4"
                  delay={500}
                  screenWidth={screenWidth}
                />
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Current Rhythm</Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                    {stats.weeklyProgress}/{stats.weeklyGoal} resets logged against your weekly target
                  </Text>
                </View>
                <View style={styles.goalSummaryRow}>
                  <View style={styles.goalMetric}>
                    <Text style={[styles.goalMetricValue, { color: theme.text.primary }]}>
                      {stats.todayBreaks}
                    </Text>
                    <Text style={[styles.goalMetricLabel, { color: theme.text.muted }]}>Today</Text>
                  </View>
                  <View style={styles.goalMetric}>
                    <Text style={[styles.goalMetricValue, { color: theme.text.primary }]}>
                      {stats.weekBreaks}
                    </Text>
                    <Text style={[styles.goalMetricLabel, { color: theme.text.muted }]}>This Week</Text>
                  </View>
                  <View style={styles.goalMetric}>
                    <Text style={[styles.goalMetricValue, { color: theme.accent.primary }]}>
                      {weeklyGoalProgress}%
                    </Text>
                    <Text style={[styles.goalMetricLabel, { color: theme.text.muted }]}>Goal Pace</Text>
                  </View>
                </View>
                <View style={[styles.goalProgressTrack, { backgroundColor: theme.border.subtle }]}>
                  <View
                    style={[
                      styles.goalProgressBar,
                      {
                        width: `${weeklyGoalProgress}%`,
                        backgroundColor: theme.accent.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              {advancedStats.hasFeature && stats.weeklyRecoveryReport && (
                <WeeklyRecoveryReportCard
                  report={stats.weeklyRecoveryReport}
                  theme={theme}
                  delay={320}
                  onShare={handleShareRecoveryReport}
                />
              )}

              {advancedStats.hasFeature && stats.recoveryInsights.length > 0 && (
                <>
                  <View style={styles.insightsHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                      Deeper Signals
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                      The patterns underneath your current recovery rhythm
                    </Text>
                  </View>
                  <View style={styles.recoveryInsightsGrid}>
                    {stats.recoveryInsights.map((item, index) => (
                      <RecoveryInsightCard
                        key={item.id}
                        item={item}
                        delay={360 + index * 70}
                        theme={theme}
                        screenWidth={screenWidth}
                      />
                    ))}
                  </View>
                </>
              )}

              {/* Chart */}
              {advancedStats.hasFeature && stats.chartData.length > 0 && (
                <View style={styles.chartCard}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={[styles.chartTitle, { color: theme.text.primary }]}>
                      Recovery Rhythm
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                      {selectedPeriod === 'week'
                        ? 'How often you interrupted strain this week'
                        : selectedPeriod === 'month'
                        ? 'How your reset habit moved across the last 30 days'
                        : 'How your reset habit moved across the year'}
                    </Text>
                  </View>
                  <BarChart data={stats.chartData} delay={400} theme={theme} />
                </View>
              )}

              {/* Break Types Distribution */}
              {advancedStats.hasFeature && stats.breakTypes.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recovery Mix</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                      Which types of resets carried the week
                    </Text>
                  </View>
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
              {advancedStats.hasFeature && stats.timePatterns.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recovery Windows</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                      When your workday naturally makes room for resets
                    </Text>
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

              {!advancedStats.hasFeature && (
                <UpgradePrompt
                  title="Unlock the pattern layer behind your recovery"
                  subtitle="You can already see the weekly story. Pro opens deeper signals, rhythm trends, and mix analysis so you know what to fix next."
                  bullets={PRO_STATS_HIGHLIGHTS}
                  ctaLabel="Preview Pro Analytics"
                  onPress={handleUpgradePress}
                  icon="analytics"
                  accentColors={['#FAE34B', '#FF9500']}
                />
              )}

              {/* Recent Activity */}
              {stats.recentBreaks.length > 0 && (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recent Resets</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                      Your latest completed recovery sessions
                    </Text>
                  </View>
                  {stats.recentBreaks.map((item, index) => (
                    <RecentBreakItem key={item.id} item={item} index={index} theme={theme} />
                  ))}
                </View>
              )}

              {/* XP & Level Card */}
              <View style={styles.xpCard}>
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
    backgroundColor: '#FF2472',
  },
  ambientGreen: {
    bottom: 50,
    left: -150,
    width: 400,
    height: 400,
    backgroundColor: '#FF2472',
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
    fontFamily: 'GeneralSans-Bold',
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 26,
  },
  periodItem: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  periodText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  periodOn: { color: '#FFFFFF' },
  periodOff: { color: 'rgba(255,255,255,0.34)' },
  periodBar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  recoveryInsightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 20,
    rowGap: 24,
    marginBottom: 34,
  },
  insightsHeader: {
    marginBottom: 20,
  },
  statCard: {
    paddingVertical: 8,
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 36,
    letterSpacing: -1.5,
    color: '#FFFFFF',
  },
  statSuffix: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  statLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  chartCard: {
    marginBottom: 34,
  },
  chartTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
    color: '#FFFFFF',
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
    color: '#FF2472',
    fontWeight: '600',
  },
  barLabelSmall: {
    fontSize: 9,
  },
  sectionCard: {
    marginBottom: 34,
  },
  sectionTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  sectionTitleRow: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 5,
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
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  typeCount: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  typeBarTrack: {
    height: 4,
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
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  recentInfo: {
    flex: 1,
    marginRight: 12,
  },
  recentType: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    letterSpacing: -0.2,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  recentTime: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  recentDuration: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 15,
    color: '#FF2472',
  },
  xpCard: {
    marginBottom: 34,
  },
  xpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  xpLeft: {
    marginRight: 20,
  },
  xpLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  xpValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 26,
    letterSpacing: -0.8,
    color: '#FF2472',
  },
  xpRight: {
    flex: 1,
  },
  xpNextLevel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  xpProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressBar: {
    height: '100%',
    backgroundColor: '#FF2472',
    borderRadius: 4,
  },
  goalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  goalMetric: {
    flex: 1,
  },
  goalMetricValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    letterSpacing: -0.8,
    marginBottom: 5,
  },
  goalMetricLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  goalProgressTrack: {
    height: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  goalProgressBar: {
    height: '100%',
    borderRadius: 999,
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
    fontFamily: 'GeneralSans-Bold',
    fontSize: 16,
    letterSpacing: -0.2,
    color: '#FFFFFF',
  },
  timePatternRange: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 11,
    letterSpacing: 0.3,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 3,
  },
  timePatternStats: {
    alignItems: 'flex-end',
  },
  timePatternCount: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 18,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  timePatternPercent: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  timePatternBarTrack: {
    height: 4,
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
