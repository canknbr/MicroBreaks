/**
 * Break History Service
 * Manages completed breaks, statistics, and streaks
 */

import { generateId } from '@/utils/generateId';
import {
  STORAGE_KEYS,
  getItemWithError,
  setItem,
  setItemWithError,
  CompletedBreak,
  StreakData,
  UserStats,
  DEFAULT_STREAK_DATA,
  StorageError,
  getStoredUserStats,
  updateStoredUserStats,
} from './storage';
import {
  MAX_BREAK_HISTORY,
  MAX_STREAK_HISTORY_DAYS,
  MAX_GRACES_PER_WEEK,
} from '@/constants/config';
import { calculateDailyGoal, validateBreakDuration, validateXP } from '@/utils/validation';
import { syncService } from '@/services/sync';
import { useUserStore } from '@/store/userStore';
import { toMindfulSample } from '@/services/health/mindfulMinutes';
import { writeMindfulSession } from '@/services/health/healthKitSource';
import { useMissionsStore } from '@/store/missionsStore';
import type { Mission } from '@/services/missions/types';

// Result type for save operations
export interface SaveBreakResult {
  success: boolean;
  breakId?: string;
  error?: StorageError;
  /**
   * Missions that newly completed as a result of this save. Lets the
   * caller render "+XP — mission complete!" feedback without re-
   * reading the missions store afterwards.
   */
  completedMissions?: Mission[];
}

/**
 * Get local date string in YYYY-MM-DD format
 * This ensures consistent date handling regardless of timezone
 */
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Whole-calendar-day distance between two YYYY-MM-DD strings.
 * Uses UTC midnight of the parsed Y/M/D so DST shifts (23h/25h days)
 * do not collapse "yesterday" into "today" or drop a streak.
 */
function calendarDayDiff(laterStr: string, earlierStr: string): number {
  const [ly, lm, ld] = laterStr.split('-').map(Number);
  const [ey, em, ed] = earlierStr.split('-').map(Number);
  if (
    !Number.isFinite(ly) || !Number.isFinite(lm) || !Number.isFinite(ld) ||
    !Number.isFinite(ey) || !Number.isFinite(em) || !Number.isFinite(ed)
  ) {
    return Number.NaN;
  }
  const laterUTC = Date.UTC(ly, lm - 1, ld);
  const earlierUTC = Date.UTC(ey, em - 1, ed);
  return Math.round((laterUTC - earlierUTC) / 86_400_000);
}

function createDefaultStreakData(): StreakData {
  return {
    ...DEFAULT_STREAK_DATA,
    streakHistory: [],
  };
}

/**
 * Return the Monday of the ISO week containing `date` as a local
 * YYYY-MM-DD string. Used to anchor the grace-day reset boundary.
 * JS getDay(): Sunday=0, Monday=1, … Saturday=6. We shift back so
 * Sunday rolls into the previous Monday rather than the next.
 */
function getWeekStartDateString(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const shift = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + shift);
  return getLocalDateString(d);
}

function syncUserProgressProjection(stats: UserStats, streakData: StreakData): void {
  useUserStore.setState((state) => ({
    progress: {
      ...state.progress,
      level: stats.level,
      totalXP: stats.totalXP,
      totalBreaks: stats.totalBreaks,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      weeklyGoal: stats.weeklyGoal,
      dailyGoal: calculateDailyGoal(stats.weeklyGoal),
    },
  }));
}

// Get all completed breaks
export async function getBreakHistory(): Promise<CompletedBreak[]> {
  const result = await getItemWithError<CompletedBreak[]>(STORAGE_KEYS.BREAK_HISTORY);
  if (result.error) {
    await setItem(STORAGE_KEYS.BREAK_HISTORY, []);
    return [];
  }

  return result.data || [];
}

export function getBreaksByDateRangeFromHistory(
  history: CompletedBreak[],
  startDate: Date,
  endDate: Date
): CompletedBreak[] {
  return history.filter((b) => {
    const breakDate = new Date(b.completedAt);
    return breakDate >= startDate && breakDate <= endDate;
  });
}

// Get breaks within a date range
export async function getBreaksByDateRange(
  startDate: Date,
  endDate: Date
): Promise<CompletedBreak[]> {
  const history = await getBreakHistory();
  return getBreaksByDateRangeFromHistory(history, startDate, endDate);
}

export function getTodayBreaksFromHistory(history: CompletedBreak[]): CompletedBreak[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getBreaksByDateRangeFromHistory(history, today, tomorrow);
}

// Get breaks for today
export async function getTodayBreaks(): Promise<CompletedBreak[]> {
  const history = await getBreakHistory();
  return getTodayBreaksFromHistory(history);
}

