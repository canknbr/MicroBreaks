/**
 * Tier State Singleton
 *
 * The hooks in `useEffectiveTier` / `useTierFeature` are React-only;
 * services and background tasks need a synchronous way to read the
 * current tier without subscribing to React.
 *
 * This singleton is fed by `useTierStateSync` mounted at the app
 * root. Any service can call `getCurrentEffectiveTier()` to ask
 * "what is the user's tier *right now*" — useful when the user
 * completes a break and we need to decide whether to write to Apple
 * Health, query the calendar, sync premium data, etc.
 *
 * Default is `'free'`. The first sync flips it to the right value
 * within one React render of the app booting.
 */

import type { Tier } from './tiers';

let current: Tier = 'free';
const listeners = new Set<(tier: Tier) => void>();

/** Synchronous getter — safe to call from anywhere. */
export function getCurrentEffectiveTier(): Tier {
  return current;
}

/**
 * Update the cached tier. Called only by `useTierStateSync` — keep
 * this internal to the module so services can't accidentally promote
 * themselves.
 */
export function __setEffectiveTier(tier: Tier): void {
  if (current === tier) return;
  current = tier;
  listeners.forEach((fn) => {
    try {
      fn(tier);
    } catch {
      // Listener crashes shouldn't take down the others.
    }
  });
}

/**
 * Subscribe to tier changes. Returns an unsubscribe handle. Use
 * sparingly — most callers want the synchronous getter.
 */
export function subscribeToTierState(fn: (tier: Tier) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Test seam — reset the singleton between cases. */
export function __resetTierStateForTests(): void {
  current = 'free';
  listeners.clear();
}
