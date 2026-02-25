/**
 * Secure ID generation using expo-crypto
 * Replaces weak Math.random() based ID generation
 */

import * as Crypto from 'expo-crypto';

/**
 * Generate a cryptographically secure unique ID with an optional prefix.
 * Uses crypto.randomUUID() which provides 128 bits of entropy.
 */
export function generateId(prefix?: string): string {
  const uuid = Crypto.randomUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
}
