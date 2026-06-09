/**
 * Buddy Invite Codes
 *
 * Six-character alphanumeric codes. We pick a deliberately small
 * alphabet (digits + uppercase letters minus look-alikes 0/O/1/I/L)
 * so codes are safe to read out loud without ambiguity.
 *
 * Format: `^[2-9A-HJ-NP-Z]{6}$` (28 distinct chars → 28^6 ≈ 481M
 * possible codes). The webhook that accepts an invite does a
 * Firestore collision check before persisting; collisions at this
 * cardinality are vanishingly unlikely until tens of millions of
 * active invites.
 */

import { BUDDY_CODE_LENGTH, type BuddyCode } from './types';

// Alphabet excludes the look-alike pairs 0/O and 1/I/L so codes are
// safe to read out loud without ambiguity. 28 characters total.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ' as const;
const CODE_REGEX = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

/**
 * Validate a buddy code. Returns the normalized (uppercased,
 * stripped) form if valid; null otherwise. Use this on the invite
 * acceptance form input so the user can paste a code with
 * lowercase or whitespace and we still accept it.
 */
export function validateBuddyCode(input: string | null | undefined): BuddyCode | null {
  if (!input) return null;
  const trimmed = input.replace(/\s+/g, '').toUpperCase();
  return CODE_REGEX.test(trimmed) ? trimmed : null;
}

/**
 * Generate a new buddy code from a random source. Defaults to
 * `Math.random` for production use; tests inject a deterministic
 * source so they can verify length / alphabet without flake.
 *
 * Not cryptographically secure — the security boundary is the
 * Firestore rule that requires invite + recipient + sender to match
 * before the buddy relationship is created. The code is just a
 * human-readable handoff.
 */
export function generateBuddyCode(rng: () => number = Math.random): BuddyCode {
  let out = '';
  for (let i = 0; i < BUDDY_CODE_LENGTH; i += 1) {
    const idx = Math.floor(rng() * ALPHABET.length);
    out += ALPHABET[idx];
  }
  return out;
}
