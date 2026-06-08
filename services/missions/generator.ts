/**
 * Mission Generator
 *
 * Deterministic, seedable picker that produces a fresh set of daily
 * missions from a fixed template pool. Same seed → same missions, so
 * the system survives app restarts mid-day without re-randomising
 * the user's goal set.
 *
 * The seed is the local date string (YYYY-MM-DD) by default; tests
 * pass an explicit seed for full determinism.
 */

import type { Mission, MissionKind } from './types';

interface MissionTemplate {
  kind: MissionKind;
  target: number;
  category?: string;
  bonusXP: number;
  description: string;
}

const TEMPLATES: MissionTemplate[] = [
  // Count goals — gentle ramp from 1 to 4 so we don't sandbag a 0-streak
  // user on day one but also offer headroom for power users.
  { kind: 'take_breaks', target: 1, bonusXP: 5,  description: 'Take 1 break today' },
  { kind: 'take_breaks', target: 2, bonusXP: 10, description: 'Take 2 breaks today' },
  { kind: 'take_breaks', target: 3, bonusXP: 15, description: 'Take 3 breaks today' },
  { kind: 'take_breaks', target: 4, bonusXP: 20, description: 'Take 4 breaks today' },

  // Category diversification.
  { kind: 'mindful_break', target: 1, category: 'mindful', bonusXP: 15, description: 'Complete a mindful break' },
  { kind: 'mindful_break', target: 1, category: 'quick',   bonusXP: 10, description: 'Complete a quick break' },
  { kind: 'mindful_break', target: 1, category: 'stretch', bonusXP: 15, description: 'Complete a stretch break' },

  // Duration.
  { kind: 'long_break', target: 120, bonusXP: 15, description: 'Take a break of at least 2 minutes' },
  { kind: 'long_break', target: 180, bonusXP: 20, description: 'Take a break of at least 3 minutes' },

  // Time-of-day windows.
  { kind: 'morning_break', target: 12, bonusXP: 10, description: 'Take a break before noon' },
  { kind: 'evening_break', target: 18, bonusXP: 10, description: 'Take a break after 6pm' },
];

/** Tiny string hash — DJB2. */
function hashSeed(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return h >>> 0; // force unsigned
}

/** Linear-congruential generator. Deterministic, fast, good enough. */
function makeRng(seedNum: number): () => number {
  let state = seedNum || 1;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Build a daily mission set. Returns `count` distinct missions
 * sampled from the template pool with a soft constraint: never two
 * missions of the same kind in one set.
 */
export function generateDailyMissions(
  seed: string,
  count = 3,
  templates: MissionTemplate[] = TEMPLATES
): Mission[] {
  const rng = makeRng(hashSeed(seed));
  const pool = [...templates];
  const out: Mission[] = [];
  const usedKinds = new Set<MissionKind>();

  // Fisher-Yates shuffle then pick from the front, skipping repeats.
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  for (const tpl of pool) {
    if (out.length >= count) break;
    if (usedKinds.has(tpl.kind)) continue;
    usedKinds.add(tpl.kind);
    out.push({
      id: `${seed}-${tpl.kind}-${out.length}`,
      kind: tpl.kind,
      target: tpl.target,
      category: tpl.category,
      progress: 0,
      completed: false,
      completedAt: null,
      bonusXP: tpl.bonusXP,
      description: tpl.description,
    });
  }

  // If the kind-uniqueness constraint left us short (unlikely with
  // current pool size), fill from anywhere.
  if (out.length < count) {
    for (const tpl of pool) {
      if (out.length >= count) break;
      const alreadyPicked = out.some((m) => m.id.endsWith(`${tpl.kind}-${out.indexOf(m)}`));
      if (alreadyPicked) continue;
      out.push({
        id: `${seed}-${tpl.kind}-${out.length}-fill`,
        kind: tpl.kind,
        target: tpl.target,
        category: tpl.category,
        progress: 0,
        completed: false,
        completedAt: null,
        bonusXP: tpl.bonusXP,
        description: tpl.description,
      });
    }
  }

  return out;
}
