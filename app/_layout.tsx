import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useEffectiveTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { SplashScreen } from '@/components/splash';
import {
  initializeNotifications,
  scheduleAllNotifications,
  scheduleBreakReminder,
} from '@/services/notifications';
import { analytics } from '@/services/analytics';
import { initializeFirebase } from '@/services/firebase/config';
import { initializeCrashlytics } from '@/services/firebase/crashlytics-adapter';
import { initializeAuth } from '@/services/firebase/auth';
import { initializeFirestore } from '@/services/firebase/firestore';
import { registerForPushNotifications, onTokenRefresh } from '@/services/firebase/messaging';
import { syncService } from '@/services/sync';
import { initializeTimerService, shutdownTimerService } from '@/services/timerService';
import OfflineBanner from '@/components/common/OfflineBanner';

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
  const effectiveTheme = useEffectiveTheme();
  const { i18n } = useTranslation();
  const [showSplash, setShowSplash] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);
  const tokenRefreshUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Firebase first
        await initializeFirebase();

        // Initialize Crashlytics
        await initializeCrashlytics();

        // Initialize Firestore
        await initializeFirestore();

        // Initialize Auth, start sync, and register for push
        const user = await initializeAuth();
        if (user) {
          await syncService.initialize(user.uid);
          try {
            await registerForPushNotifications(user.uid);
          } catch (e) {
            if (__DEV__) console.warn('Failed to register for push notifications:', e);
          }
          const unsubTokenRefresh = onTokenRefresh(user.uid);
          tokenRefreshUnsubRef.current = unsubTokenRefresh;
        }

        // Initialize notifications
        await initializeNotifications();

        // Schedule notifications
        await scheduleAllNotifications();

        // Initialize analytics (now sends to Firebase Analytics)
        await analytics.initialize();

        // Initialize timer service (foreground tick + AppState handler)
        initializeTimerService();

        // Artificial delay to ensure smooth experience
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();

    return () => {
      // Cleanup sync, analytics, and timer on unmount
      syncService.shutdown();
      void analytics.shutdown();
      shutdownTimerService();
      if (tokenRefreshUnsubRef.current) {
        tokenRefreshUnsubRef.current();
        tokenRefreshUnsubRef.current = null;
      }
    };
  }, []);

  // Handle app state changes to reschedule break reminders
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, reschedule break reminder
        try {
          await scheduleBreakReminder();
        } catch (error) {
          if (__DEV__) {
            console.warn('Failed to schedule break reminder on foreground:', error);
          }
        }
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
    <GestureHandlerRootView style={styles.container} accessibilityLanguage={i18n.language}>
      <SafeAreaProvider>
        <ThemeProvider value={effectiveTheme === 'dark' ? MicroBreaksDarkTheme : DefaultTheme}>
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
                name="privacy-policy"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_right',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="terms-of-service"
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
                minimumDuration={1200}
              />
            )}
          </View>
          <OfflineBanner />
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
