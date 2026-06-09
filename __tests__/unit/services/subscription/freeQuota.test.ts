import {
  FREE_DAILY_BREAK_LIMIT,
  getFreeBreakUsage,
} from '@/services/subscription/freeQuota';
import type { CompletedBreak } from '@/services/storage';

const NOW = new Date('2026-06-09T12:00:00');

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

describe('getFreeBreakUsage', () => {
  it('returns zero usage for an empty history', () => {
    const u = getFreeBreakUsage([], { now: NOW });
    expect(u).toEqual({
      used: 0,
      limit: FREE_DAILY_BREAK_LIMIT,
      remaining: FREE_DAILY_BREAK_LIMIT,
      exhausted: false,
    });
  });

  it('counts only breaks that fall on the same local day', () => {
    const history = [
      brk({ completedAt: '2026-06-09T08:00:00' }),
      brk({ completedAt: '2026-06-09T09:00:00' }),
      // Yesterday — should not count
      brk({ completedAt: '2026-06-08T23:55:00' }),
      // Tomorrow (impossible but defensive)
      brk({ completedAt: '2026-06-10T00:05:00' }),
    ];
    const u = getFreeBreakUsage(history, { now: NOW });
    expect(u.used).toBe(2);
  });

  it('flags exhausted when used reaches the default limit', () => {
    const history = Array.from({ length: FREE_DAILY_BREAK_LIMIT }).map(() =>
      brk({ completedAt: '2026-06-09T10:00:00' })
    );
    const u = getFreeBreakUsage(history, { now: NOW });
    expect(u.exhausted).toBe(true);
    expect(u.remaining).toBe(0);
  });

  it('flags exhausted when used exceeds the limit (defensive)', () => {
    const history = Array.from({ length: FREE_DAILY_BREAK_LIMIT + 3 }).map(() =>
      brk({ completedAt: '2026-06-09T10:00:00' })
    );
    const u = getFreeBreakUsage(history, { now: NOW });
    expect(u.exhausted).toBe(true);
    expect(u.remaining).toBe(0);
  });

  it('respects a caller-provided custom limit', () => {
    const history = [
      brk({ completedAt: '2026-06-09T08:00:00' }),
      brk({ completedAt: '2026-06-09T09:00:00' }),
      brk({ completedAt: '2026-06-09T10:00:00' }),
    ];
    const u = getFreeBreakUsage(history, { now: NOW, limit: 2 });
    expect(u).toMatchObject({ used: 3, limit: 2, remaining: 0, exhausted: true });
  });

  it('ignores breaks with malformed completedAt timestamps', () => {
    const history = [
      brk({ completedAt: '2026-06-09T08:00:00' }),
      brk({ completedAt: 'not-a-date' }),
      brk({ completedAt: '' }),
    ];
    const u = getFreeBreakUsage(history, { now: NOW });
    expect(u.used).toBe(1);
  });

  it('handles a break exactly at midnight as today', () => {
    const history = [brk({ completedAt: '2026-06-09T00:00:00' })];
    const u = getFreeBreakUsage(history, { now: NOW });
    expect(u.used).toBe(1);
  });
});
