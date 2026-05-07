/**
 * Error Boundary Components
 * Premium-level error handling with recovery options
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { captureError, addBreadcrumb } from '@/services/firebase/crashlytics-adapter';
import { RenderError } from '@/services/error/types';

// ============================================
// Types
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI component */
  fallback?: ReactNode | ((_error: Error, _reset: () => void) => ReactNode);
  /** Callback when error occurs */
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void;
  /** Component name for error context */
  componentName?: string;
  /** Whether to show detailed error in dev */
  showDetails?: boolean;
  /** Custom recovery action */
  onRecovery?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================
// Animated Button Component
// ============================================

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.buttonText,
            isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// ============================================
// Default Error Fallback UI
// ============================================

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  showDetails?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
  showDetails = __DEV__,
}) => {
  const [showStack, setShowStack] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f1a']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Icon */}
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.iconContainer}
          >
            <View style={styles.iconBackground}>
              <Text style={styles.icon}>!</Text>
            </View>
          </Animated.View>

          {/* Error Title */}
          <Animated.Text
            entering={FadeInUp.delay(100).duration(400)}
            style={styles.title}
          >
            Something went wrong
          </Animated.Text>

          {/* Error Message */}
          <Animated.Text
            entering={FadeInUp.delay(200).duration(400)}
            style={styles.message}
          >
            We apologize for the inconvenience. The app encountered an unexpected error.
          </Animated.Text>

          {/* Error Details (Dev Only) */}
          {showDetails && (
            <Animated.View
              entering={FadeInUp.delay(300).duration(400)}
              style={styles.detailsContainer}
            >
              <Pressable
                onPress={() => setShowStack(!showStack)}
                style={styles.detailsHeader}
              >
                <Text style={styles.detailsTitle}>
                  {showStack ? 'Hide' : 'Show'} Error Details
                </Text>
                <Text style={styles.chevron}>{showStack ? '▼' : '▶'}</Text>
              </Pressable>

              {showStack && (
                <View style={styles.stackContainer}>
                  <Text style={styles.errorName}>{error.name}</Text>
                  <Text style={styles.errorMessage}>{error.message}</Text>
                  {errorInfo?.componentStack && (
                    <Text style={styles.stackTrace}>
                      {errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              )}
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(400)}
            style={styles.buttonContainer}
          >
            <AnimatedButton
              onPress={onReset}
              title="Try Again"
              variant="primary"
            />
          </Animated.View>

          {/* Help Text */}
          <Animated.Text
            entering={FadeInUp.delay(500).duration(400)}
            style={styles.helpText}
          >
            If the problem persists, please restart the app or contact support.
          </Animated.Text>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// ============================================
// Main Error Boundary Class
// ============================================

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, componentName } = this.props;

    // Update state with error info
    this.setState({ errorInfo });

    // Create structured error
    const renderError = new RenderError(error.message, {
      code: 'REACT_ERROR_BOUNDARY',
      componentStack: errorInfo.componentStack || undefined,
      context: {
        component: componentName,
      },
      originalError: error,
    });

    // Add breadcrumb
    addBreadcrumb(
      `Error boundary caught error in ${componentName || 'unknown component'}`,
      'error',
      'error',
      {
        errorMessage: error.message,
        componentStack: errorInfo.componentStack,
      }
    );

    // Report to Sentry
    captureError(renderError, {
      component: componentName,
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    const { onRecovery } = this.props;

    addBreadcrumb('Error boundary reset', 'ui', 'info');

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (onRecovery) {
      onRecovery();
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }

      // Default fallback
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.resetError}
          showDetails={showDetails}
        />
      );
    }

    return children;
  }
}

// ============================================
// Specialized Error Boundaries
// ============================================

/**
 * App-level error boundary with full-screen fallback
 */
export const AppErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <ErrorBoundary
    componentName="App"
    showDetails={__DEV__}
    onError={(error, errorInfo) => {
      console.error('[AppErrorBoundary]', error, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Screen-level error boundary
 */
export const ScreenErrorBoundary: React.FC<{
  children: ReactNode;
  screenName: string;
}> = ({ children, screenName }) => (
  <ErrorBoundary
    componentName={`Screen:${screenName}`}
    showDetails={__DEV__}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Component-level error boundary with minimal fallback
 */
export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode;
}> = ({ children, componentName, fallback }) => (
  <ErrorBoundary
    componentName={componentName}
    fallback={
      fallback || (
        <View style={styles.minimalFallback}>
          <Text style={styles.minimalFallbackText}>
            Unable to load this section
          </Text>
        </View>
      )
    }
  >
    {children}
  </ErrorBoundary>
);

// ============================================
// Styles
// ============================================

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  icon: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.85,
    marginBottom: 32,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 32,
    overflow: 'hidden',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chevron: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  stackContainer: {
    padding: 16,
    paddingTop: 0,
  },
  errorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  stackTrace: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#06FFA5',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#000000',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  minimalFallback: {
    padding: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  minimalFallbackText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});

export default ErrorBoundary;