export function getWeekBreaksFromHistory(history: CompletedBreak[]): CompletedBreak[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  return getBreaksByDateRangeFromHistory(history, monday, sunday);
}

// Get breaks for current week (Monday to Sunday)
export async function getWeekBreaks(): Promise<CompletedBreak[]> {
  const history = await getBreakHistory();
  return getWeekBreaksFromHistory(history);
}

export function getMonthBreaksFromHistory(history: CompletedBreak[]): CompletedBreak[] {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  return getBreaksByDateRangeFromHistory(history, firstDay, lastDay);
}

export function getYearBreaksFromHistory(history: CompletedBreak[]): CompletedBreak[] {
  const today = new Date();
  const firstMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  firstMonth.setHours(0, 0, 0, 0);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  nextMonth.setHours(0, 0, 0, 0);

  return getBreaksByDateRangeFromHistory(history, firstMonth, nextMonth);
}

// Get breaks for current month
export async function getMonthBreaks(): Promise<CompletedBreak[]> {
  const history = await getBreakHistory();
  return getMonthBreaksFromHistory(history);
}

// Serialize writes so concurrent completions cannot interleave history/stat updates.
let saveQueue: Promise<unknown> = Promise.resolve();

// Save a completed break
export async function saveCompletedBreak(breakData: Omit<CompletedBreak, 'id'>): Promise<SaveBreakResult> {
  const runSave = saveQueue.then<SaveBreakResult>(async () => {
    try {
      const history = await getBreakHistory();

      // Idempotency: if a save with the same (breakId, completedAt) tuple
      // already exists at the top of history, treat the second call as a
      // success without writing again. Defense in depth against double-
      // submit from the break-session screen — the in-component savedRef
      // guard already covers the common case, but a stale closure or a
      // future caller without that guard would otherwise duplicate.
      const dupe = history.slice(0, 5).find(
        (b) =>
          b.breakId === breakData.breakId &&
          b.completedAt === breakData.completedAt
      );
      if (dupe) {
        return { success: true, breakId: dupe.id };
      }

      // Validate and sanitize input data
      const validatedDuration = validateBreakDuration(breakData.duration);
      const validatedXP = validateXP(breakData.xpEarned);

      const breakId = generateId('break');
      const newBreak: CompletedBreak = {
        ...breakData,
        id: breakId,
        duration: validatedDuration.value,
        xpEarned: validatedXP,
        stepsCompleted: Math.max(0, Math.round(breakData.stepsCompleted)),
        totalSteps: Math.max(1, Math.round(breakData.totalSteps)),
        reliefScore: breakData.reliefScore ?? null,
        updatedAt: breakData.updatedAt ?? breakData.completedAt,
      };

      history.unshift(newBreak); // Add to beginning

      // Keep only last N breaks to manage storage
      if (history.length > MAX_BREAK_HISTORY) {
        history.length = MAX_BREAK_HISTORY;
      }

      const saveError = await setItemWithError(STORAGE_KEYS.BREAK_HISTORY, history);
      if (saveError) {
        return { success: false, error: saveError };
      }

      // Update streak
      const streakData = await updateStreak();

      // Update user stats
      const userStats = await updateUserStats(newBreak);

      // Evaluate daily missions against today's break history. Bonus
      // XP from missions that just completed is credited on top of
      // the break's own xpEarned. Done before the projection so the
      // UI sees the combined total in one paint.
      let missionXP = 0;
      let completedMissions: Mission[] = [];
      try {
        const todayBreaks = getTodayBreaksFromHistory(history);
        completedMissions = useMissionsStore
          .getState()
          .recordBreak(newBreak, todayBreaks);
        missionXP = completedMissions.reduce((sum, m) => sum + m.bonusXP, 0);
        if (missionXP > 0) {
          userStats.totalXP += missionXP;
          userStats.level = Math.floor(userStats.totalXP / 100) + 1;
          await updateStoredUserStats(userStats);
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('[breakHistory] missions evaluation failed', err);
        }
      }

      syncUserProgressProjection(userStats, streakData);

      // Sync new break to cloud
      syncService.queueDataChange('break', newBreak);

      // Mirror mindful breaks into Apple Health as a courtesy. Fire
      // and forget — HealthKit availability and permission are both
      // optional, and a failed write must never affect the save flow
      // that the user actually triggered.
      const sample = toMindfulSample(newBreak);
      if (sample) {
        void writeMindfulSession(sample).catch(() => {
          // The adapter already swallows + logs; this catch is
          // defense in depth in case it ever stops doing so.
        });
      }

      return { success: true, breakId, completedMissions };
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving break:', error);
      }
      return { success: false };
    }
  });

  saveQueue = runSave.then(
    () => undefined,
    () => undefined
  );

  return runSave;
}

