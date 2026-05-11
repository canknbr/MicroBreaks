import {
  getBreakOutcomeBadge,
  getBreakOutcomeSummary,
  mapBreakHistoryToOutcomeSignals,
  sortBreakListByOutcome,
} from '@/features/recovery/personalization';
import type { ExerciseCategory } from '@/data/exercises';
import type { CompletedBreak } from '@/services/storage';

describe('recovery personalization helpers', () => {
  const history: CompletedBreak[] = [
    {
      id: 'entry-1',
      breakId: 'eye-rest',
      title: 'Eye Rest',
      category: 'quick',
      icon: '👀',
      color: '#00E5FF',
      duration: 60,
      stepsCompleted: 1,
      totalSteps: 1,
      xpEarned: 10,
      rating: 'good',
      reliefScore: 'much_better',
      completedAt: '2026-05-11T10:00:00.000Z',
    },
    {
      id: 'entry-2',
      breakId: 'deep-breath',
      title: 'Deep Breath',
      category: 'mindful',
      icon: '🫁',
      color: '#4ECDC4',
      duration: 120,
      stepsCompleted: 1,
      totalSteps: 1,
      xpEarned: 10,
      rating: 'bad',
      reliefScore: 'same',
      completedAt: '2026-05-11T09:00:00.000Z',
    },
    {
      id: 'entry-3',
      breakId: 'blink-reset',
      title: 'Blink Reset',
      category: 'quick',
      icon: '👁️',
      color: '#00E5FF',
      duration: 60,
      stepsCompleted: 1,
      totalSteps: 1,
      xpEarned: 10,
      rating: 'good',
      reliefScore: 'better',
      completedAt: '2026-05-11T08:00:00.000Z',
    },
  ];

  it('maps break history into recommendation outcome signals', () => {
    expect(mapBreakHistoryToOutcomeSignals(history, 2)).toEqual([
      {
        breakId: 'eye-rest',
        category: 'quick',
        rating: 'good',
        reliefScore: 'much_better',
      },
      {
        breakId: 'deep-breath',
        category: 'mindful',
        rating: 'bad',
        reliefScore: 'same',
      },
    ]);
  });

  it('summarizes exact and category-level outcomes for a break', () => {
    const summary = getBreakOutcomeSummary(
      'eye-rest',
      'quick',
      mapBreakHistoryToOutcomeSignals(history)
    );

    expect(summary.exactCount).toBe(1);
    expect(summary.exactAverage).toBeGreaterThan(10);
    expect(summary.categoryCount).toBe(1);
    expect(summary.categoryAverage).toBeGreaterThan(5);
  });

  it('returns a positive badge for high-relief exact matches', () => {
    expect(
      getBreakOutcomeBadge(
        'eye-rest',
        'quick',
        mapBreakHistoryToOutcomeSignals(history)
      )
    ).toEqual({
      label: 'Works well for you',
      tone: 'positive',
    });
  });

  it('returns a warning badge for low-relief exact matches', () => {
    expect(
      getBreakOutcomeBadge(
        'deep-breath',
        'mindful',
        mapBreakHistoryToOutcomeSignals(history)
      )
    ).toEqual({
      label: 'Try a fresher reset',
      tone: 'warning',
    });
  });

  it('sorts accessible, better-performing breaks ahead of weaker or locked ones', () => {
    const items: Array<{ id: string; category: ExerciseCategory; isLocked: boolean }> = [
      { id: 'deep-breath', category: 'mindful', isLocked: false },
      { id: 'eye-rest', category: 'quick', isLocked: true },
      { id: 'blink-reset', category: 'quick', isLocked: false },
    ];

    expect(
      sortBreakListByOutcome(
        items,
        mapBreakHistoryToOutcomeSignals(history),
        'deep-breath',
        false
      ).map((item) => item.id)
    ).toEqual(['blink-reset', 'deep-breath', 'eye-rest']);
  });
});
