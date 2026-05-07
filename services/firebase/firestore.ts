/**
 * Firestore Client Wrapper
 * Provides Firestore instance and helper functions
 */

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

let offlinePersistenceEnabled = false;
const DELETE_BATCH_SIZE = 450;
const FIRESTORE_CACHE_SIZE_BYTES = 20 * 1024 * 1024;

async function deleteCollectionDocuments(
  collectionRef: FirebaseFirestoreTypes.CollectionReference
): Promise<void> {
  const db = firestore();
  const snapshot = await collectionRef.get();

  for (let index = 0; index < snapshot.docs.length; index += DELETE_BATCH_SIZE) {
    const batch = db.batch();
    const chunk = snapshot.docs.slice(index, index + DELETE_BATCH_SIZE);

    chunk.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

/**
 * Initialize Firestore with offline persistence
 */
export async function initializeFirestore(): Promise<void> {
  if (offlinePersistenceEnabled) return;

  try {
    // Firestore offline persistence is enabled by default on mobile,
    // but we explicitly cap cache growth to avoid unbounded local storage usage.
    await firestore().settings({
      cacheSizeBytes: FIRESTORE_CACHE_SIZE_BYTES,
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
 * Get reference to a user's devices subcollection
 */
export function getDevicesCollection(userId: string): FirebaseFirestoreTypes.CollectionReference {
  return firestore().collection('users').doc(userId).collection('devices');
}

/**
 * Get reference to a specific device doc for a user
 */
export function getDeviceDoc(
  userId: string,
  deviceId: string
): FirebaseFirestoreTypes.DocumentReference {
  return getDevicesCollection(userId).doc(deviceId);
}

/**
 * Delete all user data from Firestore (GDPR compliance)
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  // Delete subcollections first (breaks, devices)
  await deleteCollectionDocuments(getBreaksCollection(userId));
  await deleteCollectionDocuments(getDevicesCollection(userId));

  // Delete the user document
  await getUserDoc(userId).delete();

  if (__DEV__) {
    console.log('[Firestore] Deleted all data for user:', userId);
  }
}

export { firestore };
