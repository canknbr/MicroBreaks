/**
 * Settings Store
 * Manages app-wide settings with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  // Appearance
  theme: 'dark' | 'light' | 'system';
  accentColor: string;

  // Audio & Haptics
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  voiceGuidanceEnabled: boolean;

  // Notifications
  notificationsEnabled: boolean;
  breakReminders: boolean;
  reminderIntervalMinutes: number;
  streakAlerts: boolean;
  goalNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number; // 0-23
  quietHoursEnd: number; // 0-23
  workDaysOnly: boolean;
  workDays: number[]; // 0=Sunday, 6=Saturday

  // Break Preferences
  defaultBreakDuration: number; // seconds
  autoStartNextStep: boolean;
  showStepPreview: boolean;

  // Privacy
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
}

interface SettingsState {
  settings: AppSettings;

  // Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleVoiceGuidance: () => void;
  toggleNotifications: () => void;
  toggleBreakReminders: () => void;
  toggleStreakAlerts: () => void;
  toggleGoalNotifications: () => void;
  toggleQuietHours: () => void;
  setReminderInterval: (minutes: number) => void;
  setQuietHours: (start: number, end: number) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  // Appearance
  theme: 'dark',
  accentColor: '#06FFA5',

  // Audio & Haptics
  soundEnabled: true,
  hapticsEnabled: true,
  voiceGuidanceEnabled: true,

  // Notifications
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

  // Break Preferences
  defaultBreakDuration: 60,
  autoStartNextStep: true,
  showStepPreview: true,

  // Privacy
  analyticsEnabled: true,
  crashReportingEnabled: true,
};

// Granular selectors for performance optimization
export const useSettings = () => useSettingsStore((state) => state.settings);

// Individual setting selectors
export const useThemeSetting = () => useSettingsStore((state) => state.settings.theme);
export const useAccentColor = () => useSettingsStore((state) => state.settings.accentColor);
export const useSoundEnabled = () => useSettingsStore((state) => state.settings.soundEnabled);
export const useHapticsEnabled = () => useSettingsStore((state) => state.settings.hapticsEnabled);
export const useVoiceGuidanceEnabled = () => useSettingsStore((state) => state.settings.voiceGuidanceEnabled);
export const useNotificationsEnabled = () => useSettingsStore((state) => state.settings.notificationsEnabled);
export const useBreakReminders = () => useSettingsStore((state) => state.settings.breakReminders);
export const useReminderInterval = () => useSettingsStore((state) => state.settings.reminderIntervalMinutes);

// Action selectors (stable references)
export const useSettingsActions = () => useSettingsStore((state) => ({
  updateSettings: state.updateSettings,
  toggleSound: state.toggleSound,
  toggleHaptics: state.toggleHaptics,
  toggleVoiceGuidance: state.toggleVoiceGuidance,
  toggleNotifications: state.toggleNotifications,
  toggleBreakReminders: state.toggleBreakReminders,
  setReminderInterval: state.setReminderInterval,
  setTheme: state.setTheme,
}));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      toggleSound: () =>
        set((state) => ({
          settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
        })),

      toggleHaptics: () =>
        set((state) => ({
          settings: { ...state.settings, hapticsEnabled: !state.settings.hapticsEnabled },
        })),

      toggleVoiceGuidance: () =>
        set((state) => ({
          settings: { ...state.settings, voiceGuidanceEnabled: !state.settings.voiceGuidanceEnabled },
        })),

      toggleNotifications: () =>
        set((state) => ({
          settings: { ...state.settings, notificationsEnabled: !state.settings.notificationsEnabled },
        })),

      toggleBreakReminders: () =>
        set((state) => ({
          settings: { ...state.settings, breakReminders: !state.settings.breakReminders },
        })),

      toggleStreakAlerts: () =>
        set((state) => ({
          settings: { ...state.settings, streakAlerts: !state.settings.streakAlerts },
        })),

      toggleGoalNotifications: () =>
        set((state) => ({
          settings: { ...state.settings, goalNotifications: !state.settings.goalNotifications },
        })),

      toggleQuietHours: () =>
        set((state) => ({
          settings: { ...state.settings, quietHoursEnabled: !state.settings.quietHoursEnabled },
        })),

      setReminderInterval: (minutes) =>
        set((state) => ({
          settings: { ...state.settings, reminderIntervalMinutes: minutes },
        })),

      setQuietHours: (start, end) =>
        set((state) => ({
          settings: { ...state.settings, quietHoursStart: start, quietHoursEnd: end },
        })),

      setTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),

      resetSettings: () =>
        set({ settings: defaultSettings }),
    }),
    {
      name: 'microbreaks-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSettingsStore;
