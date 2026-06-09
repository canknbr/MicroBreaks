# Firebase Hardening — Phase 1 Console Checklist

Code-side hardening is done. The items below can only be configured in the
Firebase Console / GCP Console. **Do them in this order.** Each step has a
"why" so you can decide later whether to skip one.

---

## 1. Budget alert + hard cap (most important — do first)

**Why:** A misconfigured rule, a stuck listener, or a malicious script can
chew through the free quota in hours. A budget cap is your last line of
defense against an overnight bill.

1. Open [GCP Console → Billing → Budgets & alerts](https://console.cloud.google.com/billing).
2. Pick the GCP project linked to your Firebase project.
3. **Create budget**:
   - Name: `MicroBreaks monthly cap`
   - Time range: Monthly
   - Amount: **$50** (raise later if traffic grows)
4. **Threshold alerts:** 50%, 90%, 100% — email yourself on each.
5. (Optional, recommended) Connect the budget to a **Pub/Sub topic** and use
   the [auto-cap recipe](https://cloud.google.com/billing/docs/how-to/notify)
   to disable billing when the cap is hit. Without this step, Firebase keeps
   serving past the cap — alerts only.

---

## 2. Firestore security rules — deploy the tightened ruleset

**Why:** The repo already has a careful `firestore.rules`. The latest commit
adds the missing `reliefScore` field to `validBreakDoc` so production writes
with a relief score won't be silently rejected.

```bash
# From the repo root
npx firebase deploy --only firestore:rules
```

Then **verify in the Console**:
1. Firebase Console → Firestore → Rules tab
2. Check the timestamp matches your deploy
3. Click **"Rules Playground"** and run the test cases:
   - `create` on `/users/<your-uid>` as that uid → should allow
   - `create` on `/users/<other-uid>` as your uid → should deny
   - `create` on `/users/<your-uid>/breaks/abc` with a 700-second duration → should deny (out of bounds)

---

## 3. Enable App Check (after install)

The client-side wiring landed in `services/firebase/appCheck.ts`. It's a
no-op until the package is installed and the providers are activated in the
Console.

### 3a. Install the package

```bash
npx expo install @react-native-firebase/app-check
npx expo prebuild
```

### 3b. Configure providers in the Firebase Console

1. **App Check** → **Apps** → pick your iOS app
   - Provider: **App Attest** (with DeviceCheck fallback for older devices)
   - Save
2. **App Check** → **Apps** → pick your Android app
   - Provider: **Play Integrity**
   - Save

### 3c. Add a debug token for dev builds

Without this, your dev simulator / emulator can't pass attestation:

1. Run the app once after the install — Crashlytics will log the App Check
   debug token to the device console.
2. **Firebase Console → App Check → Apps → ⋮ → Manage debug tokens** → paste
   the token.
3. Add the token to your `.env`:
   ```
   EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN=<paste>
   ```

### 3d. Flip to enforce mode (24h later)

1. Firebase Console → **App Check → APIs**
2. For **each** product (Firestore, Functions, Storage, etc):
   - Start in **monitor mode**. Watch the dashboard for 24h.
   - If you see > 0% rejection of legitimate clients, fix it before flipping.
   - Once clean: switch to **enforce mode**. This is the moment App Check
     starts actually blocking bots.

---

## 4. Authentication hardening

**Why:** Anonymous auth is what we use today. Without rate-limit it's a
clean attack surface for abuse.

1. Firebase Console → **Authentication → Settings → User actions**
   - Sign-up quotas: enable, set to **20 per hour per IP**. Adjust if needed.
2. Firebase Console → **Authentication → Settings → Authorized domains**
   - Strip every domain you don't recognise. Production should have only
     `localhost` (dev) and your real app domain.
3. Firebase Console → **Authentication → Sign-in method**
   - Disable every provider you're not using. If you only use anonymous,
     turn off Email/Password, Google, etc.

---

## 5. Crashlytics / Analytics retention

**Why:** Cheap data hygiene. Defaults retain data longer than most apps need.

1. **Analytics → Data settings → Data Retention** — set to **14 months**
   (the smallest setting). You can still see all-time aggregates.
2. **Crashlytics → Settings** — confirm "Auto-collection" is enabled but
   "User identifiers" stays empty (we don't link Crashlytics to email).

---

## 6. Cloud Functions — minimum quotas

**Why:** A runaway function can rack up bills. Caps are free.

1. **Functions → onAuthUserDelete** → ⋮ → **Edit**:
   - **Memory**: 256 MB (we just delete docs)
   - **Timeout**: 60 seconds
   - **Max instances**: 5 (we don't expect parallel deletes)
2. Open **Cloud Run → Services → onAuthUserDelete** and confirm the limits
   stuck.

---

## 7. RevenueCat webhook → entitlement ledger

**Why:** The client `Purchases` SDK is easy to spoof on a jailbroken
device. By having RevenueCat post every billing event to our Cloud
Function, Firestore becomes the canonical source of "what server saw"
and security rules can gate premium features without trusting the
client.

### 7a. Deploy the function

```bash
# From the repo root
cd functions && npm install && npm run build
firebase functions:secrets:set REVENUECAT_WEBHOOK_SECRET
# Paste a long random string — generate with: openssl rand -hex 32
firebase deploy --only functions:revenueCatWebhook
```

Grab the deployed URL from the deploy output — it looks like
`https://revenue-cat-webhook-<hash>-uc.a.run.app` or
`https://us-central1-<project>.cloudfunctions.net/revenueCatWebhook`.

### 7b. Configure the webhook in RevenueCat

1. RevenueCat Dashboard → **Project Settings → Integrations →
   Webhooks** → **Add new**.
2. **URL**: paste the function URL.
3. **Authorization header value**: paste the same secret string from
   step 7a. RevenueCat sends it as `Authorization: <secret>` (no
   `Bearer` prefix).
4. Enable every event type — INITIAL_PURCHASE, RENEWAL, CANCELLATION,
   EXPIRATION, BILLING_ISSUE, REFUND, etc. Better to receive and drop
   in code than to miss one we needed later.
5. Save.

### 7c. Verify it works

1. Click **"Send test event"** in the RevenueCat webhook config.
2. Firebase Console → **Functions → revenueCatWebhook → Logs**:
   - You should see `Entitlement ledger updated` with `tier`, `status`,
     `event: TEST`.
3. Firestore → `users/<your-uid>/entitlements/current` should now have
   a document.

If the secret doesn't match the function returns 401 — that's the
expected behavior, **don't** disable the secret to "make it work".

### 7d. Rotate the secret

When the secret leaks (or quarterly, whichever comes first):

```bash
firebase functions:secrets:set REVENUECAT_WEBHOOK_SECRET
firebase deploy --only functions:revenueCatWebhook
```

Then paste the new secret into RevenueCat. There's a ~10-minute
window where events may fail during rotation — RevenueCat retries
5xx so they'll catch up.

### 7e. App Store Server Notifications (later)

When you have time, also wire Apple's App Store Server Notifications
V2 directly into a separate Cloud Function. It catches edge cases
RevenueCat sometimes misses (test sandbox events, retroactive refunds
processed by Apple support). One source of truth is better than two,
but having a second corroborating signal is the gold standard.

---

## 8. Scheduled cleanup of stale anonymous users

**Why:** Anonymous accounts that never convert pile up forever
otherwise. Each one costs 1 Auth row (free) and any Firestore docs
they wrote (not free). At low scale this is pennies; at 100k MAU it's
the difference between a $10 and a $100 monthly Firestore bill.

The function deletes Auth records; the existing `onAuthUserDelete`
trigger fans out the Firestore cleanup so we never have to teach a
new function about the schema.

### 8a. Deploy the function

```bash
# From the repo root
cd functions && npm install && npm run build && npm test
firebase deploy --only functions:cleanupStaleAnonymousUsers
```

The deploy provisions a Cloud Scheduler job + Pub/Sub topic
automatically. Confirm in the GCP Console → Cloud Scheduler → look
for `firebase-schedule-cleanupStaleAnonymousUsers-us-central1`.

### 8b. Verify the policy in the emulator (optional but worth it)

```bash
cd functions
npm run serve         # boots the functions emulator
# In another terminal, hit the scheduler trigger manually:
curl -X POST http://localhost:5001/<project>/us-central1/cleanupStaleAnonymousUsers
```

Watch the emulator log — you should see `[cleanup] start`,
`[cleanup] done` with inspected/deleted counts. The function is
idempotent; a second run does nothing if there's nothing to delete.

### 8c. Tune the knobs (only when you need to)

If your DAU graph shows that legitimate users come back after long
breaks, raise the threshold in
`functions/src/cleanup/cleanupStaleAnonymousUsers.ts`:

```ts
const STALE_THRESHOLD_MS = 90 * 86_400_000;   // current: 90 days
const MAX_DELETES_PER_RUN = 500;              // safety floor
```

Default policy:
- Account must be **purely anonymous** (no linked providers).
- Account must have been silent for **> 90 days**.
- If both timestamps are missing or unparseable, **do nothing**.
- Cap of **500 deletes per run** so a clock skew or audit can't drain
  thousands of users in one invocation.

### 8d. Watch for a few days

Cloud Functions Console → `cleanupStaleAnonymousUsers` → Logs.
Healthy runs show:

```
[cleanup] start  { thresholdDays: 90, maxDeletesPerRun: 500 }
[cleanup] done   { inspected: <n>, deleted: <m>, failed: 0 }
```

If you see `[cleanup] delete failed` repeatedly for the same uid,
inspect the user in the Auth dashboard — usually a leftover
permission issue or a UID that's already been cleaned up by another
trigger.

---

## Done? Quick sanity check

After all eight steps:

- [ ] Budget alert email arrives when you test-spend $1 (e.g. by deploying)
- [ ] Rules playground rejects out-of-policy operations
- [ ] App Check dashboard shows > 0 verified requests within 24h
- [ ] Auth dashboard shows < 10 anonymous sign-ups / day under normal use
- [ ] Crashlytics dashboard shows retention = 14 months
- [ ] Functions dashboard shows max-instances = 5
- [ ] RevenueCat test event writes a doc to
      `users/<uid>/entitlements/current`
- [ ] Cloud Scheduler shows a `cleanupStaleAnonymousUsers` job ticking
      daily at 03:00 UTC

This is the floor. Phase 3 (family seat orchestration, App Store
Server Notifications, caching, pagination, indexes) builds on top of
it.
