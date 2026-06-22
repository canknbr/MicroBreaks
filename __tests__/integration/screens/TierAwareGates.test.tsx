import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { render } from '@/__tests__/utils/test-utils';
import BreaksScreen from '@/app/(tabs)/breaks';
import ProfileScreen from '@/app/(tabs)/profile';
import StatsScreen from '@/app/(tabs)/stats';
import { useStatsData } from '@/hooks/useStatsData';
import type { ServerEntitlementView } from '@/hooks/useServerEntitlement';
import { EMPTY_ENTITLEMENT } from '@/services/entitlements/types';
import { useSettingsStore } from '@/store/settingsStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useUserStore } from '@/store/userStore';

// The server ledger is the trusted source of truth. We force it to
// "loaded + free" so it diverges from the optimistic local store, which
// each test sets to premium. A tier-AWARE gate must trust the server and
// stay locked; a tier-BLIND gate that reads the local store status would
// wrongly unlock — that's the monetization-bypass these tests pin down.
let mockServerEntitlement: ServerEntitlementView;
jest.mock('@/hooks/useServerEntitlement', () => ({
  useServerEntitlement: () => mockServerEntitlement,
}));

jest.mock('@/hooks/useStatsData', () => ({
  useStatsData: jest.fn(),
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    settings: {
      enabled: true,
      breakReminders: true,
      reminderIntervalMinutes: 25,
      streakAlerts: true,
      goalNotifications: true,
      quietHoursEnabled: true,
      quietHoursStart: 22,
      quietHoursEnd: 8,
    },
    isLoading: false,
    hasPermission: true,
    requestPermission: jest.fn(),
    updateSettings: jest.fn(),
    toggleNotifications: jest.fn(),
    toggleBreakReminders: jest.fn(),
    toggleStreakAlerts: jest.fn(),
    toggleGoalNotifications: jest.fn(),
    setReminderInterval: jest.fn(),
    toggleQuietHours: jest.fn(),
    setQuietHours: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAchievements', () => ({
  useAchievements: () => ({
    unlockedAchievements: [],
    stats: { total: 0, unlocked: 0, percentage: 0, totalXP: 0, earnedXP: 0 },
    nextToUnlock: [],
  }),
}));

jest.mock('@/store/timerStore', () => ({
  useTimerPreferences: () => ({ autoStartBreak: false, autoStartWork: false }),
  useTimerActions: () => ({
    toggleAutoStartBreak: jest.fn(),
    toggleAutoStartWork: jest.fn(),
  }),
}));

const mockUseStatsData = useStatsData as jest.MockedFunction<typeof useStatsData>;

describe('tier-aware gates trust the server ledger over local subscription status', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    (router.push as jest.Mock).mockClear();

    // Server says free and has answered — this is the trusted truth.
    mockServerEntitlement = {
      entitlement: { ...EMPTY_ENTITLEMENT, tier: 'free' },
      loaded: true,
    };

    act(() => {
      useSubscriptionStore.getState().resetSubscription();
      // Local store optimistically (or stale-y, e.g. post-refund) claims premium.
      useSubscriptionStore.getState().setCustomerState({
        status: 'premium',
        entitlementId: 'pro',
        activeOfferId: 'pro_annual',
      });

      useUserStore.setState((state) => ({
        ...state,
        profile: { ...state.profile, name: 'User', avatar: null, email: null },
        progress: {
          ...state.progress,
          level: 1,
          totalXP: 0,
          totalBreaks: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyGoal: 35,
          dailyGoal: 5,
        },
        preferences: { favoriteBreaks: [], recentBreaks: [] },
        achievements: {
          unlockedIds: [],
          unlockedAt: {},
          categoryBreaks: {},
          totalMinutes: 0,
        },
        isAuthenticated: false,
      }));

      useSettingsStore.setState((state) => ({
        ...state,
        settings: { ...state.settings, theme: 'dark' },
        settingsUpdatedAt: 0,
      }));
    });

    mockUseStatsData.mockReturnValue({
      totalBreaks: 3,
      totalMinutes: 9,
      currentStreak: 2,
      longestStreak: 4,
      todayBreaks: 1,
      weekBreaks: 3,
      xpEarned: 30,
      level: 1,
      weeklyGoal: 35,
      weeklyProgress: 3,
      chartData: [],
      breakTypes: [],
      timePatterns: [],
      recentBreaks: [],
      weeklyRecoveryReport: null,
      recoveryInsights: [],
      isLoading: false,
      refresh: jest.fn(),
    });
  });

  it('keeps the full break library locked when the server says free though local claims premium', () => {
    render(<BreaksScreen />);

    // Locked state renders the upsell card. A tier-blind gate reading the
    // local premium status would hide it.
    expect(screen.getByText('Preview Pro Library')).toBeTruthy();
  });

  it('gates non-week stats periods when the server says free though local claims premium', () => {
    render(<StatsScreen />);

    fireEvent.press(screen.getByText('Month'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/subscription',
      params: { placement: 'stats' },
    });
  });

  it('shows the profile upgrade CTA when the server says free though local claims premium', () => {
    render(<ProfileScreen />);

    expect(screen.getByLabelText(/Go Pro\./i)).toBeTruthy();
  });
});
