import { composeWeeklyStory } from '@/services/insights/weeklyStory';
import type { CompletedBreak, StreakData, UserStats } from '@/services/storage';

function brk(overrides: Partial<CompletedBreak> = {}): CompletedBreak {
  return {
    id: `b-${Math.random()}`,
    breakId: 'eye-rest',
    title: 'Eye Rest',
    category: 'quick',
    icon: '👁️',
    color: '#00E5FF',
    duration: 60,
    stepsCompleted: 1,
    totalSteps: 1,
    xpEarned: 10,
    rating: null,
    completedAt: '2026-06-09T10:00:00',
    ...overrides,
  };
}

function streak(overrides: Partial<StreakData> = {}): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastBreakDate: null,
    streakHistory: [],
    ...overrides,
  };
}

function stats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    totalBreaks: 0,
    totalMinutes: 0,
    totalXP: 0,
    level: 1,
    weeklyGoal: 20,
    weeklyProgress: 0,
    ...overrides,
  };
}

describe('composeWeeklyStory', () => {
  const NOW = new Date('2026-06-09T12:00:00');

  it('returns a 7-day inclusive range ending today', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [],
      streak: streak(),
      userStats: stats(),
    });
    expect(story.range.end).toBe('2026-06-09');
    expect(story.range.start).toBe('2026-06-03');
  });

  it('aggregates totals only from in-range breaks', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [
        brk({ completedAt: '2026-06-09T09:00:00', duration: 60, xpEarned: 5 }),
        brk({ completedAt: '2026-06-08T10:00:00', duration: 120, xpEarned: 10 }),
        // Out of range — yesterday's "yesterday" past the window
        brk({ completedAt: '2026-05-30T10:00:00', duration: 600, xpEarned: 50 }),
      ],
      streak: streak(),
      userStats: stats(),
    });
    expect(story.totals.breaks).toBe(2);
    expect(story.totals.minutes).toBe(3); // (60+120)/60 = 3
    expect(story.totals.xp).toBe(15);
    expect(story.totals.activeDays).toBe(2);
  });

  it('flags streak as at risk when user has streak but no break today', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [brk({ completedAt: '2026-06-08T10:00:00' })],
      streak: streak({ currentStreak: 5, longestStreak: 10, lastBreakDate: '2026-06-08' }),
      userStats: stats(),
    });
    expect(story.streakCallout.atRisk).toBe(true);
  });

  it('does not flag at-risk when user already broke today', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [brk({ completedAt: '2026-06-09T08:00:00' })],
      streak: streak({ currentStreak: 5, longestStreak: 10, lastBreakDate: '2026-06-09' }),
      userStats: stats(),
    });
    expect(story.streakCallout.atRisk).toBe(false);
  });

  it('returns the top 3 categories by count, sorted descending', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [
        brk({ category: 'mindful', completedAt: '2026-06-09T08:00:00' }),
        brk({ category: 'mindful', completedAt: '2026-06-08T08:00:00' }),
        brk({ category: 'mindful', completedAt: '2026-06-07T08:00:00' }),
        brk({ category: 'stretch', completedAt: '2026-06-09T09:00:00' }),
        brk({ category: 'stretch', completedAt: '2026-06-08T09:00:00' }),
        brk({ category: 'quick',   completedAt: '2026-06-09T10:00:00' }),
        brk({ category: 'active',  completedAt: '2026-06-09T11:00:00' }),
      ],
      streak: streak(),
      userStats: stats(),
    });
    expect(story.categoryMix).toHaveLength(3);
    expect(story.categoryMix[0]).toMatchObject({ category: 'mindful', count: 3 });
    expect(story.categoryMix[1]).toMatchObject({ category: 'stretch', count: 2 });
    // The 4th category ('active') drops out.
    expect(story.categoryMix.find((c) => c.category === 'active')).toBeUndefined();
  });

  it('picks the time bucket with the most breaks as bestTime', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [
        brk({ completedAt: '2026-06-09T13:00:00' }), // midday
        brk({ completedAt: '2026-06-08T14:00:00' }), // midday
        brk({ completedAt: '2026-06-07T10:00:00' }), // morning
      ],
      streak: streak(),
      userStats: stats(),
    });
    expect(story.bestTime?.bucket).toBe('midday');
    expect(story.bestTime?.count).toBe(2);
  });

  it('returns null bestTime when no breaks in range', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [],
      streak: streak(),
      userStats: stats(),
    });
    expect(story.bestTime).toBeNull();
  });

  it('builds a 7-element daily rhythm chronologically', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [
        brk({ completedAt: '2026-06-09T10:00:00', duration: 90 }),
        brk({ completedAt: '2026-06-09T11:00:00', duration: 90 }),
        brk({ completedAt: '2026-06-05T10:00:00', duration: 60 }),
      ],
      streak: streak(),
      userStats: stats(),
    });
    expect(story.dailyRhythm).toHaveLength(7);
    expect(story.dailyRhythm[0].date).toBe('2026-06-03');
    expect(story.dailyRhythm[6].date).toBe('2026-06-09');
    expect(story.dailyRhythm[6].breaks).toBe(2);
    expect(story.dailyRhythm[6].minutes).toBe(3);
    expect(story.dailyRhythm[2].breaks).toBe(1); // 2026-06-05 is index 2
  });

  it('uses the zero-week headline when no breaks happened', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [],
      streak: streak(),
      userStats: stats(),
    });
    expect(story.headline.toLowerCase()).toContain('quiet');
  });

  it('uses the streak-strong headline when current streak is ≥ 7', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [brk({ completedAt: '2026-06-09T08:00:00' })],
      streak: streak({ currentStreak: 10, longestStreak: 10, lastBreakDate: '2026-06-09' }),
      userStats: stats(),
    });
    expect(story.headline).toContain('10');
    expect(story.headline.toLowerCase()).toContain('strong');
  });

  it('calls out a dominant category when ≥ 50% share', () => {
    const story = composeWeeklyStory({
      now: NOW,
      history: [
        brk({ category: 'mindful', completedAt: '2026-06-09T08:00:00' }),
        brk({ category: 'mindful', completedAt: '2026-06-09T09:00:00' }),
        brk({ category: 'mindful', completedAt: '2026-06-09T10:00:00' }),
        brk({ category: 'stretch', completedAt: '2026-06-09T11:00:00' }),
      ],
      streak: streak({ currentStreak: 1, longestStreak: 1, lastBreakDate: '2026-06-09' }),
      userStats: stats(),
    });
    expect(story.headline.toLowerCase()).toContain('mindful');
  });
});
