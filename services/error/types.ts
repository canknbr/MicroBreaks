/**
 * Error Types and Classes
 * Premium-level error classification system
 */

// ============================================
// Error Severity Levels
// ============================================

export enum ErrorSeverity {
  /** Informational - logged but not alerted */
  INFO = 'info',
  /** Warning - potential issues that don't break functionality */
  WARNING = 'warning',
  /** Error - functionality impaired but app continues */
  ERROR = 'error',
  /** Fatal - app cannot continue, requires restart */
  FATAL = 'fatal',
}

// ============================================
// Error Categories
// ============================================

export enum ErrorCategory {
  /** Network-related errors (API, connectivity) */
  NETWORK = 'network',
  /** Storage errors (AsyncStorage, database) */
  STORAGE = 'storage',
  /** Authentication/authorization errors */
  AUTH = 'auth',
  /** Validation/input errors */
  VALIDATION = 'validation',
  /** Navigation errors */
  NAVIGATION = 'navigation',
  /** Notification system errors */
  NOTIFICATION = 'notification',
  /** Animation/rendering errors */
  RENDER = 'render',
  /** Business logic errors */
  BUSINESS = 'business',
  /** Unknown/uncategorized errors */
  UNKNOWN = 'unknown',
}

// ============================================
// Error Context
// ============================================

export interface ErrorContext {
  /** Component or screen where error occurred */
  component?: string;
  /** User action that triggered the error */
  action?: string;
  /** Additional contextual data */
  extra?: Record<string, unknown>;
  /** User ID if available */
  userId?: string;
  /** Session ID */
  sessionId?: string;
  /** Timestamp */
  timestamp?: string;
}

// ============================================
// Base App Error Class
// ============================================

export class AppError extends Error {
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly isRecoverable: boolean;
  public readonly originalError?: Error;

  constructor(
    message: string,
    options: {
      code?: string;
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      context?: ErrorContext;
      isRecoverable?: boolean;
      originalError?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.context = {
      ...options.context,
      timestamp: new Date().toISOString(),
    };
    this.isRecoverable = options.isRecoverable ?? true;
    this.originalError = options.originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /** Convert to plain object for logging */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      context: this.context,
      isRecoverable: this.isRecoverable,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }
}

// ============================================
// Specific Error Classes
// ============================================

/** Network-related errors */
export class NetworkError extends AppError {
  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      url?: string;
      context?: ErrorContext;
      originalError?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'NETWORK_ERROR',
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.NETWORK,
      context: {
        ...options.context,
        extra: {
          ...options.context?.extra,
          statusCode: options.statusCode,
          url: options.url,
        },
      },
      isRecoverable: true,
      originalError: options.originalError,
    });
    this.name = 'NetworkError';
  }
}

/** Storage-related errors */
export class StorageError extends AppError {
  constructor(
    message: string,
    options: {
      code?: string;
      key?: string;
      operation?: 'read' | 'write' | 'delete';
      context?: ErrorContext;
      originalError?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'STORAGE_ERROR',
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.STORAGE,
      context: {
        ...options.context,
        extra: {
          ...options.context?.extra,
          key: options.key,
          operation: options.operation,
        },
      },
      isRecoverable: true,
      originalError: options.originalError,
    });
    this.name = 'StorageError';
  }
}

/** Validation errors */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    message: string,
    options: {
      code?: string;
      field?: string;
      value?: unknown;
      context?: ErrorContext;
    } = {}
  ) {
    super(message, {
      code: options.code || 'VALIDATION_ERROR',
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.VALIDATION,
      context: options.context,
      isRecoverable: true,
    });
    this.name = 'ValidationError';
    this.field = options.field;
    this.value = options.value;
  }
}

/** Notification system errors */
export class NotificationError extends AppError {
  constructor(
    message: string,
    options: {
      code?: string;
      notificationType?: string;
      context?: ErrorContext;
      originalError?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'NOTIFICATION_ERROR',
      severity: ErrorSeverity.WARNING,
      category: ErrorCategory.NOTIFICATION,
      context: {
        ...options.context,
        extra: {
          ...options.context?.extra,
          notificationType: options.notificationType,
        },
      },
      isRecoverable: true,
      originalError: options.originalError,
    });
    this.name = 'NotificationError';
  }
}

/** Render/UI errors */
export class RenderError extends AppError {
  constructor(
    message: string,
    options: {
      code?: string;
      componentStack?: string;
      context?: ErrorContext;
      originalError?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'RENDER_ERROR',
      severity: ErrorSeverity.ERROR,
      category: ErrorCategory.RENDER,
      context: {
        ...options.context,
        extra: {
          ...options.context?.extra,
          componentStack: options.componentStack,
        },
      },
      isRecoverable: false,
      originalError: options.originalError,
    });
    this.name = 'RenderError';
  }
}

/** Fatal errors that require app restart */
export class FatalError extends AppError {
  constructor(
    message: string,
    options: {
      code?: string;
      context?: ErrorContext;
      originalError?: Error;
    } = {}
  ) {
    super(message, {
      code: options.code || 'FATAL_ERROR',
      severity: ErrorSeverity.FATAL,
      category: ErrorCategory.UNKNOWN,
      context: options.context,
      isRecoverable: false,
      originalError: options.originalError,
    });
    this.name = 'FatalError';
  }
}

// ============================================
// Error Factory
// ============================================

export const ErrorFactory = {
  /** Create error from unknown caught value */
  fromUnknown(error: unknown, context?: ErrorContext): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(error.message, {
        code: 'UNKNOWN_ERROR',
        context,
        originalError: error,
      });
    }

    if (typeof error === 'string') {
      return new AppError(error, {
        code: 'STRING_ERROR',
        context,
      });
    }

    return new AppError('An unknown error occurred', {
      code: 'UNKNOWN_ERROR',
      context: {
        ...context,
        extra: {
          ...context?.extra,
          rawError: String(error),
        },
      },
    });
  },

  /** Create network error from fetch response */
  fromResponse(response: Response, context?: ErrorContext): NetworkError {
    return new NetworkError(
      `Request failed with status ${response.status}`,
      {
        statusCode: response.status,
        url: response.url,
        context,
      }
    );
  },

  /** Create validation error */
  validation(message: string, field?: string, value?: unknown): ValidationError {
    return new ValidationError(message, { field, value });
  },
};
