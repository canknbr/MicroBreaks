# MicroBreaks - State Management Architecture
## Zen Master Level Zustand + MMKV Implementation

---

## Store Architecture Overview

```
stores/
├── index.ts                    # Export all stores
├── storage.ts                  # MMKV configuration
│
├── onboardingStore.ts          # Onboarding flow state
├── userStore.ts                # User profile & preferences
│
├── timerStore.ts               # Timer & sessions
├── breakStore.ts               # Break management
├── exerciseStore.ts            # Exercise library & favorites
│
├── progressStore.ts            # Stats, streaks, analytics
├── achievementStore.ts         # XP, badges, milestones
│
├── notificationStore.ts        # Notification management
├── subscriptionStore.ts        # Premium & IAP
│
└── uiStore.ts                  # UI state (modals, toasts)
```

---

## 1. Storage Configuration

```typescript
// stores/storage.ts

import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// Create MMKV instance
export const storage = new MMKV({
  id: 'microbreaks-storage',
  encryptionKey: 'your-encryption-key', // For sensitive data
});

// Zustand storage adapter
export const zustandStorage: StateStorage = {
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

// Direct storage helpers
export const storageHelpers = {
  // Get with default
  get: <T>(key: string, defaultValue: T): T => {
    const value = storage.getString(key);
    if (value === undefined) return defaultValue;
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },

  // Set value
  set: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  // Remove
  remove: (key: string): void => {
    storage.delete(key);
  },

  // Clear all
  clearAll: (): void => {
    storage.clearAll();
  },

  // Check if key exists
  has: (key: string): boolean => {
    return storage.contains(key);
  },
};
```

---

## 2. Onboarding Store

