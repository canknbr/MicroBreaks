/**
 * Stats Data Hook
 * Provides real statistics from break history
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getBreakHistory,
  getWeeklyChartDataFromHistory,
  getMonthlyChartDataFromHistory,
  getBreakTypeDistributionFromBreaks,
  getUserStats,
  getStreakData,
  getTodayBreaksFromHistory,
  getWeekBreaksFromHistory,
  getMonthBreaksFromHistory,
  getTimePatternsFromBreaks,
  TimePatternData,
  getRecentBreaksFromHistory,
} from '@/services/breakHistory';
import { CompletedBreak, StreakData, UserStats } from '@/services/storage';

export type StatsPeriod = 'week' | 'month' | 'year';

interface ChartDataPoint {
  label: string;
  value: number;
  minutes: number;
}

interface BreakTypeData {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

export interface WeeklyRecoveryReport {
  score: number;
  scoreLabel: string;
  summary: string;
  shareMessage: string;
  recommendation: string;
  focusArea: string;
  activeDays: number;
  averageDurationMinutes: number;
  completionRate: number;
  positiveRatingRate: number | null;
  topCategory: string | null;
  topCategoryShare: number;
  bestTimeLabel: string | null;
  bestTimeShare: number;
  weekOverWeekChange: number | null;
}

export interface RecoveryInsight {
  id: string;
  icon: string;
  title: string;
  value: string;
  detail: string;
  tone: 'positive' | 'neutral' | 'attention';
}

interface StatsData {
  // Summary stats
  totalBreaks: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  todayBreaks: number;
  weekBreaks: number;
  xpEarned: number;
  level: number;
  weeklyGoal: number;
  weeklyProgress: number;

  // Chart data
  chartData: ChartDataPoint[];

  // Break type distribution
  breakTypes: BreakTypeData[];

  // Time patterns
  timePatterns: TimePatternData[];

  // Recent breaks
  recentBreaks: CompletedBreak[];

  // Premium analytics
  weeklyRecoveryReport: WeeklyRecoveryReport | null;
  recoveryInsights: RecoveryInsight[];

  // Loading state
  isLoading: boolean;

  // Refresh function
  refresh: () => Promise<void>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();
  result.setDate(result.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  result.setHours(0, 0, 0, 0);
  return result;
}

function getLocalDateKey(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Strong rhythm';
  if (score >= 65) return 'Healthy momentum';
  if (score >= 45) return 'Building consistency';
  return 'Early routine';
}

function buildWeeklyRecoveryShareMessage(report: Omit<WeeklyRecoveryReport, 'shareMessage'>): string {
  const lines = [
    'My MicroBreaks weekly recovery report',
    `Recovery score: ${report.score}/100 (${report.scoreLabel})`,
    report.summary,
    `Active days: ${report.activeDays}/7`,
    `Average break: ${report.averageDurationMinutes} minutes`,
    `Completion rate: ${report.completionRate}%`,
  ];

  if (report.bestTimeLabel) {
    lines.push(`Best window: ${report.bestTimeLabel}`);
  }

  if (report.topCategory) {
    lines.push(`Top break mix: ${report.topCategory} (${report.topCategoryShare}%)`);
  }

  lines.push(`Next focus: ${report.focusArea}`);
  lines.push(report.recommendation);

  return lines.join('\n');
}

function buildWeeklyRecoveryReport(
  weekBreaks: CompletedBreak[],
  allBreaks: CompletedBreak[],
  weeklyGoal: number,
  currentStreak: number
): WeeklyRecoveryReport | null {
  if (allBreaks.length === 0) {
    return null;
  }

  const activeDays = new Set(weekBreaks.map((item) => getLocalDateKey(item.completedAt))).size;
  const averageDurationMinutes = weekBreaks.length > 0
    ? Number((weekBreaks.reduce((sum, item) => sum + item.duration, 0) / 60 / weekBreaks.length).toFixed(1))
    : 0;
  const completionRate = weekBreaks.length > 0
    ? Math.round(
        (weekBreaks.reduce(
          (sum, item) => sum + item.stepsCompleted / Math.max(item.totalSteps, 1),
          0
        ) /
          weekBreaks.length) *
          100
      )
    : 0;

  const ratedBreaks = weekBreaks.filter((item) => item.rating !== null);
  const positiveRatingRate = ratedBreaks.length > 0
    ? Math.round((ratedBreaks.filter((item) => item.rating === 'good').length / ratedBreaks.length) * 100)
    : null;

  const currentWeekStart = getStartOfWeek(new Date());
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);

  const previousWeekBreaks = allBreaks.filter((item) => {
    const completedAt = new Date(item.completedAt);
    return completedAt >= previousWeekStart && completedAt < currentWeekStart;
  });

  const weekOverWeekChange =
    previousWeekBreaks.length === 0
      ? weekBreaks.length > 0
        ? null
        : 0
      : Math.round(((weekBreaks.length - previousWeekBreaks.length) / previousWeekBreaks.length) * 100);

  const categoryCounts = new Map<string, number>();
  const timeCounts = new Map<string, number>([
    ['Morning', 0],
    ['Afternoon', 0],
    ['Evening', 0],
    ['Night', 0],
  ]);

  weekBreaks.forEach((item) => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);

    const hour = new Date(item.completedAt).getHours();
    if (hour >= 5 && hour < 12) {
      timeCounts.set('Morning', (timeCounts.get('Morning') ?? 0) + 1);
    } else if (hour >= 12 && hour < 17) {
      timeCounts.set('Afternoon', (timeCounts.get('Afternoon') ?? 0) + 1);
    } else if (hour >= 17 && hour < 21) {
      timeCounts.set('Evening', (timeCounts.get('Evening') ?? 0) + 1);
    } else {
      timeCounts.set('Night', (timeCounts.get('Night') ?? 0) + 1);
    }
  });

  const topCategoryEntry =
    Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;
  const bestTimeEntry =
    Array.from(timeCounts.entries()).sort((a, b) => b[1] - a[1])[0] ?? null;

  const topCategory = topCategoryEntry ? titleCase(topCategoryEntry[0]) : null;
  const topCategoryShare =
    topCategoryEntry && weekBreaks.length > 0
      ? Math.round((topCategoryEntry[1] / weekBreaks.length) * 100)
      : 0;
  const bestTimeLabel = bestTimeEntry && bestTimeEntry[1] > 0 ? bestTimeEntry[0] : null;
  const bestTimeShare =
    bestTimeEntry && weekBreaks.length > 0
      ? Math.round((bestTimeEntry[1] / weekBreaks.length) * 100)
      : 0;

  const goalProgress = weeklyGoal > 0 ? clamp((weekBreaks.length / weeklyGoal) * 100, 0, 100) : 0;
  const activeDaysScore = clamp((activeDays / 5) * 100, 0, 100);
  const durationScore = clamp((averageDurationMinutes / 3) * 100, 0, 100);
  const streakScore = clamp((currentStreak / 7) * 100, 0, 100);

  const score = Math.round(
    goalProgress * 0.35 +
      activeDaysScore * 0.25 +
      durationScore * 0.15 +
      completionRate * 0.15 +
      streakScore * 0.1
  );

  let focusArea = 'Maintain momentum';
  let recommendation = 'Keep the current routine and repeat the break types that feel best.';

  if (weekBreaks.length === 0) {
    focusArea = 'Restart the habit';
    recommendation = 'Take one short break today to restart your weekly recovery rhythm.';
  } else if (activeDays < 3) {
    focusArea = 'Spread breaks across the week';
    recommendation = 'Aim for breaks on at least 3 separate days so recovery is not concentrated into one block.';
  } else if (averageDurationMinutes < 2.5) {
    focusArea = 'Add one longer reset';
    recommendation = 'Mix in a 3 to 5 minute stretch or walking session to balance quick resets.';
  } else if (topCategory === 'Quick' && topCategoryShare >= 50) {
    focusArea = 'Balance your break mix';
    recommendation = 'Add a stretch or mindful routine to reduce posture fatigue and improve recovery variety.';
  } else if (positiveRatingRate != null && positiveRatingRate < 50) {
    focusArea = 'Repeat what feels good';
    recommendation = 'Favorite the sessions that feel best and revisit them so your routine improves faster.';
  } else if (bestTimeLabel === 'Afternoon' && bestTimeShare >= 50) {
    focusArea = 'Start recovery earlier';
    recommendation = 'Try adding one morning break so fatigue does not build up until the afternoon.';
  }

  let summary = 'No breaks logged this week yet. A single reset today is enough to restart your rhythm.';
  if (weekBreaks.length > 0 && score >= 85) {
    summary = `You kept a strong rhythm with ${activeDays} active days and ${averageDurationMinutes} minute average breaks.`;
  } else if (weekBreaks.length > 0 && score >= 65) {
    summary = `Your recovery habit is holding together with solid consistency and a healthy break mix this week.`;
  } else if (weekBreaks.length > 0 && score >= 45) {
    summary = `The routine is starting to form, but it still relies on a few concentrated break windows.`;
  } else if (weekBreaks.length > 0) {
    summary = `You have activity this week, but the pattern is still light enough that recovery can slip easily.`;
  }

  const report = {
    score,
    scoreLabel: getScoreLabel(score),
    summary,
    recommendation,
    focusArea,
    activeDays,
    averageDurationMinutes,
    completionRate,
    positiveRatingRate,
    topCategory,
    topCategoryShare,
    bestTimeLabel,
    bestTimeShare,
    weekOverWeekChange,
  };

  return {
    ...report,
    shareMessage: buildWeeklyRecoveryShareMessage(report),
  };
}

function buildRecoveryInsights(report: WeeklyRecoveryReport | null): RecoveryInsight[] {
  if (!report) {
    return [];
  }

  const consistencyDetail =
    report.weekOverWeekChange == null
      ? 'No previous week baseline yet.'
      : `${report.weekOverWeekChange >= 0 ? '+' : ''}${report.weekOverWeekChange}% vs last week.`;

  return [
    {
      id: 'consistency',
      icon: 'calendar-outline',
      title: 'Consistency',
      value: `${report.activeDays}/7 days`,
      detail: consistencyDetail,
      tone: report.activeDays >= 4 ? 'positive' : report.activeDays >= 2 ? 'neutral' : 'attention',
    },
    {
      id: 'mix',
      icon: 'layers-outline',
      title: 'Break Mix',
      value: report.topCategory ? `${report.topCategory} ${report.topCategoryShare}%` : 'No mix yet',
      detail: report.topCategory
        ? `Most of this week's breaks leaned ${report.topCategory.toLowerCase()}.`
        : 'Take a few more breaks to build a pattern.',
      tone: report.topCategoryShare <= 45 ? 'positive' : report.topCategoryShare <= 65 ? 'neutral' : 'attention',
    },
    {
      id: 'timing',
      icon: 'time-outline',
      title: 'Best Window',
      value: report.bestTimeLabel ?? 'No pattern yet',
      detail: report.bestTimeLabel
        ? `${report.bestTimeShare}% of your breaks happened in ${report.bestTimeLabel.toLowerCase()}.`
        : 'You need a few more sessions before timing patterns stabilize.',
      tone: report.bestTimeLabel ? 'positive' : 'neutral',
    },
    {
      id: 'quality',
      icon: 'pulse-outline',
      title: 'Quality',
      value:
        report.positiveRatingRate != null
          ? `${report.positiveRatingRate}% positive`
          : `${report.completionRate}% complete`,
      detail:
        report.positiveRatingRate != null
          ? 'Based on the breaks you rated this week.'
          : 'Based on how many session steps you completed.',
      tone:
        report.positiveRatingRate != null
          ? report.positiveRatingRate >= 70
            ? 'positive'
            : report.positiveRatingRate >= 50
              ? 'neutral'
              : 'attention'
          : report.completionRate >= 85
            ? 'positive'
            : report.completionRate >= 60
              ? 'neutral'
              : 'attention',
    },
  ];
}

export function useStatsData(period: StatsPeriod = 'week'): StatsData {
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [breakTypes, setBreakTypes] = useState<BreakTypeData[]>([]);
  const [timePatterns, setTimePatterns] = useState<TimePatternData[]>([]);
  const [recentBreaks, setRecentBreaks] = useState<CompletedBreak[]>([]);
  const [allBreaks, setAllBreaks] = useState<CompletedBreak[]>([]);
  const [weekBreaksData, setWeekBreaksData] = useState<CompletedBreak[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stats, streak, history] = await Promise.all([
        getUserStats(),
        getStreakData(),
        getBreakHistory(),
      ]);

      const today = getTodayBreaksFromHistory(history);
      const week = getWeekBreaksFromHistory(history);
      const recent = getRecentBreaksFromHistory(history, 10);
      const month = getMonthBreaksFromHistory(history);

      setUserStats(stats);
      setStreakData(streak);
      setTodayCount(today.length);
      setWeekCount(week.length);
      setRecentBreaks(recent);
      setWeekBreaksData(week);
      setAllBreaks(history);

      // Load period-specific data
      let chart: ChartDataPoint[] = [];
      if (period === 'week') {
        const weeklyData = getWeeklyChartDataFromHistory(history);
        chart = weeklyData.map((d) => ({
          label: d.day,
          value: d.count,
          minutes: d.minutes,
        }));
      } else if (period === 'month') {
        const monthlyData = getMonthlyChartDataFromHistory(history);
        // Show every 5th day label for readability
        chart = monthlyData.map((d, i) => ({
          label: i % 5 === 0 ? d.date : '',
          value: d.count,
          minutes: d.minutes,
        }));
      } else {
        // Year - aggregate by week (simplified)
        const monthlyData = getMonthlyChartDataFromHistory(history);
        chart = monthlyData.map((d, i) => ({
          label: i % 7 === 0 ? d.date : '',
          value: d.count,
          minutes: d.minutes,
        }));
      }
      setChartData(chart);

      const periodBreaks = period === 'week' ? week : period === 'month' ? month : history;
      setBreakTypes(getBreakTypeDistributionFromBreaks(periodBreaks));
      setTimePatterns(getTimePatternsFromBreaks(periodBreaks));
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading stats:', error);
      }
      // Keep previous data on error - don't reset state
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const weeklyRecoveryReport = useMemo(
    () =>
      buildWeeklyRecoveryReport(
        weekBreaksData,
        allBreaks,
        userStats?.weeklyGoal || 20,
        streakData?.currentStreak || 0
      ),
    [allBreaks, streakData, userStats, weekBreaksData]
  );

  const recoveryInsights = useMemo(
    () => buildRecoveryInsights(weeklyRecoveryReport),
    [weeklyRecoveryReport]
  );

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    totalBreaks: userStats?.totalBreaks || 0,
    totalMinutes: userStats?.totalMinutes || 0,
    currentStreak: streakData?.currentStreak || 0,
    longestStreak: streakData?.longestStreak || 0,
    todayBreaks: todayCount,
    weekBreaks: weekCount,
    xpEarned: userStats?.totalXP || 0,
    level: userStats?.level || 1,
    weeklyGoal: userStats?.weeklyGoal || 20,
    weeklyProgress: userStats?.weeklyProgress || 0,
    chartData,
    breakTypes,
    timePatterns,
    recentBreaks,
    weeklyRecoveryReport,
    recoveryInsights,
    isLoading,
    refresh: loadData,
  }), [
    userStats,
    streakData,
    todayCount,
    weekCount,
    chartData,
    breakTypes,
    timePatterns,
    recentBreaks,
    weeklyRecoveryReport,
    recoveryInsights,
    isLoading,
    loadData,
  ]);
}

export default useStatsData;
