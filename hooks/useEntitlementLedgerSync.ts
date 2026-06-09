/**
 * useEntitlementLedgerSync
 *
 * Watches the server entitlement ledger and mirrors useful fields
 * into the local `subscriptionStore`. Mounted once at the app root.
 *
 * This is the single point where server-side billing truth flows
 * into the synchronous client state. Local writes (RC client SDK,
 * preview purchases) still happen — the mirror overrides them when
 * the webhook lands.
 */

import { useEffect } from 'react';
import { useServerEntitlement } from './useServerEntitlement';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { mapEntitlementToCustomerState } from '@/services/entitlements/storeMirror';

export function useEntitlementLedgerSync(): void {
  const { entitlement, loaded } = useServerEntitlement();
  const setCustomerState = useSubscriptionStore((s) => s.setCustomerState);

  useEffect(() => {
    if (!loaded) return;
    const update = mapEntitlementToCustomerState(entitlement);
    if (!update) return;
    setCustomerState(update);
  }, [entitlement, loaded, setCustomerState]);
}
