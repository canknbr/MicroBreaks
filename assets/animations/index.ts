/**
 * Lottie Animation Assets Index
 *
 * Two parallel registries live in this file:
 *
 *  1. `animationRegistry` — exercise-time animations (breathing, stretch,
 *     eye, mindfulness, active). These power the `ExerciseLottieAnimation`
 *     component. Currently empty; calls fall back to `AnimatedPlaceholder`.
 *
 *  2. `MILESTONE_CELEBRATION_REGISTRY` — the 10 named milestone moments
 *     used by `MilestoneCelebration`. Each entry declares the asset path
 *     the future Lottie file will live at, plus per-milestone choreography
 *     metadata (duration, haptic intensity, ConfettiCelebration fallback
 *     type). Until the .json files ship, the component falls back to the
 *     existing ConfettiCelebration visuals so the call site can be wired
 *     today without waiting on assets.
 *
 * To add a Lottie animation:
 * 1. Download JSON from LottieFiles.com / lordicon.com / useanimations.com
 * 2. Place in this directory matching the asset path declared below
 * 3. Uncomment the `require(...)` for that key and add it to the source
 *    map at the bottom — the call site changes nothing.
 */

import type { AnimationObject } from 'lottie-react-native';
import { LottieAnimationCategory } from '@/components/animations';
import type { CelebrationType } from '@/components/ui/ConfettiCelebration';

// ============================================================
// Exercise animations
// ============================================================

// Type for animation registry entry
export interface AnimationAsset {
  source: object; // Lottie JSON object
  name: string;
  category: LottieAnimationCategory;
}

const animationRegistry: Record<string, AnimationAsset> = {
  // Breathing animations
  // 'breathe-default': {
  //   source: breatheAnimation,
  //   name: 'Default Breathing',
  //   category: 'breathing',
  // },

  // Stretching animations
  // 'stretch-default': {
  //   source: stretchAnimation,
  //   name: 'Default Stretch',
  //   category: 'stretching',
  // },

  // Add more animations as they are downloaded
};

/**
 * Get animation asset by key
 */
export function getAnimationAsset(key: string): AnimationAsset | undefined {
  return animationRegistry[key];
}

/**
 * Get all animations by category
 */
export function getAnimationsByCategory(category: LottieAnimationCategory): AnimationAsset[] {
  return Object.values(animationRegistry).filter((asset) => asset.category === category);
}

/**
 * Check if any Lottie animations are available
 */
export function hasLottieAnimations(): boolean {
  return Object.keys(animationRegistry).length > 0;
}

/**
 * Get random animation from category (for variety)
 */
export function getRandomAnimationByCategory(
  category: LottieAnimationCategory
): AnimationAsset | undefined {
  const animations = getAnimationsByCategory(category);
  if (animations.length === 0) return undefined;
  return animations[Math.floor(Math.random() * animations.length)];
}

// ============================================================
// Milestone celebrations
// ============================================================

/**
 * Every milestone moment the app celebrates. These are the only valid
 * keys callers may pass to `<MilestoneCelebration name={...} />` — the
 * type unions the registry with the call site so a typo on either side
 * surfaces at typecheck time.
 */
export type MilestoneCelebrationKey =
  | 'first_break'
  | 'streak_day_3'
  | 'streak_day_7'
  | 'streak_day_14'
  | 'streak_day_30'
  | 'streak_day_60'
  | 'streak_day_100'
  | 'goal_complete'
  | 'level_up'
  | 'perfect_week'
  | 'achievement_unlocked';

export interface MilestoneCelebrationMeta {
  /** Asset path the Lottie loader will use once the .json ships. */
  assetPath: string;
  /** Total animation length — drives auto-dismiss timing. */
  durationMs: number;
  /**
   * 0–1 intensity passed to `useHapticChoreography().milestone(...)`.
   * Bigger milestones get heavier haptic — a 100-day streak should feel
   * different from a 3-day one.
   */
  hapticIntensity: number;
  /**
   * Which existing `ConfettiCelebration` type to render when the Lottie
   * asset is not yet bundled. This keeps users seeing a real celebration
   * today and lets the Lottie swap in transparently tomorrow.
   */
  fallbackType: CelebrationType;
}

/**
 * Single source of truth for every milestone. Sorted by intensity so it
 * reads as the user's journey from first session to long-form streak.
 */
export const MILESTONE_CELEBRATION_REGISTRY: Record<
  MilestoneCelebrationKey,
  MilestoneCelebrationMeta
> = {
  first_break:        { assetPath: 'assets/animations/celebration-first-break.json',     durationMs: 2400, hapticIntensity: 0.45, fallbackType: 'first_break' },
  streak_day_3:       { assetPath: 'assets/animations/celebration-streak-3.json',        durationMs: 2400, hapticIntensity: 0.4,  fallbackType: 'streak_milestone' },
  streak_day_7:       { assetPath: 'assets/animations/celebration-streak-7.json',        durationMs: 2800, hapticIntensity: 0.55, fallbackType: 'streak_milestone' },
  streak_day_14:      { assetPath: 'assets/animations/celebration-streak-14.json',       durationMs: 3000, hapticIntensity: 0.65, fallbackType: 'streak_milestone' },
  streak_day_30:      { assetPath: 'assets/animations/celebration-streak-30.json',       durationMs: 3200, hapticIntensity: 0.8,  fallbackType: 'streak_milestone' },
  streak_day_60:      { assetPath: 'assets/animations/celebration-streak-60.json',       durationMs: 3400, hapticIntensity: 0.9,  fallbackType: 'streak_milestone' },
  streak_day_100:     { assetPath: 'assets/animations/celebration-streak-100.json',      durationMs: 3800, hapticIntensity: 1.0,  fallbackType: 'streak_milestone' },
  goal_complete:      { assetPath: 'assets/animations/celebration-goal.json',            durationMs: 2600, hapticIntensity: 0.6,  fallbackType: 'goal_complete' },
  level_up:           { assetPath: 'assets/animations/celebration-level-up.json',        durationMs: 2800, hapticIntensity: 0.7,  fallbackType: 'new_level' },
  perfect_week:       { assetPath: 'assets/animations/celebration-perfect-week.json',    durationMs: 3400, hapticIntensity: 0.85, fallbackType: 'perfect_week' },
  achievement_unlocked: { assetPath: 'assets/animations/celebration-achievement.json',   durationMs: 2800, hapticIntensity: 0.7,  fallbackType: 'achievement' },
};

/**
 * Map a milestone key to its bundled Lottie source, or `null` when the
 * asset has not yet been added. The component uses the null return to
 * choose its fallback path.
 *
 * Adding a real animation:
 *   1. drop the .json into `assets/animations/`
 *   2. add an `import x from './celebration-first-break.json'`
 *   3. return it from the matching branch below
 */
export function getMilestoneLottieSource(
  _key: MilestoneCelebrationKey
): AnimationObject | null {
  // No celebration .json assets are bundled yet. The component falls back
  // to ConfettiCelebration so users see the existing visuals today.
  return null;
}

export function getMilestoneMeta(
  key: MilestoneCelebrationKey
): MilestoneCelebrationMeta {
  return MILESTONE_CELEBRATION_REGISTRY[key];
}

export default animationRegistry;
