/**
 * Onboarding Layout
 * Main onboarding flow navigation
 */

import React from 'react';
import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../contexts/OnboardingContext';

// Total number of onboarding screens
const TOTAL_SCREENS = 21;

export default function OnboardingLayout() {
  return (
    <OnboardingProvider totalScreens={TOTAL_SCREENS}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: false, // Disable swipe back during onboarding
        }}
      />
    </OnboardingProvider>
  );
}
