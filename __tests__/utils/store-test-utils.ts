/**
 * Store Testing Utilities
 * Helpers for testing Zustand stores with proper isolation
 */

import { act } from '@testing-library/react-native';

// ============================================
// Store Reset Utilities
// ============================================

/**
 * Generic store resetter that works with any Zustand store
 */
export function createStoreResetter<T>(
  useStore: {
    getState: () => T;
    setState: (state: Partial<T>) => void;
  },
  initialState: T
) {
  return () => {
    act(() => {
      useStore.setState(initialState);
    });
  };
}

/**
 * Create an isolated store for testing
 * This creates a fresh store instance for each test
 */
export function createIsolatedStore<T extends object>(
  createStore: () => { getState: () => T; setState: (partial: Partial<T>) => void }
) {
  let store = createStore();

  return {
    get current() {
      return store;
    },
    reset() {
      store = createStore();
    },
    getState() {
      return store.getState();
    },
    setState(partial: Partial<T>) {
      act(() => {
        store.setState(partial);
      });
    },
  };
}

// ============================================
// User Store Test Helpers
// ============================================

export const initialUserState = {
  profile: {
    name: 'User',
    avatar: null,
    email: null,
    joinedAt: new Date().toISOString(),
  },
  progress: {
    level: 1,
    totalXP: 0,
    totalBreaks: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyGoal: 35,
    dailyGoal: 5,
  },
  preferences: {
    favoriteBreaks: [],
    recentBreaks: [],
  },
  achievements: {
    unlockedIds: [],
    unlockedAt: {},
    categoryBreaks: {},
    totalMinutes: 0,
  },
  isAuthenticated: false,
};

/**
 * Create a user store with custom initial state
 */
export function createMockUserState(overrides: {
  profile?: Partial<typeof initialUserState.profile>;
  progress?: Partial<typeof initialUserState.progress>;
  preferences?: Partial<typeof initialUserState.preferences>;
  achievements?: Partial<typeof initialUserState.achievements>;
} = {}) {
  return {
    profile: { ...initialUserState.profile, ...overrides.profile },
    progress: { ...initialUserState.progress, ...overrides.progress },
    preferences: { ...initialUserState.preferences, ...overrides.preferences },
    achievements: { ...initialUserState.achievements, ...overrides.achievements },
    isAuthenticated: false,
  };
}

// ============================================
// Settings Store Test Helpers
// ============================================

export const initialSettingsState = {
  settings: {
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
  },
};

/**
 * Create settings state with custom values
 */
export function createMockSettingsState(
  overrides: Partial<typeof initialSettingsState.settings> = {}
) {
  return {
    settings: {
      ...initialSettingsState.settings,
      ...overrides,
    },
  };
}

// ============================================
// Notification Store Test Helpers
// ============================================

export const initialNotificationState = {
  notifications: [] as Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
  }>,
  unreadCount: 0,
};

/**
 * Create notification state with mock notifications
 */
export function createMockNotificationState(
  notifications: Array<{
    id?: string;
    type?: string;
    title?: string;
    body?: string;
    timestamp?: string;
    read?: boolean;
  }> = []
) {
  const fullNotifications = notifications.map((n, i) => ({
    id: n.id || `notification-${i}`,
    type: n.type || 'break_reminder',
    title: n.title || 'Test Notification',
    body: n.body || 'Test body',
    timestamp: n.timestamp || new Date().toISOString(),
    read: n.read ?? false,
  }));

  return {
    notifications: fullNotifications,
    unreadCount: fullNotifications.filter((n) => !n.read).length,
  };
}

// ============================================
// Onboarding Store Test Helpers
// ============================================

export const initialOnboardingState = {
  isComplete: false,
  currentStep: 0,
  data: {
    workRole: null,
    screenTime: null,
    painAreas: [],
    workPattern: null,
    energyPattern: null,
    breakStyle: [],
  },
};

/**
 * Create onboarding state
 */
export function createMockOnboardingState(overrides: {
  isComplete?: boolean;
  currentStep?: number;
  data?: Partial<typeof initialOnboardingState.data>;
} = {}) {
  return {
    isComplete: overrides.isComplete ?? false,
    currentStep: overrides.currentStep ?? 0,
    data: {
      ...initialOnboardingState.data,
      ...overrides.data,
    },
  };
}

// ============================================
// Async Store Action Helpers
// ============================================

/**
 * Helper to test async store actions
 */
export async function testAsyncAction<T>(
  action: () => Promise<T>,
  expectedResult?: T
): Promise<T> {
  let result: T;

  await act(async () => {
    result = await action();
  });

  if (expectedResult !== undefined) {
    expect(result!).toEqual(expectedResult);
  }

  return result!;
}

/**
 * Helper to test store state changes
 */
export function expectStoreState<T>(
  useStore: { getState: () => T },
  matcher: (state: T) => void
) {
  matcher(useStore.getState());
}
