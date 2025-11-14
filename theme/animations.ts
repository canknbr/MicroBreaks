/**
 * Animation Design Tokens
 *
 * Timing functions and durations for consistent animations
 * Based on Material Design and iOS Human Interface Guidelines
 */

// Animation Durations (in milliseconds)
export const Duration = {
  instant: 0,
  fastest: 100,
  fast: 200,
  normal: 300,
  slow: 400,
  slower: 500,
  slowest: 700,

  // Semantic names
  quick: 150,
  standard: 250,
  complex: 375,
  emphasized: 500,
} as const;

// Component-specific durations
export const ComponentDuration = {
  tooltip: Duration.fast,
  fade: Duration.normal,
  slide: Duration.normal,
  scale: Duration.fast,
  collapse: Duration.normal,
  modal: Duration.normal,
  drawer: Duration.normal,
  ripple: Duration.fast,
  skeleton: 1500,
  spinner: 1000,
  breathingGuide: 4000, // For breathing exercises
} as const;

// Easing Functions
export const Easing = {
  // Standard ease functions
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Custom cubic-bezier curves (Material Design)
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Standard easing
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Deceleration
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)', // Acceleration
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)', // Sharp

  // iOS-like spring
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Smooth
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

// React Native Reanimated easing functions
export const ReanimatedEasing = {
  linear: { type: 'linear' },
  bezier: {
    standard: { type: 'bezier', x1: 0.4, y1: 0, x2: 0.2, y2: 1 },
    decelerate: { type: 'bezier', x1: 0, y1: 0, x2: 0.2, y2: 1 },
    accelerate: { type: 'bezier', x1: 0.4, y1: 0, x2: 1, y2: 1 },
    sharp: { type: 'bezier', x1: 0.4, y1: 0, x2: 0.6, y2: 1 },
  },
  spring: {
    // Spring configurations for react-native-reanimated
    gentle: { damping: 15, stiffness: 100 },
    standard: { damping: 20, stiffness: 150 },
    snappy: { damping: 25, stiffness: 200 },
    bouncy: { damping: 10, stiffness: 150 },
  },
} as const;

// Transition Types
export const Transition = {
  fade: {
    duration: Duration.normal,
    easing: Easing.easeInOut,
  },
  fadeIn: {
    duration: Duration.normal,
    easing: Easing.easeOut,
  },
  fadeOut: {
    duration: Duration.fast,
    easing: Easing.easeIn,
  },
  slide: {
    duration: Duration.normal,
    easing: Easing.easeInOut,
  },
  slideUp: {
    duration: Duration.normal,
    easing: Easing.decelerate,
  },
  slideDown: {
    duration: Duration.normal,
    easing: Easing.accelerate,
  },
  scale: {
    duration: Duration.fast,
    easing: Easing.spring,
  },
  scaleIn: {
    duration: Duration.fast,
    easing: Easing.decelerate,
  },
  scaleOut: {
    duration: Duration.fast,
    easing: Easing.accelerate,
  },
  collapse: {
    duration: Duration.normal,
    easing: Easing.standard,
  },
} as const;

// Screen Transition Animations
export const ScreenTransition = {
  // Modal presentations
  modal: {
    duration: Duration.normal,
    easing: Easing.decelerate,
  },
  // Stack navigation
  push: {
    duration: Duration.normal,
    easing: Easing.standard,
  },
  pop: {
    duration: Duration.fast,
    easing: Easing.accelerate,
  },
  // Bottom sheet
  bottomSheet: {
    duration: Duration.normal,
    easing: Easing.decelerate,
  },
} as const;

// Micro-interaction Timings
export const MicroInteraction = {
  buttonPress: {
    duration: Duration.fastest,
    scale: 0.95,
  },
  cardPress: {
    duration: Duration.fast,
    scale: 0.98,
  },
  ripple: {
    duration: Duration.fast,
    easing: Easing.easeOut,
  },
  hover: {
    duration: Duration.fast,
    easing: Easing.easeInOut,
  },
  focus: {
    duration: Duration.fast,
    easing: Easing.easeInOut,
  },
} as const;

// Loading & Progress Animations
export const LoadingAnimation = {
  spinner: {
    duration: 1000,
    easing: Easing.linear,
  },
  skeleton: {
    duration: 1500,
    easing: Easing.easeInOut,
  },
  progressBar: {
    duration: Duration.normal,
    easing: Easing.decelerate,
  },
  pulse: {
    duration: 1500,
    easing: Easing.easeInOut,
  },
} as const;

// Timer Circle Animation
export const TimerAnimation = {
  countdown: {
    duration: 1000, // Per second
    easing: Easing.linear,
  },
  complete: {
    duration: Duration.emphasized,
    easing: Easing.spring,
  },
  pause: {
    duration: Duration.fast,
    easing: Easing.easeOut,
  },
} as const;

// Break Animation Timings
export const BreakAnimation = {
  exerciseTransition: {
    duration: Duration.normal,
    easing: Easing.standard,
  },
  stepProgress: {
    duration: Duration.slow,
    easing: Easing.decelerate,
  },
  completion: {
    duration: Duration.emphasized,
    easing: Easing.spring,
  },
  breathingGuide: {
    inhale: 4000,
    hold: 4000,
    exhale: 4000,
    easing: Easing.easeInOut,
  },
} as const;

// Gesture Animation
export const GestureAnimation = {
  swipe: {
    duration: Duration.normal,
    velocityThreshold: 500,
  },
  pan: {
    duration: Duration.fast,
    dragThreshold: 10,
  },
  pinch: {
    duration: Duration.fast,
    scaleThreshold: 0.1,
  },
} as const;

// Celebration Animations
export const CelebrationAnimation = {
  confetti: {
    duration: 2000,
    particleCount: 50,
  },
  trophy: {
    duration: Duration.emphasized,
    easing: Easing.spring,
  },
  badge: {
    duration: Duration.emphasized,
    easing: Easing.bounce,
  },
  streak: {
    duration: 1500,
    easing: Easing.spring,
  },
} as const;

// Haptic Feedback Types (for use with Haptics API)
export const HapticFeedback = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
  selection: 'selection',
} as const;

// Reduced Motion (accessibility)
export const ReducedMotion = {
  duration: Duration.instant,
  enabled: false, // Should be set based on user preference
} as const;

// Animation Configs for React Native Animated
export const AnimatedConfig = {
  spring: {
    gentle: {
      tension: 100,
      friction: 15,
      useNativeDriver: true,
    },
    standard: {
      tension: 150,
      friction: 20,
      useNativeDriver: true,
    },
    snappy: {
      tension: 200,
      friction: 25,
      useNativeDriver: true,
    },
  },
  timing: {
    fast: {
      duration: Duration.fast,
      useNativeDriver: true,
    },
    normal: {
      duration: Duration.normal,
      useNativeDriver: true,
    },
    slow: {
      duration: Duration.slow,
      useNativeDriver: true,
    },
  },
} as const;

export type DurationValue = (typeof Duration)[keyof typeof Duration];
export type EasingValue = (typeof Easing)[keyof typeof Easing];
export type TransitionType = keyof typeof Transition;
