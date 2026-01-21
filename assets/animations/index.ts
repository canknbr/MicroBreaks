/**
 * Lottie Animation Assets Index
 *
 * This file provides a registry of available Lottie animations.
 * To add animations:
 * 1. Download Lottie JSON files from LottieFiles.com, lordicon.com, or useanimations.com
 * 2. Place them in this directory
 * 3. Import and register them below
 *
 * Recommended free animation sources:
 * - https://lottiefiles.com/free-animations
 * - https://lordicon.com/
 * - https://useanimations.com/
 *
 * Animation categories needed:
 * - Breathing (inhale/exhale animations)
 * - Stretching (body movement animations)
 * - Eye exercises (eye movement animations)
 * - Mindfulness (meditation/calm animations)
 * - Celebration (success/completion animations)
 * - Active (walking/exercise animations)
 * - Loading (progress indicators)
 */

import { LottieAnimationCategory } from '@/components/animations';

// Type for animation registry entry
export interface AnimationAsset {
  source: object; // Lottie JSON object
  name: string;
  category: LottieAnimationCategory;
}

// Animation registry - add imported animations here
// Example:
// import breatheAnimation from './breathe.json';
// import stretchAnimation from './stretch.json';

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

export default animationRegistry;