// Update the rating on an existing break
export async function updateBreakRating(
  breakId: string,
  rating: CompletedBreak['rating'],
  reliefScore?: CompletedBreak['reliefScore']
): Promise<void> {
  const history = await getBreakHistory();
  const breakEntry = history.find((b) => b.id === breakId);
  if (!breakEntry) return;
  const nextReliefScore = reliefScore ?? breakEntry.reliefScore ?? null;
  if (breakEntry.rating === rating && (breakEntry.reliefScore ?? null) === nextReliefScore) return;

  breakEntry.rating = rating;
  breakEntry.reliefScore = nextReliefScore;
  breakEntry.updatedAt = new Date().toISOString();

  const saved = await setItem(STORAGE_KEYS.BREAK_HISTORY, history);
  if (saved) {
    syncService.queueDataChange('break', breakEntry);
  }
}

// Get streak data
export async function getStreakData(): Promise<StreakData> {
  const result = await getItemWithError<StreakData>(STORAGE_KEYS.STREAK_DATA);
  if (result.error) {
    const fallback = createDefaultStreakData();
    await setItem(STORAGE_KEYS.STREAK_DATA, fallback);
    return fallback;
  }

  return result.data || createDefaultStreakData();
}

// Update streak based on break history
async function updateStreak(): Promise<StreakData> {
  const streakData = await getStreakData();
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const currentWeekStart = getWeekStartDateString(today);

  // Roll the grace counter over at each ISO week boundary so a user
  // who burned a grace last week starts the new week fresh. We do
  // this before the diff check so a grace earned by the rollover is
  // immediately spendable.
  if (streakData.weekStartDate !== currentWeekStart) {
    streakData.gracesUsedThisWeek = 0;
    streakData.weekStartDate = currentWeekStart;
  }

  const lastBreakDate = streakData.lastBreakDate;

  if (!lastBreakDate) {
    // First break ever
    streakData.currentStreak = 1;
    streakData.longestStreak = 1;
    streakData.lastBreakDate = todayStr;
  } else {
    const diffDays = calendarDayDiff(todayStr, lastBreakDate);
    const gracesUsed = streakData.gracesUsedThisWeek ?? 0;

    if (diffDays === 0) {
      // Same day, streak unchanged
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      streakData.currentStreak += 1;
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
      }
    } else if (diffDays === 2 && gracesUsed < MAX_GRACES_PER_WEEK) {
      // One missed day — spend a grace to keep the streak alive.
      // We treat the missed day as if the user had broken on it,
      // so the streak still grows by exactly one.
      streakData.gracesUsedThisWeek = gracesUsed + 1;
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
    // Keep only last N days
    if (streakData.streakHistory.length > MAX_STREAK_HISTORY_DAYS) {
      streakData.streakHistory.length = MAX_STREAK_HISTORY_DAYS;
    }
  }

  await setItem(STORAGE_KEYS.STREAK_DATA, streakData);
  return streakData;
}

// Get user stats
export async function getUserStats(): Promise<UserStats> {
  return getStoredUserStats();
}

// Update user stats after completing a break
async function updateUserStats(breakData: CompletedBreak): Promise<UserStats> {
  const stats = await getUserStats();

  stats.totalBreaks += 1;
  stats.totalMinutes += Math.round(breakData.duration / 60);
  stats.totalXP += breakData.xpEarned;

  // Level calculation: level up every 100 XP
  stats.level = Math.floor(stats.totalXP / 100) + 1;

  // Update weekly progress
  const weekBreaks = await getWeekBreaks();
  stats.weeklyProgress = weekBreaks.length;

  return updateStoredUserStats(stats);
}

// Get weekly data for chart (last 7 days)
export async function getWeeklyChartData(): Promise<{ day: string; count: number; minutes: number }[]> {
  const history = await getBreakHistory();
  return getWeeklyChartDataFromHistory(history);
}

export function getWeeklyChartDataFromHistory(
  history: CompletedBreak[]
): { day: string; count: number; minutes: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Get start of week (Monday)
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  const weekBreaks = getBreaksByDateRangeFromHistory(history, monday, sunday);

  const result: { day: string; count: number; minutes: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const dayBreaks = weekBreaks.filter((b) => {
      const breakDate = new Date(b.completedAt);
      return breakDate >= dayStart && breakDate < dayEnd;
    });
    const totalMinutes = dayBreaks.reduce((sum, b) => sum + Math.round(b.duration / 60), 0);

    result.push({
      day: days[i],
      count: dayBreaks.length,
      minutes: totalMinutes,
    });
  }

  return result;
}

// Get monthly data for chart (last 30 days)
export async function getMonthlyChartData(): Promise<{ date: string; count: number; minutes: number }[]> {
  const history = await getBreakHistory();
  return getMonthlyChartDataFromHistory(history);
}

