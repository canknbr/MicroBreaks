/**
 * Entitlement Ledger Reader
 *
 * Client-side read of `users/{uid}/entitlements/current`. Returns
 * the server-trusted tier so UI gates can prefer the server's word
 * over the local `subscriptionStore` (which is RevenueCat client SDK
 * state — easy to spoof).
 *
 * One-shot `fetch` for screens that just need the current state, and
 * a `subscribe` snapshot listener for places that need live updates
 * (e.g. paywall closing the moment a purchase clears the webhook).
 *
 * Fails open: any read error returns `EMPTY_ENTITLEMENT` so callers
 * never have to handle exceptions inline.
 */

import {
  EMPTY_ENTITLEMENT,
  type EntitlementDoc,
  ENTITLEMENT_SCHEMA_VERSION,
} from './types';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface FirestoreLike {
  getEntitlementDoc(
    userId: string
  ): FirebaseFirestoreTypes.DocumentReference;
}

let firestoreLib: FirestoreLike | null = null;

function getFirestore(): FirestoreLike | null {
  if (firestoreLib) return firestoreLib;
  try {
    // Lazy require — Firestore native module init shouldn't happen at
    // import time so tests that don't touch Firestore can run cheap.
    const mod = require('@/services/firebase/firestore');
    firestoreLib = { getEntitlementDoc: mod.getEntitlementDoc };
  } catch {
    firestoreLib = null;
  }
  return firestoreLib;
}

/** Test seam — inject a mock or null. */
export function __setEntitlementFirestoreForTests(mock: FirestoreLike | null): void {
  firestoreLib = mock;
}

function isEntitlementDoc(value: unknown): value is EntitlementDoc {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.schemaVersion === 'number' &&
    typeof v.tier === 'string' &&
    typeof v.status === 'string' &&
    typeof v.lastEventAt === 'number'
  );
}

/**
 * One-shot read of the user's current entitlement doc. Returns the
 * empty/free default if the doc doesn't exist, the read fails, or
 * the schema doesn't match what this build expects.
 */
export async function fetchCurrentEntitlement(
  userId: string
): Promise<EntitlementDoc> {
  const fs = getFirestore();
  if (!fs || !userId) return EMPTY_ENTITLEMENT;

  try {
    const snapshot = await fs.getEntitlementDoc(userId).get();
    if (!snapshot.exists) return EMPTY_ENTITLEMENT;
    const data = snapshot.data();
    if (!isEntitlementDoc(data)) return EMPTY_ENTITLEMENT;
    // Future schema migration hook: when we bump
    // ENTITLEMENT_SCHEMA_VERSION, decide here whether to map the
    // older doc forward or treat it as missing.
    if (data.schemaVersion !== ENTITLEMENT_SCHEMA_VERSION) {
      return EMPTY_ENTITLEMENT;
    }
    return data;
  } catch {
    return EMPTY_ENTITLEMENT;
  }
}

export interface EntitlementSubscription {
  unsubscribe: () => void;
}

/**
 * Subscribe to live entitlement updates. The callback fires with
 * `EMPTY_ENTITLEMENT` on missing doc, malformed doc, or read error.
 * Returns an `unsubscribe` handle the caller must invoke (e.g. in
 * useEffect cleanup) — same contract as `addEventListener` patterns.
 */
export function subscribeToEntitlement(
  userId: string,
  onChange: (doc: EntitlementDoc) => void
): EntitlementSubscription {
  const fs = getFirestore();
  if (!fs || !userId) {
    onChange(EMPTY_ENTITLEMENT);
    return { unsubscribe: () => {} };
  }

  const unsubscribe = fs.getEntitlementDoc(userId).onSnapshot(
    (snapshot) => {
      if (!snapshot || !snapshot.exists) {
        onChange(EMPTY_ENTITLEMENT);
        return;
      }
      const data = snapshot.data();
      if (!isEntitlementDoc(data) || data.schemaVersion !== ENTITLEMENT_SCHEMA_VERSION) {
        onChange(EMPTY_ENTITLEMENT);
        return;
      }
      onChange(data);
    },
    () => {
      // Permission denied, network error, etc — fall back to empty.
      onChange(EMPTY_ENTITLEMENT);
    }
  );

  return {
    unsubscribe: () => {
      try {
        unsubscribe();
      } catch {
        // unsubscribe should never throw, but be defensive.
      }
    },
  };
}
