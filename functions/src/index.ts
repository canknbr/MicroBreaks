/**
 * MicroBreaks Cloud Functions
 *
 * Currently exposes a single function:
 *  - onAuthUserDelete: when a Firebase Auth user is deleted, scrub the rest
 *    of their footprint so the deletion is atomic from the user's POV.
 *
 * Deploy with:
 *   cd functions && npm install && npm run build && firebase deploy --only functions
 */

import * as admin from 'firebase-admin';
import * as functionsV1 from 'firebase-functions/v1';

admin.initializeApp();

const DELETE_BATCH_SIZE = 450;

/**
 * Delete every document in a collection in pages so we stay under the
 * 500-document-per-batch Firestore write limit.
 */
async function deleteCollection(
  collectionRef: FirebaseFirestore.CollectionReference
): Promise<void> {
  const db = admin.firestore();
  while (true) {
    const snapshot = await collectionRef.limit(DELETE_BATCH_SIZE).get();
    if (snapshot.empty) {
      return;
    }
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    if (snapshot.size < DELETE_BATCH_SIZE) {
      return;
    }
  }
}

/**
 * Fan-out cleanup when a user deletes their auth account.
 *
 * Path layout mirrors the client wrapper in
 * services/firebase/firestore.ts:
 *   users/{uid}/breaks/*
 *   users/{uid}/devices/*
 *   users/{uid}
 */
export const onAuthUserDelete = functionsV1.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  const userDoc = admin.firestore().collection('users').doc(uid);

  try {
    await deleteCollection(userDoc.collection('breaks'));
  } catch (error) {
    console.error(`[onAuthUserDelete] breaks subcollection cleanup failed for ${uid}:`, error);
  }

  try {
    await deleteCollection(userDoc.collection('devices'));
  } catch (error) {
    console.error(`[onAuthUserDelete] devices subcollection cleanup failed for ${uid}:`, error);
  }

  try {
    await userDoc.delete();
  } catch (error) {
    console.error(`[onAuthUserDelete] user doc delete failed for ${uid}:`, error);
  }

  console.log(`[onAuthUserDelete] Cleanup complete for ${uid}`);
});
