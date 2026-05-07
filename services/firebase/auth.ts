/**
 * Firebase Auth Service
 * Handles anonymous authentication
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

type AuthUser = FirebaseAuthTypes.User;
type AuthStateListener = (user: AuthUser | null) => void;

let currentUser: AuthUser | null = null;

/**
 * Initialize anonymous auth.
 * Creates an anonymous account if no user is signed in.
 */
export async function initializeAuth(): Promise<AuthUser | null> {
  try {
    const authInstance = auth();
    currentUser = authInstance.currentUser;

    if (!currentUser) {
      const credential = await authInstance.signInAnonymously();
      currentUser = credential.user;
    }

    if (__DEV__) {
      console.log('[Auth] Signed in:', currentUser?.uid);
    }

    return currentUser;
  } catch (error) {
    console.error('[Auth] Failed to initialize:', error);
    return null;
  }
}

/**
 * Get the current user (may be null if not initialized)
 */
export function getCurrentUser(): AuthUser | null {
  return auth().currentUser;
}

/**
 * Get the current user's UID, or null if not signed in
 */
export function getCurrentUserId(): string | null {
  return auth().currentUser?.uid ?? null;
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChanged(listener: AuthStateListener): () => void {
  return auth().onAuthStateChanged((user) => {
    currentUser = user;
    listener(user);
  });
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await auth().signOut();
    currentUser = null;
  } catch (error) {
    console.error('[Auth] Failed to sign out:', error);
  }
}

/**
 * Start a fresh anonymous session.
 * Useful after account deletion or a local reset flow.
 */
export async function refreshAnonymousSession(): Promise<AuthUser | null> {
  try {
    const authInstance = auth();

    if (authInstance.currentUser) {
      await authInstance.signOut();
    }

    const credential = await authInstance.signInAnonymously();
    currentUser = credential.user;

    if (__DEV__) {
      console.log('[Auth] Refreshed anonymous session:', currentUser?.uid);
    }

    return currentUser;
  } catch (error) {
    console.error('[Auth] Failed to refresh anonymous session:', error);
    return null;
  }
}

/**
 * Delete the current user's Firebase Auth account.
 * Caller should delete Firestore data and clear local storage before this.
 */
export async function deleteAuthAccount(): Promise<void> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('No authenticated user to delete');
  }

  try {
    await user.delete();
    currentUser = null;
    if (__DEV__) {
      console.log('[Auth] Account deleted');
    }
  } catch (error) {
    console.error('[Auth] Failed to delete account:', error);
    throw error;
  }
}
