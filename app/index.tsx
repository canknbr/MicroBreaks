/**
 * App Entry Point
 * Redirects to main tabs (or onboarding if not completed)
 */

import { Redirect } from 'expo-router';

export default function AppIndex() {
  // TODO: Check onboarding completion status
  // const isOnboardingComplete = useOnboardingStore((s) => s.isComplete);
  // if (!isOnboardingComplete) {
  //   return <Redirect href="/(onboarding)/welcome" />;
  // }

  return <Redirect href="/(tabs)" />;
}
