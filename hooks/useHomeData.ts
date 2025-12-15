/**
 * Home Screen Data Hook
 * Manages state, loading, and data fetching for home screen
 * Uses real data from AsyncStorage and Zustand stores
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTodayBreaks,
  getWeekBreaks,
  getStreakData,
  getUserStats,
  getRecentBreaks,
} from '@/services/breakHistory';
import { useUserStore } from '@/store';

export interface UserData {
  name: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  levelTitle: string;
}

export interface DailyProgress {
  breaksTaken: number;
  breaksGoal: number;
  minutesInvested: number;
  lastBreakMinutesAgo: number;
}

export interface StreakData {
  current: number;
  longest: number;
  completedDays: boolean[];
  currentDayIndex: number;
}

export interface WeeklyInsight {
  icon: string;
  label: string;
  value: string;
  change: number;
  color: string;
}

export interface HomeData {
  user: UserData;
  avatar: string | null;
  dailyProgress: DailyProgress;
  streak: StreakData;
  weeklyInsights: WeeklyInsight[];
  nextBreakMinutes: number;
}

interface UseHomeDataReturn {
  data: HomeData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  // Computed states
  isEmpty: boolean;
  isNewUser: boolean;
  hasCompletedGoal: boolean;
  shouldCelebrate: 'goal_complete' | 'new_level' | 'streak_milestone' | 'first_break' | null;
  clearCelebration: () => void;
}

// Level titles based on level
const LEVEL_TITLES: Record<number, string> = {
  1: 'Wellness Beginner',
  2: 'Break Enthusiast',
  3: 'Committed Breaker',
  4: 'Wellness Warrior',
  5: 'Break Master',
  6: 'Zen Apprentice',
  7: 'Mindfulness Pro',
  8: 'Wellness Champion',
  9: 'Break Legend',
  10: 'Zen Master',
};

// Calculate last break minutes ago
function calculateLastBreakMinutes(completedAt: string | undefined): number {
  if (!completedAt) return 999; // No breaks taken yet
  const lastBreakTime = new Date(completedAt);
  const now = new Date();
  return Math.floor((now.getTime() - lastBreakTime.getTime()) / (1000 * 60));
}

// Calculate weekly completed days
function calculateWeeklyDays(streakHistory: { date: string; count: number }[]): boolean[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const completedDays: boolean[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dateStr = day.toISOString().split('T')[0];
    const hasBreaks = streakHistory.some((h) => h.date === dateStr && h.count > 0);
    completedDays.push(hasBreaks);
  }

  return completedDays;
}

// Generate home data from stored data
async function generateHomeData(userName: string, userAvatar: string | null): Promise<HomeData & { avatar: string | null }> {
  const [todayBreaks, weekBreaks, storedStreak, userStats, recentBreaks] = await Promise.all([
    getTodayBreaks(),
    getWeekBreaks(),
    getStreakData(),
    getUserStats(),
    getRecentBreaks(1),
  ]);

  const dayOfWeek = new Date().getDay();
  const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Calculate minutes invested today
  const minutesInvested = todayBreaks.reduce(
    (sum, b) => sum + Math.round(b.duration / 60),
    0
  );

  // Calculate last break time
  const lastBreakMinutesAgo = recentBreaks.length > 0
    ? calculateLastBreakMinutes(recentBreaks[0].completedAt)
    : 999;

  // Calculate weekly insights
  const weekBreaksCount = weekBreaks.length;
  const weekMinutes = weekBreaks.reduce((sum, b) => sum + Math.round(b.duration / 60), 0);

  // Get level title
  const levelTitle = LEVEL_TITLES[Math.min(userStats.level, 10)] || LEVEL_TITLES[10];

  return {
    user: {
      name: userName,
      level: userStats.level,
      currentXP: userStats.totalXP % 100,
      nextLevelXP: 100,
      levelTitle,
    },
    avatar: userAvatar,
    dailyProgress: {
      breaksTaken: todayBreaks.length,
      breaksGoal: userStats.weeklyGoal > 0 ? Math.max(Math.round(userStats.weeklyGoal / 7), 3) : 8,
      minutesInvested,
      lastBreakMinutesAgo,
    },
    streak: {
      current: storedStreak.currentStreak,
      longest: storedStreak.longestStreak,
      completedDays: calculateWeeklyDays(storedStreak.streakHistory),
      currentDayIndex,
    },
    weeklyInsights: [
      {
        icon: 'fitness',
        label: 'Breaks',
        value: String(weekBreaksCount),
        change: weekBreaksCount > 0 ? Math.min(Math.round((weekBreaksCount / 20) * 100), 100) : 0,
        color: '#06FFA5',
      },
      {
        icon: 'time',
        label: 'Minutes',
        value: `${weekMinutes}m`,
        change: weekMinutes > 0 ? Math.min(Math.round((weekMinutes / 60) * 100), 100) : 0,
        color: '#00E5FF',
      },
      {
        icon: 'flame',
        label: 'Streak',
        value: `${storedStreak.currentStreak} days`,
        change: storedStreak.currentStreak > 0
          ? Math.min(Math.round((storedStreak.currentStreak / 7) * 100), 100)
          : 0,
        color: '#FFD166',
      },
      {
        icon: 'trophy',
        label: 'XP',
        value: `${userStats.totalXP}`,
        change: userStats.totalXP > 0 ? Math.min(Math.round((userStats.totalXP / 100) * 100), 100) : 0,
        color: '#B47EFF',
      },
    ],
    nextBreakMinutes: lastBreakMinutesAgo > 25 ? 0 : 25 - lastBreakMinutesAgo,
  };
}

export function useHomeData(): UseHomeDataReturn {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [celebration, setCelebration] = useState<UseHomeDataReturn['shouldCelebrate']>(null);
  const [previousData, setPreviousData] = useState<HomeData | null>(null);

  // Get user profile from store
  const userProfile = useUserStore((state) => state.profile);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const newData = await generateHomeData(userProfile.name, userProfile.avatar);

      // Check for celebrations (only on refresh, not initial load)
      if (previousData && isRefresh) {
        // Goal complete celebration
        if (
          newData.dailyProgress.breaksTaken >= newData.dailyProgress.breaksGoal &&
          previousData.dailyProgress.breaksTaken < previousData.dailyProgress.breaksGoal
        ) {
          setCelebration('goal_complete');
        }
        // Level up celebration
        else if (newData.user.level > previousData.user.level) {
          setCelebration('new_level');
        }
        // Streak milestone (7, 14, 30, 60, 100 days)
        else if (
          [7, 14, 30, 60, 100].includes(newData.streak.current) &&
          !([7, 14, 30, 60, 100].includes(previousData.streak.current))
        ) {
          setCelebration('streak_milestone');
        }
        // First break of the day
        else if (
          newData.dailyProgress.breaksTaken === 1 &&
          previousData.dailyProgress.breaksTaken === 0
        ) {
          setCelebration('first_break');
        }
      }

      setPreviousData(data);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [data, previousData, userProfile.name, userProfile.avatar]);

  useEffect(() => {
    fetchData();
  }, [userProfile.name, userProfile.avatar]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  // Computed values
  const isEmpty = useMemo(() => {
    return data?.dailyProgress.breaksTaken === 0;
  }, [data]);

  const isNewUser = useMemo(() => {
    return data?.user.level === 1 && data?.user.currentXP === 0 && data?.dailyProgress.breaksTaken === 0;
  }, [data]);

  const hasCompletedGoal = useMemo(() => {
    if (!data) return false;
    return data.dailyProgress.breaksTaken >= data.dailyProgress.breaksGoal;
  }, [data]);

  return {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
    isEmpty,
    isNewUser,
    hasCompletedGoal,
    shouldCelebrate: celebration,
    clearCelebration,
  };
}

// Dynamic greeting based on time and context
export function useGreeting(userName?: string): { greeting: string; subtitle: string } {
  return useMemo(() => {
    const hour = new Date().getHours();
    const name = userName ? `, ${userName}` : '';

    let greeting: string;
    let subtitle: string;

    if (hour < 5) {
      greeting = `Good night${name}`;
      subtitle = 'Rest well, breaks can wait';
    } else if (hour < 12) {
      greeting = `Good morning${name}`;
      subtitle = 'Start your day with a stretch';
    } else if (hour < 14) {
      greeting = `Good afternoon${name}`;
      subtitle = 'Perfect time for a midday break';
    } else if (hour < 17) {
      greeting = `Good afternoon${name}`;
      subtitle = 'Keep the momentum going';
    } else if (hour < 21) {
      greeting = `Good evening${name}`;
      subtitle = 'Wind down with a gentle break';
    } else {
      greeting = `Good evening${name}`;
      subtitle = 'One more break before rest';
    }

    return { greeting, subtitle };
  }, [userName]);
}

// Time-aware ambient colors
export function useAmbientColors(): {
  primary: string;
  secondary: string;
  gradient: [string, string];
} {
  return useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 6) {
      // Night - deep blues
      return {
        primary: '#1a1a3e',
        secondary: '#0d0d2b',
        gradient: ['#1a1a3e', '#0d0d2b'],
      };
    } else if (hour < 10) {
      // Morning - fresh greens
      return {
        primary: '#06FFA5',
        secondary: '#00E5FF',
        gradient: ['#06FFA5', '#00E5FF'],
      };
    } else if (hour < 14) {
      // Midday - energetic cyan
      return {
        primary: '#00E5FF',
        secondary: '#06FFA5',
        gradient: ['#00E5FF', '#06FFA5'],
      };
    } else if (hour < 17) {
      // Afternoon - focused purple
      return {
        primary: '#B47EFF',
        secondary: '#06FFA5',
        gradient: ['#B47EFF', '#06FFA5'],
      };
    } else if (hour < 20) {
      // Evening - warm gold
      return {
        primary: '#FFD166',
        secondary: '#B47EFF',
        gradient: ['#FFD166', '#B47EFF'],
      };
    } else {
      // Night - calming purple
      return {
        primary: '#B47EFF',
        secondary: '#1a1a3e',
        gradient: ['#B47EFF', '#1a1a3e'],
      };
    }
  }, []);
}

// Format current date
export function useFormattedDate(): string {
  return useMemo(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }, []);
}
