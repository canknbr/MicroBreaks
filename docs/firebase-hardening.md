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

## Done? Quick sanity check

After all six steps:

- [ ] Budget alert email arrives when you test-spend $1 (e.g. by deploying)
- [ ] Rules playground rejects out-of-policy operations
- [ ] App Check dashboard shows > 0 verified requests within 24h
- [ ] Auth dashboard shows < 10 anonymous sign-ups / day under normal use
- [ ] Crashlytics dashboard shows retention = 14 months
- [ ] Functions dashboard shows max-instances = 5

This is the floor. Phase 2 (Cloud Function webhooks for billing, family
seat orchestration, scheduled cleanups) and Phase 3 (caching, pagination,
indexes) build on top of it.
