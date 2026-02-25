/**
 * Break History Sync Service
 * Syncs completed breaks with Firestore subcollection
 */

import { getBreaksCollection } from '@/services/firebase/firestore';
import { firestore } from '@/services/firebase/firestore';
import { getBreakHistory } from '@/services/breakHistory';
import { mergeBreakHistories } from './merger';
import { STORAGE_KEYS, setItem } from '@/services/storage';
import type { CompletedBreak } from '@/services/storage';

/**
 * Push local break history to Firestore
 * Uses batch writes for efficiency
 */
export async function pushBreakHistory(userId: string, lastPushAt: number | null): Promise<void> {
  const localBreaks = await getBreakHistory();

  // Filter to only breaks created after last push
  const newBreaks = lastPushAt
    ? localBreaks.filter((b) => new Date(b.completedAt).getTime() > lastPushAt)
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

  let query = breaksRef.orderBy('completedAt', 'desc').limit(500);

  if (lastPullAt) {
    const lastPullDate = new Date(lastPullAt).toISOString();
    query = breaksRef
      .where('completedAt', '>', lastPullDate)
      .orderBy('completedAt', 'desc')
      .limit(500);
  }

  const snapshot = await query.get();

  if (snapshot.empty) return;

  const remoteBreaks: CompletedBreak[] = snapshot.docs.map(
    (doc) => doc.data() as CompletedBreak
  );

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
