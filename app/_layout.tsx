import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, AppState, AppStateStatus, LogBox } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useEffectiveTheme } from '@/hooks/useTheme';
import { useNotificationDeepLinks } from '@/hooks/useNotificationDeepLinks';
import { useTranslation } from 'react-i18next';
import { BootstrapStatusScreen } from '@/components/bootstrap';
import { SplashScreen } from '@/components/splash';
import {
  initializeNotifications,
  scheduleAllNotifications,
  scheduleBreakReminder,
} from '@/services/notifications';
import { analytics } from '@/services/analytics';
import { billingService } from '@/services/billing';
import type { BootstrapIssue, BootstrapPhase } from '@/services/bootstrap';
import { runBootstrapSteps } from '@/services/bootstrap';
import { firebase, initializeFirebase } from '@/services/firebase/config';
import {
  initializeCrashlytics,
  setUser as setCrashlyticsUser,
} from '@/services/firebase/crashlytics-adapter';
import { initializeAuth, onAuthStateChanged } from '@/services/firebase/auth';
import { initializeAppCheck } from '@/services/firebase/appCheck';
import { initializeFirestore } from '@/services/firebase/firestore';
import { useTierStateSync } from '@/hooks/useTierStateSync';
import { useEntitlementLedgerSync } from '@/hooks/useEntitlementLedgerSync';
import { registerForPushNotifications, onTokenRefresh } from '@/services/firebase/messaging';
import { syncService } from '@/services/sync';
import { initializeTimerService, shutdownTimerService } from '@/services/timerService';
import { widgetDataBridge } from '@/services/widgets/widgetDataBridge';
import {
  initializeShortcutHandler,
  shutdownShortcutHandler,
} from '@/services/shortcuts/handler';
import { useUserStore, flushProgressSideEffects } from '@/store/userStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useTimerStore } from '@/store/timerStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useRoutinesStore } from '@/store/routinesStore';
import { useMissionsStore } from '@/store/missionsStore';
import { useBuddiesStore } from '@/store/buddiesStore';
import OfflineBanner from '@/components/common/OfflineBanner';

// Prevent the native splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync();

// Dev-only: silence known-benign console noise so the LogBox stays clean.
if (__DEV__) {
  LogBox.ignoreLogs([
    'i18next::pluralResolver',
    'This method is deprecated',
    '[Auth] initialize skipped',
  ]);
}

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom dark theme matching our design system
const UnwindDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0C0B0F',
    card: '#1C1922',
    primary: '#FF2472',
    text: '#FFFFFF',
    border: '#26222E',
  },
};

function getBootstrapErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return 'Unknown startup failure';
}

function syncAuthenticatedUserState(user: FirebaseAuthTypes.User): boolean {
  const nextEmail = user.email ?? null;
  const nextEmailVerified = user.emailVerified === true;
  const nextAuthenticated = !user.isAnonymous;
  const currentState = useUserStore.getState();
  const emailChanged = currentState.profile.email !== nextEmail;
  const emailVerificationChanged = currentState.profile.emailVerified !== nextEmailVerified;
  const authChanged = currentState.isAuthenticated !== nextAuthenticated;

  if (!emailChanged && !emailVerificationChanged && !authChanged) {
    return false;
  }

  useUserStore.setState((state) => ({
    profile: {
      ...state.profile,
      email: nextEmail,
      emailVerified: nextEmailVerified,
      updatedAt: Date.now(),
    },
    isAuthenticated: nextAuthenticated,
  }));

  return true;
}

