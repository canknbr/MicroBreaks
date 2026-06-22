/**
 * Home Screen Data Hook
 * Manages state, loading, and data fetching for home screen
 * Uses real data from AsyncStorage and Zustand stores
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from '@/i18n/hooks';
import {
  getBreakHistory,
  getStreakData,
  getUserStats,
} from '@/services/breakHistory';
import { DEFAULT_WEEKLY_GOAL } from '@/constants/config';
import { useUserStore } from '@/store';
import { useSettingsStore } from '@/store/settingsStore';
import { calculateDailyGoal } from '@/utils/validation';
import { mapBreakHistoryToOutcomeSignals } from '@/features/recovery/personalization';
import type { RecommendationOutcomeSignal } from '@/services/recommendations/scoring';
import { getEffectiveReminderInterval } from '@/features/workday/patterns';

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
  lastBreakMinutesAgo: number | null;
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
  recommendationSignals: {
    recentBreakIds: string[];
    historicalOutcomes: RecommendationOutcomeSignal[];
  };
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

interface UseHomeDataOptions {
  workPattern?: string | null;
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

// Calculate last break minutes ago. Returns null (out-of-band) when there is
// no break to measure against, so consumers never confuse "no data" with a
// real elapsed time — an in-band sentinel (999) collided with genuine gaps
// longer than ~16.6h.
function calculateLastBreakMinutes(completedAt: string | undefined): number | null {
  if (!completedAt) return null; // No breaks taken yet
  const lastBreakTime = new Date(completedAt);
  const now = new Date();
  return Math.floor((now.getTime() - lastBreakTime.getTime()) / (1000 * 60));
}

// Calculate weekly completed days
export function calculateWeeklyDays(streakHistory: { date: string; count: number }[]): boolean[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const completedDays: boolean[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    // Key by LOCAL Y/M/D — streak history is written with local dates
    // (breakHistory.getLocalDateString). toISOString() would convert to UTC
    // and shift the key back a day for UTC+ users, mismatching the history.
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(
      day.getDate()
    ).padStart(2, '0')}`;
    const hasBreaks = streakHistory.some((h) => h.date === dateStr && h.count > 0);
    completedDays.push(hasBreaks);
  }

  return completedDays;
}

function getDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

// Half-open week interval [start, end): Monday 00:00 local up to — but not
// including — the following Monday 00:00. Mirrors getDayRange so week bucketing
// uses the same exclusive upper bound and never double-counts a break that
// lands exactly on the next-week boundary.
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const dayOfWeek = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

async function generateHomeData(
  userName: string,
  userAvatar: string | null,
  reminderIntervalMinutes: number,
  workPattern: string | null
): Promise<HomeData & { avatar: string | null }> {
  const [allBreaks, storedStreak, userStats] = await Promise.all([
    getBreakHistory(),
    getStreakData(),
    getUserStats(),
  ]);

  const today = new Date();
  const { start: todayStart, end: tomorrow } = getDayRange(today);
  const { start: weekStart, end: weekEnd } = getWeekRange(today);
  const dayOfWeek = today.getDay();

  const todayBreaks = allBreaks.filter((breakEntry) => {
    const completedAt = new Date(breakEntry.completedAt);
    return completedAt >= todayStart && completedAt < tomorrow;
  });

  const weekBreaks = allBreaks.filter((breakEntry) => {
    const completedAt = new Date(breakEntry.completedAt);
    return completedAt >= weekStart && completedAt < weekEnd;
  });

  const mostRecentBreak = allBreaks[0];
  const recommendationSignals = {
    recentBreakIds: allBreaks.slice(0, 5).map((breakEntry) => breakEntry.breakId),
    historicalOutcomes: mapBreakHistoryToOutcomeSignals(allBreaks),
  };

  const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Calculate minutes invested today
  const minutesInvested = todayBreaks.reduce(
    (sum, b) => sum + Math.round(b.duration / 60),
    0
  );

  // Calculate last break time
  const lastBreakMinutesAgo = mostRecentBreak
    ? calculateLastBreakMinutes(mostRecentBreak.completedAt)
    : null;

  // Calculate weekly insights
  const weekBreaksCount = weekBreaks.length;
  const weekMinutes = weekBreaks.reduce((sum, b) => sum + Math.round(b.duration / 60), 0);

  // Get level title
  const levelTitle = LEVEL_TITLES[Math.min(userStats.level, 10)] || LEVEL_TITLES[10];

  const effectiveReminderInterval = getEffectiveReminderInterval(
    reminderIntervalMinutes,
    workPattern
  );

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
      breaksGoal:
        userStats.weeklyGoal > 0
          ? calculateDailyGoal(userStats.weeklyGoal)
          : calculateDailyGoal(DEFAULT_WEEKLY_GOAL),
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
    nextBreakMinutes:
      lastBreakMinutesAgo == null || lastBreakMinutesAgo > effectiveReminderInterval
        ? 0
        : effectiveReminderInterval - lastBreakMinutesAgo,
    recommendationSignals,
  };
}

export function useHomeData(options: UseHomeDataOptions = {}): UseHomeDataReturn {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [celebration, setCelebration] = useState<UseHomeDataReturn['shouldCelebrate']>(null);

  // Use refs to avoid unnecessary callback recreations
  const dataRef = useRef<HomeData | null>(null);
  const previousDataRef = useRef<HomeData | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  // Get user profile from store
  const userProfile = useUserStore((state) => state.profile);
  const reminderIntervalMinutes = useSettingsStore(
    (state) => state.settings.reminderIntervalMinutes
  );
  const workPattern = options.workPattern ?? null;

  const fetchData = useCallback(async (isRefresh = false) => {
    const requestId = ++requestIdRef.current;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const newData = await generateHomeData(
        userProfile.name,
        userProfile.avatar,
        reminderIntervalMinutes,
        workPattern
      );

      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      // Check for celebrations (only on refresh, not initial load)
      const prevData = previousDataRef.current;
      if (prevData && isRefresh) {
        // Goal complete celebration
        if (
          newData.dailyProgress.breaksTaken >= newData.dailyProgress.breaksGoal &&
          prevData.dailyProgress.breaksTaken < prevData.dailyProgress.breaksGoal
        ) {
          setCelebration('goal_complete');
        }
        // Level up celebration
        else if (newData.user.level > prevData.user.level) {
          setCelebration('new_level');
        }
        // Streak milestone (7, 14, 30, 60, 100 days)
        else if (
          [7, 14, 30, 60, 100].includes(newData.streak.current) &&
          !([7, 14, 30, 60, 100].includes(prevData.streak.current))
        ) {
          setCelebration('streak_milestone');
        }
        // First break of the day
        else if (
          newData.dailyProgress.breaksTaken === 1 &&
          prevData.dailyProgress.breaksTaken === 0
        ) {
          setCelebration('first_break');
        }
      }

      // Update refs before setting state
      previousDataRef.current = dataRef.current;
      dataRef.current = newData;
      setData(newData);
    } catch (err) {
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      if (!isMountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile.name, userProfile.avatar, reminderIntervalMinutes, workPattern]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [fetchData]);

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
  const { t } = useTranslation();

  return useMemo(() => {
    const hour = new Date().getHours();
    const name = userName ? `, ${userName}` : '';

    let greetingKey: string;
    let subtitleKey: string;

    if (hour < 5) {
      greetingKey = 'home.greeting.night';
      subtitleKey = 'home.greetingSubtitle.night';
    } else if (hour < 12) {
      greetingKey = 'home.greeting.morning';
      subtitleKey = 'home.greetingSubtitle.morning';
    } else if (hour < 14) {
      greetingKey = 'home.greeting.afternoon';
      subtitleKey = 'home.greetingSubtitle.earlyAfternoon';
    } else if (hour < 17) {
      greetingKey = 'home.greeting.afternoon';
      subtitleKey = 'home.greetingSubtitle.lateAfternoon';
    } else if (hour < 21) {
      greetingKey = 'home.greeting.evening';
      subtitleKey = 'home.greetingSubtitle.evening';
    } else {
      greetingKey = 'home.greeting.evening';
      subtitleKey = 'home.greetingSubtitle.lateEvening';
    }

    return {
      greeting: `${t(greetingKey)}${name}`,
      subtitle: t(subtitleKey),
    };
  }, [userName, t]);
}

// Hook to get current hour, updating when it changes
function useCurrentHour(): number {
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    // Check every minute if the hour has changed
    const interval = setInterval(() => {
      const currentHour = new Date().getHours();
      setHour((prev) => (prev !== currentHour ? currentHour : prev));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return hour;
}

// Time-aware ambient colors
export function useAmbientColors(): {
  primary: string;
  secondary: string;
  gradient: [string, string];
} {
  const hour = useCurrentHour();

  return useMemo(() => {
    if (hour < 6) {
      // Night - deep blues
      return {
        primary: '#1a1a3e',
        secondary: '#0d0d2b',
        gradient: ['#1a1a3e', '#0d0d2b'] as [string, string],
      };
    } else if (hour < 10) {
      // Morning - fresh greens
      return {
        primary: '#06FFA5',
        secondary: '#00E5FF',
        gradient: ['#06FFA5', '#00E5FF'] as [string, string],
      };
    } else if (hour < 14) {
      // Midday - energetic cyan
      return {
        primary: '#00E5FF',
        secondary: '#06FFA5',
        gradient: ['#00E5FF', '#06FFA5'] as [string, string],
      };
    } else if (hour < 17) {
      // Afternoon - focused purple
      return {
        primary: '#B47EFF',
        secondary: '#06FFA5',
        gradient: ['#B47EFF', '#06FFA5'] as [string, string],
      };
    } else if (hour < 20) {
      // Evening - warm gold
      return {
        primary: '#FFD166',
        secondary: '#B47EFF',
        gradient: ['#FFD166', '#B47EFF'] as [string, string],
      };
    } else {
      // Night - calming purple
      return {
        primary: '#B47EFF',
        secondary: '#1a1a3e',
        gradient: ['#B47EFF', '#1a1a3e'] as [string, string],
      };
    }
  }, [hour]);
}

// Format current date
export function useFormattedDate(): string {
  const [dateStr, setDateStr] = useState(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  });

  useEffect(() => {
    // Check every minute if the date has changed
    const interval = setInterval(() => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      };
      const newDateStr = date.toLocaleDateString('en-US', options);
      setDateStr((prev) => (prev !== newDateStr ? newDateStr : prev));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return dateStr;
}
