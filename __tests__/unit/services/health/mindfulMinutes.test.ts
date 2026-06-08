import { toMindfulSample } from '@/services/health/mindfulMinutes';
import type { CompletedBreak } from '@/services/storage';

function makeBreak(overrides: Partial<CompletedBreak> = {}): CompletedBreak {
  return {
    id: 'b-1',
    breakId: 'eye-rest',
    title: 'Eye Rest',
    category: 'mindful',
    icon: '🧘',
    color: '#00E5FF',
    duration: 60,
    stepsCompleted: 1,
    totalSteps: 1,
    xpEarned: 5,
    rating: null,
    completedAt: '2026-06-08T14:30:00.000Z',
    ...overrides,
  };
}

describe('toMindfulSample', () => {
  it('maps a mindful break into a sample with start = end - duration', () => {
    const sample = toMindfulSample(makeBreak({ category: 'mindful', duration: 90 }));
    expect(sample).not.toBeNull();
    expect(sample!.endMs - sample!.startMs).toBe(90 * 1000);
    expect(new Date(sample!.endMs).toISOString()).toBe('2026-06-08T14:30:00.000Z');
  });

  it('maps a quick break (counts as mindful)', () => {
    const sample = toMindfulSample(makeBreak({ category: 'quick' }));
    expect(sample).not.toBeNull();
  });

  it('rejects an active break (physical, not mindful)', () => {
    expect(toMindfulSample(makeBreak({ category: 'active' }))).toBeNull();
  });

  it('rejects a stretch break (physical)', () => {
    expect(toMindfulSample(makeBreak({ category: 'stretch' }))).toBeNull();
  });

  it('rejects a zero-duration break', () => {
    expect(toMindfulSample(makeBreak({ duration: 0 }))).toBeNull();
  });

  it('rejects a negative duration defensively', () => {
    expect(toMindfulSample(makeBreak({ duration: -30 }))).toBeNull();
  });

  it('rejects a break with a malformed completedAt timestamp', () => {
    expect(
      toMindfulSample(makeBreak({ completedAt: 'definitely-not-a-date' }))
    ).toBeNull();
  });

  it('carries the breakId through as the sample source label', () => {
    const sample = toMindfulSample(makeBreak({ breakId: 'box-breathing' }));
    expect(sample?.source).toBe('box-breathing');
  });
});