export default function RootLayout() {
  const effectiveTheme = useEffectiveTheme();
  const { i18n } = useTranslation();
  const [fontsLoaded, fontError] = useFonts({
    'GeneralSans-Regular': require('../assets/fonts/GeneralSans-Regular.ttf'),
    'GeneralSans-Medium': require('../assets/fonts/GeneralSans-Medium.ttf'),
    'GeneralSans-Semibold': require('../assets/fonts/GeneralSans-Semibold.ttf'),
    'GeneralSans-Bold': require('../assets/fonts/GeneralSans-Bold.ttf'),
    'JetBrainsMono-Regular': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Medium': require('../assets/fonts/JetBrainsMono-Medium.ttf'),
    'JetBrainsMono-Bold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
  });
  useNotificationDeepLinks();
  // Bridges the React-side effective tier into the `tierState`
  // singleton so non-React services (HealthKit writes, calendar reads,
  // etc) can synchronously gate on the user's tier.
  useTierStateSync();
  // Mirrors the server entitlement ledger into subscriptionStore so
  // synchronous reads of `customer.status` reflect server truth.
  useEntitlementLedgerSync();
  const [showSplash, setShowSplash] = useState(true);
  const [bootstrapPhase, setBootstrapPhase] = useState<BootstrapPhase>('loading');
  const [bootstrapIssues, setBootstrapIssues] = useState<BootstrapIssue[]>([]);
  const tokenRefreshUnsubRef = useRef<(() => void) | null>(null);
  const authStateUnsubRef = useRef<(() => void) | null>(null);
  const activeUserIdRef = useRef<string | null>(null);
  const prepareAttemptRef = useRef(0);
  const isMountedRef = useRef(true);

  const teardownUserSession = useCallback(async () => {
    if (tokenRefreshUnsubRef.current) {
      tokenRefreshUnsubRef.current();
      tokenRefreshUnsubRef.current = null;
    }

    // Flush any in-flight progress side effects so the sync queue gets the
    // last mutation before we shut down. Without this, a rapid sign-out can
    // drop the very last write — see audit task A8.
    await flushProgressSideEffects();

    await syncService.shutdown();
    useUserStore.setState((state) => ({
      profile: {
        ...state.profile,
        email: null,
        emailVerified: false,
        updatedAt: Date.now(),
      },
      isAuthenticated: false,
    }));
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

  const appendBootstrapIssue = useCallback((issue: BootstrapIssue) => {
    setBootstrapIssues((current) => {
      const alreadyPresent = current.some(
        (entry) =>
          entry.step === issue.step &&
          entry.message === issue.message &&
          entry.critical === issue.critical
      );
      return alreadyPresent ? current : [...current, issue];
    });
    setBootstrapPhase((current) => (current === 'blocked' ? current : 'degraded'));
  }, []);

  const reportOptionalBootstrapFailure = useCallback(
    (step: string, error: unknown) => {
      if (__DEV__) {
        console.warn(`[Bootstrap] Optional step failed: ${step}`, error);
      }

      appendBootstrapIssue({
        step,
        critical: false,
        message: getBootstrapErrorMessage(error),
      });
    },
    [appendBootstrapIssue]
  );

  const bindUserSession = useCallback(async (
    user: FirebaseAuthTypes.User,
    onIssue?: (issue: BootstrapIssue) => void
  ) => {
    const authProfileChanged = syncAuthenticatedUserState(user);

    if (activeUserIdRef.current === user.uid) {
      if (authProfileChanged) {
        await syncService.queueDataChange('profile');
      }
      return;
    }

    if (activeUserIdRef.current && activeUserIdRef.current !== user.uid) {
      await teardownUserSession();
    }

    activeUserIdRef.current = user.uid;

    analytics.setUserId(user.uid);
    analytics.setUserProperties({
      auth_type: user.isAnonymous ? 'anonymous' : 'authenticated',
      sync_enabled: true,
    });
    setCrashlyticsUser(user.uid);

    const reportIssue = (step: string, error: unknown) => {
      const issue = {
        step,
        critical: false,
        message: getBootstrapErrorMessage(error),
      };

      if (onIssue) {
        onIssue(issue);
        return;
      }

      reportOptionalBootstrapFailure(step, error);
    };

    try {
      await billingService.initialize({ appUserId: user.uid });
    } catch (error) {
      reportIssue('billing', error);
    }

    try {
      await syncService.initialize(user.uid);
      if (authProfileChanged) {
        await syncService.queueDataChange('profile');
      }
    } catch (error) {
      reportIssue('sync', error);
    }

    try {
      await registerForPushNotifications(user.uid);
    } catch (error) {
      reportIssue('push_registration', error);
    }

    try {
      tokenRefreshUnsubRef.current = onTokenRefresh(user.uid);
    } catch (error) {
      reportIssue('push_token_listener', error);
    }
  }, [reportOptionalBootstrapFailure, teardownUserSession]);

  const resetBootstrapResources = useCallback(async () => {
    if (authStateUnsubRef.current) {
      authStateUnsubRef.current();
      authStateUnsubRef.current = null;
    }

    try {
      await teardownUserSession();
    } catch (error) {
      reportOptionalBootstrapFailure('session_reset', error);
    }

    try {
      await analytics.shutdown();
    } catch (error) {
      if (__DEV__) {
        console.warn('[Bootstrap] Failed to shutdown analytics cleanly:', error);
      }
    }

    shutdownTimerService();
    widgetDataBridge.shutdown();
    shutdownShortcutHandler();
  }, [reportOptionalBootstrapFailure, teardownUserSession]);

  const prepareApp = useCallback(async () => {
    const attemptId = ++prepareAttemptRef.current;

    setBootstrapPhase('loading');
    setBootstrapIssues([]);
    setShowSplash(true);

    try {
      await resetBootstrapResources();

      if (!isMountedRef.current || prepareAttemptRef.current !== attemptId) {
        return;
      }

      const deferredIssues: BootstrapIssue[] = [];
      const collectDeferredIssue = (issue: BootstrapIssue) => {
        deferredIssues.push(issue);
        if (__DEV__) {
          console.warn(`[Bootstrap] Deferred issue during startup: ${issue.step}`, issue.message);
        }
      };

      const result = await runBootstrapSteps([
        {
          name: 'firebase',
          critical: true,
          run: async () => {
            await initializeFirebase();
            if (!firebase.apps.length) {
              throw new Error('Firebase app is unavailable. Check native Firebase configuration.');
            }
          },
        },
        {
          name: 'hydrate_stores',
          critical: true,
          run: async () => {
            const stores = [
              useOnboardingStore,
              useUserStore,
              useSettingsStore,
              useNotificationStore,
              useTimerStore,
              useSubscriptionStore,
              useRoutinesStore,
              useMissionsStore,
              useBuddiesStore,
            ];
            const waitForHydration = (store: any) => {
              return new Promise<void>((resolve) => {
                if (store.persist.hasHydrated()) {
                  resolve();
                } else {
                  const unsub = store.persist.onFinishHydration(() => {
                    unsub();
                    resolve();
                  });
                }
              });
            };
            await Promise.all(stores.map(waitForHydration));
          },
        },
        {
          name: 'crashlytics',
          run: async () => {
            await initializeCrashlytics();
          },
        },
        {
          // App Check must come before Firestore / Functions / Storage so
          // every outbound request carries an attestation token. The init
          // is a no-op until @react-native-firebase/app-check is installed
          // and the Firebase Console providers are enabled, so this is
          // safe to land ahead of the dashboard side.
          name: 'app_check',
          run: async () => {
            await initializeAppCheck();
          },
        },
        {
          name: 'firestore',
          run: async () => {
            await initializeFirestore();
          },
        },
        {
          name: 'notifications',
          run: async () => {
            await initializeNotifications();
          },
        },
        {
          name: 'notification_schedule',
          run: async () => {
            await scheduleAllNotifications();
          },
        },
        {
          name: 'analytics',
          run: async () => {
            await analytics.initialize();
          },
        },
        {
          name: 'timer_service',
          run: () => {
            initializeTimerService();
          },
        },
        {
          name: 'widget_data_bridge',
          run: async () => {
            // Best-effort: a widget snapshot failure must not block boot.
            await widgetDataBridge.initialize();
          },
        },
        {
          name: 'shortcut_handler',
          run: () => {
            // Bridges Siri / Spotlight / Action Button App Intents
            // into expo-router. No-op on Android + before prebuild.
            initializeShortcutHandler();
          },
        },
        {
          name: 'auth',
          critical: true,
          run: async () => {
            const user = await initializeAuth();
            if (!user) {
              if (__DEV__) {
                // Dev-only bypass: the repo ships a mock GoogleService-Info.plist
                // (mock-project-id), so signInAnonymously() returns
                // auth/internal-error. Don't hard-block the simulator build — boot
                // into a local/offline (no-session) mode instead of "Startup Blocked".
                console.warn(
                  '[Bootstrap] Auth unavailable in dev (mock Firebase config) — continuing without a signed-in session.'
                );
                return;
              }
              throw new Error('Failed to establish an anonymous session.');
            }

            await bindUserSession(user, collectDeferredIssue);

            authStateUnsubRef.current = onAuthStateChanged((nextUser) => {
              if (nextUser) {
                void bindUserSession(nextUser).catch((error) => {
                  reportOptionalBootstrapFailure('auth_state_change_bind', error);
                });
                return;
              }

              void teardownUserSession().catch((error) => {
                reportOptionalBootstrapFailure('auth_state_change_teardown', error);
              });
            });
          },
        },
      ]);

      if (!isMountedRef.current || prepareAttemptRef.current !== attemptId) {
        return;
      }

      const allIssues = [...result.issues, ...deferredIssues];
      const nextPhase =
        result.phase === 'blocked'
          ? 'blocked'
          : allIssues.length > 0
            ? 'degraded'
            : 'ready';

      if (nextPhase !== 'blocked') {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (!isMountedRef.current || prepareAttemptRef.current !== attemptId) {
        return;
      }

      setBootstrapIssues(allIssues);
      setBootstrapPhase(nextPhase);

      if (nextPhase === 'blocked') {
        setShowSplash(false);
      }
    } catch (error) {
      if (!isMountedRef.current || prepareAttemptRef.current !== attemptId) {
        return;
      }

      setBootstrapIssues([
        {
          step: 'bootstrap_runtime',
          critical: true,
          message: getBootstrapErrorMessage(error),
        },
      ]);
      setBootstrapPhase('blocked');
      setShowSplash(false);
    }
  }, [bindUserSession, reportOptionalBootstrapFailure, resetBootstrapResources, teardownUserSession]);

  useEffect(() => {
    isMountedRef.current = true;
    void prepareApp().catch((error) => {
      if (__DEV__) {
        console.warn('[Bootstrap] Unexpected prepareApp failure:', error);
      }
    });

    return () => {
      isMountedRef.current = false;
      void resetBootstrapResources().catch((error) => {
        if (__DEV__) {
          console.warn('[Bootstrap] Failed to reset resources during unmount:', error);
        }
      });
    };
  }, [prepareApp, resetBootstrapResources]);

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
    if (bootstrapPhase !== 'loading') {
      // Hide native splash once our app is ready
      void ExpoSplashScreen.hideAsync();
    }
  }, [bootstrapPhase]);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    // Onboarding navigation is handled by app/index.tsx using useOnboardingStore
  }, []);

  const appIsReady = bootstrapPhase !== 'loading';
  const blockedIssue = bootstrapIssues.find((issue) => issue.critical) ?? bootstrapIssues[0];

  // Don't render anything until app is ready (incl. custom fonts).
  // A font error still lets us render with the system fallback.
  if (!appIsReady || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container} accessibilityLanguage={i18n.language}>
      <SafeAreaProvider>
        <ThemeProvider value={effectiveTheme === 'dark' ? UnwindDarkTheme : DefaultTheme}>
          <View style={styles.container}>
            {bootstrapPhase === 'blocked' && blockedIssue ? (
              <BootstrapStatusScreen
                issue={blockedIssue}
                onRetry={() => {
                  void prepareApp();
                }}
              />
            ) : (
              <>
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
                    name="exercise-library"
                    options={{
                      animation: 'slide_from_right',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="exercise-detail"
                    options={{
                      animation: 'slide_from_right',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="routine-builder"
                    options={{
                      presentation: 'modal',
                      animation: 'slide_from_bottom',
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
                    name="weekly-story"
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
                {showSplash && bootstrapPhase !== 'blocked' && (
                  <SplashScreen
                    onAnimationComplete={handleSplashComplete}
                    minimumDuration={2000}
                  />
                )}
              </>
            )}
          </View>
          {bootstrapPhase !== 'blocked' && <OfflineBanner />}
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
