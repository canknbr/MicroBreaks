# Store Privacy Labels — Submission Reference

This document is the source of truth for the data-collection answers we will enter into:
- **App Store Connect → App Privacy → Data Types**
- **Google Play Console → App content → Data safety**
- **App Store Connect → App Information → Age Rating**
- **Google Play Console → App content → Content rating**

Update this file **before** any store submission. The numbers here must match what
ships in the binary — see "Source of truth" notes for each entry.

> **Status:** drafted 2026-06-05 against MicroBreaks 1.0.0 build 1 (RevenueCat enabled,
> Firebase Analytics/Crashlytics/Auth/Firestore/Messaging on).

---

## 1. App Store Connect — Privacy Nutrition Labels

### Data types we collect

| Data type | Collected | Linked to user | Used for tracking | Purposes | Source of truth |
|-----------|-----------|----------------|-------------------|----------|-----------------|
| **User ID** (Firebase UID) | Yes | Yes | No | App Functionality, Analytics | `services/firebase/auth.ts`, `services/sync/*` |
| **Email Address** (only if user links an account) | Yes | Yes | No | App Functionality (sign in & recovery) | `services/firebase/auth.ts` `linkAnonymousWithEmailPassword` |
| **Purchase History** | Yes | Yes | No | App Functionality, Analytics | RevenueCat SDK + `services/billing/*` |
| **Crash Data** | Yes | Yes | No | App Functionality (debugging) | Firebase Crashlytics — UID only, **no email** (see `crashlytics-adapter.ts`) |
| **Performance Data** | Yes | Yes | No | Analytics | Firebase Analytics screen views + events |
| **Product Interaction** (taps, break completions, paywall views) | Yes | Yes | No | Analytics | `services/analytics/index.ts` |
| **Device ID / Advertising ID** | **No** | — | — | — | We do not request `requestTrackingAuthorization` and do not link any vendor-supplied ad identifier. Firebase Analytics ID-for-Advertisers is **disabled** via Firebase config (no `AdSupport.framework`). |
| **Diagnostics** (battery state, OS version, crash stack) | Yes | Yes | No | App Functionality | Firebase Crashlytics + Analytics |
| **Coarse Location** | **No** | — | — | — | App does not request `CLLocationManager`. |
| **Contacts / Health / Photos / Browsing History / Search History** | **No** | — | — | — | None of these are accessed. |

### Tracking (App Tracking Transparency)

- The app does **NOT** track users across apps or websites owned by other companies.
- Therefore we do **NOT** present the ATT prompt.
- All "Used for tracking" cells above are **No**.

### Answers to nutrition questionnaire (verbatim)

| Question | Answer |
|----------|--------|
| Do you or your third-party partners collect data from this app? | **Yes** |
| Do you collect data that is linked to the user's identity? | **Yes** (UID + purchase history + linked email) |
| Do you use data to track users across apps and websites? | **No** |
| Privacy Policy URL | `https://microbreaks.app/privacy-policy` (also bundled via `app/privacy-policy.tsx`) |

---

## 2. Google Play Console — Data Safety

### Data collected & shared

| Data category | Data type | Collected | Shared | Optional | Purpose | Encrypted in transit |
|---------------|-----------|-----------|--------|----------|---------|----------------------|
| **App activity** | App interactions, In-app search history | Yes | No | No | Analytics, App functionality | Yes (HTTPS) |
| **App info & performance** | Crash logs, Diagnostics, Other performance data | Yes | No | No | App functionality | Yes |
| **Personal info** | User IDs | Yes | No | No | App functionality, Analytics | Yes |
| **Personal info** | Email address | Yes (only if user links an account) | No | **Yes** | Account management | Yes |
| **Financial info** | Purchase history | Yes | No | No | App functionality, Analytics | Yes |
| **Device or other IDs** | Device or other IDs | **No** | — | — | — | — |
| **Location** | Approximate / Precise location | **No** | — | — | — | — |
| **Photos and videos** | Photos / Videos | **No** | — | — | — | — |
| **Audio files** | Voice or sound recordings, Music files | **No** | — | — | — | — |
| **Files and docs** | Files and docs | **No** | — | — | — | — |
| **Calendar** | Calendar events | **No** | — | — | — | — |
| **Contacts** | Contacts | **No** | — | — | — | — |
| **Health and fitness** | Health info, Fitness info | **No** | — | — | — | — |
| **Messages** | SMS / MMS / Email / In-app messages | **No** | — | — | — | — |
| **Web browsing** | Browsing history | **No** | — | — | — | — |

### Security & privacy practices

| Question | Answer | Notes |
|----------|--------|-------|
| Is all of the user data collected encrypted in transit? | **Yes** | All Firebase + RevenueCat traffic is HTTPS only. |
| Do you provide a way for users to request that their data be deleted? | **Yes** | In-app: Profile → Account → Delete Account (`services/account/sessionReset.ts replaceWithFreshAnonymousSession({ deleteRemoteUserData: true })`). Email channel: `privacy@microbreaks.app`. |
| Have you committed to following the Play Families Policy? | N/A (target audience is adults) | We are not targeting children — see Section 3 / 4. |

### Sharing

We do **not** share user data with third parties beyond the data processors we use to provide the service itself (Firebase, RevenueCat). This is "collection" per Play policy, not "sharing", because the processors act under our instructions and contract.

---

## 3. App Store — Age Rating (App Store Connect)

The questionnaire answers are derived from the actual content shipping in v1.0.0:

| Question | Answer |
|----------|--------|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Sexual Content or Nudity | None |
| Profanity or Crude Humor | None |
| Alcohol, Tobacco, or Drug Use or References | None |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | **Infrequent/Mild** (the app shows physical wellness exercises; an in-app disclaimer reminds users to consult professionals — see `breakSession.preparation.disclaimer` i18n key) |
| Gambling | None |
| Contests | None |
| Unrestricted Web Access | No |
| User-Generated Content | No |

**Resulting rating:** **4+** (App Store).

---

## 4. Google Play — Content Rating (IARC)

We complete the IARC questionnaire. All answers are "No" except:
- "Does the app contain medical or wellness content?" → **Yes — non-prescriptive wellness tips only**
- "Does the app include in-app purchases?" → **Yes (subscriptions via Play Billing, surfaced through RevenueCat)**

**Expected rating:** **Everyone** (IARC) / PEGI 3.

---

## 5. Cross-store metadata cross-check before submission

Before pressing submit, verify:

- [ ] `app.json` `version` and Android `versionCode` / iOS `buildNumber` match the build that contains the code described above.
- [ ] `services/firebase/crashlytics-adapter.ts setUser` does **not** forward email (regression guard for E-SEC4).
- [ ] `services/analytics/index.ts` is not logging any field the table above marks "No".
- [ ] Privacy policy at `https://microbreaks.app/privacy-policy` matches `constants/legal.ts PRIVACY_POLICY_VERSION` shipped in the build.
- [ ] EAS `projectId` is the real one (not `your-project-id`) — `scripts/validate-app-config.js` enforces this in production profile.

If any item changes (e.g. you add a new analytics event that touches a field), update this doc **in the same PR**.
