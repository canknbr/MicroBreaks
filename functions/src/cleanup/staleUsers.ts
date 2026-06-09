/**
 * Stale Anonymous User Cleanup
 *
 * Pure decision helper. The scheduled function in
 * `./cleanupStaleAnonymousUsers.ts` pages Firebase Auth and asks
 * `shouldDeleteStaleUser` for each record; tests pin the policy
 * here so we don't need to spin up the Auth admin SDK to check
 * "is this rule sound?".
 *
 * Policy:
 *   - User must have NO linked provider data (i.e. truly anonymous,
 *     never converted to email/Google/Apple/etc).
 *   - Last sign-in must be older than `staleThresholdMs`.
 *   - If we can't read a last-sign-in timestamp, treat the user as
 *     "unknown age" — do NOT delete. We'd rather leave a stale row
 *     than nuke an active user because their metadata is missing.
 *
 * The existing `onAuthUserDelete` trigger fans out the Firestore
 * cleanup so we only need to call `auth.deleteUser(uid)` here.
 */

export interface StaleUserCandidate {
  /** Auth UID. */
  uid: string;
  /** Linked provider data. Empty array = anonymous. */
  providerData: ReadonlyArray<{ providerId: string }>;
  /** `metadata.lastSignInTime` from Firebase Auth. Can be missing. */
  lastSignInTime?: string | null;
  /** `metadata.creationTime` — used as fallback if last-sign-in missing. */
  creationTime?: string | null;
}

export interface ShouldDeleteOptions {
  /** Current time (ms since epoch). Inject for tests. */
  now: number;
  /** Account is stale if last activity is older than this many ms. */
  staleThresholdMs: number;
}

function parseTimeMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

export function shouldDeleteStaleUser(
  candidate: StaleUserCandidate,
  options: ShouldDeleteOptions
): boolean {
  // Conservative gate #1: only delete anonymous users. A linked-email
  // account that's been silent for a year is still a user we care
  // about — they could be ghosting between devices.
  if (candidate.providerData.length > 0) return false;

  // Conservative gate #2: must have a timestamp we trust. If
  // last-sign-in is missing, fall back to creationTime; if neither
  // is parseable, do nothing.
  const lastActiveMs =
    parseTimeMs(candidate.lastSignInTime) ??
    parseTimeMs(candidate.creationTime);
  if (lastActiveMs == null) return false;

  // Delete if the youngest known activity is older than the threshold.
  return options.now - lastActiveMs > options.staleThresholdMs;
}
