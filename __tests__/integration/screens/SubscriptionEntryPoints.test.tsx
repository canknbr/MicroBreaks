import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { render } from '@/__tests__/utils/test-utils';
import BreaksScreen from '@/app/(tabs)/breaks';
import ProfileScreen from '@/app/(tabs)/profile';
import StatsScreen from '@/app/(tabs)/stats';
import { useStatsData } from '@/hooks/useStatsData';
import { useSettingsStore } from '@/store/settingsStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useUserStore } from '@/store/userStore';

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
    stats: {
      total: 0,
      unlocked: 0,
      percentage: 0,
      totalXP: 0,
      earnedXP: 0,
    },
    nextToUnlock: [],
  }),
}));

jest.mock('@/store/timerStore', () => ({
  useTimerPreferences: () => ({
    autoStartBreak: false,
    autoStartWork: false,
    soundEnabled: true,
    vibrationEnabled: true,
  }),
  useTimerActions: () => ({
    toggleAutoStartBreak: jest.fn(),
    toggleAutoStartWork: jest.fn(),
    toggleTimerSound: jest.fn(),
    toggleTimerVibration: jest.fn(),
  }),
}));

const mockUseStatsData = useStatsData as jest.MockedFunction<typeof useStatsData>;

describe('subscription entry points', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();

    act(() => {
      useSubscriptionStore.getState().resetSubscription();

      useUserStore.setState((state) => ({
        ...state,
        profile: {
          ...state.profile,
          name: 'User',
          avatar: null,
          email: null,
        },
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
      }));

      useSettingsStore.setState((state) => ({
        ...state,
        settings: {
          ...state.settings,
          theme: 'dark',
        },
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

  it('routes free users from the breaks upsell card to the subscription modal', () => {
    render(<BreaksScreen />);

    fireEvent.press(screen.getByText('Preview Pro Library'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/subscription',
      params: { placement: 'breaks' },
    });
  });

  it('routes locked breaks to the subscription modal instead of starting a session', () => {
    render(<BreaksScreen />);

    fireEvent.press(screen.getByLabelText(/Afternoon Reset,/i));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/subscription',
      params: { placement: 'breaks' },
    });
  });

  it('routes free users from locked stats periods to the subscription modal', () => {
    render(<StatsScreen />);

    fireEvent.press(screen.getByText('Month'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/subscription',
      params: { placement: 'stats' },
    });
  });

  it('routes free users from the stats upsell card to the subscription modal', () => {
    render(<StatsScreen />);

    fireEvent.press(screen.getByText('Preview Pro Analytics'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/subscription',
      params: { placement: 'stats' },
    });
  });

  it('routes the profile premium card to the subscription modal', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByLabelText(/Go Pro\./i));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/subscription',
      params: { placement: 'profile' },
    });
  });

  it('opens the link-account modal for anonymous users from profile', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByText('Secure My Progress'));

    expect(screen.getByText('Secure Your Progress')).toBeTruthy();
  });

  it('opens restore mode from profile for anonymous users', () => {
    render(<ProfileScreen />);

    fireEvent.press(screen.getByText('Restore Linked Account'));

    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByText('Restore Existing')).toBeTruthy();
  });
});
