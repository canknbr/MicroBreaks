/**
 * Firebase Auth Service
 * Handles anonymous authentication and linked-account foundations
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

type AuthUser = FirebaseAuthTypes.User;
type AuthStateListener = (user: AuthUser | null) => void;
type AuthErrorAction = 'link' | 'sign_in';

let currentUser: AuthUser | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmailPassword(email: string, password: string): { email: string; password: string } {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  return {
    email: normalizedEmail,
    password,
  };
}

function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code.trim().length > 0 ? code : null;
}

export function getAuthErrorMessage(error: unknown, action: AuthErrorAction = 'link'): string {
  const code = getErrorCode(error);

  switch (code) {
    case 'auth/email-already-in-use':
    case 'auth/credential-already-in-use':
      return action === 'sign_in'
        ? 'This email is already linked to another account.'
        : 'This email is already in use. Sign in with it instead of linking a new account.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/network-request-failed':
      return 'Network unavailable. Check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/requires-recent-login':
      return 'For security, please sign out and try again.';
    default:
      if (error instanceof Error && error.message.trim().length > 0) {
        return error.message;
      }

      return action === 'sign_in'
        ? 'Unable to sign in right now. Please try again.'
        : 'Unable to link this account right now. Please try again.';
  }
}

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
    if (__DEV__) {
      // Expected with the mock dev Firebase config — the bootstrap handles
      // this gracefully, so keep it at log level (no red LogBox in dev).
      console.log('[Auth] initialize skipped (dev):', (error as Error)?.message ?? error);
    } else {
      console.error('[Auth] Failed to initialize:', error);
    }
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
 * Get the current user's linked email if present.
 */
export function getCurrentUserEmail(): string | null {
  return auth().currentUser?.email ?? null;
}

/**
 * Check whether the active email identity has been verified.
 */
export function isCurrentUserEmailVerified(): boolean {
  return auth().currentUser?.emailVerified === true;
}

/**
 * Check whether the active auth session is still anonymous.
 */
export function isCurrentUserAnonymous(): boolean {
  return auth().currentUser?.isAnonymous !== false;
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChanged(listener: AuthStateListener): () => void {
  const authInstance = auth();
  const subscribe = typeof authInstance.onUserChanged === 'function'
    ? authInstance.onUserChanged.bind(authInstance)
    : authInstance.onAuthStateChanged.bind(authInstance);

  return subscribe((user) => {
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
 * Link the current anonymous Firebase user to an email/password identity.
 * This preserves the existing anonymous user's UID and synced data.
 */
export async function linkCurrentAnonymousUserWithEmail(
  email: string,
  password: string
): Promise<AuthUser> {
  const authInstance = auth();
  const user = authInstance.currentUser;

  if (!user) {
    throw new Error('No authenticated user to link');
  }

  if (!user.isAnonymous) {
    throw new Error('Current user is already linked to a permanent account');
  }

  const credentials = validateEmailPassword(email, password);
  const emailCredential = auth.EmailAuthProvider.credential(
    credentials.email,
    credentials.password
  );
  const result = await user.linkWithCredential(emailCredential);

  currentUser = result.user;

  if (__DEV__) {
    console.log('[Auth] Linked anonymous account:', currentUser?.uid);
  }

  return currentUser;
}

/**
 * Sign in using an existing email/password identity.
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<AuthUser> {
  const authInstance = auth();
  const credentials = validateEmailPassword(email, password);
  const result = await authInstance.signInWithEmailAndPassword(
    credentials.email,
    credentials.password
  );

  currentUser = result.user;

  if (__DEV__) {
    console.log('[Auth] Signed in with email:', currentUser?.uid);
  }

  return currentUser;
}

/**
 * Reload the active Firebase user and return the latest snapshot.
 */
export async function reloadCurrentUser(): Promise<AuthUser | null> {
  const user = auth().currentUser;
  if (!user) {
    return null;
  }

  await user.reload();
  currentUser = auth().currentUser;
  return currentUser;
}

/**
 * Send a verification email for the current linked account.
 */
export async function sendCurrentUserEmailVerification(): Promise<void> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error('No authenticated user to verify');
  }

  if (user.isAnonymous || !user.email) {
    throw new Error('Current account does not support email verification');
  }

  if (user.emailVerified) {
    return;
  }

  await user.sendEmailVerification();
}

/**
 * Send a password reset email for an existing linked account.
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const authInstance = auth();
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error('Email is required');
  }

  await authInstance.sendPasswordResetEmail(normalizedEmail);
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
