/**
 * Test Utilities for MicroBreaks
 * Premium-level testing helpers with providers and factories
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ============================================
// Custom Render with Providers
// ============================================

interface AllTheProvidersProps {
  children: ReactNode;
}

/**
 * Wraps components with all necessary providers for testing
 */
function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 59, left: 0, right: 0, bottom: 34 },
        }}
      >
        {children}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Custom render function that wraps component with all providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// ============================================
// Store Test Helpers
// ============================================

/**
 * Reset all Zustand stores to initial state
 */
export async function resetAllStores() {
  // Dynamic imports to avoid circular dependencies
  const { useUserStore } = await import('@/store/userStore');
  const { useSettingsStore } = await import('@/store/settingsStore');
  const { useOnboardingStore } = await import('@/store/onboardingStore');
  const { useNotificationStore } = await import('@/store/notificationStore');

  // Reset each store
  useUserStore.setState(useUserStore.getInitialState?.() || {});
  useSettingsStore.setState(useSettingsStore.getInitialState?.() || {});
  useOnboardingStore.setState(useOnboardingStore.getInitialState?.() || {});
  useNotificationStore.setState(useNotificationStore.getInitialState?.() || {});
}

/**
 * Create a store mock helper
 */
export function createStoreMock<T extends object>(initialState: T) {
  let state = { ...initialState };

  return {
    getState: () => state,
    setState: (partial: Partial<T>) => {
      state = { ...state, ...partial };
    },
    subscribe: jest.fn(() => jest.fn()),
    destroy: jest.fn(),
    reset: () => {
      state = { ...initialState };
    },
  };
}

// ============================================
// Async Helpers
// ============================================

/**
 * Wait for a condition to be true
 */
export function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('waitFor timeout'));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}

/**
 * Wait for next tick
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Flush all pending promises
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

/**
 * Wait for specified milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Mock Data Factories
// ============================================

/**
 * Create mock user profile
 */
export function createMockUserProfile(overrides = {}) {
  return {
    name: 'Test User',
    avatar: null,
    email: 'test@example.com',
    joinedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock user progress
 */
export function createMockUserProgress(overrides = {}) {
  return {
    level: 1,
    totalXP: 0,
    totalBreaks: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyGoal: 35,
    dailyGoal: 5,
    ...overrides,
  };
}

/**
 * Create mock exercise
 */
export function createMockExercise(overrides = {}) {
  return {
    id: 'test-exercise-1',
    title: 'Test Exercise',
    description: 'A test exercise for testing',
    category: 'quick',
    totalDuration: 60,
    color: '#06FFA5',
    icon: 'eye',
    steps: [
      {
        id: 'step-1',
        instruction: 'Step 1 instruction',
        voiceInstruction: 'Step 1 voice instruction',
        duration: 30,
        animation: 'breathing',
        visualGuide: 'circle',
      },
      {
        id: 'step-2',
        instruction: 'Step 2 instruction',
        voiceInstruction: 'Step 2 voice instruction',
        duration: 30,
        animation: 'breathing',
        visualGuide: 'circle',
      },
    ],
    ...overrides,
  };
}

/**
 * Create mock achievement
 */
export function createMockAchievement(overrides = {}) {
  return {
    id: 'test-achievement-1',
    title: 'Test Achievement',
    description: 'A test achievement',
    icon: 'trophy',
    category: 'breaks',
    xpReward: 50,
    requirement: {
      type: 'breaks',
      count: 10,
    },
    ...overrides,
  };
}

/**
 * Create mock notification
 */
export function createMockNotification(overrides = {}) {
  return {
    id: `notification-${Date.now()}`,
    type: 'break_reminder' as const,
    title: 'Test Notification',
    body: 'This is a test notification',
    timestamp: new Date().toISOString(),
    read: false,
    data: {},
    ...overrides,
  };
}

/**
 * Create mock app settings
 */
export function createMockSettings(overrides = {}) {
  return {
    theme: 'dark' as const,
    accentColor: '#06FFA5',
    soundEnabled: true,
    hapticsEnabled: true,
    voiceGuidanceEnabled: true,
    notificationsEnabled: true,
    breakReminders: true,
    reminderIntervalMinutes: 25,
    streakAlerts: true,
    goalNotifications: true,
    quietHoursEnabled: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    workDaysOnly: true,
    workDays: [1, 2, 3, 4, 5],
    defaultBreakDuration: 60,
    autoStartNextStep: true,
    showStepPreview: true,
    analyticsEnabled: true,
    crashReportingEnabled: true,
    ...overrides,
  };
}

// ============================================
// Navigation Helpers
// ============================================

/**
 * Create mock router
 */
export function createMockRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    setParams: jest.fn(),
  };
}

/**
 * Create mock navigation
 */
export function createMockNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => true),
  };
}

// ============================================
// Event Helpers
// ============================================

/**
 * Create mock press event
 */
export function createMockPressEvent() {
  return {
    nativeEvent: {
      locationX: 0,
      locationY: 0,
      pageX: 0,
      pageY: 0,
      timestamp: Date.now(),
    },
    persist: jest.fn(),
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  };
}

/**
 * Create mock layout event
 */
export function createMockLayoutEvent(width = 390, height = 844) {
  return {
    nativeEvent: {
      layout: {
        width,
        height,
        x: 0,
        y: 0,
      },
    },
  };
}

// ============================================
// Exports
// ============================================

// Re-export everything from testing-library
export * from '@testing-library/react-native';

// Export custom render as default render
export { customRender as render };
