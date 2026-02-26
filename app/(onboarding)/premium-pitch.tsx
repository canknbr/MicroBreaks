/**
 * ONB_020: Premium Pitch (Placeholder)
 * Premium features are not yet available.
 * This screen redirects directly to completion.
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function PremiumPitchScreen() {
  const router = useRouter();

  useEffect(() => {
    // Premium features not yet implemented — skip to completion
    router.replace('./completion');
  }, []);

  return null;
}
