import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffectiveTheme } from '@/hooks/useTheme';
import { SplashScreen } from '@/components/splash';
import {
  initializeNotifications,
  scheduleAllNotifications,
  scheduleBreakReminder,
} from '@/services/notifications';

// Prevent the native splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom dark theme matching our design system
const MicroBreaksDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#1A1A1A',
    primary: '#06FFA5',
    text: '#FFFFFF',
    border: '#2A2A2A',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const effectiveTheme = useEffectiveTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize notifications
        await initializeNotifications();

        // Schedule notifications
        await scheduleAllNotifications();

        // Artificial delay to ensure smooth experience
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Handle app state changes to reschedule break reminders
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, reschedule break reminder
        await scheduleBreakReminder();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Hide native splash once our app is ready
      ExpoSplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    // Onboarding navigation is handled by app/index.tsx using useOnboardingStore
  }, []);

  // Don't render anything until app is ready
  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? MicroBreaksDarkTheme : DefaultTheme}>
          <View style={styles.container}>
            {/* Main Navigation Stack */}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
              <Stack.Screen
                name="break-session"
                options={{
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="notifications"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_right',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: 'modal',
                  title: 'Modal',
                  headerShown: true,
                }}
              />
            </Stack>

            {/* Animated Splash Screen Overlay */}
            {showSplash && (
              <SplashScreen
                onAnimationComplete={handleSplashComplete}
                minimumDuration={2800}
              />
            )}
          </View>
          <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
