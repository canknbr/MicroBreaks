/**
 * User Sync Service
 * Syncs user profile, progress, preferences, and achievements with Firestore
 */

import { getUserDoc } from '@/services/firebase/firestore';
import { useUserStore } from '@/store/userStore';
import type { UserProfile, UserProgress, UserPreferences, UserAchievements } from '@/store/userStore';
import { mergeProfiles, mergeProgress, mergePreferences, mergeAchievements } from './merger';

interface RemoteUserData {
  profile?: UserProfile & { updatedAt?: number };
  progress?: UserProgress;
  preferences?: UserPreferences;
  achievements?: UserAchievements;
}

/**
 * Push local user data to Firestore
 */
export async function pushUserProfile(userId: string): Promise<void> {
  const state = useUserStore.getState();

  const data: RemoteUserData = {
    profile: { ...state.profile, updatedAt: Date.now() },
    progress: state.progress,
    preferences: state.preferences,
    achievements: state.achievements,
  };

  await getUserDoc(userId).set(data, { merge: true });

  if (__DEV__) {
    console.log('[UserSync] Pushed user data');
  }
}

/**
 * Pull remote user data and merge with local
 */
export async function pullUserProfile(userId: string): Promise<void> {
  const doc = await getUserDoc(userId).get();

  if (!doc.exists) {
    // No remote data yet - push local data
    await pushUserProfile(userId);
    return;
  }

  const remote = doc.data() as RemoteUserData;
  if (!remote) return;

  const state = useUserStore.getState();

  // Merge each section with appropriate strategy
  if (remote.profile) {
    const mergedProfile = mergeProfiles(
      { ...state.profile, updatedAt: 0 },
      remote.profile
    );
    state.updateProfile(mergedProfile);
  }

  if (remote.progress) {
    const mergedProgress = mergeProgress(state.progress, remote.progress);
    state.updateProgress(mergedProgress);
  }

  if (remote.preferences) {
    const mergedPreferences = mergePreferences(state.preferences, remote.preferences);
    // Update favorites and recents
    const currentPrefs = useUserStore.getState().preferences;
    if (
      JSON.stringify(currentPrefs.favoriteBreaks) !== JSON.stringify(mergedPreferences.favoriteBreaks) ||
      JSON.stringify(currentPrefs.recentBreaks) !== JSON.stringify(mergedPreferences.recentBreaks)
    ) {
      // Apply merged favorites by toggling as needed
      for (const breakId of mergedPreferences.favoriteBreaks) {
        if (!currentPrefs.favoriteBreaks.includes(breakId)) {
          useUserStore.getState().toggleFavorite(breakId);
        }
      }
    }
  }

  if (remote.achievements) {
    const mergedAchievements = mergeAchievements(state.achievements, remote.achievements);
    // Unlock any new achievements from remote
    for (const id of mergedAchievements.unlockedIds) {
      if (!state.achievements.unlockedIds.includes(id)) {
        useUserStore.getState().unlockAchievement(id);
      }
    }
  }

  if (__DEV__) {
    console.log('[UserSync] Pulled and merged user data');
  }
}
