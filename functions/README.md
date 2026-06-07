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
