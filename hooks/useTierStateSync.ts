/**
 * useTierStateSync
 *
 * Bridges the React-side effective tier into the synchronous
 * `tierState` singleton so non-React services can gate their work.
 * Mount once at the app root (`_layout.tsx`).
 *
 * The hook returns nothing — it's an "install side effect" pattern.
 * If you want the tier in a component, use `useEffectiveTier`
 * directly.
 */

import { useEffect } from 'react';
import { useEffectiveTier } from './useEffectiveTier';
import { __setEffectiveTier } from '@/services/subscription/tierState';

export function useTierStateSync(): void {
  const { tier } = useEffectiveTier();

  useEffect(() => {
    __setEffectiveTier(tier);
  }, [tier]);
}
