/**
 * App Entry Point
 * Redirects to main tabs (or onboarding if not completed)
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useOnboardingStore } from '@/store';

export default function AppIndex() {
  const isOnboardingComplete = useOnboardingStore((s) => s.isComplete);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from AsyncStorage
  useEffect(() => {
    const unsubscribe = useOnboardingStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Check if already hydrated
    if (useOnboardingStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#06FFA5" />
      </View>
    );
  }

  // Redirect based on onboarding status
  if (!isOnboardingComplete) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
