import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
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
import { billingService } from '@/services/billing';
import { initializeFirebase } from '@/services/firebase/config';
import {
  initializeCrashlytics,
  setUser as setCrashlyticsUser,
} from '@/services/firebase/crashlytics-adapter';
import { initializeAuth, onAuthStateChanged } from '@/services/firebase/auth';
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
  const authStateUnsubRef = useRef<(() => void) | null>(null);
  const activeUserIdRef = useRef<string | null>(null);

  const teardownUserSession = useCallback(() => {
    if (tokenRefreshUnsubRef.current) {
      tokenRefreshUnsubRef.current();
      tokenRefreshUnsubRef.current = null;
    }

    syncService.shutdown();
    analytics.setUserId(null);
    analytics.setUserProperties({
      auth_type: null,
      sync_enabled: false,
      subscription_status: null,
      subscription_offer_id: null,
      subscription_entitlement: null,
      billing_provider: null,
      has_pro_access: false,
      billing_preview_mode: false,
    });
    setCrashlyticsUser(null);
    activeUserIdRef.current = null;
  }, []);

  const bindUserSession = useCallback(async (user: FirebaseAuthTypes.User) => {
    if (activeUserIdRef.current === user.uid) {
      return;
    }

    if (activeUserIdRef.current && activeUserIdRef.current !== user.uid) {
      teardownUserSession();
    }

    activeUserIdRef.current = user.uid;

    analytics.setUserId(user.uid);
    analytics.setUserProperties({
      auth_type: user.isAnonymous ? 'anonymous' : 'authenticated',
      sync_enabled: true,
    });
    setCrashlyticsUser(user.uid);

    await billingService.initialize({ appUserId: user.uid });
    await syncService.initialize(user.uid);

    try {
      await registerForPushNotifications(user.uid);
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to register for push notifications:', error);
      }
    }

    tokenRefreshUnsubRef.current = onTokenRefresh(user.uid);
  }, [teardownUserSession]);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Firebase first
        await initializeFirebase();

        // Initialize Crashlytics
        await initializeCrashlytics();

        // Initialize Firestore
        await initializeFirestore();

        // Initialize notifications
        await initializeNotifications();

        // Schedule notifications
        await scheduleAllNotifications();

        // Initialize analytics (now sends to Firebase Analytics)
        await analytics.initialize();

        // Initialize timer service (foreground tick + AppState handler)
        initializeTimerService();

        authStateUnsubRef.current = onAuthStateChanged((user) => {
          if (user) {
            void bindUserSession(user);
            return;
          }

          teardownUserSession();
        });

        const user = await initializeAuth();
        if (user) {
          await bindUserSession(user);
        }

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
      if (authStateUnsubRef.current) {
        authStateUnsubRef.current();
        authStateUnsubRef.current = null;
      }
      teardownUserSession();
      void analytics.shutdown();
      shutdownTimerService();
    };
  }, [bindUserSession, teardownUserSession]);

  // Handle app state changes to reschedule break reminders
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (billingService.isReady) {
          try {
            await billingService.refreshCustomerState();
          } catch (error) {
            if (__DEV__) {
              console.warn('Failed to refresh billing state on foreground:', error);
            }
          }
        }

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
                name="subscription"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
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
