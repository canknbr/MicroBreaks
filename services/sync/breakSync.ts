/**
 * Break History Sync Service
 * Syncs completed breaks with Firestore subcollection
 */

import { firestore, getBreaksCollection } from '@/services/firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getBreakHistory } from '@/services/breakHistory';
import { mergeBreakHistories } from './merger';
import { STORAGE_KEYS, setItem } from '@/services/storage';
import type { CompletedBreak } from '@/services/storage';

const BREAK_PULL_PAGE_SIZE = 500;

function getBreakMutationTimestamp(breakItem: CompletedBreak): number {
  return new Date(breakItem.updatedAt ?? breakItem.completedAt).getTime();
}

/**
 * Push local break history to Firestore
 * Uses batch writes for efficiency
 */
export async function pushBreakHistory(userId: string, lastPushAt: number | null): Promise<void> {
  const localBreaks = await getBreakHistory();

  // Filter to breaks created or mutated after the last push
  const newBreaks = lastPushAt
    ? localBreaks.filter((b) => getBreakMutationTimestamp(b) > lastPushAt)
    : localBreaks;

  if (newBreaks.length === 0) return;

  const breaksRef = getBreaksCollection(userId);

  // Batch write in chunks of 500 (Firestore limit)
  const chunkSize = 500;
  for (let i = 0; i < newBreaks.length; i += chunkSize) {
    const chunk = newBreaks.slice(i, i + chunkSize);
    const batch = firestore().batch();

    for (const breakItem of chunk) {
      const docRef = breaksRef.doc(breakItem.id);
      batch.set(docRef, breakItem);
    }

    await batch.commit();
  }

  if (__DEV__) {
    console.log(`[BreakSync] Pushed ${newBreaks.length} breaks`);
  }
}

/**
 * Pull remote breaks and merge with local history
 */
export async function pullBreakHistory(userId: string, lastPullAt: number | null): Promise<void> {
  const breaksRef = getBreaksCollection(userId);
  const remoteBreaks: CompletedBreak[] = [];
  const lastPullDate = lastPullAt ? new Date(lastPullAt).toISOString() : null;
  let lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null = null;

  while (true) {
    let query: FirebaseFirestoreTypes.Query = lastPullDate
      ? breaksRef
          .where('updatedAt', '>', lastPullDate)
          .orderBy('updatedAt', 'desc')
          .limit(BREAK_PULL_PAGE_SIZE)
      : breaksRef.orderBy('completedAt', 'desc').limit(BREAK_PULL_PAGE_SIZE);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    remoteBreaks.push(
      ...snapshot.docs.map((doc) => {
        const breakItem = doc.data() as CompletedBreak;
        return {
          ...breakItem,
          updatedAt: breakItem.updatedAt ?? breakItem.completedAt,
        };
      })
    );

    if (snapshot.docs.length < BREAK_PULL_PAGE_SIZE) {
      break;
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  if (remoteBreaks.length === 0) return;

  // Merge with local
  const localBreaks = await getBreakHistory();
  const merged = mergeBreakHistories(localBreaks, remoteBreaks);

  // Save merged history
  await setItem(STORAGE_KEYS.BREAK_HISTORY, merged);

  if (__DEV__) {
    console.log(`[BreakSync] Pulled ${remoteBreaks.length} breaks, merged to ${merged.length} total`);
  }
}

/**
 * Push a single break to Firestore (for real-time sync after completion)
 */
export async function pushSingleBreak(userId: string, breakItem: CompletedBreak): Promise<void> {
  const breaksRef = getBreaksCollection(userId);
  await breaksRef.doc(breakItem.id).set(breakItem);
}