```typescript
// stores/onboardingStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';

// Types
type WorkRole = 'developer' | 'designer' | 'analyst' | 'student' | 'manager' | 'writer' | 'support' | 'other';
type PainArea = 'eyes' | 'head' | 'neck' | 'shoulders' | 'upperBack' | 'lowerBack' | 'wrists' | 'hands' | 'none';
type WorkPattern = 'deepFocus' | 'taskSwitching' | 'meetingHeavy' | 'flexible';
type NotificationStyle = 'gentle' | 'balanced' | 'strict' | 'smart';
type EnergyPattern = 'morning' | 'nightOwl' | 'afternoonSlump' | 'steady' | 'custom';
type BreakStyle = 'movement' | 'deskExercises' | 'breathing' | 'eyeMicro' | 'mixed';
type TimerPreset = 'micro' | 'pomodoro' | 'deepWork' | 'custom';

interface OnboardingProfile {
  // Profile data
  workRole: WorkRole | null;
  screenTimeHours: number;
  painAreas: PainArea[];
  workPattern: WorkPattern | null;
  ergonomicSetup: string[]; // ['monitor', 'feet', 'keyboard', etc.]
  notificationStyle: NotificationStyle | null;
  energyPattern: EnergyPattern | null;
  breakStyle: BreakStyle | null;
  timerPreset: TimerPreset | null;

  // Permissions
  notificationsEnabled: boolean;
  calendarIntegration: 'google' | 'outlook' | 'apple' | 'none';

  // AI recommendations (generated)
  recommendations: {
    suggestedPreset: TimerPreset;
    primaryExercises: string[];
    focusTips: string[];
  } | null;
}

interface OnboardingState {
  // Progress
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  lastCompletedStep: number;

  // Profile data
  profile: OnboardingProfile;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeOnboarding: () => void;

  // Profile updates
  setWorkRole: (role: WorkRole) => void;
  setScreenTime: (hours: number) => void;
  togglePainArea: (area: PainArea) => void;
  setWorkPattern: (pattern: WorkPattern) => void;
  setErgonomicSetup: (items: string[]) => void;
  setNotificationStyle: (style: NotificationStyle) => void;
  setEnergyPattern: (pattern: EnergyPattern) => void;
  setBreakStyle: (style: BreakStyle) => void;
  setTimerPreset: (preset: TimerPreset) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setCalendarIntegration: (integration: OnboardingProfile['calendarIntegration']) => void;
  setRecommendations: (recommendations: OnboardingProfile['recommendations']) => void;

  // Utilities
  getStepByIndex: (index: number) => string;
  canProceed: () => boolean;
  reset: () => void;
}

const TOTAL_STEPS = 21;

const initialProfile: OnboardingProfile = {
  workRole: null,
  screenTimeHours: 8,
  painAreas: [],
  workPattern: null,
  ergonomicSetup: [],
  notificationStyle: null,
  energyPattern: null,
  breakStyle: null,
  timerPreset: null,
  notificationsEnabled: false,
  calendarIntegration: 'none',
  recommendations: null,
};

const initialState = {
  isComplete: false,
  currentStep: 1,
  totalSteps: TOTAL_STEPS,
  lastCompletedStep: 0,
  profile: initialProfile,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setStep: (step) => {
        if (step >= 1 && step <= TOTAL_STEPS) {
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const { currentStep, totalSteps, lastCompletedStep } = get();
        if (currentStep < totalSteps) {
          set({
            currentStep: currentStep + 1,
            lastCompletedStep: Math.max(lastCompletedStep, currentStep),
          });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      completeOnboarding: () => {
        const { profile } = get();

        // Generate final recommendations if not already done
        if (!profile.recommendations) {
          const recommendations = generateRecommendations(profile);
          set({
            profile: { ...profile, recommendations },
            isComplete: true,
            lastCompletedStep: TOTAL_STEPS,
          });
        } else {
          set({
            isComplete: true,
            lastCompletedStep: TOTAL_STEPS,
          });
        }

        // Sync profile to userStore
        useUserStore.getState().initializeFromOnboarding(get().profile);
      },

      // Profile setters
      setWorkRole: (role) => {
        set((state) => ({
          profile: { ...state.profile, workRole: role },
        }));
      },

      setScreenTime: (hours) => {
        set((state) => ({
          profile: { ...state.profile, screenTimeHours: hours },
        }));
      },

      togglePainArea: (area) => {
        set((state) => {
          const current = state.profile.painAreas;

          // If selecting 'none', clear all others
          if (area === 'none') {
            return {
              profile: {
                ...state.profile,
                painAreas: current.includes('none') ? [] : ['none'],
              },
            };
          }

          // Remove 'none' if selecting an actual area
          const withoutNone = current.filter((a) => a !== 'none');

          // Toggle the selected area
          const updated = withoutNone.includes(area)
            ? withoutNone.filter((a) => a !== area)
            : [...withoutNone, area];

          return {
            profile: { ...state.profile, painAreas: updated },
          };
        });
      },

      setWorkPattern: (pattern) => {
        set((state) => ({
          profile: { ...state.profile, workPattern: pattern },
        }));
      },

      setErgonomicSetup: (items) => {
        set((state) => ({
          profile: { ...state.profile, ergonomicSetup: items },
        }));
      },

      setNotificationStyle: (style) => {
        set((state) => ({
          profile: { ...state.profile, notificationStyle: style },
        }));
      },

      setEnergyPattern: (pattern) => {
        set((state) => ({
          profile: { ...state.profile, energyPattern: pattern },
        }));
      },

      setBreakStyle: (style) => {
        set((state) => ({
          profile: { ...state.profile, breakStyle: style },
        }));
      },

      setTimerPreset: (preset) => {
        set((state) => ({
          profile: { ...state.profile, timerPreset: preset },
        }));
      },

      setNotificationsEnabled: (enabled) => {
        set((state) => ({
          profile: { ...state.profile, notificationsEnabled: enabled },
        }));
      },

      setCalendarIntegration: (integration) => {
        set((state) => ({
          profile: { ...state.profile, calendarIntegration: integration },
        }));
      },

      setRecommendations: (recommendations) => {
        set((state) => ({
          profile: { ...state.profile, recommendations },
        }));
      },

      // Utilities
      getStepByIndex: (index) => {
        const steps = [
          'welcome', 'social-proof', 'value-promise', 'work-role',
          'screen-time', 'pain-assessment', 'work-pattern', 'ergonomic-setup',
          'notification-preference', 'energy-pattern', 'break-style',
          'recommendation', 'break-demo', 'value-display', 'impact-education',
          'timer-config', 'notification-permission', 'calendar-integration',
          'first-session', 'premium-pitch', 'completion',
        ];
        return steps[index - 1] || 'welcome';
      },

      canProceed: () => {
        const { currentStep, profile } = get();

        // Validation per step
        switch (currentStep) {
          case 4: return profile.workRole !== null;
          case 6: return profile.painAreas.length > 0;
          case 7: return profile.workPattern !== null;
          case 9: return profile.notificationStyle !== null;
          case 10: return profile.energyPattern !== null;
          case 11: return profile.breakStyle !== null;
          case 16: return profile.timerPreset !== null;
          default: return true;
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

// Helper function to generate AI recommendations
function generateRecommendations(profile: OnboardingProfile) {
  // Suggest timer preset based on work pattern
  let suggestedPreset: TimerPreset = 'pomodoro';
  if (profile.workPattern === 'deepFocus') {
    suggestedPreset = 'deepWork';
  } else if (profile.workPattern === 'taskSwitching') {
    suggestedPreset = 'micro';
  }

  // Suggest exercises based on pain areas
  const exerciseMap: Record<PainArea, string[]> = {
    eyes: ['20-20-20', 'eye-circles', 'palming'],
    head: ['neck-rolls', 'deep-breathing', 'eye-rest'],
    neck: ['neck-rolls', 'chin-tucks', 'shoulder-rolls'],
    shoulders: ['shoulder-shrugs', 'shoulder-rolls', 'chest-stretch'],
    upperBack: ['cat-cow', 'thoracic-rotation', 'wall-stretch'],
    lowerBack: ['seated-twist', 'pelvic-tilts', 'hip-flexor-stretch'],
    wrists: ['wrist-circles', 'wrist-stretch', 'finger-spread'],
    hands: ['finger-stretch', 'grip-release', 'hand-shake'],
    none: ['general-stretch', '20-20-20', 'deep-breathing'],
  };

  const primaryExercises = new Set<string>();
  profile.painAreas.forEach((area) => {
    exerciseMap[area]?.forEach((ex) => primaryExercises.add(ex));
  });

  return {
    suggestedPreset,
    primaryExercises: Array.from(primaryExercises).slice(0, 5),
    focusTips: generateFocusTips(profile),
  };
}

function generateFocusTips(profile: OnboardingProfile): string[] {
  const tips: string[] = [];

  if (profile.screenTimeHours > 10) {
    tips.push('With 10+ hours of screen time, eye breaks every 20 minutes are essential.');
  }

  if (profile.energyPattern === 'afternoonSlump') {
    tips.push('Schedule your most challenging tasks for the morning when your energy peaks.');
  }

  if (profile.workPattern === 'meetingHeavy') {
    tips.push('Try to batch meetings and protect focus blocks for deep work.');
  }

  return tips;
}
```

