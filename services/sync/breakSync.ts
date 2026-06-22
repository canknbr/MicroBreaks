/**
 * Break History Sync Service
 * Syncs completed breaks with Firestore subcollection
 */

import { firestore, getBreaksCollection } from '@/services/firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getBreakHistory, replaceBreakHistory } from '@/services/breakHistory';
import { mergeBreakHistories } from './merger';
import type { CompletedBreak } from '@/services/storage';

const BREAK_PULL_PAGE_SIZE = 500;

function getBreakMutationTimestamp(breakItem: CompletedBreak): number {
  return new Date(breakItem.updatedAt ?? breakItem.completedAt).getTime();
}

// IDs pushed at the most recent lastPushAt boundary timestamp. We hold them
// in memory so a mutation that lands on the exact same millisecond as the
// last sync (rare but possible) is detected as new on the next push instead
// of being silently filtered out (C-BUG4).
const boundaryPushedIds = new Set<string>();
let boundaryTimestamp: number | null = null;

/**
 * Test helper — clears the dedup set so suites can exercise the boundary
 * path repeatedly without pollution.
 */
export function __resetBreakPushDedupForTests(): void {
  boundaryPushedIds.clear();
  boundaryTimestamp = null;
}

/**
 * Push local break history to Firestore
 * Uses batch writes for efficiency
 */
export async function pushBreakHistory(userId: string, lastPushAt: number | null): Promise<void> {
  const localBreaks = await getBreakHistory();

  // Filter to breaks created or mutated since the last push. We use `>=` at
  // the boundary so a mutation that lands on the exact same millisecond as
  // the last sync isn't dropped — see C-BUG4 — and rely on
  // `boundaryPushedIds` to skip the records we already wrote at that
  // instant.
  let newBreaks: CompletedBreak[];
  if (lastPushAt === null) {
    newBreaks = localBreaks;
  } else {
    const boundaryActive = boundaryTimestamp === lastPushAt;
    newBreaks = localBreaks.filter((b) => {
      const ts = getBreakMutationTimestamp(b);
      if (ts > lastPushAt) return true;
      if (ts === lastPushAt && boundaryActive) {
        return !boundaryPushedIds.has(b.id);
      }
      return ts === lastPushAt;
    });
  }

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

  // Refresh the boundary dedup set. The new boundary is the most recent
  // mutation timestamp we just pushed.
  const maxTimestamp = newBreaks.reduce(
    (max, b) => Math.max(max, getBreakMutationTimestamp(b)),
    0
  );
  if (boundaryTimestamp !== maxTimestamp) {
    boundaryTimestamp = maxTimestamp;
    boundaryPushedIds.clear();
  }
  for (const b of newBreaks) {
    if (getBreakMutationTimestamp(b) === maxTimestamp) {
      boundaryPushedIds.add(b.id);
    }
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

  // Merge with local inside the serialized save queue so the read+merge+write
  // can't interleave with a concurrent break completion and drop it.
  const merged = await replaceBreakHistory((localBreaks) =>
    mergeBreakHistories(localBreaks, remoteBreaks)
  );

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
