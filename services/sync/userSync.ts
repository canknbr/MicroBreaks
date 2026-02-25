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
 * Accepts an optional pre-fetched document to avoid redundant Firestore reads
 */
export async function pullUserProfile(userId: string, prefetchedDoc?: any): Promise<void> {
  const doc = prefetchedDoc ?? await getUserDoc(userId).get();

  if (!doc.exists) {
    // No remote data yet - push local data
    await pushUserProfile(userId);
    return;
  }

  const remote = doc.data() as RemoteUserData;
  if (!remote) return;

  const state = useUserStore.getState();

  // Merge each section with appropriate strategy
  // Use setState directly to avoid triggering sync hooks
  if (remote.profile) {
    const mergedProfile = mergeProfiles(
      { ...state.profile, updatedAt: state.profile.updatedAt ?? 0 },
      remote.profile
    );
    useUserStore.setState({
      profile: { ...mergedProfile },
    });
  }

  if (remote.progress) {
    const mergedProgress = mergeProgress(state.progress, remote.progress);
    useUserStore.setState({
      progress: mergedProgress,
    });
  }

  if (remote.preferences) {
    const mergedPreferences = mergePreferences(state.preferences, remote.preferences);
    useUserStore.setState({
      preferences: mergedPreferences,
    });
  }

  if (remote.achievements) {
    const mergedAchievements = mergeAchievements(state.achievements, remote.achievements);
    useUserStore.setState({
      achievements: mergedAchievements,
    });
  }

  if (__DEV__) {
    console.log('[UserSync] Pulled and merged user data');
  }
}