---

## 3. Timer Store

```typescript
// stores/timerStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { generateId, getCurrentTimestamp } from '@/utils';

// Types
type TimerStatus = 'idle' | 'running' | 'paused' | 'break' | 'completed';
type TimerPreset = 'micro' | 'pomodoro' | 'deepWork' | 'custom';

interface PresetConfig {
  id: TimerPreset | string;
  name: string;
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  exercises: string[];
}

interface TimerSession {
  id: string;
  presetId: string;
  workMinutes: number;
  breakMinutes: number;

  // Time tracking
  startedAt: string;
  endedAt: string | null;
  pausedAt: string | null;
  totalPausedSeconds: number;

  // Status
  status: TimerStatus;
  completedEarly: boolean;

  // Break info
  breaksTaken: number;
  exercisesCompleted: string[];

  // Metadata
  createdAt: string;
}

interface TimerState {
  // Active session
  activeSession: TimerSession | null;

  // Configuration
  presets: Record<string, PresetConfig>;
  defaultPresetId: TimerPreset;

  // Session history (last 100)
  sessions: Record<string, TimerSession>;

  // Real-time computed
  getTimeRemaining: () => number;
  getProgress: () => number;
  isInBreak: () => boolean;

  // Session actions
  startSession: (presetId?: string) => string;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: (completedEarly?: boolean) => void;
  skipToBreak: () => void;

  // Break actions
  startBreak: () => void;
  endBreak: () => void;
  skipBreak: () => void;
  extendBreak: (minutes: number) => void;
  completeExercise: (exerciseId: string) => void;

  // Configuration
  setDefaultPreset: (presetId: TimerPreset) => void;
  updatePreset: (presetId: string, config: Partial<PresetConfig>) => void;
  createCustomPreset: (config: Omit<PresetConfig, 'id'>) => string;
  deleteCustomPreset: (presetId: string) => void;

  // Recovery
  recoverSession: () => void;

  // Stats
  getTodayStats: () => { sessions: number; focusMinutes: number; breakMinutes: number };

  reset: () => void;
}

const defaultPresets: Record<string, PresetConfig> = {
  micro: {
    id: 'micro',
    name: 'Micro',
    workMinutes: 15,
    breakMinutes: 3,
    longBreakMinutes: 10,
    sessionsUntilLongBreak: 4,
    exercises: ['20-20-20', 'neck-rolls'],
  },
  pomodoro: {
    id: 'pomodoro',
    name: 'Pomodoro',
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4,
    exercises: ['20-20-20', 'neck-rolls', 'shoulder-shrugs'],
  },
  deepWork: {
    id: 'deepWork',
    name: 'Deep Work',
    workMinutes: 50,
    breakMinutes: 10,
    longBreakMinutes: 20,
    sessionsUntilLongBreak: 2,
    exercises: ['20-20-20', 'neck-rolls', 'shoulder-shrugs', 'back-stretch', 'deep-breathing'],
  },
};

const initialState = {
  activeSession: null,
  presets: defaultPresets,
  defaultPresetId: 'pomodoro' as TimerPreset,
  sessions: {},
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Real-time computed
      getTimeRemaining: () => {
        const session = get().activeSession;
        if (!session) return 0;

        const now = Date.now();
        const started = new Date(session.startedAt).getTime();
        const paused = session.totalPausedSeconds * 1000;

        // If currently paused, don't count time since pause
        const pausedSince = session.pausedAt
          ? now - new Date(session.pausedAt).getTime()
          : 0;

        const elapsed = now - started - paused - pausedSince;

        const targetMinutes = session.status === 'break'
          ? session.breakMinutes
          : session.workMinutes;

        const totalMs = targetMinutes * 60 * 1000;
        return Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
      },

      getProgress: () => {
        const session = get().activeSession;
        if (!session) return 0;

        const remaining = get().getTimeRemaining();
        const targetMinutes = session.status === 'break'
          ? session.breakMinutes
          : session.workMinutes;
        const total = targetMinutes * 60;

        return Math.min(100, ((total - remaining) / total) * 100);
      },

      isInBreak: () => {
        return get().activeSession?.status === 'break';
      },

      // Start new session
      startSession: (presetId) => {
        // End any existing session first
        const existing = get().activeSession;
        if (existing && existing.status !== 'completed') {
          get().endSession(true);
        }

        const preset = get().presets[presetId || get().defaultPresetId];
        const id = generateId();
        const now = getCurrentTimestamp();

        const session: TimerSession = {
          id,
          presetId: preset.id,
          workMinutes: preset.workMinutes,
          breakMinutes: preset.breakMinutes,
          startedAt: now,
          endedAt: null,
          pausedAt: null,
          totalPausedSeconds: 0,
          status: 'running',
          completedEarly: false,
          breaksTaken: 0,
          exercisesCompleted: [],
          createdAt: now,
        };

        set({
          activeSession: session,
          sessions: { ...get().sessions, [id]: session },
        });

        // Schedule notification
        scheduleTimerNotification(session.workMinutes);

        return id;
      },

      // Pause
      pauseSession: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'running') return;

        set({
          activeSession: {
            ...session,
            status: 'paused',
            pausedAt: getCurrentTimestamp(),
          },
        });

        cancelTimerNotification();
      },

      // Resume
      resumeSession: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'paused' || !session.pausedAt) return;

        const pausedDuration = Date.now() - new Date(session.pausedAt).getTime();

        set({
          activeSession: {
            ...session,
            status: 'running',
            pausedAt: null,
            totalPausedSeconds: session.totalPausedSeconds + Math.floor(pausedDuration / 1000),
          },
        });

        // Reschedule notification
        const remaining = get().getTimeRemaining();
        scheduleTimerNotification(remaining / 60);
      },

      // End session
      endSession: (completedEarly = false) => {
        const session = get().activeSession;
        if (!session) return;

        const now = getCurrentTimestamp();
        const started = new Date(session.startedAt).getTime();
        const ended = Date.now();
        const actualSeconds = Math.floor((ended - started) / 1000) - session.totalPausedSeconds;

        const completedSession: TimerSession = {
          ...session,
          status: 'completed',
          endedAt: now,
          completedEarly,
        };

        set({
          activeSession: null,
          sessions: {
            ...get().sessions,
            [session.id]: completedSession,
          },
        });

        // Award XP
        if (!completedEarly) {
          useAchievementStore.getState().awardXP(25, 'session_complete');
          useProgressStore.getState().recordSession(completedSession);
        }

        cancelTimerNotification();
      },

      // Skip to break
      skipToBreak: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'running') return;

        get().endSession(true);
        get().startBreak();
      },

      // Break management
      startBreak: () => {
        const session = get().activeSession;
        if (!session) {
          // Create break-only session
          const preset = get().presets[get().defaultPresetId];
          const id = generateId();
          const now = getCurrentTimestamp();

          set({
            activeSession: {
              id,
              presetId: preset.id,
              workMinutes: 0,
              breakMinutes: preset.breakMinutes,
              startedAt: now,
              endedAt: null,
              pausedAt: null,
              totalPausedSeconds: 0,
              status: 'break',
              completedEarly: false,
              breaksTaken: 1,
              exercisesCompleted: [],
              createdAt: now,
            },
          });
          return;
        }

        set({
          activeSession: {
            ...session,
            status: 'break',
            startedAt: getCurrentTimestamp(), // Reset for break timer
            totalPausedSeconds: 0,
            breaksTaken: session.breaksTaken + 1,
          },
        });

        scheduleTimerNotification(session.breakMinutes);
      },

      endBreak: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'break') return;

        // Award XP for completed break
        useAchievementStore.getState().awardXP(10, 'break_complete');
        useProgressStore.getState().recordBreak(session);

        get().endSession(false);
      },

      skipBreak: () => {
        const session = get().activeSession;
        if (!session || session.status !== 'break') return;

        get().endSession(true);
      },

      extendBreak: (minutes) => {
        const session = get().activeSession;
        if (!session || session.status !== 'break') return;

        set({
          activeSession: {
            ...session,
            breakMinutes: session.breakMinutes + minutes,
          },
        });

        // Update notification
        const remaining = get().getTimeRemaining();
        scheduleTimerNotification((remaining + minutes * 60) / 60);
      },

      completeExercise: (exerciseId) => {
        const session = get().activeSession;
        if (!session) return;

        if (!session.exercisesCompleted.includes(exerciseId)) {
          set({
            activeSession: {
              ...session,
              exercisesCompleted: [...session.exercisesCompleted, exerciseId],
            },
          });

          // Award XP for exercise
          useAchievementStore.getState().awardXP(5, 'exercise_complete');
          useProgressStore.getState().recordExercise(exerciseId);
        }
      },

      // Configuration
      setDefaultPreset: (presetId) => {
        set({ defaultPresetId: presetId });
      },

      updatePreset: (presetId, config) => {
        const preset = get().presets[presetId];
        if (!preset) return;

        set({
          presets: {
            ...get().presets,
            [presetId]: { ...preset, ...config },
          },
        });
      },

      createCustomPreset: (config) => {
        const id = `custom_${generateId()}`;
        set({
          presets: {
            ...get().presets,
            [id]: { ...config, id },
          },
        });
        return id;
      },

      deleteCustomPreset: (presetId) => {
        if (!presetId.startsWith('custom_')) return;

        const { [presetId]: deleted, ...remaining } = get().presets;
        set({ presets: remaining });

        // Reset default if deleted
        if (get().defaultPresetId === presetId) {
          set({ defaultPresetId: 'pomodoro' });
        }
      },

      // Recovery
      recoverSession: () => {
        const session = get().activeSession;
        if (!session) return;

        if (session.status === 'running') {
          const remaining = get().getTimeRemaining();

          if (remaining <= 0) {
            // Timer expired while app was closed
            if (session.breaksTaken === 0) {
              // Work phase ended, start break
              get().startBreak();
            } else {
              // Break ended
              get().endBreak();
            }
          }
          // Timer still running, notification will handle it
        }
      },

      // Stats
      getTodayStats: () => {
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = Object.values(get().sessions).filter(
          (s) => s.createdAt.startsWith(today) && s.status === 'completed'
        );

        return {
          sessions: todaySessions.length,
          focusMinutes: todaySessions.reduce((sum, s) => sum + s.workMinutes, 0),
          breakMinutes: todaySessions.reduce((sum, s) => sum + (s.breakMinutes * s.breaksTaken), 0),
        };
      },

      reset: () => set(initialState),
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        activeSession: state.activeSession,
        presets: state.presets,
        defaultPresetId: state.defaultPresetId,
        sessions: state.sessions,
      }),
    }
  )
);

// Notification helpers (implement with expo-notifications)
function scheduleTimerNotification(minutes: number) {
  // Implementation
}

function cancelTimerNotification() {
  // Implementation
}
```

