# MicroBreaks Cloud Functions

Hosts the server-side post-delete cleanup so client account-deletion can be a
single atomic `auth.deleteUser()` call. See `src/index.ts` for the function
definitions.

## First-time setup

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

Required project state:
- Firebase project must be on the Blaze plan (Auth triggers need outbound
  Google APIs).
- `firebase.json` at the repo root must include the `functions` section that
  points to this directory (it does — see top-level `firebase.json`).
- Deploy from the project root; running `firebase deploy --only functions`
  here also works.

## What runs server-side

| Trigger | What it does | Reason |
|---------|-------------|--------|
| `auth.user().onDelete` → `onAuthUserDelete` | Wipes `users/{uid}` plus its `breaks/` and `devices/` subcollections. | Makes the client account-delete flow atomic — the user only needs `auth.deleteUser()` to succeed. The Cloud Function picks up the rest. |
| HTTPS `revenueCatWebhook` | Verifies the shared secret, maps the RevenueCat event to our ledger shape, and writes to `users/{uid}/entitlements/current`. | Server-side billing source of truth. The client `Purchases` SDK is easy to spoof; the webhook is the only path that can write the canonical entitlement row. See `docs/firebase-hardening.md` §7 for setup. |
| Cloud Scheduler → `cleanupStaleAnonymousUsers` | Daily 03:00 UTC: pages Firebase Auth, deletes anonymous accounts that have been silent for > 90 days (capped at 500 deletes per run). The existing `onAuthUserDelete` trigger handles the Firestore fan-out. | Anonymous accounts pile up forever otherwise. At low scale this is pennies; at 100k MAU it's the difference between a $10 and a $100 monthly Firestore bill. See `docs/firebase-hardening.md` §8. |

## Tests

```bash
npm install      # one-time
npm test         # runs the mapper + (future) webhook tests
```

The mapper unit tests live in `src/entitlements/__tests__/mapper.test.ts`
and cover every RevenueCat event type → status mapping, tier inference,
billing-period inference, trial flagging, store mapping, ISO timestamp
conversion, and edge cases (missing app_user_id, malformed payload,
unknown event types). They run under `ts-jest` and are excluded from
the root jest suite (see `jest.config.js`).

## Client expectations

After this function is deployed:

- `services/account/sessionReset.ts replaceWithFreshAnonymousSession({ deleteRemoteUserData: true })`
  still calls `deleteAllUserData(userId)` defensively before deleting the auth
  account. The Cloud Function is the **primary** mechanism but the client
  fallback covers the case where the function fails to deploy or is paused.
  Both are idempotent — `deleteAllUserData` no-ops cleanly when collections
  are already empty.
- The function logs to `firebase functions:log` — check there if a user
  reports lingering data after a delete.

## Local testing

```bash
npm run serve   # spins up the Firebase emulator on the functions trigger
```

Use the Firebase Emulator UI to manually delete a test auth user and verify
that the corresponding Firestore documents disappear within a few seconds.
