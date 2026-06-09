/**
 * RevenueCat Webhook → Entitlement Ledger
 *
 * RevenueCat POSTs subscription events here. We verify the shared
 * secret in the `Authorization` header, map the event to our
 * ledger shape, and write it to `users/{uid}/entitlements/current`.
 *
 * The shared secret comes from the `REVENUECAT_WEBHOOK_SECRET`
 * environment variable, set via:
 *   firebase functions:secrets:set REVENUECAT_WEBHOOK_SECRET
 *
 * RevenueCat config: in the dashboard add a webhook pointing at the
 * deployed function URL, and paste the secret into the
 * "Authorization header value" field. RC will send it as
 * `Authorization: <secret>` (literal, no `Bearer` prefix).
 *
 * Why a custom secret and not a Bearer JWT? RevenueCat hasn't
 * shipped JWT signing for webhooks yet (as of 2026). The shared
 * secret with a long random value is the documented pattern.
 */

import * as admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import {
  mapRevenueCatEvent,
  type RevenueCatWebhookPayload,
} from './mapper';

const REVENUECAT_WEBHOOK_SECRET = defineSecret('REVENUECAT_WEBHOOK_SECRET');

/**
 * Constant-time secret compare. Don't roll your own; this is the
 * standard recipe for header-secret webhooks.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export const revenueCatWebhook = onRequest(
  {
    secrets: [REVENUECAT_WEBHOOK_SECRET],
    // Single concurrent instance is plenty — RevenueCat events arrive
    // at human-purchase cadence, not high-throughput.
    maxInstances: 5,
    timeoutSeconds: 30,
    memory: '256MiB',
    // We do our own auth check; no need for invoker-side auth.
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const expected = REVENUECAT_WEBHOOK_SECRET.value();
    const provided = (req.get('authorization') ?? '').trim();
    if (!expected || !provided || !safeEqual(provided, expected)) {
      logger.warn('RevenueCat webhook rejected — bad/missing secret');
      res.status(401).send('Unauthorized');
      return;
    }

    let payload: RevenueCatWebhookPayload;
    try {
      payload = (req.body ?? {}) as RevenueCatWebhookPayload;
    } catch (e) {
      logger.warn('RevenueCat webhook payload parse failed', { error: String(e) });
      res.status(400).send('Bad Request');
      return;
    }

    const mapped = mapRevenueCatEvent(payload);
    if (!mapped) {
      // RC retries 5xx but treats 2xx as ack-and-drop. We don't want
      // retries for events we can't even identify a user on.
      logger.info('RevenueCat webhook event dropped — no app_user_id', {
        type: payload.event?.type,
      });
      res.status(204).send();
      return;
    }

    try {
      await admin
        .firestore()
        .collection('users')
        .doc(mapped.uid)
        .collection('entitlements')
        .doc('current')
        .set(mapped.doc, { merge: false });
      logger.info('Entitlement ledger updated', {
        uid: mapped.uid,
        tier: mapped.doc.tier,
        status: mapped.doc.status,
        event: mapped.doc.lastEventType,
      });
      res.status(200).send('OK');
    } catch (e) {
      logger.error('Entitlement ledger write failed', {
        uid: mapped.uid,
        error: String(e),
      });
      // 5xx so RC retries.
      res.status(500).send('Internal Error');
    }
  }
);
