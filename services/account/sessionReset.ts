import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultAppSettings,
  initialOnboardingData,
  getTodayKey,
  initialTimerPreferences,
  initialTimerSession,
  initialTimerStats,
  initialUserAchievements,
  initialUserPreferences,
  initialUserProgress,
  initialUserProfile,
  useNotificationStore,
  useOnboardingStore,
  useSettingsStore,
  useSubscriptionStore,
  useTimerStore,
  useUserStore,
} from '@/store';
import { flushProgressSideEffects } from '@/store/userStore';
import { cancelAllNotifications } from '@/services/notifications';
import {
  deleteAuthAccount,
  getCurrentUserId,
  refreshAnonymousSession,
  signInWithEmailPassword,
  signOut,
} from '@/services/firebase/auth';
import { deleteAllUserData } from '@/services/firebase/firestore';
import { unregisterPushNotifications } from '@/services/firebase/messaging';
import { syncService } from '@/services/sync';

const RESETTABLE_STORAGE_PREFIXES = ['@microbreaks/', 'microbreaks-'];

function shouldResetStorageKey(key: string): boolean {
  return RESETTABLE_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix));
}

async function clearAppStorage(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter(shouldResetStorageKey);

  if (appKeys.length > 0) {
    await AsyncStorage.multiRemove(appKeys);
  }
}

function resetInMemoryStores(): void {
  useOnboardingStore.setState({
    isComplete: false,
    currentStep: 0,
    totalSteps: useOnboardingStore.getState().totalSteps,
    data: { ...initialOnboardingData, painAreas: [], breakStyle: [] },
  });

  useUserStore.setState({
    profile: {
      ...initialUserProfile,
      joinedAt: new Date().toISOString(),
    },
    progress: { ...initialUserProgress },
    preferences: {
      ...initialUserPreferences,
      favoriteBreaks: [],
      recentBreaks: [],
    },
    achievements: {
      ...initialUserAchievements,
      unlockedIds: [],
      unlockedAt: {},
      categoryBreaks: {},
    },
    isAuthenticated: false,
  });

  useSettingsStore.setState({
    settings: {
      ...defaultAppSettings,
      workDays: [...defaultAppSettings.workDays],
    },
    settingsUpdatedAt: 0,
  });

  useNotificationStore.setState({ notifications: [] });

  useTimerStore.setState({
    session: { ...initialTimerSession },
    stats: {
      ...initialTimerStats,
      lastResetDate: getTodayKey(),
    },
    preferences: { ...initialTimerPreferences },
  });

  useSubscriptionStore.getState().resetSubscription();
}

export async function clearLocalSessionState(): Promise<void> {
  // Drain any pending progress side effects before resetting state — once
  // resetInMemoryStores has run the queued sync write would race against a
  // freshly-zeroed progress projection.
  await flushProgressSideEffects();
  await cancelAllNotifications();
  resetInMemoryStores();
  await clearAppStorage();
}

export async function replaceWithFreshAnonymousSession(options?: {
  deleteRemoteUserData?: boolean;
}): Promise<void> {
  const userId = getCurrentUserId();

  await syncService.shutdown();

  if (!options?.deleteRemoteUserData && userId) {
    // Best-effort — orphaned token is harmless.
    try {
      await unregisterPushNotifications(userId);
    } catch {
      // ignored
    }
  }

  if (options?.deleteRemoteUserData && userId) {
    await deleteAllUserData(userId);
  }

  // Run the destructive auth op BEFORE wiping local state. If the auth op
  // fails (network, Firebase outage), we still have the user's local data
  // and they can retry. The previous order — clear-then-auth — meant a
  // failed signOut would leave the user with their data wiped and no
  // visible recovery path.
  if (options?.deleteRemoteUserData) {
    await deleteAuthAccount();
  } else {
    await signOut();
  }

  await clearLocalSessionState();

  // If this fails the user is signed out with empty local state; the
  // bootstrap path in `_layout.tsx` will create a fresh anonymous user
  // on the next foreground/reconnect, so we surface the error but the
  // app is not left in an unrecoverable state.
  const freshUser = await refreshAnonymousSession();
  if (!freshUser) {
    throw new Error('Could not start a fresh anonymous session.');
  }
}

export async function signInWithRecoveredAccount(email: string, password: string): Promise<void> {
  const previousUserId = getCurrentUserId();

  // Stop sync so the old anonymous sync session does not race with the
  // credential check or the post-recovery initialization for the new user.
  await syncService.shutdown();

  // Verify credentials first. If they are invalid, throw without touching
  // local stores or the existing anonymous Firebase session so the user can
  // retry without data loss.
  try {
    await signInWithEmailPassword(email, password);
  } catch (error) {
    // Best-effort: restart sync for the still-signed-in anonymous user so
    // the app continues to function. Auth state is unchanged.
    if (previousUserId) {
      try {
        await syncService.initialize(previousUserId);
      } catch {
        // ignored — sync will retry on next foreground
      }
    }
    throw error;
  }

  // Credentials valid. Firebase auth has switched to the recovered user.
  // Unregister the old push token and wipe local stores so the recovered
  // account hydrates from its own cloud state instead of the anonymous one.
  if (previousUserId) {
    try {
      await unregisterPushNotifications(previousUserId);
    } catch {
      // ignored — token is orphaned but harmless
    }
  }

  await clearLocalSessionState();
}
