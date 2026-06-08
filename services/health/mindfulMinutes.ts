/**
 * Mindful Minutes
 *
 * Pure helpers + types for writing completed breaks into Apple Health
 * as Mindful Session samples. The actual HealthKit plumbing lives in
 * `healthKitSource.ts`; this module decides *which* breaks should be
 * mirrored and what their start/end window looks like.
 *
 * Why we filter at this layer:
 *   - Not every break is mindful (e.g. a "hydrate + stand up" break).
 *     Writing pure-physical breaks as mindful sessions would muddy the
 *     user's Health history.
 *   - Zero-duration breaks are noise.
 *   - Future settings can flip individual categories on/off without
 *     touching the source adapter.
 */

import type { CompletedBreak } from '@/services/storage';

/** A mindful sample in HealthKit terms — half-open `[start, end)`. */
export interface MindfulSample {
  startMs: number;
  endMs: number;
  /** Free-form label kept for debugging only (not written to Health). */
  source: string;
}

/**
 * Break categories that map cleanly onto "mindful". Stretch-only or
 * pure-movement breaks are excluded — they belong in a future
 * Workout sample type, not Mindful Sessions.
 *
 * Categories present in the data layer today: 'active', 'mindful',
 * 'quick', 'stretch'. Only the first two qualify.
 */
const MINDFUL_CATEGORIES = new Set<string>(['mindful', 'quick']);

/**
 * Decide whether this break should be mirrored as a Mindful Session.
 * Returns null when the break does not qualify (caller skips the
 * write) and a `MindfulSample` otherwise.
 */
export function toMindfulSample(b: CompletedBreak): MindfulSample | null {
  if (!b || typeof b.duration !== 'number' || b.duration <= 0) {
    return null;
  }
  if (b.category && !MINDFUL_CATEGORIES.has(b.category)) {
    return null;
  }

  const endMs = new Date(b.completedAt).getTime();
  if (!Number.isFinite(endMs)) return null;
  const startMs = endMs - b.duration * 1000;
  if (startMs >= endMs) return null;

  return {
    startMs,
    endMs,
    source: b.breakId ?? 'microbreaks',
  };
}
