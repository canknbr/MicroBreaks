/**
 * Onboarding Store
 * Tracks onboarding completion and user preferences from onboarding flow
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createMmkvStorage } from '@/services/storage/zustandMmkv';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
import { ACTIVE_ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';
import { normalizeBreakStylePreferences } from '@/services/recommendations/scoring';

export interface OnboardingData {
  workRole: string | null;
  screenTime: number | null; // hours per day
  painAreas: string[];
  painSeverity: Record<string, 'mild' | 'moderate' | 'severe'>;
  workPattern: string | null;
  energyPattern: string | null;
  breakStyle: string[];
  breakInterval: number; // minutes
  notificationsEnabled: boolean;
  calendarIntegration: boolean;
}

interface OnboardingState {
  // State
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;

  // Actions
  setCurrentStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  skipOnboarding: () => void;
}

export const ONBOARDING_STORE_PERSIST_KEY = ZUSTAND_PERSIST_KEYS.ONBOARDING;

export const initialOnboardingData: OnboardingData = {
  workRole: null,
  screenTime: null,
  painAreas: [],
  painSeverity: {},
  workPattern: null,
  energyPattern: null,
  breakStyle: [],
  breakInterval: 25,
  notificationsEnabled: true,
  calendarIntegration: false,
};

function sanitizePainSeverity(
  value: unknown
): Record<string, 'mild' | 'moderate' | 'severe'> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const next: Record<string, 'mild' | 'moderate' | 'severe'> = {};

  for (const [key, severity] of Object.entries(value)) {
    if (
      typeof key === 'string' &&
      (severity === 'mild' || severity === 'moderate' || severity === 'severe')
    ) {
      next[key] = severity;
    }
  }

  return next;
}

function sanitizePersistedOnboardingState(state: unknown): Pick<
  OnboardingState,
  'isComplete' | 'currentStep' | 'totalSteps' | 'data'
> {
  const persisted = state && typeof state === 'object' ? state as Partial<OnboardingState> : {};
  const data = persisted.data && typeof persisted.data === 'object'
    ? persisted.data as Partial<OnboardingData>
    : {};

  return {
    isComplete: persisted.isComplete === true,
    currentStep:
      typeof persisted.currentStep === 'number' && persisted.currentStep >= 0
        ? Math.floor(persisted.currentStep)
        : 0,
    totalSteps: ACTIVE_ONBOARDING_TOTAL_STEPS,
    data: {
      workRole: typeof data.workRole === 'string' ? data.workRole : null,
      screenTime: typeof data.screenTime === 'number' && Number.isFinite(data.screenTime)
        ? data.screenTime
        : null,
      painAreas: Array.isArray(data.painAreas)
        ? data.painAreas.filter((area): area is string => typeof area === 'string')
        : [],
      painSeverity: sanitizePainSeverity(data.painSeverity),
      workPattern: typeof data.workPattern === 'string' ? data.workPattern : null,
      energyPattern: typeof data.energyPattern === 'string' ? data.energyPattern : null,
      breakStyle: Array.isArray(data.breakStyle)
        ? normalizeBreakStylePreferences(
            data.breakStyle.filter((style): style is string => typeof style === 'string')
          )
        : [],
      breakInterval:
        typeof data.breakInterval === 'number' && Number.isFinite(data.breakInterval) && data.breakInterval > 0
          ? Math.round(data.breakInterval)
          : initialOnboardingData.breakInterval,
      notificationsEnabled:
        typeof data.notificationsEnabled === 'boolean'
          ? data.notificationsEnabled
          : initialOnboardingData.notificationsEnabled,
      calendarIntegration:
        typeof data.calendarIntegration === 'boolean'
          ? data.calendarIntegration
          : initialOnboardingData.calendarIntegration,
    },
  };
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Initial State
      isComplete: false,
      currentStep: 0,
      totalSteps: ACTIVE_ONBOARDING_TOTAL_STEPS,
      data: initialOnboardingData,

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      updateData: (newData) =>
        set((state) => {
          const merged: OnboardingData = {
            ...state.data,
            ...newData,
            breakStyle: Array.isArray(newData.breakStyle)
              ? normalizeBreakStylePreferences(newData.breakStyle)
              : state.data.breakStyle,
          };

          // C-BUG8: when painAreas is rewritten, prune any painSeverity
          // entries that no longer correspond to a selected area so the
          // recommendation engine does not see zombie severity signals.
          const painAreasRewritten = Array.isArray(newData.painAreas);
          const severityRewritten = newData.painSeverity !== undefined;
          if (painAreasRewritten || severityRewritten) {
            const allowed = new Set(merged.painAreas);
            const pruned: OnboardingData['painSeverity'] = {};
            for (const [area, severity] of Object.entries(merged.painSeverity)) {
              if (allowed.has(area)) {
                pruned[area] = severity;
              }
            }
            merged.painSeverity = pruned;
          }

          return { data: merged };
        }),

      completeOnboarding: () =>
        set({
          isComplete: true,
          currentStep: ACTIVE_ONBOARDING_TOTAL_STEPS,
        }),

      skipOnboarding: () =>
        set({
          isComplete: true,
          currentStep: 0,
          data: initialOnboardingData,
        }),

      resetOnboarding: () =>
        set({
          isComplete: false,
          currentStep: 0,
          data: initialOnboardingData,
        }),
    }),
    {
      name: ONBOARDING_STORE_PERSIST_KEY,
      storage: createMmkvStorage(),
      version: 1,
      migrate: (persistedState) => sanitizePersistedOnboardingState(persistedState),
    }
  )
);

export const onboardingStoreTestUtils = {
  sanitizePersistedOnboardingState,
};

export default useOnboardingStore;
