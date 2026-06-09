/**
 * Scheduled Cleanup: stale anonymous users
 *
 * Cloud Scheduler fires this once a day. We page Firebase Auth,
 * apply the pure `shouldDeleteStaleUser` policy, and call
 * `auth.deleteUser(uid)` on matches. The existing
 * `onAuthUserDelete` trigger picks up each deletion and scrubs the
 * Firestore footprint, so this function only needs to touch Auth.
 *
 * Cost / safety knobs:
 *   - `STALE_THRESHOLD_MS` — 90 days of silence is the cutoff. Apple
 *     and Google's anonymous-account retention guidance both sit in
 *     this range.
 *   - `MAX_DELETES_PER_RUN` — caps a single invocation so a bad
 *     query, a corrupted clock, or a sudden audit can't drain
 *     thousands of accounts in one go. The next run picks up where
 *     this one stopped.
 *   - `maxInstances: 1` — never run two cleanups in parallel; the
 *     pagination state isn't shared.
 *   - `timeoutSeconds: 540` — under the v2 functions 9-minute ceiling.
 *
 * Observability: logs `[cleanup] start`, an `inspected` count per
 * page, and a final `done` with totals. Failures to delete a
 * specific user are logged at `warn` so the rest of the run
 * continues.
 */

import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';
import { shouldDeleteStaleUser } from './staleUsers';

const STALE_THRESHOLD_MS = 90 * 86_400_000;
const MAX_DELETES_PER_RUN = 500;
const PAGE_SIZE = 1000;

export const cleanupStaleAnonymousUsers = onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'UTC',
    timeoutSeconds: 540,
    memory: '256MiB',
    maxInstances: 1,
  },
  async () => {
    const now = Date.now();
    logger.info('[cleanup] start', {
      thresholdDays: 90,
      maxDeletesPerRun: MAX_DELETES_PER_RUN,
    });

    let pageToken: string | undefined;
    let totalInspected = 0;
    let totalDeleted = 0;
    let totalFailed = 0;

    try {
      // Outer pagination loop. We stop early once we hit the per-run
      // delete cap so a single invocation can't drain a million-user
      // account in one go.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (totalDeleted >= MAX_DELETES_PER_RUN) break;

        const result = await admin.auth().listUsers(PAGE_SIZE, pageToken);

        for (const user of result.users) {
          if (totalDeleted >= MAX_DELETES_PER_RUN) break;
          totalInspected += 1;

          const should = shouldDeleteStaleUser(
            {
              uid: user.uid,
              providerData: user.providerData ?? [],
              lastSignInTime: user.metadata?.lastSignInTime,
              creationTime: user.metadata?.creationTime,
            },
            { now, staleThresholdMs: STALE_THRESHOLD_MS }
          );
          if (!should) continue;

          try {
            // The existing onAuthUserDelete trigger fans out the
            // Firestore cleanup — we only need Auth here.
            await admin.auth().deleteUser(user.uid);
            totalDeleted += 1;
          } catch (e) {
            totalFailed += 1;
            logger.warn('[cleanup] delete failed', {
              uid: user.uid,
              error: String(e),
            });
          }
        }

        if (!result.pageToken) break;
        pageToken = result.pageToken;
      }
    } catch (e) {
      logger.error('[cleanup] paging failed', {
        inspected: totalInspected,
        deleted: totalDeleted,
        error: String(e),
      });
    }

    logger.info('[cleanup] done', {
      inspected: totalInspected,
      deleted: totalDeleted,
      failed: totalFailed,
    });
  }
);
