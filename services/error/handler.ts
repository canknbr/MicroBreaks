/**
 * Global Error Handler
 * Centralized error handling with recovery strategies
 */

import { Alert, Platform } from 'react-native';
import {
  AppError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  ErrorFactory,
  NetworkError,
  StorageError,
  ValidationError,
} from './types';
import { captureError, addBreadcrumb } from '../firebase/crashlytics-adapter';

// ============================================
// Error Handler Configuration
// ============================================

interface ErrorHandlerConfig {
  /** Show user-friendly alerts for errors */
  showAlerts: boolean;
  /** Log errors to console */
  logToConsole: boolean;
  /** Report errors to Sentry */
  reportToSentry: boolean;
  /** Custom error handlers by category */
  categoryHandlers?: Partial<
    Record<ErrorCategory, (error: AppError) => void>
  >;
}

const defaultConfig: ErrorHandlerConfig = {
  showAlerts: !__DEV__, // Show alerts in production
  logToConsole: __DEV__,
  reportToSentry: true,
};

// ============================================
// User-Friendly Error Messages
// ============================================

const userMessages: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]:
    'Unable to connect to the server. Please check your internet connection and try again.',
  [ErrorCategory.STORAGE]:
    'There was a problem saving your data. Please try again.',
  [ErrorCategory.AUTH]:
    'Authentication failed. Please sign in again.',
  [ErrorCategory.VALIDATION]:
    'Please check your input and try again.',
  [ErrorCategory.NAVIGATION]:
    'Navigation error occurred. Please try again.',
  [ErrorCategory.NOTIFICATION]:
    'Unable to process notifications. Please check your settings.',
  [ErrorCategory.RENDER]:
    'Display error occurred. Please restart the app.',
  [ErrorCategory.BUSINESS]:
    'An error occurred. Please try again.',
  [ErrorCategory.UNKNOWN]:
    'Something went wrong. Please try again.',
};

// ============================================
// Global Error Handler Class
// ============================================

class GlobalErrorHandler {
  private config: ErrorHandlerConfig = defaultConfig;
  private errorQueue: AppError[] = [];
  private isProcessing = false;

  /**
   * Configure the error handler
   */
  configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Handle an error
   */
  handle(
    error: Error | AppError | unknown,
    context?: ErrorContext
  ): AppError {
    // Convert to AppError if needed
    const appError = ErrorFactory.fromUnknown(error, context);

    // Add to queue (cap at 50 to prevent memory leaks)
    if (this.errorQueue.length < 50) {
      this.errorQueue.push(appError);
    }

    // Process queue
    this.processQueue();

    return appError;
  }

  /**
   * Handle an error silently (no alerts)
   */
  handleSilent(
    error: Error | AppError | unknown,
    context?: ErrorContext
  ): AppError {
    const appError = ErrorFactory.fromUnknown(error, context);

    // Log and report, but don't alert
    if (this.config.logToConsole) {
      this.logError(appError);
    }

    if (this.config.reportToSentry) {
      captureError(appError, context);
    }

    return appError;
  }

  /**
   * Process error queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.errorQueue.length > 0) {
        const error = this.errorQueue.shift();
        if (error) {
          try {
            await this.processError(error);
          } catch (e) {
            // Prevent processError failure from blocking future errors
            if (__DEV__) {
              console.warn('[ErrorHandler] processError failed:', e);
            }
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single error
   */
  private async processError(error: AppError): Promise<void> {
    // Log to console
    if (this.config.logToConsole) {
      this.logError(error);
    }

    // Report to Sentry
    if (this.config.reportToSentry) {
      captureError(error, error.context);
    }

    // Run category-specific handler
    const categoryHandler = this.config.categoryHandlers?.[error.category];
    if (categoryHandler) {
      categoryHandler(error);
    }

    // Show alert for severe errors
    if (this.config.showAlerts && this.shouldShowAlert(error)) {
      await this.showErrorAlert(error);
    }
  }

  /**
   * Determine if we should show an alert
   */
  private shouldShowAlert(error: AppError): boolean {
    // Don't show for info or warning level
    if (
      error.severity === ErrorSeverity.INFO ||
      error.severity === ErrorSeverity.WARNING
    ) {
      return false;
    }

    // Always show for fatal errors
    if (error.severity === ErrorSeverity.FATAL) {
      return true;
    }

    // Don't show for validation errors (usually handled in UI)
    if (error.category === ErrorCategory.VALIDATION) {
      return false;
    }

    return true;
  }

  /**
   * Show error alert to user
   */
  private showErrorAlert(error: AppError): Promise<void> {
    return new Promise((resolve) => {
      const message = userMessages[error.category] || userMessages[ErrorCategory.UNKNOWN];
      const title = error.severity === ErrorSeverity.FATAL ? 'Critical Error' : 'Error';

      Alert.alert(
        title,
        message,
        [
          {
            text: 'OK',
            onPress: () => resolve(),
          },
        ],
        { cancelable: true, onDismiss: () => resolve() }
      );
    });
  }