---

## 4. Progress Store

```typescript
// stores/progressStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';

// Types
interface DailyStats {
  date: string; // YYYY-MM-DD
  sessions: number;
  focusMinutes: number;
  breakMinutes: number;
  exercisesCompleted: number;
  exerciseIds: string[];
  mood: 'tired' | 'good' | 'energized' | 'meh' | null;
}

interface ProgressState {
  // Daily stats (last 90 days)
  dailyStats: Record<string, DailyStats>;

  // Streak
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFreezes: number; // Premium feature

  // Lifetime stats
  totalSessions: number;
  totalFocusMinutes: number;
  totalBreaks: number;
  totalExercises: number;

  // Recording actions
  recordSession: (session: any) => void;
  recordBreak: (session: any) => void;
  recordExercise: (exerciseId: string) => void;
  recordMood: (mood: DailyStats['mood']) => void;

  // Streak management
  checkAndUpdateStreak: () => void;
  useStreakFreeze: () => boolean;

  // Getters
  getTodayStats: () => DailyStats;
  getWeekStats: () => DailyStats[];
  getStreakCalendar: (days: number) => boolean[];

  reset: () => void;
}

const createEmptyDayStats = (date: string): DailyStats => ({
  date,
  sessions: 0,
  focusMinutes: 0,
  breakMinutes: 0,
  exercisesCompleted: 0,
  exerciseIds: [],
  mood: null,
});

const getTodayDate = () => new Date().toISOString().split('T')[0];

const initialState = {
  dailyStats: {},
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  streakFreezes: 0,
  totalSessions: 0,
  totalFocusMinutes: 0,
  totalBreaks: 0,
  totalExercises: 0,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,

      recordSession: (session) => {
        const today = getTodayDate();
        const current = get().dailyStats[today] || createEmptyDayStats(today);

        set({
          dailyStats: {
            ...get().dailyStats,
            [today]: {
              ...current,
              sessions: current.sessions + 1,
              focusMinutes: current.focusMinutes + session.workMinutes,
            },
          },
          totalSessions: get().totalSessions + 1,
          totalFocusMinutes: get().totalFocusMinutes + session.workMinutes,
        });

        get().checkAndUpdateStreak();
      },

      recordBreak: (session) => {
        const today = getTodayDate();
        const current = get().dailyStats[today] || createEmptyDayStats(today);

        set({
          dailyStats: {
            ...get().dailyStats,
            [today]: {
              ...current,
              breakMinutes: current.breakMinutes + session.breakMinutes,
            },
          },
          totalBreaks: get().totalBreaks + 1,
        });
      },

      recordExercise: (exerciseId) => {
        const today = getTodayDate();
        const current = get().dailyStats[today] || createEmptyDayStats(today);

        // Don't double count
        if (current.exerciseIds.includes(exerciseId)) return;

        set({
          dailyStats: {
            ...get().dailyStats,
            [today]: {
              ...current,
              exercisesCompleted: current.exercisesCompleted + 1,
              exerciseIds: [...current.exerciseIds, exerciseId],
            },
          },
          totalExercises: get().totalExercises + 1,
        });
      },

      recordMood: (mood) => {
        const today = getTodayDate();
        const current = get().dailyStats[today] || createEmptyDayStats(today);

        set({
          dailyStats: {
            ...get().dailyStats,
            [today]: { ...current, mood },
          },
        });
      },

      checkAndUpdateStreak: () => {
        const today = getTodayDate();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const { lastActivityDate, currentStreak, longestStreak } = get();

        // First activity ever
        if (!lastActivityDate) {
          set({
            currentStreak: 1,
            longestStreak: Math.max(longestStreak, 1),
            lastActivityDate: today,
          });
          return;
        }

        // Already recorded today
        if (lastActivityDate === today) {
          return;
        }

        // Continued streak (activity yesterday)
        if (lastActivityDate === yesterday) {
          const newStreak = currentStreak + 1;
          set({
            currentStreak: newStreak,
            longestStreak: Math.max(longestStreak, newStreak),
            lastActivityDate: today,
          });
          return;
        }

        // Streak broken (more than 1 day gap)
        set({
          currentStreak: 1,
          lastActivityDate: today,
        });
      },

      useStreakFreeze: () => {
        const { streakFreezes, currentStreak } = get();
        if (streakFreezes <= 0) return false;

        set({
          streakFreezes: streakFreezes - 1,
          lastActivityDate: getTodayDate(), // Pretend today is active
        });
        return true;
      },

      getTodayStats: () => {
        const today = getTodayDate();
        return get().dailyStats[today] || createEmptyDayStats(today);
      },

      getWeekStats: () => {
        const stats: DailyStats[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
          stats.push(get().dailyStats[date] || createEmptyDayStats(date));
        }
        return stats;
      },

      getStreakCalendar: (days) => {
        const calendar: boolean[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
          const stats = get().dailyStats[date];
          calendar.push(stats ? stats.sessions > 0 || stats.exercisesCompleted > 0 : false);
        }
        return calendar;
      },

      reset: () => set(initialState),
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
```

