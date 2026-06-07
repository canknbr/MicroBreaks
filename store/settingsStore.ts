/**
 * Settings Store
 * Manages app-wide settings with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { createMmkvStorage } from '@/services/storage/zustandMmkv';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import { syncService } from '@/services/sync';

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
  settingsUpdatedAt: number;

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

export const defaultAppSettings: AppSettings = {
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

function sanitizeTheme(value: unknown): AppSettings['theme'] {
  return value === 'light' || value === 'system' || value === 'dark'
    ? value
    : defaultAppSettings.theme;
}

function sanitizeWorkDays(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [...defaultAppSettings.workDays];
  }

  const days = value
    .filter((day): day is number => typeof day === 'number' && Number.isInteger(day))
    .filter((day) => day >= 0 && day <= 6);

  return Array.from(new Set(days));
}

function sanitizePersistedSettingsState(state: unknown): Pick<
  SettingsState,
  'settings' | 'settingsUpdatedAt'
> {
  const persisted = state && typeof state === 'object' ? state as Partial<SettingsState> : {};
  const settings = persisted.settings && typeof persisted.settings === 'object'
    ? persisted.settings as Partial<AppSettings>
    : {};

  return {
    settings: {
      ...defaultAppSettings,
      theme: sanitizeTheme(settings.theme),
      accentColor:
        typeof settings.accentColor === 'string' && settings.accentColor.trim().length > 0
          ? settings.accentColor
          : defaultAppSettings.accentColor,
      soundEnabled:
        typeof settings.soundEnabled === 'boolean'
          ? settings.soundEnabled
          : defaultAppSettings.soundEnabled,
      hapticsEnabled:
        typeof settings.hapticsEnabled === 'boolean'
          ? settings.hapticsEnabled
          : defaultAppSettings.hapticsEnabled,
      voiceGuidanceEnabled:
        typeof settings.voiceGuidanceEnabled === 'boolean'
          ? settings.voiceGuidanceEnabled
          : defaultAppSettings.voiceGuidanceEnabled,
      notificationsEnabled:
        typeof settings.notificationsEnabled === 'boolean'
          ? settings.notificationsEnabled
          : defaultAppSettings.notificationsEnabled,
      breakReminders:
        typeof settings.breakReminders === 'boolean'
          ? settings.breakReminders
          : defaultAppSettings.breakReminders,
      reminderIntervalMinutes:
        typeof settings.reminderIntervalMinutes === 'number' && Number.isFinite(settings.reminderIntervalMinutes)
          ? Math.max(5, Math.min(120, Math.round(settings.reminderIntervalMinutes)))
          : defaultAppSettings.reminderIntervalMinutes,
      streakAlerts:
        typeof settings.streakAlerts === 'boolean'
          ? settings.streakAlerts
          : defaultAppSettings.streakAlerts,
      goalNotifications:
        typeof settings.goalNotifications === 'boolean'
          ? settings.goalNotifications
          : defaultAppSettings.goalNotifications,
      quietHoursEnabled:
        typeof settings.quietHoursEnabled === 'boolean'
          ? settings.quietHoursEnabled
          : defaultAppSettings.quietHoursEnabled,
      quietHoursStart:
        typeof settings.quietHoursStart === 'number' && Number.isFinite(settings.quietHoursStart)
          ? Math.max(0, Math.min(23, Math.round(settings.quietHoursStart)))
          : defaultAppSettings.quietHoursStart,
      quietHoursEnd:
        typeof settings.quietHoursEnd === 'number' && Number.isFinite(settings.quietHoursEnd)
          ? Math.max(0, Math.min(23, Math.round(settings.quietHoursEnd)))
          : defaultAppSettings.quietHoursEnd,
      workDaysOnly:
        typeof settings.workDaysOnly === 'boolean'
          ? settings.workDaysOnly
          : defaultAppSettings.workDaysOnly,
      workDays: sanitizeWorkDays(settings.workDays),
      defaultBreakDuration:
        typeof settings.defaultBreakDuration === 'number' && Number.isFinite(settings.defaultBreakDuration)
          ? Math.max(15, Math.round(settings.defaultBreakDuration))
          : defaultAppSettings.defaultBreakDuration,
      autoStartNextStep:
        typeof settings.autoStartNextStep === 'boolean'
          ? settings.autoStartNextStep
          : defaultAppSettings.autoStartNextStep,
      showStepPreview:
        typeof settings.showStepPreview === 'boolean'
          ? settings.showStepPreview
          : defaultAppSettings.showStepPreview,
      analyticsEnabled:
        typeof settings.analyticsEnabled === 'boolean'
          ? settings.analyticsEnabled
          : defaultAppSettings.analyticsEnabled,
      crashReportingEnabled:
        typeof settings.crashReportingEnabled === 'boolean'
          ? settings.crashReportingEnabled
          : defaultAppSettings.crashReportingEnabled,
    },
    settingsUpdatedAt:
      typeof persisted.settingsUpdatedAt === 'number' && Number.isFinite(persisted.settingsUpdatedAt)
        ? Math.max(0, persisted.settingsUpdatedAt)
        : 0,
  };
}

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

// Action selectors (stable references via useShallow)
export const useSettingsActions = () => useSettingsStore(useShallow((state) => ({
  updateSettings: state.updateSettings,
  toggleSound: state.toggleSound,
  toggleHaptics: state.toggleHaptics,
  toggleVoiceGuidance: state.toggleVoiceGuidance,
  toggleNotifications: state.toggleNotifications,
  toggleBreakReminders: state.toggleBreakReminders,
  setReminderInterval: state.setReminderInterval,
  setTheme: state.setTheme,
})));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultAppSettings,
      settingsUpdatedAt: 0,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      toggleSound: () => {
        set((state) => ({
          settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      toggleHaptics: () => {
        set((state) => ({
          settings: { ...state.settings, hapticsEnabled: !state.settings.hapticsEnabled },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      toggleVoiceGuidance: () => {
        set((state) => ({
          settings: { ...state.settings, voiceGuidanceEnabled: !state.settings.voiceGuidanceEnabled },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      toggleNotifications: () => {
        set((state) => ({
          settings: { ...state.settings, notificationsEnabled: !state.settings.notificationsEnabled },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      toggleBreakReminders: () => {
        set((state) => ({
          settings: { ...state.settings, breakReminders: !state.settings.breakReminders },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      toggleStreakAlerts: () => {
        set((state) => ({
          settings: { ...state.settings, streakAlerts: !state.settings.streakAlerts },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      toggleGoalNotifications: () => {
        set((state) => ({
          settings: { ...state.settings, goalNotifications: !state.settings.goalNotifications },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      toggleQuietHours: () => {
        set((state) => ({
          settings: { ...state.settings, quietHoursEnabled: !state.settings.quietHoursEnabled },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      setReminderInterval: (minutes) => {
        set((state) => ({
          settings: { ...state.settings, reminderIntervalMinutes: Math.max(5, Math.min(120, Math.round(minutes))) },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      setQuietHours: (start, end) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quietHoursStart: Math.max(0, Math.min(23, Math.round(start))),
            quietHoursEnd: Math.max(0, Math.min(23, Math.round(end))),
          },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
          settingsUpdatedAt: Date.now(),
        }));
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },

      resetSettings: () => {
        set({ settings: { ...defaultAppSettings }, settingsUpdatedAt: Date.now() });
        if (!syncService.isSyncPulling()) {
          syncService.queueSettingsChange();
        }
      },
    }),
    {
      name: ZUSTAND_PERSIST_KEYS.SETTINGS,
      storage: createMmkvStorage(),
      version: 1,
      migrate: (persistedState) => sanitizePersistedSettingsState(persistedState),
    }
  )
);

export const settingsStoreTestUtils = {
  sanitizePersistedSettingsState,
};

export default useSettingsStore;
