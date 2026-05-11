/**
 * Onboarding Layout
 * Stack navigator for the onboarding flow
 */

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // Disable swipe back to prevent skipping screens
      }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="work-role" />
      <Stack.Screen name="pain-assessment" />
      <Stack.Screen name="recommendation" />
      <Stack.Screen name="break-demo" />
      <Stack.Screen name="notification-permission" />
      <Stack.Screen name="premium-pitch" />
      <Stack.Screen name="completion" />
    </Stack>
  );
}
