/**
 * Onboarding Flow Types
 * Type definitions for the MicroBreaks onboarding experience
 */

export type OnboardingScreenId =
  | 'ONB_001'
  | 'ONB_002'
  | 'ONB_003'
  | 'ONB_004'
  | 'ONB_005'
  | 'ONB_006'
  | 'ONB_007'
  | 'ONB_008'
  | 'ONB_009'
  | 'ONB_010'
  | 'ONB_011'
  | 'ONB_012'
  | 'ONB_013'
  | 'ONB_014'
  | 'ONB_015'
  | 'ONB_016'
  | 'ONB_017'
  | 'ONB_018'
  | 'ONB_019'
  | 'ONB_020'
  | 'ONB_021';

export type OnboardingPhase =
  | 'HOOK'
  | 'PROFILE'
  | 'DEMONSTRATION'
  | 'ACTIVATION'
  | 'MONETIZATION';

export interface UserProfile {
  // Work Context
  workRole?:
    | 'developer'
    | 'designer'
    | 'analyst'
    | 'student'
    | 'manager'
    | 'writer'
    | 'support'
    | 'other';
  dailyScreenTime?: number; // hours
  workPattern?: 'deep_focus' | 'task_switching' | 'meeting_heavy' | 'flexible';

  // Health Status
  painAreas?: PainArea[];
  painSeverity?: Record<PainArea, 'mild' | 'moderate' | 'severe'>;
  ergonomicScore?: number;

  // Preferences
  notificationStyle?: 'gentle' | 'balanced' | 'strict' | 'smart';
  energyPattern?:
    | 'morning_person'
    | 'night_owl'
    | 'afternoon_slump'
    | 'steady_energy'
    | 'custom';
  breakStyles?: BreakStyle[];

  // Settings
  workInterval?: number; // minutes
  breakInterval?: number; // minutes
  timerPreset?: 'pomodoro' | 'deep_work' | 'micro_session' | 'custom';

  // Permissions
  notificationsEnabled?: boolean;
  calendarIntegrationEnabled?: boolean;
  calendarProvider?: 'google' | 'outlook' | 'apple';

  // Trial & Subscription
  trialStarted?: boolean;
  subscriptionType?: 'free' | 'trial' | 'premium';
}

export type PainArea =
  | 'eyes'
  | 'head'
  | 'neck'
  | 'shoulders'
  | 'upper_back'
  | 'lower_back'
  | 'wrists'
  | 'hands'
  | 'none';

export type BreakStyle =
  | 'movement'
  | 'desk_exercises'
  | 'breathing'
  | 'eye_micro'
  | 'mixed';

export interface OnboardingContext {
  currentScreen: OnboardingScreenId;
  userData: Partial<UserProfile>;
  startTime: Date;
  screenTimes: Record<OnboardingScreenId, number>;
  skipEvents: OnboardingScreenId[];
  backEvents: OnboardingScreenId[];
  completionPath: OnboardingScreenId[];
  abTestVariants?: Record<string, string>;
}

export type OnboardingState =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'abandoned'
  | 'returning';

export interface OnboardingScreenProps {
  onNext: (data?: Partial<UserProfile>) => void;
  onBack: () => void;
  onSkip?: () => void;
  userData: Partial<UserProfile>;
  screenId: OnboardingScreenId;
}

export interface AnalyticsEvent {
  eventName: string;
  screenId: OnboardingScreenId;
  timestamp: Date;
  data?: Record<string, any>;
}
