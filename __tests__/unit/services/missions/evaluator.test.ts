import { evaluateMissions } from '@/services/missions/evaluator';
import type { Mission } from '@/services/missions/types';
import type { CompletedBreak } from '@/services/storage';

function mission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'm-1',
    kind: 'take_breaks',
    target: 3,
    progress: 0,
    completed: false,
    completedAt: null,
    bonusXP: 10,
    description: '',
    ...overrides,
  };
}

function makeBreak(overrides: Partial<CompletedBreak> = {}): CompletedBreak {
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
    completedAt: '2026-06-08T10:00:00.000Z',
    ...overrides,
  };
}

describe('evaluateMissions — take_breaks', () => {
  it('updates progress to match today break count', () => {
    const m = mission({ kind: 'take_breaks', target: 3 });
    const newBreak = makeBreak();
    const result = evaluateMissions({
      missions: [m],
      newBreak,
      todayBreaks: [makeBreak(), makeBreak()],
    });
    expect(result.missions[0].progress).toBe(2);
    expect(result.missions[0].completed).toBe(false);
    expect(result.newlyCompleted).toHaveLength(0);
  });

  it('completes once today count meets the target', () => {
    const m = mission({ kind: 'take_breaks', target: 2 });
    const newBreak = makeBreak();
    const result = evaluateMissions({
      missions: [m],
      newBreak,
      todayBreaks: [makeBreak(), newBreak],
    });
    expect(result.missions[0].progress).toBe(2);
    expect(result.missions[0].completed).toBe(true);
    expect(result.newlyCompleted).toHaveLength(1);
  });

  it('caps progress at target so future calls stay idempotent', () => {
    const m = mission({ kind: 'take_breaks', target: 2, progress: 2, completed: true });
    const result = evaluateMissions({
      missions: [m],
      newBreak: makeBreak(),
      todayBreaks: Array.from({ length: 7 }).map(() => makeBreak()),
    });
    // already complete → unchanged
    expect(result.missions[0].progress).toBe(2);
    expect(result.newlyCompleted).toHaveLength(0);
  });
});

describe('evaluateMissions — mindful_break', () => {
  it('completes when a break in the target category exists', () => {
    const m = mission({
      kind: 'mindful_break',
      category: 'mindful',
      target: 1,
    });
    const newBreak = makeBreak({ category: 'mindful' });
    const result = evaluateMissions({
      missions: [m],
      newBreak,
      todayBreaks: [newBreak],
    });
    expect(result.missions[0].completed).toBe(true);
  });

  it('ignores breaks in other categories', () => {
    const m = mission({
      kind: 'mindful_break',
      category: 'mindful',
      target: 1,
    });
    const result = evaluateMissions({
      missions: [m],
      newBreak: makeBreak({ category: 'stretch' }),
      todayBreaks: [makeBreak({ category: 'stretch' })],
    });
    expect(result.missions[0].completed).toBe(false);
    expect(result.missions[0].progress).toBe(0);
  });
});

describe('evaluateMissions — long_break', () => {
  it('completes when any today break meets the duration target', () => {
    const m = mission({ kind: 'long_break', target: 120 });
    const result = evaluateMissions({
      missions: [m],
      newBreak: makeBreak({ duration: 60 }),
      todayBreaks: [makeBreak({ duration: 60 }), makeBreak({ duration: 150 })],
    });
    expect(result.missions[0].completed).toBe(true);
  });

  it('reports partial progress for the longest break so far', () => {
    const m = mission({ kind: 'long_break', target: 180 });
    const result = evaluateMissions({
      missions: [m],
      newBreak: makeBreak({ duration: 100 }),
      todayBreaks: [makeBreak({ duration: 100 })],
    });
    expect(result.missions[0].completed).toBe(false);
    expect(result.missions[0].progress).toBe(100);
  });
});

describe('evaluateMissions — morning_break / evening_break', () => {
  it('completes a morning mission when a break is taken before noon', () => {
    const m = mission({ kind: 'morning_break', target: 12 });
    const result = evaluateMissions({
      missions: [m],
      newBreak: makeBreak({ completedAt: '2026-06-08T09:30:00' }),
      todayBreaks: [makeBreak({ completedAt: '2026-06-08T09:30:00' })],
    });
    expect(result.missions[0].completed).toBe(true);
  });

  it('does not complete a morning mission after noon', () => {
    const m = mission({ kind: 'morning_break', target: 12 });
    const result = evaluateMissions({
      missions: [m],
      newBreak: makeBreak({ completedAt: '2026-06-08T13:30:00' }),
      todayBreaks: [makeBreak({ completedAt: '2026-06-08T13:30:00' })],
    });
    expect(result.missions[0].completed).toBe(false);
  });

  it('completes an evening mission at/after the target hour', () => {
    const m = mission({ kind: 'evening_break', target: 18 });
    const result = evaluateMissions({
      missions: [m],
      newBreak: makeBreak({ completedAt: '2026-06-08T19:00:00' }),
      todayBreaks: [makeBreak({ completedAt: '2026-06-08T19:00:00' })],
    });
    expect(result.missions[0].completed).toBe(true);
  });
});

describe('evaluateMissions — multi-mission orchestration', () => {
  it('reports every mission that newly completes in a single call', () => {
    const a = mission({ id: 'a', kind: 'take_breaks', target: 1, bonusXP: 5 });
    const b = mission({
      id: 'b',
      kind: 'mindful_break',
      category: 'mindful',
      target: 1,
      bonusXP: 15,
    });
    const newBreak = makeBreak({ category: 'mindful' });
    const result = evaluateMissions({
      missions: [a, b],
      newBreak,
      todayBreaks: [newBreak],
    });
    expect(result.newlyCompleted.map((m) => m.id).sort()).toEqual(['a', 'b']);
  });

  it('does not re-emit a mission that was already complete entering the call', () => {
    const a = mission({
      id: 'a',
      kind: 'take_breaks',
      target: 1,
      progress: 1,
      completed: true,
      completedAt: '2026-06-08T08:00:00',
      bonusXP: 5,
    });
    const result = evaluateMissions({
      missions: [a],
      newBreak: makeBreak(),
      todayBreaks: [makeBreak(), makeBreak()],
    });
    expect(result.newlyCompleted).toHaveLength(0);
  });
});
