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
      <Stack.Screen name="social-proof" />
      <Stack.Screen name="value-promise" />
      <Stack.Screen name="work-role" />
      <Stack.Screen name="screen-time" />
      <Stack.Screen name="pain-assessment" />
      <Stack.Screen name="work-pattern" />
      <Stack.Screen name="ergonomic-setup" />
      <Stack.Screen name="notification-preference" />
      <Stack.Screen name="energy-pattern" />
      <Stack.Screen name="break-style" />
      <Stack.Screen name="recommendation" />
      <Stack.Screen name="break-demo" />
      <Stack.Screen name="value-display" />
      <Stack.Screen name="impact-education" />
      <Stack.Screen name="timer-config" />
      <Stack.Screen name="notification-permission" />
      <Stack.Screen name="calendar-integration" />
      <Stack.Screen name="first-session" />
      <Stack.Screen name="premium-pitch" />
      <Stack.Screen name="completion" />
    </Stack>
  );
}
