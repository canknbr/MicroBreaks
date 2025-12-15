/**
 * Break History Service
 * Manages completed breaks, statistics, and streaks
 */

import {
  STORAGE_KEYS,
  getItem,
  setItem,
  CompletedBreak,
  StreakData,
  UserStats,
  DEFAULT_STREAK_DATA,
  DEFAULT_USER_STATS,
} from './storage';

// Get all completed breaks
export async function getBreakHistory(): Promise<CompletedBreak[]> {
  const history = await getItem<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);
  return history || [];
}

// Get breaks within a date range
export async function getBreaksByDateRange(
  startDate: Date,
  endDate: Date
): Promise<CompletedBreak[]> {
  const history = await getBreakHistory();
  return history.filter((b) => {
    const breakDate = new Date(b.completedAt);
    return breakDate >= startDate && breakDate <= endDate;
  });
}

// Get breaks for today
export async function getTodayBreaks(): Promise<CompletedBreak[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getBreaksByDateRange(today, tomorrow);
}

// Get breaks for current week (Monday to Sunday)
export async function getWeekBreaks(): Promise<CompletedBreak[]> {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return getBreaksByDateRange(monday, sunday);
}

// Get breaks for current month
export async function getMonthBreaks(): Promise<CompletedBreak[]> {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  return getBreaksByDateRange(firstDay, lastDay);
}

