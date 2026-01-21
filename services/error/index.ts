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

// Sentry Integration
export {
  sentryService,
  initializeSentry,
  captureError,
  captureMessage,
  addBreadcrumb,
  setUser,
  setContext,
} from './sentry';

// Global Error Handler
export {
  errorHandler,
  useErrorHandler,
  setupGlobalErrorHandlers,
} from './handler';
