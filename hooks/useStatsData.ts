/**
 * Stats Data Hook
 * Provides real statistics from break history
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getWeeklyChartData,
  getMonthlyChartData,
  getBreakTypeDistribution,
  getRecentBreaks,
  getUserStats,
  getStreakData,
  getTodayBreaks,
  getWeekBreaks,
  getTimePatterns,
  TimePatternData,
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

  // Loading state
  isLoading: boolean;

  // Refresh function
  refresh: () => Promise<void>;
}

export function useStatsData(period: StatsPeriod = 'week'): StatsData {
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [breakTypes, setBreakTypes] = useState<BreakTypeData[]>([]);
  const [timePatterns, setTimePatterns] = useState<TimePatternData[]>([]);
  const [recentBreaks, setRecentBreaks] = useState<CompletedBreak[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [weekCount, setWeekCount] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [stats, streak, today, week, recent] = await Promise.all([
        getUserStats(),
        getStreakData(),
        getTodayBreaks(),
        getWeekBreaks(),
        getRecentBreaks(10),
      ]);

      setUserStats(stats);
      setStreakData(streak);
      setTodayCount(today.length);
      setWeekCount(week.length);
      setRecentBreaks(recent);

      // Load period-specific data
      let chart: ChartDataPoint[] = [];
      if (period === 'week') {
        const weeklyData = await getWeeklyChartData();
        chart = weeklyData.map((d) => ({
          label: d.day,
          value: d.count,
          minutes: d.minutes,
        }));
      } else if (period === 'month') {
        const monthlyData = await getMonthlyChartData();
        // Show every 5th day label for readability
        chart = monthlyData.map((d, i) => ({
          label: i % 5 === 0 ? d.date : '',
          value: d.count,
          minutes: d.minutes,
        }));
      } else {
        // Year - aggregate by week (simplified)
        const monthlyData = await getMonthlyChartData();
        chart = monthlyData.map((d, i) => ({
          label: i % 7 === 0 ? d.date : '',
          value: d.count,
          minutes: d.minutes,
        }));
      }
      setChartData(chart);

      // Load break type distribution for the period
      const types = await getBreakTypeDistribution(period === 'year' ? 'all' : period);
      setBreakTypes(types);

      // Load time patterns
      const patterns = await getTimePatterns(period === 'year' ? 'all' : period);
      setTimePatterns(patterns);
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
    isLoading,
    refresh: loadData,
  }), [userStats, streakData, todayCount, weekCount, chartData, breakTypes, timePatterns, recentBreaks, isLoading, loadData]);
}

export default useStatsData;
