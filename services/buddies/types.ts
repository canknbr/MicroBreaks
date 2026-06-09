/**
 * Streak Buddies — Types
 *
 * A "buddy" is another MicroBreaks user the current user has
 * opted into sharing a minimal daily snapshot with. The product
 * intent: quiet accountability with a tiny circle (max 5 buddies),
 * not a social-feed scroll.
 *
 * What we share per day:
 *   - Current streak count
 *   - Did-they-break-today flag
 *   - Last-break-at hint (rounded to nearest hour for privacy)
 *
 * What we never share:
 *   - Exact break times
 *   - Categories / pain areas
 *   - Subscription tier (visible only to the user themselves)
 *
 * This module is types-only; the Firestore schema, invite flow, and
 * UI are all separate. Keeping this file tight lets the rest of the
 * buddy system import a single source of truth.
 */

/** Stable opaque id for a buddy relationship. */
export type BuddyId = string;

/** Six-character alphanumeric invite code, e.g. "QX3D9F". */
export type BuddyCode = string;

/**
 * The other user as we see them. Identity is derived from a
 * single-shared identifier (the invite code that created the link)
 * — we don't expose Firebase UIDs across users.
 */
export interface Buddy {
  /** Stable id for THIS relationship (not Firebase UID). */
  id: BuddyId;
  /** Display name the buddy chose at invite-accept time. */
  displayName: string;
  /** Emoji avatar — same field shape as the user's own profile. */
  avatar: string | null;
  /** ISO date the relationship was confirmed. */
  acceptedAt: string;
}

/** A pending invite the current user issued, waiting for acceptance. */
export interface BuddyInvite {
  code: BuddyCode;
  /** ISO date the invite was created. */
  createdAt: string;
  /** ISO date the invite expires (default: 7 days from createdAt). */
  expiresAt: string;
  /** Display name + avatar the inviter wants their buddy to see. */
  inviterDisplayName: string;
  inviterAvatar: string | null;
}

/**
 * The daily snapshot we publish to our buddies (one of these per day
 * per user). Buddies read each other's most recent snapshot to drive
 * the "did they break today?" indicator.
 */
export interface BuddyStreakSnapshot {
  /** YYYY-MM-DD local-date string the snapshot belongs to. */
  date: string;
  /** Current streak (days) at the time of this snapshot. */
  currentStreak: number;
  /** True iff at least one break was logged on `date`. */
  brokeToday: boolean;
  /**
   * Hour-of-day (0-23, local time) of the most recent break today,
   * or null if `brokeToday` is false. Deliberately rounded — we
   * never expose minute-level activity to a buddy.
   */
  lastBreakHour: number | null;
  /** ISO timestamp the snapshot was last written. */
  updatedAt: string;
}

/**
 * Cap on simultaneous buddy relationships. Five is a deliberate
 * floor — large enough to include real accountability partners,
 * small enough that the home-screen buddy strip stays calm.
 */
export const MAX_BUDDIES = 5;

/** Length of the alphanumeric invite code. */
export const BUDDY_CODE_LENGTH = 6;

/** Default invite TTL — 7 days. */
export const BUDDY_INVITE_TTL_MS = 7 * 86_400_000;
