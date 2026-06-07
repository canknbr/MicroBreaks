import type { CompletedBreak } from '@/services/storage';
import type { UserProfile, UserProgress } from '@/store/userStore';
import { buildWidgetSnapshot } from '@/services/widgets/snapshot';
import { WIDGET_SNAPSHOT_SCHEMA_VERSION } from '@/services/widgets/types';

const FIXED_NOW = new Date('2026-06-07T14:30:00Z').getTime();

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    name: 'Ada',
    avatar: null,
    email: null,
    emailVerified: false,
    joinedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  return {
    level: 4,
    totalXP: 1200,
    totalBreaks: 90,
    currentStreak: 7,
    longestStreak: 12,
    weeklyGoal: 21,
    dailyGoal: 3,
    ...overrides,
  };
}

function makeBreak(overrides: Partial<CompletedBreak> = {}): CompletedBreak {
  return {
    id: 'b1',
    breakId: 'eye-rest',
    title: 'Eye Rest',
    category: 'quick',
    icon: '👁️',
    color: '#00E5FF',
    duration: 120,
    stepsCompleted: 3,
    totalSteps: 3,
    xpEarned: 10,
    rating: null,
    completedAt: new Date(FIXED_NOW).toISOString(),
    ...overrides,
  };
}

describe('buildWidgetSnapshot', () => {
  it('reports zero progress when the user has no breaks at all', () => {
    const snap = buildWidgetSnapshot({
      profile: makeProfile(),
      progress: makeProgress({ currentStreak: 0, longestStreak: 0 }),
      history: [],
      now: FIXED_NOW,
    });

    expect(snap.schemaVersion).toBe(WIDGET_SNAPSHOT_SCHEMA_VERSION);
    expect(snap.today.breaksTaken).toBe(0);
    expect(snap.today.progressPct).toBe(0);
    expect(snap.today.totalMinutes).toBe(0);
    expect(snap.lastBreak).toBeNull();
    expect(snap.streak.atRisk).toBe(false);
  });

  it('counts only today-local breaks toward today.breaksTaken', () => {
    const yesterday = new Date(FIXED_NOW - 24 * 60 * 60 * 1000).toISOString();
    const tomorrow = new Date(FIXED_NOW + 24 * 60 * 60 * 1000).toISOString();

    const snap = buildWidgetSnapshot({
      profile: makeProfile(),
      progress: makeProgress(),
      history: [
        makeBreak({ id: 'a', completedAt: yesterday }),
        makeBreak({ id: 'b' /* today */ }),
        makeBreak({ id: 'c', completedAt: tomorrow }),
      ],
      now: FIXED_NOW,
    });

    expect(snap.today.breaksTaken).toBe(1);
  });

  it('flags streakAtRisk when the user has a streak but no break today', () => {
    const earlier = new Date(FIXED_NOW - 36 * 60 * 60 * 1000).toISOString();

    const snap = buildWidgetSnapshot({
      profile: makeProfile(),
      progress: makeProgress({ currentStreak: 5 }),
      history: [makeBreak({ completedAt: earlier })],
      now: FIXED_NOW,
    });

    expect(snap.today.breaksTaken).toBe(0);
    expect(snap.streak.atRisk).toBe(true);
  });

  it('clears streakAtRisk when at least one break has been taken today', () => {
    const snap = buildWidgetSnapshot({
      profile: makeProfile(),
      progress: makeProgress({ currentStreak: 5 }),
      history: [makeBreak()],
      now: FIXED_NOW,
    });

    expect(snap.streak.atRisk).toBe(false);
  });

  it('exposes the most recent break in `lastBreak` regardless of array order', () => {
    const oldIso = new Date(FIXED_NOW - 5 * 60 * 60 * 1000).toISOString();
    const newIso = new Date(FIXED_NOW - 30 * 60 * 1000).toISOString();

    const snap = buildWidgetSnapshot({
      profile: makeProfile(),
      progress: makeProgress(),
      history: [
        makeBreak({ id: 'old', completedAt: oldIso, title: 'Stretch' }),
        makeBreak({ id: 'new', completedAt: newIso, title: 'Focus' }),
      ],
      now: FIXED_NOW,
    });

    expect(snap.lastBreak?.title).toBe('Focus');
    expect(snap.lastBreak?.completedAt).toBe(new Date(newIso).getTime());
  });

  it('clamps progress percentage to 100 even when the user overshoots the daily goal', () => {
    const snap = buildWidgetSnapshot({
      profile: makeProfile(),
      progress: makeProgress({ dailyGoal: 1 }),
      history: [makeBreak({ id: 'a' }), makeBreak({ id: 'b' }), makeBreak({ id: 'c' })],
      now: FIXED_NOW,
    });

    expect(snap.today.breaksTaken).toBe(3);
    expect(snap.today.progressPct).toBe(100);
  });

  it('falls back to "Friend" when the profile has no name', () => {
    const snap = buildWidgetSnapshot({
      profile: makeProfile({ name: '   ' }),
      progress: makeProgress(),
      history: [],
      now: FIXED_NOW,
    });

    expect(snap.user.name).toBe('Friend');
  });

  it('serialises the recommendation with a deep link the widget can launch', () => {
    const snap = buildWidgetSnapshot({
      profile: makeProfile(),
      progress: makeProgress(),
      history: [],
      recommendation: {
        breakId: 'neck-reset',
        title: 'Neck Reset',
        icon: '🧘',
        color: '#FF9F1C',
        durationMin: 3,
      },
      now: FIXED_NOW,
    });

    expect(snap.nextRecommended).toEqual({
      breakId: 'neck-reset',
      title: 'Neck Reset',
      icon: '🧘',
      color: '#FF9F1C',
      durationMin: 3,
      deepLink: 'microbreaks://break/neck-reset',
    });
  });

  it('ignores breaks with malformed timestamps without throwing', () => {
    const snap = buildWidgetSnapshot({
      profile: makeProfile(),
      progress: makeProgress(),
      history: [
        makeBreak({ id: 'bad', completedAt: 'not-a-date' }),
        makeBreak({ id: 'good' }),
      ],
      now: FIXED_NOW,
    });

    expect(snap.today.breaksTaken).toBe(1);
    expect(snap.lastBreak?.title).toBe('Eye Rest');
  });
});
