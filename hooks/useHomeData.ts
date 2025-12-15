/**
 * Home Screen Data Hook
 * Manages state, loading, and data fetching for home screen
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

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

// Simulated API delay
const simulateApiCall = <T>(data: T, delay = 1000): Promise<T> => {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
};

// Mock data generator
const generateMockData = (): HomeData => {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();

  // Simulate different states based on time
  const breaksTaken = Math.min(Math.floor(hour / 2.5), 8);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
    user: {
      name: 'Can',
      level: 3,
      currentXP: 280,
      nextLevelXP: 500,
      levelTitle: 'Committed Breaker',
    },
    dailyProgress: {
      breaksTaken,
      breaksGoal: 8,
      minutesInvested: breaksTaken * 3,
      lastBreakMinutesAgo: Math.floor(Math.random() * 120) + 10,
    },
    streak: {
      current: 5,
      longest: 12,
      completedDays: [true, true, true, true, !isWeekend, false, false],
      currentDayIndex: Math.min(dayOfWeek === 0 ? 6 : dayOfWeek - 1, 6),
    },
    weeklyInsights: [
      { icon: 'fitness', label: 'Breaks', value: '24', change: 12, color: '#06FFA5' },
      { icon: 'time', label: 'Minutes', value: '48m', change: 8, color: '#00E5FF' },
      { icon: 'flame', label: 'Streak', value: '5 days', change: 25, color: '#FFD166' },
      { icon: 'trending-up', label: 'Focus', value: '+18%', change: 18, color: '#B47EFF' },
    ],
    nextBreakMinutes: Math.floor(Math.random() * 20) + 5,
  };
};

export function useHomeData(): UseHomeDataReturn {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [celebration, setCelebration] = useState<UseHomeDataReturn['shouldCelebrate']>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const newData = await simulateApiCall(generateMockData(), isRefresh ? 500 : 1200);

      // Check for celebrations
      if (data) {
        // Goal complete celebration
        if (
          newData.dailyProgress.breaksTaken >= newData.dailyProgress.breaksGoal &&
          data.dailyProgress.breaksTaken < data.dailyProgress.breaksGoal
        ) {
          setCelebration('goal_complete');
        }
        // Level up celebration
        else if (newData.user.level > data.user.level) {
          setCelebration('new_level');
        }
        // Streak milestone (7, 14, 30, 60, 100 days)
        else if (
          [7, 14, 30, 60, 100].includes(newData.streak.current) &&
          !([7, 14, 30, 60, 100].includes(data.streak.current))
        ) {
          setCelebration('streak_milestone');
        }
        // First break of the day
        else if (
          newData.dailyProgress.breaksTaken === 1 &&
          data.dailyProgress.breaksTaken === 0
        ) {
          setCelebration('first_break');
        }
      }

      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [data]);

  useEffect(() => {
    fetchData();
  }, []);

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
    return data?.user.level === 1 && data?.dailyProgress.breaksTaken === 0;
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
