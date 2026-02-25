/**
 * Analytics Service
 * Centralized analytics tracking for MicroBreaks
 */

import Constants from 'expo-constants';
import firebaseAnalytics from '@react-native-firebase/analytics';
import { generateId } from '@/utils/generateId';

// ============================================
// Analytics Events
// ============================================

export enum AnalyticsEvent {
  // App Lifecycle
  APP_OPENED = 'app_opened',
  APP_BACKGROUNDED = 'app_backgrounded',
  APP_FOREGROUNDED = 'app_foregrounded',

  // Onboarding
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_STEP_COMPLETED = 'onboarding_step_completed',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  ONBOARDING_SKIPPED = 'onboarding_skipped',

  // Breaks
  BREAK_REMINDER_SHOWN = 'break_reminder_shown',
  BREAK_REMINDER_TAPPED = 'break_reminder_tapped',
  BREAK_REMINDER_DISMISSED = 'break_reminder_dismissed',
  BREAK_STARTED = 'break_started',
  BREAK_COMPLETED = 'break_completed',
  BREAK_SKIPPED = 'break_skipped',
  BREAK_PAUSED = 'break_paused',
  BREAK_RESUMED = 'break_resumed',

  // Exercises
  EXERCISE_STARTED = 'exercise_started',
  EXERCISE_COMPLETED = 'exercise_completed',
  EXERCISE_SKIPPED = 'exercise_skipped',

  // Achievements
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  STREAK_MILESTONE = 'streak_milestone',

  // Settings
  SETTINGS_OPENED = 'settings_opened',
  SETTINGS_CHANGED = 'settings_changed',
  NOTIFICATIONS_ENABLED = 'notifications_enabled',
  NOTIFICATIONS_DISABLED = 'notifications_disabled',

  // Navigation
  SCREEN_VIEWED = 'screen_viewed',
  TAB_CHANGED = 'tab_changed',

  // Errors
  ERROR_OCCURRED = 'error_occurred',
}

// ============================================
// Analytics Properties
// ============================================

export interface AnalyticsProperties {
  // Common properties
  timestamp?: number;
  session_id?: string;

  // Break properties
  break_duration?: number;
  break_type?: string;
  exercises_completed?: number;

  // Exercise properties
  exercise_id?: string;
  exercise_category?: string;
  exercise_duration?: number;

  // Achievement properties
  achievement_id?: string;
  achievement_name?: string;

  // Settings properties
  setting_name?: string;
  setting_value?: unknown;

  // Screen properties
  screen_name?: string;
  previous_screen?: string;

  // Error properties
  error_code?: string;
  error_message?: string;

  // Custom properties
  [key: string]: unknown;
}

// ============================================
// Analytics Configuration
// ============================================

interface AnalyticsConfig {
  enabled: boolean;
  debugMode: boolean;
  flushInterval: number;
  maxQueueSize: number;
}

const getConfig = (): AnalyticsConfig => ({
  enabled: !__DEV__, // Disable in development
  debugMode: __DEV__,
  flushInterval: 30000, // 30 seconds
  maxQueueSize: 100,
});

// ============================================
// Analytics Service
// ============================================

class AnalyticsService {
  private config: AnalyticsConfig;
  private sessionId: string;
  private eventQueue: Array<{ event: string; properties: AnalyticsProperties }> = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;
  private superProperties: Record<string, unknown> = {};

  constructor() {
    this.config = getConfig();
    this.sessionId = this.generateSessionId();
    this.initializeSuperProperties();
  }