  /**
   * Log error to console
   */
  private logError(error: AppError): void {
    const logData = {
      code: error.code,
      category: error.category,
      severity: error.severity,
      message: error.message,
      context: error.context,
      isRecoverable: error.isRecoverable,
    };

    switch (error.severity) {
      case ErrorSeverity.INFO:
        console.info('[Error]', logData);
        break;
      case ErrorSeverity.WARNING:
        console.warn('[Error]', logData);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.FATAL:
        console.error('[Error]', logData);
        if (error.stack) {
          console.error('[Stack]', error.stack);
        }
        break;
    }
  }

  /**
   * Create and handle a network error
   */
  network(
    message: string,
    options?: {
      statusCode?: number;
      url?: string;
      context?: ErrorContext;
      originalError?: Error;
    }
  ): NetworkError {
    const error = new NetworkError(message, options);
    this.handle(error);
    return error;
  }

  /**
   * Create and handle a storage error
   */
  storage(
    message: string,
    options?: {
      key?: string;
      operation?: 'read' | 'write' | 'delete';
      context?: ErrorContext;
      originalError?: Error;
    }
  ): StorageError {
    const error = new StorageError(message, options);
    this.handle(error);
    return error;
  }

  /**
   * Create and handle a validation error
   */
  validation(
    message: string,
    field?: string,
    value?: unknown
  ): ValidationError {
    const error = new ValidationError(message, { field, value });
    this.handleSilent(error); // Validation errors are usually shown in UI
    return error;
  }

  /**
   * Wrap an async function with error handling
   */
  wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: ErrorContext
  ): T {
    const handler = this;
    return async function (
      this: unknown,
      ...args: Parameters<T>
    ): Promise<ReturnType<T>> {
      try {
        return (await fn.apply(this, args)) as ReturnType<T>;
      } catch (error) {
        handler.handle(error, context);
        throw error;
      }
    } as T;
  }

  /**
   * Try to execute a function, handling errors
   */
  async tryAsync<T>(
    fn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
    try {
      const data = await fn();
      return { data, error: null };
    } catch (error) {
      const appError = this.handle(error, context);
      return { data: null, error: appError };
    }
  }

  /**
   * Try to execute a sync function, handling errors
   */
  try<T>(
    fn: () => T,
    context?: ErrorContext
  ): { data: T; error: null } | { data: null; error: AppError } {
    try {
      const data = fn();
      return { data, error: null };
    } catch (error) {
      const appError = this.handle(error, context);
      return { data: null, error: appError };
    }
  }
}

// ============================================
// Singleton Export
// ============================================

export const errorHandler = new GlobalErrorHandler();

// ============================================
// React Hook for Error Handling
// ============================================

import { useCallback } from 'react';

export function useErrorHandler(context?: ErrorContext) {
  const handle = useCallback(
    (error: Error | AppError | unknown) => {
      return errorHandler.handle(error, context);
    },
    [context]
  );

  const handleSilent = useCallback(
    (error: Error | AppError | unknown) => {
      return errorHandler.handleSilent(error, context);
    },
    [context]
  );

  const tryAsync = useCallback(
    <T>(fn: () => Promise<T>) => {
      return errorHandler.tryAsync(fn, context);
    },
    [context]
  );

  return {
    handle,
    handleSilent,
    tryAsync,
    network: errorHandler.network.bind(errorHandler),
    storage: errorHandler.storage.bind(errorHandler),
    validation: errorHandler.validation.bind(errorHandler),
  };
}

// ============================================
// Global Error Listeners Setup
// ============================================

export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  const originalHandler = (global as { ErrorUtils?: { setGlobalHandler: (handler: (error: Error, isFatal: boolean) => void) => void } }).ErrorUtils;

  if (originalHandler && typeof originalHandler.setGlobalHandler === 'function') {
    originalHandler.setGlobalHandler((error: Error, isFatal: boolean) => {
      addBreadcrumb(
        `Global error: ${error.message}`,
        'error',
        isFatal ? 'fatal' : 'error',
        { isFatal }
      );

      errorHandler.handle(error, {
        extra: { isFatal, source: 'globalHandler' },
      });

      // Let React Native handle fatal errors
      if (isFatal) {
        console.error('Fatal error:', error);
      }
    });
  }

  // Add console error tracking in dev
  if (__DEV__) {
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      // Track console errors as breadcrumbs
      const message = args.map((arg) =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      addBreadcrumb(message.slice(0, 200), 'console', 'error');
      originalConsoleError.apply(console, args);
    };
  }
}

export default errorHandler;
