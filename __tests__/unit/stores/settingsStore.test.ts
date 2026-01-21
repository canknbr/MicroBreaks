/**
 * Settings Store Unit Tests
 * Comprehensive tests for app settings state management
 */

import { act, renderHook } from '@testing-library/react-native';
import {
  useSettingsStore,
  useSettings,
  useThemeSetting,
  useSoundEnabled,
  useHapticsEnabled,
  useVoiceGuidanceEnabled,
  useNotificationsEnabled,
  useBreakReminders,
  useReminderInterval,
} from '@/store/settingsStore';

describe('SettingsStore', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useSettingsStore.getState().resetSettings();
    });
  });

  describe('Initial State', () => {
    it('should have correct default appearance settings', () => {
      const { settings } = useSettingsStore.getState();

      expect(settings.theme).toBe('dark');
      expect(settings.accentColor).toBe('#06FFA5');
    });

    it('should have correct default audio/haptic settings', () => {
      const { settings } = useSettingsStore.getState();

      expect(settings.soundEnabled).toBe(true);
      expect(settings.hapticsEnabled).toBe(true);
      expect(settings.voiceGuidanceEnabled).toBe(true);
    });

    it('should have correct default notification settings', () => {
      const { settings } = useSettingsStore.getState();

      expect(settings.notificationsEnabled).toBe(true);
      expect(settings.breakReminders).toBe(true);
      expect(settings.reminderIntervalMinutes).toBe(25);
      expect(settings.streakAlerts).toBe(true);
      expect(settings.goalNotifications).toBe(true);
    });

    it('should have correct default quiet hours settings', () => {
      const { settings } = useSettingsStore.getState();

      expect(settings.quietHoursEnabled).toBe(true);
      expect(settings.quietHoursStart).toBe(22);
      expect(settings.quietHoursEnd).toBe(8);
      expect(settings.workDaysOnly).toBe(true);
      expect(settings.workDays).toEqual([1, 2, 3, 4, 5]);
    });

    it('should have correct default break preferences', () => {
      const { settings } = useSettingsStore.getState();

      expect(settings.defaultBreakDuration).toBe(60);
      expect(settings.autoStartNextStep).toBe(true);
      expect(settings.showStepPreview).toBe(true);
    });

    it('should have correct default privacy settings', () => {
      const { settings } = useSettingsStore.getState();

      expect(settings.analyticsEnabled).toBe(true);
      expect(settings.crashReportingEnabled).toBe(true);
    });
  });

  describe('Update Settings', () => {
    it('should update multiple settings at once', () => {
      act(() => {
        useSettingsStore.getState().updateSettings({
          theme: 'light',
          soundEnabled: false,
          reminderIntervalMinutes: 30,
        });
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.theme).toBe('light');
      expect(settings.soundEnabled).toBe(false);
      expect(settings.reminderIntervalMinutes).toBe(30);
    });

    it('should preserve other settings when updating', () => {
      act(() => {
        useSettingsStore.getState().updateSettings({ theme: 'light' });
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.theme).toBe('light');
      expect(settings.hapticsEnabled).toBe(true); // Should be preserved
      expect(settings.notificationsEnabled).toBe(true); // Should be preserved
    });
  });

  describe('Toggle Actions', () => {
    it('should toggle sound on and off', () => {
      expect(useSettingsStore.getState().settings.soundEnabled).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleSound();
      });
      expect(useSettingsStore.getState().settings.soundEnabled).toBe(false);

      act(() => {
        useSettingsStore.getState().toggleSound();
      });
      expect(useSettingsStore.getState().settings.soundEnabled).toBe(true);
    });

    it('should toggle haptics on and off', () => {
      expect(useSettingsStore.getState().settings.hapticsEnabled).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleHaptics();
      });
      expect(useSettingsStore.getState().settings.hapticsEnabled).toBe(false);

      act(() => {
        useSettingsStore.getState().toggleHaptics();
      });
      expect(useSettingsStore.getState().settings.hapticsEnabled).toBe(true);
    });

    it('should toggle voice guidance on and off', () => {
      expect(useSettingsStore.getState().settings.voiceGuidanceEnabled).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleVoiceGuidance();
      });
      expect(useSettingsStore.getState().settings.voiceGuidanceEnabled).toBe(false);

      act(() => {
        useSettingsStore.getState().toggleVoiceGuidance();
      });
      expect(useSettingsStore.getState().settings.voiceGuidanceEnabled).toBe(true);
    });

    it('should toggle notifications on and off', () => {
      expect(useSettingsStore.getState().settings.notificationsEnabled).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleNotifications();
      });
      expect(useSettingsStore.getState().settings.notificationsEnabled).toBe(false);

      act(() => {
        useSettingsStore.getState().toggleNotifications();
      });
      expect(useSettingsStore.getState().settings.notificationsEnabled).toBe(true);
    });

    it('should toggle break reminders on and off', () => {
      expect(useSettingsStore.getState().settings.breakReminders).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleBreakReminders();
      });
      expect(useSettingsStore.getState().settings.breakReminders).toBe(false);

      act(() => {
        useSettingsStore.getState().toggleBreakReminders();
      });
      expect(useSettingsStore.getState().settings.breakReminders).toBe(true);
    });

    it('should toggle streak alerts on and off', () => {
      expect(useSettingsStore.getState().settings.streakAlerts).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleStreakAlerts();
      });
      expect(useSettingsStore.getState().settings.streakAlerts).toBe(false);

      act(() => {
        useSettingsStore.getState().toggleStreakAlerts();
      });
      expect(useSettingsStore.getState().settings.streakAlerts).toBe(true);
    });

    it('should toggle goal notifications on and off', () => {
      expect(useSettingsStore.getState().settings.goalNotifications).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleGoalNotifications();
      });
      expect(useSettingsStore.getState().settings.goalNotifications).toBe(false);

      act(() => {
        useSettingsStore.getState().toggleGoalNotifications();
      });
      expect(useSettingsStore.getState().settings.goalNotifications).toBe(true);
    });

    it('should toggle quiet hours on and off', () => {
      expect(useSettingsStore.getState().settings.quietHoursEnabled).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleQuietHours();
      });
      expect(useSettingsStore.getState().settings.quietHoursEnabled).toBe(false);

      act(() => {
        useSettingsStore.getState().toggleQuietHours();
      });
      expect(useSettingsStore.getState().settings.quietHoursEnabled).toBe(true);
    });
  });

  describe('Set Actions', () => {
    it('should set reminder interval', () => {
      act(() => {
        useSettingsStore.getState().setReminderInterval(45);
      });

      expect(useSettingsStore.getState().settings.reminderIntervalMinutes).toBe(45);
    });

    it('should set quiet hours', () => {
      act(() => {
        useSettingsStore.getState().setQuietHours(23, 7);
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.quietHoursStart).toBe(23);
      expect(settings.quietHoursEnd).toBe(7);
    });

    it('should set theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });
      expect(useSettingsStore.getState().settings.theme).toBe('light');

      act(() => {
        useSettingsStore.getState().setTheme('system');
      });
      expect(useSettingsStore.getState().settings.theme).toBe('system');

      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });
      expect(useSettingsStore.getState().settings.theme).toBe('dark');
    });
  });

  describe('Reset Settings', () => {
    it('should reset all settings to defaults', () => {
      // Modify many settings
      act(() => {
        useSettingsStore.getState().updateSettings({
          theme: 'light',
          soundEnabled: false,
          hapticsEnabled: false,
          voiceGuidanceEnabled: false,
          notificationsEnabled: false,
          reminderIntervalMinutes: 60,
          quietHoursStart: 20,
          quietHoursEnd: 10,
        });
      });

      // Reset
      act(() => {
        useSettingsStore.getState().resetSettings();
      });

      // Check all defaults are restored
      const { settings } = useSettingsStore.getState();
      expect(settings.theme).toBe('dark');
      expect(settings.soundEnabled).toBe(true);
      expect(settings.hapticsEnabled).toBe(true);
      expect(settings.voiceGuidanceEnabled).toBe(true);
      expect(settings.notificationsEnabled).toBe(true);
      expect(settings.reminderIntervalMinutes).toBe(25);
      expect(settings.quietHoursStart).toBe(22);
      expect(settings.quietHoursEnd).toBe(8);
    });
  });

  describe('Selectors', () => {
    it('should return all settings via useSettings hook', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.theme).toBe('dark');
      expect(result.current.soundEnabled).toBe(true);
    });

    it('should return theme via useThemeSetting hook', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      const { result } = renderHook(() => useThemeSetting());
      expect(result.current).toBe('light');
    });

    it('should return sound setting via useSoundEnabled hook', () => {
      const { result } = renderHook(() => useSoundEnabled());
      expect(result.current).toBe(true);

      act(() => {
        useSettingsStore.getState().toggleSound();
      });

      const { result: updatedResult } = renderHook(() => useSoundEnabled());
      expect(updatedResult.current).toBe(false);
    });

    it('should return haptics setting via useHapticsEnabled hook', () => {
      const { result } = renderHook(() => useHapticsEnabled());
      expect(result.current).toBe(true);
    });

    it('should return voice guidance setting via useVoiceGuidanceEnabled hook', () => {
      const { result } = renderHook(() => useVoiceGuidanceEnabled());
      expect(result.current).toBe(true);
    });

    it('should return notifications setting via useNotificationsEnabled hook', () => {
      const { result } = renderHook(() => useNotificationsEnabled());
      expect(result.current).toBe(true);
    });

    it('should return break reminders setting via useBreakReminders hook', () => {
      const { result } = renderHook(() => useBreakReminders());
      expect(result.current).toBe(true);
    });

    it('should return reminder interval via useReminderInterval hook', () => {
      act(() => {
        useSettingsStore.getState().setReminderInterval(30);
      });

      const { result } = renderHook(() => useReminderInterval());
      expect(result.current).toBe(30);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extreme reminder intervals', () => {
      act(() => {
        useSettingsStore.getState().setReminderInterval(1);
      });
      expect(useSettingsStore.getState().settings.reminderIntervalMinutes).toBe(1);

      act(() => {
        useSettingsStore.getState().setReminderInterval(180);
      });
      expect(useSettingsStore.getState().settings.reminderIntervalMinutes).toBe(180);
    });

    it('should handle overnight quiet hours', () => {
      act(() => {
        useSettingsStore.getState().setQuietHours(23, 6); // 11 PM to 6 AM
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.quietHoursStart).toBe(23);
      expect(settings.quietHoursEnd).toBe(6);
    });

    it('should handle same start and end quiet hours', () => {
      act(() => {
        useSettingsStore.getState().setQuietHours(12, 12);
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.quietHoursStart).toBe(12);
      expect(settings.quietHoursEnd).toBe(12);
    });

    it('should handle zero reminder interval', () => {
      act(() => {
        useSettingsStore.getState().setReminderInterval(0);
      });

      expect(useSettingsStore.getState().settings.reminderIntervalMinutes).toBe(0);
    });

    it('should handle boundary quiet hours values', () => {
      act(() => {
        useSettingsStore.getState().setQuietHours(0, 0);
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.quietHoursStart).toBe(0);
      expect(settings.quietHoursEnd).toBe(0);

      act(() => {
        useSettingsStore.getState().setQuietHours(23, 23);
      });

      const { settings: settings2 } = useSettingsStore.getState();
      expect(settings2.quietHoursStart).toBe(23);
      expect(settings2.quietHoursEnd).toBe(23);
    });

    it('should handle rapid toggle operations', () => {
      for (let i = 0; i < 10; i++) {
        act(() => {
          useSettingsStore.getState().toggleSound();
        });
      }

      // After 10 toggles (even number), should be back to true
      expect(useSettingsStore.getState().settings.soundEnabled).toBe(true);
    });

    it('should handle updating with empty object', () => {
      const originalSettings = { ...useSettingsStore.getState().settings };

      act(() => {
        useSettingsStore.getState().updateSettings({});
      });

      const newSettings = useSettingsStore.getState().settings;
      expect(newSettings).toEqual(originalSettings);
    });

    it('should handle concurrent toggle operations', () => {
      act(() => {
        useSettingsStore.getState().toggleSound();
        useSettingsStore.getState().toggleHaptics();
        useSettingsStore.getState().toggleVoiceGuidance();
        useSettingsStore.getState().toggleNotifications();
        useSettingsStore.getState().toggleBreakReminders();
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.soundEnabled).toBe(false);
      expect(settings.hapticsEnabled).toBe(false);
      expect(settings.voiceGuidanceEnabled).toBe(false);
      expect(settings.notificationsEnabled).toBe(false);
      expect(settings.breakReminders).toBe(false);
    });

    it('should handle updating all settings at once', () => {
      act(() => {
        useSettingsStore.getState().updateSettings({
          theme: 'light',
          accentColor: '#FF0000',
          soundEnabled: false,
          hapticsEnabled: false,
          voiceGuidanceEnabled: false,
          notificationsEnabled: false,
          breakReminders: false,
          reminderIntervalMinutes: 60,
          streakAlerts: false,
          goalNotifications: false,
          quietHoursEnabled: false,
          quietHoursStart: 21,
          quietHoursEnd: 9,
          workDaysOnly: false,
          workDays: [0, 1, 2, 3, 4, 5, 6],
          defaultBreakDuration: 120,
          autoStartNextStep: false,
          showStepPreview: false,
          analyticsEnabled: false,
          crashReportingEnabled: false,
        });
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.theme).toBe('light');
      expect(settings.accentColor).toBe('#FF0000');
      expect(settings.soundEnabled).toBe(false);
      expect(settings.hapticsEnabled).toBe(false);
      expect(settings.workDays).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it('should preserve unchanged settings when updating partially', () => {
      const originalAccentColor = useSettingsStore.getState().settings.accentColor;

      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      expect(useSettingsStore.getState().settings.accentColor).toBe(originalAccentColor);
    });

    it('should handle special characters in accent color', () => {
      act(() => {
        useSettingsStore.getState().updateSettings({
          accentColor: 'rgb(255, 100, 50)',
        });
      });

      expect(useSettingsStore.getState().settings.accentColor).toBe('rgb(255, 100, 50)');
    });

    it('should handle very large reminder interval', () => {
      act(() => {
        useSettingsStore.getState().setReminderInterval(9999);
      });

      expect(useSettingsStore.getState().settings.reminderIntervalMinutes).toBe(9999);
    });

    it('should handle empty work days array', () => {
      act(() => {
        useSettingsStore.getState().updateSettings({
          workDays: [],
        });
      });

      expect(useSettingsStore.getState().settings.workDays).toEqual([]);
    });

    it('should handle all days in work days', () => {
      act(() => {
        useSettingsStore.getState().updateSettings({
          workDays: [0, 1, 2, 3, 4, 5, 6],
        });
      });

      expect(useSettingsStore.getState().settings.workDays).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it('should handle negative break duration', () => {
      act(() => {
        useSettingsStore.getState().updateSettings({
          defaultBreakDuration: -1,
        });
      });

      // Store doesn't validate, just stores the value
      expect(useSettingsStore.getState().settings.defaultBreakDuration).toBe(-1);
    });

    it('should handle zero break duration', () => {
      act(() => {
        useSettingsStore.getState().updateSettings({
          defaultBreakDuration: 0,
        });
      });

      expect(useSettingsStore.getState().settings.defaultBreakDuration).toBe(0);
    });
  });

  describe('Multiple Updates', () => {
    it('should apply multiple sequential updates correctly', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });
      act(() => {
        useSettingsStore.getState().setReminderInterval(30);
      });
      act(() => {
        useSettingsStore.getState().toggleSound();
      });
      act(() => {
        useSettingsStore.getState().setQuietHours(20, 6);
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.theme).toBe('light');
      expect(settings.reminderIntervalMinutes).toBe(30);
      expect(settings.soundEnabled).toBe(false);
      expect(settings.quietHoursStart).toBe(20);
      expect(settings.quietHoursEnd).toBe(6);
    });

    it('should override previous updates with new ones', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });
      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });
      act(() => {
        useSettingsStore.getState().setTheme('system');
      });

      expect(useSettingsStore.getState().settings.theme).toBe('system');
    });
  });
});
