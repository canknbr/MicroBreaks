/**
 * Onboarding Index
 * Main onboarding flow controller
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../../contexts/OnboardingContext';

// Phase 1: Hook
import { WelcomeScreen } from '../../components/onboarding/screens/WelcomeScreen';
import { SocialProofScreen } from '../../components/onboarding/screens/SocialProofScreen';
import { ValuePromiseScreen } from '../../components/onboarding/screens/ValuePromiseScreen';

// Phase 2: Profile Building
import { WorkRoleScreen } from '../../components/onboarding/screens/WorkRoleScreen';
import { ScreenTimeScreen } from '../../components/onboarding/screens/ScreenTimeScreen';
import { PainAssessmentScreen } from '../../components/onboarding/screens/PainAssessmentScreen';
import { WorkPatternScreen } from '../../components/onboarding/screens/WorkPatternScreen';
import {
  ErgoSetupScreen,
  NotificationPreferenceScreen,
  EnergyPatternScreen,
  BreakStyleScreen,
  AIRecommendationScreen,
  LiveDemoScreen,
  ValueDisplayScreen,
  EducationScreen,
  TimerConfigScreen,
  NotificationPermissionScreen,
  CalendarIntegrationScreen,
  FirstSessionScreen,
  PremiumPitchScreen,
  CompletionScreen,
} from '../../components/onboarding/screens/AllRemainingScreens';

// Define all screens in order (Total: 21 screens)
const ONBOARDING_SCREENS = [
  // Phase 1: Hook (3 screens)
  WelcomeScreen,
  SocialProofScreen,
  ValuePromiseScreen,

  // Phase 2: Profile Building (8 screens)
  WorkRoleScreen,
  ScreenTimeScreen,
  PainAssessmentScreen,
  WorkPatternScreen,
  ErgoSetupScreen,
  NotificationPreferenceScreen,
  EnergyPatternScreen,
  BreakStyleScreen,

  // Phase 3: Demonstration (4 screens)
  AIRecommendationScreen,
  LiveDemoScreen,
  ValueDisplayScreen,
  EducationScreen,

  // Phase 4: Activation (4 screens)
  TimerConfigScreen,
  NotificationPermissionScreen,
  CalendarIntegrationScreen,
  FirstSessionScreen,

  // Phase 5: Monetization (2 screens)
  PremiumPitchScreen,
  CompletionScreen,
];

export default function OnboardingScreen() {
  const { currentScreenIndex, data } = useOnboarding();
  const router = useRouter();

  // Get the current screen component
  const CurrentScreen = ONBOARDING_SCREENS[currentScreenIndex] || WelcomeScreen;

  useEffect(() => {
    // Check if onboarding is already completed
    // If yes, navigate to main app
    if (data.completedAt) {
      router.replace('/(tabs)');
    }
  }, [data.completedAt]);

  return (
    <View style={styles.container}>
      <CurrentScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
