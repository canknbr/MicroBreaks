/**
 * Weekly Recovery Story
 *
 * Pure composer that turns the last 7 days of break history into a
 * structured "story" the recovery-story screen can render without
 * any business logic of its own. The screen is presentation; this
 * module decides what's worth saying.
 *
 * Sections (all optional — section is omitted when there's no
 * meaningful signal):
 *
 *   - `totals` — breaks taken, minutes invested, XP earned
 *   - `streakCallout` — current streak number + risk/save status
 *   - `categoryMix` — top 3 break categories by count
 *   - `bestTime` — hour-of-day bucket where the user broke most
 *   - `dailyRhythm` — 7-day mini histogram for the chart
 *   - `headline` — single sentence summarising the week
 */

import type { CompletedBreak, StreakData, UserStats } from '@/services/storage';

export interface WeeklyTotals {
  breaks: number;
  minutes: number;
  xp: number;
  /** Day count where at least one break was logged. */
  activeDays: number;
}

export interface CategorySlice {
  category: string;
  count: number;
  /** 0–1 share of weekly breaks. */
  share: number;
}

export interface TimeBucket {
  /** 'morning' | 'midday' | 'afternoon' | 'evening' | 'late'. */
  bucket: 'morning' | 'midday' | 'afternoon' | 'evening' | 'late';
  /** Hour range start (24h) for the label. */
  hourStart: number;
  count: number;
}

export interface DailyBar {
  /** 0-indexed day of the week the bar represents (0 = Mon). */
  dayIndex: number;
  /** 'YYYY-MM-DD'. */
  date: string;
  breaks: number;
  minutes: number;
}

export interface StreakCallout {
  current: number;
  longest: number;
  /** True iff the user has a streak but hasn't broken today. */
  atRisk: boolean;
  /** True if the streak grew during the past 7 days. */
  grew: boolean;
}

export interface WeeklyStory {
  /** Local date range (inclusive both ends, YYYY-MM-DD). */
  range: { start: string; end: string };
  totals: WeeklyTotals;
  streakCallout: StreakCallout;
  categoryMix: CategorySlice[];
  bestTime: TimeBucket | null;
  dailyRhythm: DailyBar[];
  /** A single sentence summarising what stood out this week. */
  headline: string;
}

// ============================================================
// Helpers
// ============================================================

function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toBucket(hour: number): TimeBucket['bucket'] {
  if (hour < 6) return 'late';
  if (hour < 12) return 'morning';
  if (hour < 15) return 'midday';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'late';
}

function bucketHourStart(b: TimeBucket['bucket']): number {
  switch (b) {
    case 'late':      return 22;
    case 'morning':   return 6;
    case 'midday':    return 12;
    case 'afternoon': return 15;
    case 'evening':   return 18;
  }
}

// ============================================================
// Composer
// ============================================================

export interface ComposeInput {
  /** `Date.now()` injection point so the screen and tests agree on "today". */
  now: Date;
  /** Persisted history; we filter to the last 7 days ourselves. */
  history: CompletedBreak[];
  streak: StreakData;
  userStats: UserStats;
}

