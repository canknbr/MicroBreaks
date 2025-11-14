/**
 * Onboarding Types and Interfaces
 * Defines all types used throughout the onboarding flow
 */

export type WorkRole =
  | 'developer'
  | 'designer'
  | 'analyst'
  | 'student'
  | 'manager'
  | 'writer'
  | 'support'
  | 'other';

export type PainArea =
  | 'eyes'
  | 'head'
  | 'neck'
  | 'shoulders'
  | 'upper_back'
  | 'lower_back'
  | 'wrists'
  | 'hands';

export type PainSeverity = 'mild' | 'moderate' | 'severe';

export type WorkPattern = 'deep_focus' | 'task_switching' | 'meeting_heavy' | 'flexible';

export type NotificationStyle = 'gentle' | 'balanced' | 'strict' | 'smart';

export type EnergyPattern = 'morning_person' | 'night_owl' | 'afternoon_slump' | 'steady_energy';

export type BreakStyle =
  | 'movement'
  | 'desk_exercises'
  | 'breathing'
  | 'eye_micro'
  | 'mixed_variety';

export type TimerPreset = 'pomodoro' | 'deep_work' | 'micro_session' | 'custom';

export interface PainAreaWithSeverity {
  area: PainArea;
  severity: PainSeverity;
}

export interface ErgoChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface CustomTimerSettings {
  workMinutes: number;
  breakMinutes: number;
}

export interface EnergyData {
  pattern: EnergyPattern | null;
  customCurve?: number[]; // 24 values for each hour
}

export interface OnboardingData {
  // Phase 1: Hook
  startedAt: Date | null;

  // Phase 2: Profile
  workRole: WorkRole | null;
  screenHours: number;
  painAreas: PainAreaWithSeverity[];
  workPattern: WorkPattern | null;
  ergoChecklist: ErgoChecklistItem[];
  notificationPreference: NotificationStyle | null;
  energyPattern: EnergyData;
  breakStyles: BreakStyle[];

  // Phase 3: Demonstration
  demoCompleted: boolean;
  demoFeedback: 'positive' | 'neutral' | 'negative' | null;

  // Phase 4: Activation
  timerPreset: TimerPreset;
  customTimer?: CustomTimerSettings;
  notificationsEnabled: boolean;
  calendarIntegrated: boolean;
  calendarProvider?: 'google' | 'outlook' | 'apple';

  // Phase 5: Monetization
  trialStarted: boolean;
  selectedPlan: 'free' | 'premium' | null;

  // Metadata
  completedAt: Date | null;
  currentScreen: number;
  screenPath: string[];
  totalTimeSpent: number;
}

export interface OnboardingScreen {
  id: string;
  phase: 1 | 2 | 3 | 4 | 5;
  title: string;
  component: React.ComponentType<any>;
  optional?: boolean;
  skipCondition?: (data: OnboardingData) => boolean;
}

export interface OnboardingContextType {
  data: OnboardingData;
  currentScreenIndex: number;
  totalScreens: number;
  updateData: (updates: Partial<OnboardingData>) => void;
  goToNextScreen: () => void;
  goToPreviousScreen: () => void;
  skipToScreen: (index: number) => void;
  completeOnboarding: () => Promise<void>;
  progress: number;
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  startedAt: null,
  workRole: null,
  screenHours: 8,
  painAreas: [],
  workPattern: null,
  ergoChecklist: [
    { id: 'monitor', label: 'Monitor at eye level', checked: false },
    { id: 'feet', label: 'Feet flat on floor', checked: false },
    { id: 'keyboard', label: 'Keyboard at elbow height', checked: false },
    { id: 'chair', label: 'Good chair support', checked: false },
    { id: 'lighting', label: 'Adequate lighting', checked: false },
  ],
  notificationPreference: null,
  energyPattern: { pattern: null },
  breakStyles: [],
  demoCompleted: false,
  demoFeedback: null,
  timerPreset: 'pomodoro',
  notificationsEnabled: false,
  calendarIntegrated: false,
  trialStarted: false,
  selectedPlan: null,
  completedAt: null,
  currentScreen: 0,
  screenPath: [],
  totalTimeSpent: 0,
};