---

## 5. Achievement Store

```typescript
// stores/achievementStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';

// Types
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'streak' | 'exercises' | 'sessions' | 'special';
  requirement: {
    type: 'count' | 'streak' | 'time' | 'specific';
    target: number;
    metric?: string;
  };
}

interface AchievementState {
  // XP & Level
  totalXP: number;
  currentLevel: number;

  // Achievements
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;

  // Actions
  awardXP: (amount: number, reason: string) => void;
  checkAchievements: () => string[]; // Returns newly unlocked
  unlockAchievement: (achievementId: string) => void;
  updateProgress: (achievementId: string, progress: number) => void;

  // Getters
  getLevel: () => number;
  getXPForNextLevel: () => number;
  getUnlockedAchievements: () => Achievement[];
  getInProgressAchievements: () => { achievement: Achievement; progress: number }[];

  reset: () => void;
}

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    xpReward: 10,
    category: 'streak',
    requirement: { type: 'streak', target: 3 },
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpReward: 25,
    category: 'streak',
    requirement: { type: 'streak', target: 7 },
  },
  {
    id: 'streak_30',
    title: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    xpReward: 100,
    category: 'streak',
    requirement: { type: 'streak', target: 30 },
  },
  {
    id: 'streak_100',
    title: 'Centurion',
    description: 'Maintain a 100-day streak',
    icon: '💯',
    xpReward: 500,
    category: 'streak',
    requirement: { type: 'streak', target: 100 },
  },

  // Exercise achievements
  {
    id: 'eye_care_10',
    title: 'Eye Care Beginner',
    description: 'Complete 10 eye exercises',
    icon: '👁️',
    xpReward: 15,
    category: 'exercises',
    requirement: { type: 'count', target: 10, metric: 'eye_exercises' },
  },
  {
    id: 'eye_care_50',
    title: 'Eye Care Pro',
    description: 'Complete 50 eye exercises',
    icon: '👁️',
    xpReward: 50,
    category: 'exercises',
    requirement: { type: 'count', target: 50, metric: 'eye_exercises' },
  },
  {
    id: 'stretch_master',
    title: 'Stretch Master',
    description: 'Try all stretching exercises',
    icon: '🧘',
    xpReward: 75,
    category: 'exercises',
    requirement: { type: 'count', target: 15, metric: 'unique_stretches' },
  },

  // Session achievements
  {
    id: 'sessions_10',
    title: 'Focus Finder',
    description: 'Complete 10 focus sessions',
    icon: '🎯',
    xpReward: 20,
    category: 'sessions',
    requirement: { type: 'count', target: 10, metric: 'sessions' },
  },
  {
    id: 'sessions_100',
    title: 'Focus Master',
    description: 'Complete 100 focus sessions',
    icon: '🎯',
    xpReward: 150,
    category: 'sessions',
    requirement: { type: 'count', target: 100, metric: 'sessions' },
  },
  {
    id: 'deep_work_10',
    title: 'Deep Worker',
    description: 'Complete 10 Deep Work sessions',
    icon: '🧠',
    xpReward: 50,
    category: 'sessions',
    requirement: { type: 'count', target: 10, metric: 'deep_work_sessions' },
  },

  // Special achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Take a break before 8 AM',
    icon: '🌅',
    xpReward: 25,
    category: 'special',
    requirement: { type: 'specific', target: 1, metric: 'early_break' },
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Take a break after 10 PM',
    icon: '🦉',
    xpReward: 25,
    category: 'special',
    requirement: { type: 'specific', target: 1, metric: 'late_break' },
  },
];

// XP per level (increasing)
const XP_PER_LEVEL = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  1000,  // Level 5
  1750,  // Level 6
  2750,  // Level 7
  4000,  // Level 8
  5500,  // Level 9
  7500,  // Level 10
  // ... continues
];

const initialState = {
  totalXP: 0,
  currentLevel: 1,
  unlockedAchievements: [],
  achievementProgress: {},
};

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      ...initialState,

      awardXP: (amount, reason) => {
        const newTotal = get().totalXP + amount;
        const newLevel = calculateLevel(newTotal);

        set({
          totalXP: newTotal,
          currentLevel: newLevel,
        });

        // Show toast/notification
        // triggerXPNotification(amount, reason);

        // Check for level up
        if (newLevel > get().currentLevel) {
          // triggerLevelUpCelebration(newLevel);
        }
      },

      checkAchievements: () => {
        const newlyUnlocked: string[] = [];
        const { unlockedAchievements, achievementProgress } = get();

        ACHIEVEMENTS.forEach((achievement) => {
          if (unlockedAchievements.includes(achievement.id)) return;

          const progress = achievementProgress[achievement.id] || 0;

          if (progress >= achievement.requirement.target) {
            get().unlockAchievement(achievement.id);
            newlyUnlocked.push(achievement.id);
          }
        });

        return newlyUnlocked;
      },

      unlockAchievement: (achievementId) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achievement) return;

        if (get().unlockedAchievements.includes(achievementId)) return;

        set({
          unlockedAchievements: [...get().unlockedAchievements, achievementId],
        });

        // Award XP
        get().awardXP(achievement.xpReward, `Achievement: ${achievement.title}`);

        // Show celebration
        // triggerAchievementCelebration(achievement);
      },

      updateProgress: (achievementId, progress) => {
        set({
          achievementProgress: {
            ...get().achievementProgress,
            [achievementId]: progress,
          },
        });

        // Check if completed
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (achievement && progress >= achievement.requirement.target) {
          get().unlockAchievement(achievementId);
        }
      },

      getLevel: () => {
        return calculateLevel(get().totalXP);
      },

      getXPForNextLevel: () => {
        const level = get().currentLevel;
        const currentLevelXP = XP_PER_LEVEL[level - 1] || 0;
        const nextLevelXP = XP_PER_LEVEL[level] || currentLevelXP + 2500;
        return nextLevelXP - get().totalXP;
      },

      getUnlockedAchievements: () => {
        return ACHIEVEMENTS.filter((a) =>
          get().unlockedAchievements.includes(a.id)
        );
      },

      getInProgressAchievements: () => {
        return ACHIEVEMENTS
          .filter((a) => !get().unlockedAchievements.includes(a.id))
          .map((achievement) => ({
            achievement,
            progress: get().achievementProgress[achievement.id] || 0,
          }))
          .filter(({ progress }) => progress > 0)
          .sort((a, b) => {
            const aPercent = a.progress / a.achievement.requirement.target;
            const bPercent = b.progress / b.achievement.requirement.target;
            return bPercent - aPercent;
          });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'achievement-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

function calculateLevel(xp: number): number {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) {
      return i + 1;
    }
  }
  return 1;
}
```