// Save a completed break
export async function saveCompletedBreak(breakData: Omit<CompletedBreak, 'id'>): Promise<boolean> {
  try {
    const history = await getBreakHistory();
    const newBreak: CompletedBreak = {
      ...breakData,
      id: `break_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    history.unshift(newBreak); // Add to beginning

    // Keep only last 500 breaks to manage storage
    if (history.length > 500) {
      history.length = 500;
    }

    await setItem(STORAGE_KEYS.BREAK_HISTORY, history);

    // Update streak
    await updateStreak();

    // Update user stats
    await updateUserStats(newBreak);

    return true;
  } catch (error) {
    console.error('Error saving break:', error);
    return false;
  }
}

// Get streak data
export async function getStreakData(): Promise<StreakData> {
  const data = await getItem<StreakData>(STORAGE_KEYS.STREAK_DATA);
  return data || DEFAULT_STREAK_DATA;
}

// Update streak based on break history
async function updateStreak(): Promise<void> {
  const streakData = await getStreakData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const lastBreakDate = streakData.lastBreakDate;

  if (!lastBreakDate) {
    // First break ever
    streakData.currentStreak = 1;
    streakData.longestStreak = 1;
    streakData.lastBreakDate = todayStr;
  } else {
    const lastDate = new Date(lastBreakDate);
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, streak unchanged
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      streakData.currentStreak += 1;
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
      }
    } else {
      // Streak broken, reset to 1
      streakData.currentStreak = 1;
    }
    streakData.lastBreakDate = todayStr;
  }

  // Update streak history
  const historyEntry = streakData.streakHistory.find((h) => h.date === todayStr);
  if (historyEntry) {
    historyEntry.count += 1;
  } else {
    streakData.streakHistory.unshift({ date: todayStr, count: 1 });
    // Keep only last 90 days
    if (streakData.streakHistory.length > 90) {
      streakData.streakHistory.length = 90;
    }
  }

  await setItem(STORAGE_KEYS.STREAK_DATA, streakData);
}

// Get user stats
export async function getUserStats(): Promise<UserStats> {
  const stats = await getItem<UserStats>(STORAGE_KEYS.USER_STATS);
  return stats || DEFAULT_USER_STATS;
}

// Update user stats after completing a break
async function updateUserStats(breakData: CompletedBreak): Promise<void> {
  const stats = await getUserStats();

  stats.totalBreaks += 1;
  stats.totalMinutes += Math.round(breakData.duration / 60);
  stats.totalXP += breakData.xpEarned;

  // Level calculation: level up every 100 XP
  stats.level = Math.floor(stats.totalXP / 100) + 1;

  // Update weekly progress
  const weekBreaks = await getWeekBreaks();
  stats.weeklyProgress = weekBreaks.length;

  await setItem(STORAGE_KEYS.USER_STATS, stats);
}

// Get weekly data for chart (last 7 days)
export async function getWeeklyChartData(): Promise<{ day: string; count: number; minutes: number }[]> {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Get start of week (Monday)
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const result: { day: string; count: number; minutes: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const breaks = await getBreaksByDateRange(dayStart, dayEnd);
    const totalMinutes = breaks.reduce((sum, b) => sum + Math.round(b.duration / 60), 0);

    result.push({
      day: days[i],
      count: breaks.length,
      minutes: totalMinutes,
    });
  }

  return result;
}

// Get monthly data for chart (last 30 days)
export async function getMonthlyChartData(): Promise<{ date: string; count: number; minutes: number }[]> {
  const result: { date: string; count: number; minutes: number }[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const breaks = await getBreaksByDateRange(dayStart, dayEnd);
    const totalMinutes = breaks.reduce((sum, b) => sum + Math.round(b.duration / 60), 0);

    result.push({
      date: `${dayStart.getMonth() + 1}/${dayStart.getDate()}`,
      count: breaks.length,
      minutes: totalMinutes,
    });
  }

  return result;
}

// Get break type distribution
export async function getBreakTypeDistribution(
  period: 'week' | 'month' | 'all'
): Promise<{ category: string; count: number; percentage: number; color: string }[]> {
  let breaks: CompletedBreak[];

  if (period === 'week') {
    breaks = await getWeekBreaks();
  } else if (period === 'month') {
    breaks = await getMonthBreaks();
  } else {
    breaks = await getBreakHistory();
  }

  if (breaks.length === 0) {
    return [];
  }

  // Group by category
  const categoryMap = new Map<string, { count: number; color: string }>();

  breaks.forEach((b) => {
    const existing = categoryMap.get(b.category);
    if (existing) {
      existing.count += 1;
    } else {
      categoryMap.set(b.category, { count: 1, color: b.color });
    }
  });

  // Convert to array and calculate percentages
  const total = breaks.length;
  const result: { category: string; count: number; percentage: number; color: string }[] = [];

  categoryMap.forEach((value, key) => {
    result.push({
      category: key.charAt(0).toUpperCase() + key.slice(1),
      count: value.count,
      percentage: Math.round((value.count / total) * 100),
      color: value.color,
    });
  });

  // Sort by count descending
  result.sort((a, b) => b.count - a.count);

  return result;
}

// Get recent breaks (last N)
export async function getRecentBreaks(limit: number = 10): Promise<CompletedBreak[]> {
  const history = await getBreakHistory();
  return history.slice(0, limit);
}

// Check streak status (for reminders)
export async function checkStreakStatus(): Promise<{
  isAtRisk: boolean;
  hoursUntilReset: number;
}> {
  const streakData = await getStreakData();

  if (!streakData.lastBreakDate || streakData.currentStreak === 0) {
    return { isAtRisk: false, hoursUntilReset: 0 };
  }

  const lastBreak = new Date(streakData.lastBreakDate);
  const now = new Date();
  const tomorrow = new Date(lastBreak);
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(0, 0, 0, 0);

  const hoursRemaining = Math.max(0, (tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));

  return {
    isAtRisk: hoursRemaining > 0 && hoursRemaining < 6,
    hoursUntilReset: Math.round(hoursRemaining),
  };
}

// Time pattern data
export interface TimePatternData {
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  label: string;
  count: number;
  percentage: number;
  timeRange: string;
  color: string;
  icon: string;
}

// Get time patterns - when user typically takes breaks
export async function getTimePatterns(
  period: 'week' | 'month' | 'all' = 'week'
): Promise<TimePatternData[]> {
  let breaks: CompletedBreak[];

  if (period === 'week') {
    breaks = await getWeekBreaks();
  } else if (period === 'month') {
    breaks = await getMonthBreaks();
  } else {
    breaks = await getBreakHistory();
  }

  if (breaks.length === 0) {
    return [];
  }

  // Define time periods
  const timePeriods = {
    morning: { start: 5, end: 12, label: 'Morning', timeRange: '5 AM - 12 PM', color: '#FFD166', icon: '🌅' },
    afternoon: { start: 12, end: 17, label: 'Afternoon', timeRange: '12 PM - 5 PM', color: '#06FFA5', icon: '☀️' },
    evening: { start: 17, end: 21, label: 'Evening', timeRange: '5 PM - 9 PM', color: '#B47EFF', icon: '🌆' },
    night: { start: 21, end: 5, label: 'Night', timeRange: '9 PM - 5 AM', color: '#00E5FF', icon: '🌙' },
  };

  // Count breaks by time period
  const counts: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  breaks.forEach((b) => {
    const hour = new Date(b.completedAt).getHours();

    if (hour >= 5 && hour < 12) {
      counts.morning += 1;
    } else if (hour >= 12 && hour < 17) {
      counts.afternoon += 1;
    } else if (hour >= 17 && hour < 21) {
      counts.evening += 1;
    } else {
      counts.night += 1;
    }
  });

  const total = breaks.length;
  const result: TimePatternData[] = [];

  (Object.keys(timePeriods) as Array<keyof typeof timePeriods>).forEach((key) => {
    const period = timePeriods[key];
    result.push({
      period: key,
      label: period.label,
      count: counts[key],
      percentage: Math.round((counts[key] / total) * 100),
      timeRange: period.timeRange,
      color: period.color,
      icon: period.icon,
    });
  });

  // Sort by count descending
  result.sort((a, b) => b.count - a.count);

  return result;
}

// Get best break time (most productive period)
export async function getBestBreakTime(): Promise<{
  period: string;
  percentage: number;
  icon: string;
} | null> {
  const patterns = await getTimePatterns('all');
  if (patterns.length === 0) return null;

  const best = patterns[0];
  return {
    period: best.label,
    percentage: best.percentage,
    icon: best.icon,
  };
}
