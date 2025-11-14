/**
 * Onboarding Context
 * Manages onboarding state and provides methods to navigate through screens
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  OnboardingData,
  OnboardingContextType,
  INITIAL_ONBOARDING_DATA,
} from '../types/onboarding';

const ONBOARDING_STORAGE_KEY = '@microbreaks:onboarding_data';
const ONBOARDING_COMPLETED_KEY = '@microbreaks:onboarding_completed';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
  totalScreens: number;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  totalScreens,
}) => {
  const [data, setData] = useState<OnboardingData>({
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
  });

  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [startTime] = useState(Date.now());

  // Load saved progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  // Save progress whenever data changes
  useEffect(() => {
    saveProgress();
  }, [data, currentScreenIndex]);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed.data);
        setCurrentScreenIndex(parsed.currentScreenIndex);
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        JSON.stringify({ data, currentScreenIndex })
      );
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  };

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...updates,
      screenPath: [...prev.screenPath, `screen_${currentScreenIndex}`],
    }));
  }, [currentScreenIndex]);

  const goToNextScreen = useCallback(() => {
    if (currentScreenIndex < totalScreens - 1) {
      setCurrentScreenIndex((prev) => prev + 1);
    }
  }, [currentScreenIndex, totalScreens]);

  const goToPreviousScreen = useCallback(() => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex((prev) => prev - 1);
    }
  }, [currentScreenIndex]);

  const skipToScreen = useCallback((index: number) => {
    if (index >= 0 && index < totalScreens) {
      setCurrentScreenIndex(index);
    }
  }, [totalScreens]);

  const completeOnboarding = useCallback(async () => {
    const totalTime = Date.now() - startTime;
    const finalData = {
      ...data,
      completedAt: new Date(),
      totalTimeSpent: totalTime,
    };

    try {
      // Save completion status
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');

      // Save final data
      await AsyncStorage.setItem(
        '@microbreaks:user_profile',
        JSON.stringify(finalData)
      );

      // Clear onboarding progress
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);

      console.log('Onboarding completed successfully');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }, [data, startTime]);

  const progress = ((currentScreenIndex + 1) / totalScreens) * 100;

  const value: OnboardingContextType = {
    data,
    currentScreenIndex,
    totalScreens,
    updateData,
    goToNextScreen,
    goToPreviousScreen,
    skipToScreen,
    completeOnboarding,
    progress,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
