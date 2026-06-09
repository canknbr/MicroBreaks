import {
  buildBuddySnapshot,
  describeBuddyState,
  sortBuddiesForDisplay,
  type BuddyWithSnapshot,
} from '@/services/buddies/snapshot';
import type {
  Buddy,
  BuddyStreakSnapshot,
} from '@/services/buddies/types';
import type { CompletedBreak, StreakData } from '@/services/storage';

const NOW = new Date('2026-06-09T15:30:00');

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
    xpEarned: 5,
    rating: null,
    completedAt: '2026-06-09T10:00:00',
    ...overrides,
  };
}

function streak(overrides: Partial<StreakData> = {}): StreakData {
  return {
    currentStreak: 5,
    longestStreak: 10,
    lastBreakDate: '2026-06-09',
    streakHistory: [],
    ...overrides,
  };
}

describe('buildBuddySnapshot', () => {
  it('reports brokeToday=false with null lastBreakHour when no breaks today', () => {
    const snap = buildBuddySnapshot({
      now: NOW,
      history: [brk({ completedAt: '2026-06-08T10:00:00' })], // yesterday
      streak: streak({ currentStreak: 3 }),
    });
    expect(snap.brokeToday).toBe(false);
    expect(snap.lastBreakHour).toBeNull();
    expect(snap.currentStreak).toBe(3);
  });

  it('reports brokeToday=true with the hour of the most recent break', () => {
    const snap = buildBuddySnapshot({
      now: NOW,
      history: [
        brk({ completedAt: '2026-06-09T08:30:00' }),
        brk({ completedAt: '2026-06-09T14:15:00' }), // latest today
        brk({ completedAt: '2026-06-09T11:45:00' }),
      ],
      streak: streak(),
    });
    expect(snap.brokeToday).toBe(true);
    expect(snap.lastBreakHour).toBe(14);
  });

  it('rounds to the hour — never exposes minutes', () => {
    const snap = buildBuddySnapshot({
      now: NOW,
      history: [brk({ completedAt: '2026-06-09T14:59:00' })],
      streak: streak(),
    });
    expect(snap.lastBreakHour).toBe(14);
    // Sanity: the snapshot type itself doesn't carry a minute field
    expect(Object.keys(snap)).not.toContain('lastBreakMinute');
  });

  it('uses the local-date string for `date` (not the UTC ISO date)', () => {
    const snap = buildBuddySnapshot({
      now: NOW,
      history: [],
      streak: streak(),
    });
    expect(snap.date).toBe('2026-06-09');
  });

  it('publishes currentStreak but never longestStreak', () => {
    const snap = buildBuddySnapshot({
      now: NOW,
      history: [],
      streak: streak({ currentStreak: 4, longestStreak: 999 }),
    });
    expect(snap.currentStreak).toBe(4);
    // Defensive: no field surfaces longestStreak
    expect(Object.values(snap)).not.toContain(999);
  });

  it('skips malformed completedAt timestamps when picking lastBreakHour', () => {
    const snap = buildBuddySnapshot({
      now: NOW,
      history: [
        brk({ completedAt: 'not-a-date' }),
        brk({ completedAt: '2026-06-09T09:00:00' }),
      ],
      streak: streak(),
    });
    expect(snap.brokeToday).toBe(true);
    expect(snap.lastBreakHour).toBe(9);
  });
});

describe('sortBuddiesForDisplay', () => {
  function buddy(id: string, name: string): Buddy {
    return {
      id,
      displayName: name,
      avatar: null,
      acceptedAt: '2026-01-01T00:00:00Z',
    };
  }
  function snap(brokeToday: boolean, currentStreak = 0): BuddyStreakSnapshot {
    return {
      date: '2026-06-09',
      currentStreak,
      brokeToday,
      lastBreakHour: brokeToday ? 10 : null,
      updatedAt: '2026-06-09T10:00:00Z',
    };
  }

  it('places active buddies first, then hasnt-broken, then no-snapshot', () => {
    const entries: BuddyWithSnapshot[] = [
      { buddy: buddy('c', 'C'), snapshot: null },
      { buddy: buddy('b', 'B'), snapshot: snap(false, 4) },
      { buddy: buddy('a', 'A'), snapshot: snap(true, 2) },
    ];
    const sorted = sortBuddiesForDisplay(entries);
    expect(sorted.map((e) => e.buddy.id)).toEqual(['a', 'b', 'c']);
  });

  it('breaks ties by current streak (descending)', () => {
    const entries: BuddyWithSnapshot[] = [
      { buddy: buddy('a', 'A'), snapshot: snap(true, 3) },
      { buddy: buddy('b', 'B'), snapshot: snap(true, 7) },
      { buddy: buddy('c', 'C'), snapshot: snap(true, 1) },
    ];
    const sorted = sortBuddiesForDisplay(entries);
    expect(sorted.map((e) => e.buddy.id)).toEqual(['b', 'a', 'c']);
  });

  it('handles an empty list', () => {
    expect(sortBuddiesForDisplay([])).toEqual([]);
  });
});

describe('describeBuddyState', () => {
  function snap(over: Partial<BuddyStreakSnapshot> = {}): BuddyStreakSnapshot {
    return {
      date: '2026-06-09',
      currentStreak: 5,
      brokeToday: false,
      lastBreakHour: null,
      updatedAt: '2026-06-09T10:00:00Z',
      ...over,
    };
  }

  it('says "Just joined" for a buddy with no snapshot yet', () => {
    expect(describeBuddyState(null)).toBe('Just joined');
  });

  it('describes a morning break with am suffix', () => {
    expect(
      describeBuddyState(snap({ brokeToday: true, lastBreakHour: 9 }))
    ).toBe('Broke around 9am');
  });

  it('describes an afternoon break with pm suffix', () => {
    expect(
      describeBuddyState(snap({ brokeToday: true, lastBreakHour: 14 }))
    ).toBe('Broke around 2pm');
  });

  it('handles 12am midnight + 12pm noon explicitly', () => {
    expect(
      describeBuddyState(snap({ brokeToday: true, lastBreakHour: 0 }))
    ).toBe('Broke around 12am');
    expect(
      describeBuddyState(snap({ brokeToday: true, lastBreakHour: 12 }))
    ).toBe('Broke around 12pm');
  });

  it('says brokeToday without the hour when it is unknown', () => {
    expect(
      describeBuddyState(snap({ brokeToday: true, lastBreakHour: null }))
    ).toBe('Broke today');
  });

  it('describes a streak-but-no-break-today state', () => {
    expect(
      describeBuddyState(snap({ brokeToday: false, currentStreak: 5 }))
    ).toBe("5-day streak — hasn't broken today");
  });

  it('uses "No streak yet" for a zero-streak buddy who didnt break', () => {
    expect(
      describeBuddyState(snap({ brokeToday: false, currentStreak: 0 }))
    ).toBe('No streak yet');
  });
});
