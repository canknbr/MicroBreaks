/**
 * Onboarding Index
 * Entry point for onboarding flow - redirects to welcome screen
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome screen
    router.replace('/(onboarding)/welcome');
  }, []);

  return null;
}