---

## 6. UI Store (Non-persisted)

```typescript
// stores/uiStore.ts

import { create } from 'zustand';

type ModalType =
  | 'quickBreak'
  | 'exerciseDetail'
  | 'achievement'
  | 'streakCelebration'
  | 'premiumPaywall'
  | 'ratingPrompt'
  | null;

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface UIState {
  // Modal management
  activeModal: ModalType;
  modalData: any;

  // Toast management
  toasts: Toast[];

  // Loading states
  isGlobalLoading: boolean;
  loadingMessage: string | null;

  // Theme (synced with system)
  colorScheme: 'light' | 'dark';

  // Actions
  showModal: (type: ModalType, data?: any) => void;
  hideModal: () => void;

  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  setGlobalLoading: (loading: boolean, message?: string) => void;
  setColorScheme: (scheme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeModal: null,
  modalData: null,
  toasts: [],
  isGlobalLoading: false,
  loadingMessage: null,
  colorScheme: 'dark',

  showModal: (type, data) => {
    set({ activeModal: type, modalData: data });
  },

  hideModal: () => {
    set({ activeModal: null, modalData: null });
  },

  showToast: (toast) => {
    const id = `toast_${Date.now()}`;
    set({ toasts: [...get().toasts, { ...toast, id }] });

    // Auto dismiss
    const duration = toast.duration || 3000;
    setTimeout(() => {
      get().dismissToast(id);
    }, duration);
  },

  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  setGlobalLoading: (loading, message) => {
    set({ isGlobalLoading: loading, loadingMessage: message || null });
  },

  setColorScheme: (scheme) => {
    set({ colorScheme: scheme });
  },
}));
```

