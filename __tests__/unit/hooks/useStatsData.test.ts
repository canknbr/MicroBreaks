import type { CompletedBreak } from '@/services/storage';
import { statsDataTestUtils } from '@/hooks/useStatsData';

const { buildWeeklyRecoveryReport, buildRecoveryInsights } = statsDataTestUtils;

function createBreak(overrides: Partial<CompletedBreak>): CompletedBreak {
  return {
    id: overrides.id ?? `break-${Math.random().toString(36).slice(2)}`,
    breakId: overrides.breakId ?? 'eye-rest',
    title: overrides.title ?? 'Eye Rest',
    category: overrides.category ?? 'quick',
    icon: overrides.icon ?? '👀',
    color: overrides.color ?? '#00E5FF',
    duration: overrides.duration ?? 60,
    stepsCompleted: overrides.stepsCompleted ?? 3,
    totalSteps: overrides.totalSteps ?? 3,
    xpEarned: overrides.xpEarned ?? 10,
    rating: overrides.rating ?? 'good',
    reliefScore: overrides.reliefScore ?? 'better',
    completedAt: overrides.completedAt ?? '2026-05-05T10:00:00.000Z',
    updatedAt: overrides.updatedAt ?? overrides.completedAt ?? '2026-05-05T10:00:00.000Z',
  };
}

describe('useStatsData relief insights', () => {
  it('surfaces the top relief break when relief signals exist', () => {
    const weekBreaks = [
      createBreak({
        id: '1',
        breakId: 'eye-rest',
        title: 'Eye Rest',
        reliefScore: 'much_better',
      }),
      createBreak({
        id: '2',
        breakId: 'eye-rest',
        title: 'Eye Rest',
        reliefScore: 'better',
        completedAt: '2026-05-06T10:00:00.000Z',
        updatedAt: '2026-05-06T10:00:00.000Z',
      }),
      createBreak({
        id: '3',
        breakId: 'neck-roll',
        title: 'Neck Roll',
        category: 'stretch',
        reliefScore: 'worse',
        completedAt: '2026-05-07T10:00:00.000Z',
        updatedAt: '2026-05-07T10:00:00.000Z',
      }),
    ];

    const report = buildWeeklyRecoveryReport(weekBreaks, weekBreaks, 35, 3);

    expect(report).not.toBeNull();
    expect(report?.topReliefBreakTitle).toBe('Eye Rest');
    expect(report?.topReliefRate).toBe(100);
    expect(report?.lowestReliefBreakTitle).toBe('Neck Roll');
    expect(report?.lowestReliefRate).toBe(0);
    expect(report?.shareMessage).toContain('Works best: Eye Rest');
  });

  it('adds a works-best insight card when relief performance data is available', () => {
    const weekBreaks = [
      createBreak({
        id: '1',
        breakId: 'deep-breath',
        title: 'Deep Breath',
        category: 'mindful',
        reliefScore: 'better',
      }),
      createBreak({
        id: '2',
        breakId: 'deep-breath',
        title: 'Deep Breath',
        category: 'mindful',
        reliefScore: 'much_better',
        completedAt: '2026-05-06T10:00:00.000Z',
        updatedAt: '2026-05-06T10:00:00.000Z',
      }),
    ];

    const report = buildWeeklyRecoveryReport(weekBreaks, weekBreaks, 35, 2);
    const insights = buildRecoveryInsights(report);

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'relief-winner',
          title: 'Works Best',
          value: 'Deep Breath',
          tone: 'positive',
        }),
      ])
    );
  });

  it('adds a needs-rethink insight card for low-relief breaks', () => {
    const weekBreaks = [
      createBreak({
        id: '1',
        breakId: 'deep-breath',
        title: 'Deep Breath',
        category: 'mindful',
        reliefScore: 'much_better',
      }),
      createBreak({
        id: '2',
        breakId: 'neck-roll',
        title: 'Neck Roll',
        category: 'stretch',
        reliefScore: 'worse',
        completedAt: '2026-05-06T10:00:00.000Z',
        updatedAt: '2026-05-06T10:00:00.000Z',
      }),
      createBreak({
        id: '3',
        breakId: 'neck-roll',
        title: 'Neck Roll',
        category: 'stretch',
        reliefScore: 'same',
        completedAt: '2026-05-07T10:00:00.000Z',
        updatedAt: '2026-05-07T10:00:00.000Z',
      }),
    ];

    const report = buildWeeklyRecoveryReport(weekBreaks, weekBreaks, 35, 2);
    const insights = buildRecoveryInsights(report);

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'relief-watch',
          title: 'Needs Rethink',
          value: 'Neck Roll',
          tone: 'attention',
        }),
      ])
    );
  });
});
