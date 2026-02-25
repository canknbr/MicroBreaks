/**
 * Firebase Auth Service
 * Handles anonymous auth with future upgrade path to email/Google sign-in
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
