/**
 * Firestore Client Wrapper
 * Provides Firestore instance and helper functions
 */

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

let offlinePersistenceEnabled = false;

/**
 * Initialize Firestore with offline persistence
 */
export async function initializeFirestore(): Promise<void> {
  if (offlinePersistenceEnabled) return;

  try {
    // Firestore offline persistence is enabled by default on mobile,
    // but we explicitly configure settings for consistency
    await firestore().settings({
      cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
    });

    offlinePersistenceEnabled = true;

    if (__DEV__) {
      console.log('[Firestore] Initialized with offline persistence');
    }
  } catch (error) {
    // Settings can only be set before any other Firestore call
    // If already initialized, that's fine
    if (__DEV__) {
      console.warn('[Firestore] Settings already applied or error:', error);
    }
    offlinePersistenceEnabled = true;
  }
}

/**
 * Get reference to a user's document
 */
export function getUserDoc(userId: string): FirebaseFirestoreTypes.DocumentReference {
  return firestore().collection('users').doc(userId);
}

/**
 * Get reference to a user's breaks subcollection
 */
export function getBreaksCollection(userId: string): FirebaseFirestoreTypes.CollectionReference {
  return firestore().collection('users').doc(userId).collection('breaks');
}

/**
 * Delete all user data from Firestore (GDPR compliance)
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  const db = firestore();

  // Delete subcollections first (breaks)
  const breaksRef = getBreaksCollection(userId);
  const breaksSnapshot = await breaksRef.get();
  const batch = db.batch();
  breaksSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Delete the user document
  await getUserDoc(userId).delete();

  if (__DEV__) {
    console.log('[Firestore] Deleted all data for user:', userId);
  }
}

export { firestore };
