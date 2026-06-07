/**
 * Firebase Crashlytics Adapter
 * Drop-in replacement for the Sentry service with the same interface.
 */

import crashlytics from '@react-native-firebase/crashlytics';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { generateId } from '@/utils/generateId';
import {
  AppError,
  ErrorContext,
} from '../error/types';

class CrashlyticsService {
  private isInitialized = false;
  private sessionId: string = generateId('session');

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const instance = crashlytics();

      // Set initial attributes
      await instance.setAttribute('platform', Platform.OS);
      await instance.setAttribute('app_version', Constants.expoConfig?.version || '1.0.0');
      await instance.setAttribute('session_id', this.sessionId);

      this.isInitialized = true;

      if (__DEV__) {
        console.log('[Crashlytics] Initialized successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[Crashlytics] Failed to initialize:', error);
      }
      throw error;
    }
  }

  setUser(userId: string | null): void {
    // We deliberately do NOT forward email / display name / any other PII to
    // Crashlytics. The Firebase UID is a pseudonymous identifier per GDPR
    // recital 26 — sufficient to correlate sessions without exposing personal
    // data in crash reports. The legacy second argument (email) is accepted
    // for callsite compatibility but ignored.
    try {
      if (userId) {
        crashlytics().setUserId(userId);
      } else {
        crashlytics().setUserId('');
      }
    } catch (error) {
      if (__DEV__) console.warn('[Crashlytics] Failed to set user:', error);
    }
  }

  setContext(name: string, context: Record<string, unknown>): void {
    try {
      const instance = crashlytics();
      for (const [key, value] of Object.entries(context)) {
        instance.setAttribute(`${name}_${key}`, String(value ?? ''));
      }
    } catch (error) {
      if (__DEV__) console.warn('[Crashlytics] Failed to set context:', error);
    }
  }

  addBreadcrumb(
    message: string,
    category?: string,
    _level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal',
    data?: Record<string, unknown>
  ): void {
    try {
      const logMessage = category ? `[${category}] ${message}` : message;
      crashlytics().log(
        data ? `${logMessage} ${JSON.stringify(data)}` : logMessage
      );
    } catch (error) {
      if (__DEV__) console.warn('[Crashlytics] Failed to add breadcrumb:', error);
    }
  }

  captureError(
    error: Error | AppError,
    context?: ErrorContext
  ): string | null {
    if (__DEV__) {
      console.error('[Error]', error);
      if (context) console.error('[Error Context]', context);
    }

    try {
      const instance = crashlytics();

      // Set error attributes
      if (error instanceof AppError) {
        instance.setAttribute('error_code', error.code);
        instance.setAttribute('error_category', error.category);
        instance.setAttribute('error_severity', String(error.severity));
        instance.setAttribute('is_recoverable', String(error.isRecoverable));
      }

      if (context) {
        if (context.component) instance.setAttribute('component', context.component);
        if (context.action) instance.setAttribute('action', context.action);
      }

      instance.setAttribute('session_id', this.sessionId);

      // Record the error
      instance.recordError(error);

      return this.sessionId;
    } catch (recordError) {
      if (__DEV__) console.warn('[Crashlytics] Failed to capture error:', recordError);
      return null;
    }
  }

  captureMessage(
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info'
  ): string | null {
    if (__DEV__) {
      console.log(`[${level.toUpperCase()}]`, message);
    }

    try {
      crashlytics().log(`[${level}] ${message}`);

      if (level === 'error' || level === 'warning') {
        crashlytics().recordError(new Error(message));
      }

      return this.sessionId;
    } catch (error) {
      if (__DEV__) console.warn('[Crashlytics] Failed to capture message:', error);
      return null;
    }
  }

  startTransaction(_name: string, _op: string) {
    // Crashlytics doesn't have transactions; use Firebase Performance instead if needed
    return {
      finish: () => {},
      setData: () => {},
      setTag: () => {},
      startChild: () => ({ finish: () => {} }),
    };
  }

  wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context?: ErrorContext
  ): T {
    const self = this;
    return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
      try {
        const result = fn.apply(this, args);
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

export const crashlyticsService = new CrashlyticsService();

// Convenience functions matching the Sentry export interface
export const initializeCrashlytics = () => crashlyticsService.initialize();
export const captureError = (error: Error | AppError, context?: ErrorContext) =>
  crashlyticsService.captureError(error, context);
export const captureMessage = (message: string, level?: 'debug' | 'info' | 'warning' | 'error') =>
  crashlyticsService.captureMessage(message, level);
export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal',
  data?: Record<string, unknown>
) => crashlyticsService.addBreadcrumb(message, category, level, data);
export const setUser = (userId: string | null, _legacyEmail?: string) =>
  crashlyticsService.setUser(userId);
export const setContext = (name: string, context: Record<string, unknown>) =>
  crashlyticsService.setContext(name, context);