export function getMonthlyChartDataFromHistory(
  history: CompletedBreak[]
): { date: string; count: number; minutes: number }[] {
  const today = new Date();

  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - 29);
  rangeStart.setHours(0, 0, 0, 0);

  const rangeEnd = new Date(today);
  rangeEnd.setDate(today.getDate() + 1);
  rangeEnd.setHours(0, 0, 0, 0);

  const monthBreaks = getBreaksByDateRangeFromHistory(history, rangeStart, rangeEnd);

  const result: { date: string; count: number; minutes: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const dayBreaks = monthBreaks.filter((b) => {
      const breakDate = new Date(b.completedAt);
      return breakDate >= dayStart && breakDate < dayEnd;
    });
    const totalMinutes = dayBreaks.reduce((sum, b) => sum + Math.round(b.duration / 60), 0);

    result.push({
      date: `${dayStart.getMonth() + 1}/${dayStart.getDate()}`,
      count: dayBreaks.length,
      minutes: totalMinutes,
    });
  }

  return result;
}

export async function getYearlyChartData(): Promise<{ month: string; count: number; minutes: number }[]> {
  const history = await getBreakHistory();
  return getYearlyChartDataFromHistory(history);
}

export function getYearlyChartDataFromHistory(
  history: CompletedBreak[]
): { month: string; count: number; minutes: number }[] {
  const today = new Date();
  const yearBreaks = getYearBreaksFromHistory(history);
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const result: { month: string; count: number; minutes: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    monthEnd.setHours(0, 0, 0, 0);

    const monthBreaks = yearBreaks.filter((b) => {
      const breakDate = new Date(b.completedAt);
      return breakDate >= monthStart && breakDate < monthEnd;
    });

    result.push({
      month: formatter.format(monthStart),
      count: monthBreaks.length,
      minutes: monthBreaks.reduce((sum, b) => sum + Math.round(b.duration / 60), 0),
    });
  }

  return result;
}

export function getBreakTypeDistributionFromBreaks(
  breaks: CompletedBreak[]
): { category: string; count: number; percentage: number; color: string }[] {
  if (breaks.length === 0) {
    return [];
  }

  const categoryMap = new Map<string, { count: number; color: string }>();

  breaks.forEach((b) => {
    const existing = categoryMap.get(b.category);
    if (existing) {
      existing.count += 1;
    } else {
      categoryMap.set(b.category, { count: 1, color: b.color });
    }
  });

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

  result.sort((a, b) => b.count - a.count);

  return result;
}

// Get break type distribution
export async function getBreakTypeDistribution(
  period: 'week' | 'month' | 'all'
): Promise<{ category: string; count: number; percentage: number; color: string }[]> {
  const history = await getBreakHistory();
  let breaks: CompletedBreak[];

  if (period === 'week') {
    breaks = getWeekBreaksFromHistory(history);
  } else if (period === 'month') {
    breaks = getMonthBreaksFromHistory(history);
  } else {
    breaks = history;
  }

  return getBreakTypeDistributionFromBreaks(breaks);
}

// Get recent breaks (last N)
export async function getRecentBreaks(limit: number = 10): Promise<CompletedBreak[]> {
  const history = await getBreakHistory();
  return getRecentBreaksFromHistory(history, limit);
}

export function getRecentBreaksFromHistory(
  history: CompletedBreak[],
  limit: number = 10
): CompletedBreak[] {
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

  // Parse the stored date string as local date (YYYY-MM-DD format).
  // Guard against schema drift / corrupted persistence: a malformed value
  // would otherwise produce a NaN Date and downstream hour math would lie.
  const parts = streakData.lastBreakDate.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return { isAtRisk: false, hoursUntilReset: 0 };
  }
  const lastBreak = new Date(year as number, (month as number) - 1, day as number);

  const now = new Date();

  // Calculate when the streak would reset (end of the day after lastBreak)
  const streakResetTime = new Date(lastBreak);
  streakResetTime.setDate(streakResetTime.getDate() + 2);
  streakResetTime.setHours(0, 0, 0, 0);

  const hoursRemaining = Math.max(0, (streakResetTime.getTime() - now.getTime()) / (1000 * 60 * 60));

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
  const history = await getBreakHistory();
  let breaks: CompletedBreak[];

  if (period === 'week') {
    breaks = getWeekBreaksFromHistory(history);
  } else if (period === 'month') {
    breaks = getMonthBreaksFromHistory(history);
  } else {
    breaks = history;
  }

  return getTimePatternsFromBreaks(breaks);
}

export function getTimePatternsFromBreaks(
  breaks: CompletedBreak[]
): TimePatternData[] {
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
