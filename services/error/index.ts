/**
 * Error Services - Main Export
 * Premium-level error handling infrastructure
 */

// Error Types
export {
  ErrorSeverity,
  ErrorCategory,
  AppError,
  NetworkError,
  StorageError,
  ValidationError,
  NotificationError,
  RenderError,
  FatalError,
  ErrorFactory,
  type ErrorContext,
} from './types';

// Crashlytics Integration (replaced Sentry)
export {
  crashlyticsService as sentryService,
  initializeCrashlytics as initializeSentry,
  captureError,
  captureMessage,
  addBreadcrumb,
  setUser,
  setContext,
} from '../firebase/crashlytics-adapter';

// Global Error Handler
export {
  errorHandler,
  useErrorHandler,
  setupGlobalErrorHandlers,
} from './handler';