export function composeWeeklyStory(input: ComposeInput): WeeklyStory {
  const todayStr = localDateString(input.now);
  const startDate = new Date(input.now);
  startDate.setDate(startDate.getDate() - 6);
  const startStr = localDateString(startDate);

  // Filter to the last 7 days by local date string for robustness
  // against DST shifts.
  const inRange = input.history.filter((b) => {
    const dStr = localDateString(new Date(b.completedAt));
    return dStr >= startStr && dStr <= todayStr;
  });

  // Totals
  const totals: WeeklyTotals = {
    breaks: inRange.length,
    minutes: Math.round(inRange.reduce((s, b) => s + (b.duration ?? 0), 0) / 60),
    xp: inRange.reduce((s, b) => s + (b.xpEarned ?? 0), 0),
    activeDays: new Set(
      inRange.map((b) => localDateString(new Date(b.completedAt)))
    ).size,
  };

  // Streak callout
  const brokeToday = inRange.some(
    (b) => localDateString(new Date(b.completedAt)) === todayStr
  );
  // "Grew" means the streak counter is higher today than it was at the
  // start of this 7-day window. We use streakHistory if available; if
  // we don't have a snapshot from before the window, we fall back to
  // treating the current streak as a clean growth signal only when the
  // user actually broke on multiple distinct days this week (the prior
  // heuristic, kept as a conservative floor).
  const historyBeforeWindow = input.streak.streakHistory.filter(
    (e) => e.date < startStr,
  );
  const streakAtWindowStart =
    historyBeforeWindow.length > 0
      ? historyBeforeWindow[historyBeforeWindow.length - 1]!.count
      : null;
  const grew =
    streakAtWindowStart !== null
      ? input.streak.currentStreak > streakAtWindowStart
      : input.streak.currentStreak > 0 && totals.activeDays > 1;
  const streakCallout: StreakCallout = {
    current: input.streak.currentStreak,
    longest: input.streak.longestStreak,
    atRisk: input.streak.currentStreak > 0 && !brokeToday,
    grew,
  };

  // Category mix
  const counts: Record<string, number> = {};
  for (const b of inRange) {
    const key = b.category || 'other';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const categoryMix: CategorySlice[] = Object.entries(counts)
    .map(([category, count]) => ({
      category,
      count,
      share: totals.breaks > 0 ? count / totals.breaks : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Best time bucket
  const bucketCounts: Record<TimeBucket['bucket'], number> = {
    morning: 0,
    midday: 0,
    afternoon: 0,
    evening: 0,
    late: 0,
  };
  for (const b of inRange) {
    bucketCounts[toBucket(new Date(b.completedAt).getHours())] += 1;
  }
  let bestTime: TimeBucket | null = null;
  for (const [k, v] of Object.entries(bucketCounts) as [
    TimeBucket['bucket'],
    number,
  ][]) {
    if (v > 0 && (!bestTime || v > bestTime.count)) {
      bestTime = {
        bucket: k,
        hourStart: bucketHourStart(k),
        count: v,
      };
    }
  }

  // Daily rhythm — 7 bars, Mon-first or chronological? Use
  // chronological (oldest → today) so it lines up with how people
  // read.
  const dailyRhythm: DailyBar[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dStr = localDateString(d);
    const dayBreaks = inRange.filter(
      (b) => localDateString(new Date(b.completedAt)) === dStr
    );
    dailyRhythm.push({
      dayIndex: i,
      date: dStr,
      breaks: dayBreaks.length,
      minutes: Math.round(
        dayBreaks.reduce((s, b) => s + (b.duration ?? 0), 0) / 60
      ),
    });
  }

  // Headline. Priority order: zero week → encouragement; streak
  // milestone → celebrate; category dominance → name it; otherwise
  // a quiet summary of totals.
  const headline = composeHeadline({
    totals,
    streakCallout,
    categoryMix,
  });

  return {
    range: { start: startStr, end: todayStr },
    totals,
    streakCallout,
    categoryMix,
    bestTime,
    dailyRhythm,
    headline,
  };
}

function composeHeadline(args: {
  totals: WeeklyTotals;
  streakCallout: StreakCallout;
  categoryMix: CategorySlice[];
}): string {
  const { totals, streakCallout, categoryMix } = args;

  if (totals.breaks === 0) {
    return 'A quiet week. Start with one short reset to break the silence.';
  }

  if (streakCallout.current >= 7) {
    return `${streakCallout.current} days strong — your habit is holding.`;
  }

  if (categoryMix.length > 0 && categoryMix[0].share >= 0.5) {
    const top = categoryMix[0];
    return `${totals.breaks} breaks this week, mostly ${top.category}.`;
  }

  if (totals.activeDays >= 5) {
    return `${totals.activeDays} active days this week — that's the shape of a habit.`;
  }

  return `${totals.breaks} breaks across ${totals.activeDays} day${
    totals.activeDays === 1 ? '' : 's'
  }.`;
}
