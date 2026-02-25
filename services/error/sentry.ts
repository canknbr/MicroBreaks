/**
 * Sentry Error Tracking Service
 * Premium-level error monitoring and reporting
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  AppError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
} from './types';

// ============================================
// Sentry Types (for when @sentry/react-native is installed)
// ============================================

interface SentryScope {
  setTag: (key: string, value: string) => void;
  setExtra: (key: string, value: unknown) => void;
  setLevel: (level: string) => void;
  setUser: (user: { id?: string; email?: string } | null) => void;
  setContext: (name: string, context: Record<string, unknown> | null) => void;
  addBreadcrumb: (breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, unknown>;
  }) => void;
}

export interface SentryTransaction {
  finish: () => void;
  setData: (key: string, value: unknown) => void;
  setTag: (key: string, value: string) => void;
  startChild: (options?: { op?: string; description?: string }) => { finish: () => void };
}

interface SentryHub {
  captureException: (error: Error, options?: { contexts?: Record<string, unknown> }) => string;
  captureMessage: (message: string, level?: string) => string;
  configureScope: (callback: (scope: SentryScope) => void) => void;
  withScope: (callback: (scope: SentryScope) => void) => void;
  setUser: (user: { id?: string; email?: string } | null) => void;
  addBreadcrumb: (breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, unknown>;
  }) => void;
}

// ============================================
// Sentry Configuration
// ============================================

interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release: string;
  dist: string;
  enableAutoSessionTracking: boolean;
  sessionTrackingIntervalMillis: number;
  tracesSampleRate: number;
  attachStacktrace: boolean;
  enableNative: boolean;
  enableNativeCrashHandling: boolean;
  enableAutoPerformanceTracing: boolean;
  debug: boolean;
}

const getSentryConfig = (): SentryConfig => {
  const isDev = __DEV__;
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';

  return {
    // Replace with your actual Sentry DSN
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    environment: isDev ? 'development' : 'production',
    release: `com.cankanbur.MicroBreaks@${appVersion}`,
    dist: buildNumber,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    tracesSampleRate: isDev ? 1.0 : 0.2, // 100% in dev, 20% in prod
    attachStacktrace: true,
    enableNative: true,
    enableNativeCrashHandling: true,
    enableAutoPerformanceTracing: true,
    debug: isDev,
  };
};

// ============================================
// Sentry Service
// ============================================

class SentryService {
  private isInitialized = false;
  private sentry: SentryHub | null = null;
  private userId: string | null = null;
  private sessionId: string = this.generateSessionId();

  /**
   * Initialize Sentry SDK
   * Call this in app startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Dynamic import to handle when Sentry is not installed
      const Sentry = await import('@sentry/react-native').catch(() => null);

      if (!Sentry) {
        console.warn('[Sentry] @sentry/react-native not installed. Error tracking disabled.');
        return;
      }

      const config = getSentryConfig();

      if (!config.dsn) {
        console.warn('[Sentry] DSN not configured. Error tracking disabled.');
        return;
      }

      Sentry.init({
        ...config,
        beforeSend: (event) => {
          // Filter out development errors if needed
          if (__DEV__ && !config.debug) {
            return null;
          }
          return event;
        },
        integrations: (integrations) => {
          return integrations.filter(
            (integration) => integration.name !== 'ReactNativeErrorHandlers'
          );
        },
      });

      this.sentry = Sentry as unknown as SentryHub;
      this.isInitialized = true;

      // Set initial context
      this.setContext('app', {
        platform: Platform.OS,
        version: Constants.expoConfig?.version,
        sessionId: this.sessionId,
      });

      console.log('[Sentry] Initialized successfully');
    } catch (error) {
      console.error('[Sentry] Failed to initialize:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Map our severity to Sentry level
   */
  private mapSeverityToLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'info';
      case ErrorSeverity.WARNING:
        return 'warning';
      case ErrorSeverity.ERROR:
        return 'error';
      case ErrorSeverity.FATAL:
        return 'fatal';
      default:
        return 'error';
    }
  }

  /**
   * Set user information for error context
   */
  setUser(userId: string | null, email?: string): void {
    this.userId = userId;

    if (!this.sentry) return;

    if (userId) {
      this.sentry.setUser({ id: userId, email });
    } else {
      this.sentry.setUser(null);
    }
  }

  /**
   * Set additional context
   */
  setContext(name: string, context: Record<string, unknown>): void {
    if (!this.sentry) return;

    this.sentry.configureScope((scope: SentryScope) => {
      scope.setContext(name, context);
    });
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category?: string,
    level?: 'debug' | 'info' | 'warning' | 'error',
    data?: Record<string, unknown>
  ): void {
    if (!this.sentry) return;

    this.sentry.addBreadcrumb({
      message,
      category: category || 'app',
      level: level || 'info',
      data,
    });
  }

  /**
   * Capture an error and send to Sentry
   */
  captureError(
    error: Error | AppError,
    context?: ErrorContext
  ): string | null {
    // Always log to console in development
    if (__DEV__) {
      console.error('[Error]', error);
      if (context) {
        console.error('[Error Context]', context);
      }
    }

    if (!this.sentry) {
      return null;
    }

    let eventId: string | null = null;

    this.sentry.withScope((scope: SentryScope) => {
      // Set severity level
      if (error instanceof AppError) {
        scope.setLevel(this.mapSeverityToLevel(error.severity));
        scope.setTag('error_code', error.code);
        scope.setTag('error_category', error.category);
        scope.setTag('is_recoverable', String(error.isRecoverable));

        // Add error-specific context
        if (error.context) {
          Object.entries(error.context).forEach(([key, value]) => {
            if (key === 'extra' && typeof value === 'object') {
              Object.entries(value as Record<string, unknown>).forEach(
                ([extraKey, extraValue]) => {
                  scope.setExtra(extraKey, extraValue);
                }
              );
            } else {
              scope.setExtra(key, value);
            }
          });
        }
      }

      // Add additional context
      if (context) {
        if (context.component) {
          scope.setTag('component', context.component);
        }
        if (context.action) {
          scope.setTag('action', context.action);
        }
        if (context.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
      }

      // Add session context
      scope.setExtra('sessionId', this.sessionId);

      // Capture the error
      eventId = this.sentry!.captureException(error);
    });

    return eventId;
  }

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info'
  ): string | null {
    if (__DEV__) {
      console.log(`[${level.toUpperCase()}]`, message);
    }

    if (!this.sentry) {
      return null;
    }

    return this.sentry.captureMessage(message, level);
  }

  /**
   * Start a performance transaction
   */
  startTransaction(_name: string, _op: string): SentryTransaction | null {
    if (!this.sentry) {
      return null;
    }

    // Return mock transaction if Sentry not available
    return {
      finish: () => {},
      setData: () => {},
      setTag: () => {},
      startChild: () => ({
        finish: () => {},
      }),
    };
  }

  /**
   * Wrap a function to capture errors
   */
  wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context?: ErrorContext
  ): T {
    const self = this;
    return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
      try {
        const result = fn.apply(this, args);

        // Handle promises
        if (result instanceof Promise) {
          return result.catch((error: Error) => {
            self.captureError(error, context);
            throw error;
          }) as ReturnType<T>;
        }

        return result as ReturnType<T>;
      } catch (error) {
        self.captureError(error as Error, context);
        throw error;
      }
    } as T;
  }
}

// ============================================
// Singleton Export
// ============================================

export const sentryService = new SentryService();

// ============================================
// Convenience Functions
// ============================================

export const initializeSentry = () => sentryService.initialize();
export const captureError = (error: Error | AppError, context?: ErrorContext) =>
  sentryService.captureError(error, context);
export const captureMessage = (message: string, level?: 'debug' | 'info' | 'warning' | 'error') =>
  sentryService.captureMessage(message, level);
export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: 'debug' | 'info' | 'warning' | 'error',
  data?: Record<string, unknown>
) => sentryService.addBreadcrumb(message, category, level, data);
export const setUser = (userId: string | null, email?: string) =>
  sentryService.setUser(userId, email);
export const setContext = (name: string, context: Record<string, unknown>) =>
  sentryService.setContext(name, context);
