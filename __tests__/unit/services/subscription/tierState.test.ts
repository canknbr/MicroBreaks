import {
  __resetTierStateForTests,
  __setEffectiveTier,
  getCurrentEffectiveTier,
  subscribeToTierState,
} from '@/services/subscription/tierState';

describe('tierState singleton', () => {
  beforeEach(() => {
    __resetTierStateForTests();
  });

  it('defaults to free', () => {
    expect(getCurrentEffectiveTier()).toBe('free');
  });

  it('updates the cached value', () => {
    __setEffectiveTier('pro');
    expect(getCurrentEffectiveTier()).toBe('pro');
  });

  it('notifies subscribers on change', () => {
    const seen: string[] = [];
    subscribeToTierState((tier) => seen.push(tier));
    __setEffectiveTier('solo');
    __setEffectiveTier('pro');
    expect(seen).toEqual(['solo', 'pro']);
  });

  it('does not fire subscribers when the tier is unchanged', () => {
    const fn = jest.fn();
    subscribeToTierState(fn);
    __setEffectiveTier('solo');
    __setEffectiveTier('solo');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('returns an unsubscribe handle', () => {
    const fn = jest.fn();
    const unsubscribe = subscribeToTierState(fn);
    unsubscribe();
    __setEffectiveTier('family');
    expect(fn).not.toHaveBeenCalled();
  });

  it('isolates listener crashes — other listeners still fire', () => {
    const ok = jest.fn();
    subscribeToTierState(() => {
      throw new Error('boom');
    });
    subscribeToTierState(ok);
    __setEffectiveTier('pro');
    expect(ok).toHaveBeenCalledWith('pro');
  });
});