  /**
   * Initialize analytics
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      this.log('Analytics disabled');
      return;
    }

    // Start flush timer
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Track app opened
    this.track(AnalyticsEvent.APP_OPENED);

    this.log('Analytics initialized');
  }

  /**
   * Set super properties (attached to every event)
   */
  private initializeSuperProperties(): void {
    this.superProperties = {
      app_version: Constants.expoConfig?.version || '1.0.0',
      platform: Constants.platform?.ios ? 'ios' : 'android',
      device_year_class: Constants.deviceYearClass,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return generateId('session');
  }

  /**
   * Log to console in debug mode
   */
  private log(message: string, data?: unknown): void {
    if (this.config.debugMode) {
      console.log(`[Analytics] ${message}`, data || '');
    }
  }

  /**
   * Set user ID for analytics
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
    this.log(`User ID set: ${userId}`);

    try {
      firebaseAnalytics().setUserId(userId);
    } catch (error) {
      this.log('Failed to set Firebase user ID', error);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, unknown>): void {
    this.log('User properties set', properties);

    try {
      const stringProps: Record<string, string | null> = {};
      for (const [key, value] of Object.entries(properties)) {
        stringProps[key] = value != null ? String(value) : null;
      }
      firebaseAnalytics().setUserProperties(stringProps);
    } catch (error) {
      this.log('Failed to set Firebase user properties', error);
    }
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEvent | string, properties: AnalyticsProperties = {}): void {
    const enrichedProperties: AnalyticsProperties = {
      ...this.superProperties,
      ...properties,
      timestamp: Date.now(),
      session_id: this.sessionId,
    };

    if (this.userId) {
      enrichedProperties.user_id = this.userId;
    }

    this.log(`Event: ${event}`, enrichedProperties);

    if (!this.config.enabled) {
      return;
    }

    // Add to queue
    this.eventQueue.push({ event, properties: enrichedProperties });

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties: AnalyticsProperties = {}): void {
    this.track(AnalyticsEvent.SCREEN_VIEWED, {
      screen_name: screenName,
      ...properties,
    });

    // Also log to Firebase's built-in screen tracking
    try {
      firebaseAnalytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
    } catch (error) {
      this.log('Failed to log Firebase screen view', error);
    }
  }

  /**
   * Flush event queue to analytics provider
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const fbAnalytics = firebaseAnalytics();
      for (const { event, properties } of events) {
        // Firebase Analytics params must be string/number values
        const params: Record<string, string | number> = {};
        for (const [key, value] of Object.entries(properties)) {
          if (typeof value === 'string' || typeof value === 'number') {
            params[key] = value;
          } else if (value != null) {
            params[key] = String(value);
          }
        }
        await fbAnalytics.logEvent(event, params);
      }

      this.log(`Flushed ${events.length} events to Firebase`);
    } catch (error) {
      // Put events back in queue on failure
      this.eventQueue = [...events, ...this.eventQueue];
      console.error('[Analytics] Flush failed:', error);
    }
  }

  /**
   * Shutdown analytics
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    await this.flush();
    this.log('Analytics shutdown');
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Track break events
   */
  trackBreakStarted(breakType: string, duration: number): void {
    this.track(AnalyticsEvent.BREAK_STARTED, {
      break_type: breakType,
      break_duration: duration,
    });
  }

  trackBreakCompleted(breakType: string, duration: number, exercisesCompleted: number): void {
    this.track(AnalyticsEvent.BREAK_COMPLETED, {
      break_type: breakType,
      break_duration: duration,
      exercises_completed: exercisesCompleted,
    });
  }

  trackBreakSkipped(breakType: string): void {
    this.track(AnalyticsEvent.BREAK_SKIPPED, {
      break_type: breakType,
    });
  }

  /**
   * Track exercise events
   */
  trackExerciseCompleted(exerciseId: string, category: string, duration: number): void {
    this.track(AnalyticsEvent.EXERCISE_COMPLETED, {
      exercise_id: exerciseId,
      exercise_category: category,
      exercise_duration: duration,
    });
  }

  /**
   * Track achievement events
   */
  trackAchievementUnlocked(achievementId: string, achievementName: string): void {
    this.track(AnalyticsEvent.ACHIEVEMENT_UNLOCKED, {
      achievement_id: achievementId,
      achievement_name: achievementName,
    });
  }

  trackStreakMilestone(streakCount: number): void {
    this.track(AnalyticsEvent.STREAK_MILESTONE, {
      streak_count: streakCount,
    });
  }

  /**
   * Track settings changes
   */
  trackSettingChanged(settingName: string, settingValue: unknown): void {
    this.track(AnalyticsEvent.SETTINGS_CHANGED, {
      setting_name: settingName,
      setting_value: settingValue,
    });
  }

  /**
   * Track errors
   */
  trackError(errorCode: string, errorMessage: string, properties: AnalyticsProperties = {}): void {
    this.track(AnalyticsEvent.ERROR_OCCURRED, {
      error_code: errorCode,
      error_message: errorMessage,
      ...properties,
    });
  }
}

// ============================================
// Singleton Export
// ============================================

export const analytics = new AnalyticsService();

// ============================================
// React Hook
// ============================================

import { useEffect, useCallback } from 'react';

export function useAnalytics(screenName?: string) {
  useEffect(() => {
    if (screenName) {
      analytics.trackScreen(screenName);
    }
  }, [screenName]);

  const track = useCallback((event: AnalyticsEvent | string, properties?: AnalyticsProperties) => {
    analytics.track(event, properties);
  }, []);

  return {
    track,
    trackScreen: analytics.trackScreen.bind(analytics),
    trackBreakStarted: analytics.trackBreakStarted.bind(analytics),
    trackBreakCompleted: analytics.trackBreakCompleted.bind(analytics),
    trackBreakSkipped: analytics.trackBreakSkipped.bind(analytics),
    trackExerciseCompleted: analytics.trackExerciseCompleted.bind(analytics),
    trackAchievementUnlocked: analytics.trackAchievementUnlocked.bind(analytics),
    trackSettingChanged: analytics.trackSettingChanged.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
  };
}

export default analytics;
