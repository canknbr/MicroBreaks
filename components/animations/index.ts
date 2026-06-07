/**
 * Animation Components
 * Export all animation components
 */

export {
  default as LottieAnimation,
  AnimatedPlaceholder,
  ExerciseLottieAnimation,
  getAnimationCategory,
  getFallbackAnimationType,
} from './LottieAnimation';
export type { LottieSource, LottieAnimationCategory } from './LottieAnimation';
export {
  WelcomeAnimation,
  StretchAnimation,
  TimerAnimation,
  SuccessAnimation,
} from './OnboardingAnimations';
export { default as MilestoneCelebration } from './MilestoneCelebration';
