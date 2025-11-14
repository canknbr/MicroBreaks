/**
 * Onboarding Index
 * Entry point for onboarding flow - redirects to welcome screen
 */

import { Redirect } from 'expo-router';

export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/welcome" />;
}