---

## Store Integration Patterns

### Cross-Store Actions

```typescript
// When session completes, update multiple stores
const completeSessionFlow = () => {
  const timerStore = useTimerStore.getState();
  const progressStore = useProgressStore.getState();
  const achievementStore = useAchievementStore.getState();
  const uiStore = useUIStore.getState();

  // 1. End the timer session
  timerStore.endSession();

  // 2. Record in progress
  const session = timerStore.activeSession;
  if (session) {
    progressStore.recordSession(session);
    progressStore.recordBreak(session);
  }

  // 3. Award XP
  achievementStore.awardXP(25, 'session_complete');

  // 4. Check for new achievements
  const newAchievements = achievementStore.checkAchievements();

  // 5. Show celebration
  if (newAchievements.length > 0) {
    uiStore.showModal('achievement', { achievementId: newAchievements[0] });
  } else {
    uiStore.showToast({
      type: 'success',
      message: 'Session complete! +25 XP',
    });
  }
};
```

### Hooks for Component Usage

```typescript
// hooks/useTimer.ts
export function useTimer() {
  const {
    activeSession,
    getTimeRemaining,
    getProgress,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
  } = useTimerStore();

  const [remaining, setRemaining] = useState(getTimeRemaining());

  // Update every second when running
  useEffect(() => {
    if (activeSession?.status !== 'running') return;

    const interval = setInterval(() => {
      setRemaining(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.status]);

  return {
    session: activeSession,
    remaining,
    progress: getProgress(),
    isRunning: activeSession?.status === 'running',
    isPaused: activeSession?.status === 'paused',
    isBreak: activeSession?.status === 'break',
    start: startSession,
    pause: pauseSession,
    resume: resumeSession,
    end: endSession,
  };
}

// hooks/useProgress.ts
export function useProgress() {
  const todayStats = useProgressStore((s) => s.getTodayStats());
  const weekStats = useProgressStore((s) => s.getWeekStats());
  const streak = useProgressStore((s) => s.currentStreak);
  const longestStreak = useProgressStore((s) => s.longestStreak);

  return {
    today: todayStats,
    week: weekStats,
    streak,
    longestStreak,
  };
}
```

---

## Performance Optimizations

```typescript
// 1. Selective subscriptions
const sessionCount = useTimerStore((state) => Object.keys(state.sessions).length);

// 2. Shallow equality for arrays
import { shallow } from 'zustand/shallow';

const weekStats = useProgressStore(
  (state) => state.getWeekStats(),
  shallow
);

// 3. Memoized selectors
const selectTodayBreaks = (state: ProgressState) => state.getTodayStats().sessions;
const todayBreaks = useProgressStore(selectTodayBreaks);

// 4. Avoid recomputing in render
const getTimeRemaining = useTimerStore((state) => state.getTimeRemaining);
// Call in useEffect, not in render
```

---

**Document Version:** 1.0
**Last Updated:** December 8, 2025
**Total Stores:** 8 main stores
**Architecture:** Zustand + MMKV persistence
