/**
 * Firestore Client Wrapper
 * Provides Firestore instance and helper functions
 */

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

let offlinePersistenceEnabled = false;
const DELETE_BATCH_SIZE = 450;
const FIRESTORE_CACHE_SIZE_BYTES = 20 * 1024 * 1024;

function isIgnorableFirestoreSettingsError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  if (code === 'failed-precondition') {
    return true;
  }

  const message = (error as { message?: unknown }).message;
  if (typeof message !== 'string') {
    return false;
  }

  return /already|before any other firestore call|cannot be changed/i.test(message);
}

async function deleteCollectionDocuments(
  collectionRef: FirebaseFirestoreTypes.CollectionReference
): Promise<void> {
  const db = firestore();
  while (true) {
    const snapshot = await collectionRef.limit(DELETE_BATCH_SIZE).get();
    if (snapshot.docs.length === 0) {
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    if (snapshot.docs.length < DELETE_BATCH_SIZE) {
      return;
    }
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
    if (isIgnorableFirestoreSettingsError(error)) {
      if (__DEV__) {
        console.warn('[Firestore] Settings already applied:', error);
      }
      offlinePersistenceEnabled = true;
      return;
    }

    if (__DEV__) {
      console.error('[Firestore] Failed to initialize:', error);
    }
    throw error;
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
 * Reference to the current entitlement-ledger doc the RevenueCat
 * webhook writes for this user. Rules grant client read but deny
 * client write — only the Cloud Function (admin SDK) can mutate it.
 */
export function getEntitlementDoc(
  userId: string
): FirebaseFirestoreTypes.DocumentReference {
  return firestore()
    .collection('users')
    .doc(userId)
    .collection('entitlements')
    .doc('current');
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
