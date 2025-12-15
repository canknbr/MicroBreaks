/**
 * Onboarding Store
 * Tracks onboarding completion and user preferences from onboarding flow
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingData {
  workRole: string | null;
  screenTime: number | null; // hours per day
  painAreas: string[];
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

const initialData: OnboardingData = {
  workRole: null,
  screenTime: null,
  painAreas: [],
  workPattern: null,
  energyPattern: null,
  breakStyle: [],
  breakInterval: 25,
  notificationsEnabled: true,
  calendarIntegration: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Initial State
      isComplete: false,
      currentStep: 0,
      totalSteps: 21,
      data: initialData,

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      updateData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
        })),

      completeOnboarding: () =>
        set({
          isComplete: true,
          currentStep: 21,
        }),

      skipOnboarding: () =>
        set({
          isComplete: true,
          currentStep: 0,
          data: initialData,
        }),

      resetOnboarding: () =>
        set({
          isComplete: false,
          currentStep: 0,
          data: initialData,
        }),
    }),
    {
      name: 'microbreaks-onboarding',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useOnboardingStore;
