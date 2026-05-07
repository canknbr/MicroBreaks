import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultAppSettings,
  initialOnboardingData,
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
import { cancelAllNotifications } from '@/services/notifications';
import {
  deleteAuthAccount,
  getCurrentUserId,
  refreshAnonymousSession,
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
      lastResetDate: new Date().toISOString().split('T')[0],
    },
    preferences: { ...initialTimerPreferences },
  });

  useSubscriptionStore.getState().resetSubscription();
}

export async function clearLocalSessionState(): Promise<void> {
  await cancelAllNotifications();
  resetInMemoryStores();
  await clearAppStorage();
}

export async function replaceWithFreshAnonymousSession(options?: {
  deleteRemoteUserData?: boolean;
}): Promise<void> {
  const userId = getCurrentUserId();

  syncService.shutdown();

  if (!options?.deleteRemoteUserData && userId) {
    await unregisterPushNotifications(userId);
  }

  if (options?.deleteRemoteUserData && userId) {
    await deleteAllUserData(userId);
  }

  await clearLocalSessionState();

  if (options?.deleteRemoteUserData) {
    await deleteAuthAccount();
  } else {
    await signOut();
  }

  const freshUser = await refreshAnonymousSession();
  if (!freshUser) {
    throw new Error('Could not start a fresh anonymous session.');
  }
}
