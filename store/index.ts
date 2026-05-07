/**
 * Store Exports
 * Central export point for all Zustand stores
 */

export { useOnboardingStore, initialOnboardingData } from './onboardingStore';
export type { OnboardingData } from './onboardingStore';

export {
  useUserStore,
  initialUserProfile,
  initialUserProgress,
  initialUserPreferences,
  initialUserAchievements,
} from './userStore';
export type { UserProfile, UserProgress } from './userStore';

export { useSettingsStore, defaultAppSettings } from './settingsStore';
export type { AppSettings } from './settingsStore';

export { useNotificationStore, createAchievementNotification, createStreakNotification, createGoalNotification, createLevelUpNotification } from './notificationStore';
export type { AppNotification, NotificationType } from './notificationStore';

export {
  useTimerStore,
  initialTimerSession,
  initialTimerStats,
  initialTimerPreferences,
} from './timerStore';

export {
  useSubscriptionStore,
  useSubscriptionCustomer,
  useSubscriptionOffers,
  useSubscriptionStatus,
  useBillingProvider,
  useBillingDiagnostics,
  useEntitlementHealth,
  useHasActiveSubscription,
} from './subscriptionStore';
