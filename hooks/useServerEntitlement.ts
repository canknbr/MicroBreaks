/**
 * useServerEntitlement
 *
 * Returns the server-trusted entitlement state for the current user.
 * While the snapshot listener is connecting (or there's no signed-in
 * user) `loaded` is false; once Firestore answers, `loaded` flips
 * true and `entitlement` reflects the canonical row.
 *
 * Use this for any code path that *must* trust server state — paywall
 * close-after-purchase, premium feature gating in security-sensitive
 * places. Anywhere optimistic local state is fine, the existing
 * `useSubscriptionStore` is faster and offline-friendly.
 */

import { useEffect, useState } from 'react';
import {
  EMPTY_ENTITLEMENT,
  type EntitlementDoc,
} from '@/services/entitlements/types';
import { subscribeToEntitlement } from '@/services/entitlements/reader';
import {
  getCurrentUserId,
  onAuthStateChanged,
} from '@/services/firebase/auth';

export interface ServerEntitlementView {
  entitlement: EntitlementDoc;
  loaded: boolean;
}

export function useServerEntitlement(): ServerEntitlementView {
  const [userId, setUserId] = useState<string | null>(() => getCurrentUserId());
  const [entitlement, setEntitlement] = useState<EntitlementDoc>(EMPTY_ENTITLEMENT);
  const [loaded, setLoaded] = useState(false);

  // Track auth changes so the snapshot listener reattaches when the
  // signed-in user changes (anonymous → upgraded, sign-out, etc).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setUserId(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userId) {
      setEntitlement(EMPTY_ENTITLEMENT);
      setLoaded(false);
      return;
    }
    const sub = subscribeToEntitlement(userId, (doc) => {
      setEntitlement(doc);
      setLoaded(true);
    });
    return () => {
      sub.unsubscribe();
    };
  }, [userId]);

  return { entitlement, loaded };
}
