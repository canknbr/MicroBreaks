# RevenueCat Rollout Checklist

This project now has a crash-safe RevenueCat integration path, but shipping paid subscriptions still requires production setup outside the codebase.

## 1. Environment

- Set `EXPO_PUBLIC_BILLING_PROVIDER=revenuecat`
- Set `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- Set `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- Keep `preview` in local/dev environments until store products are approved

Reference files:
- [constants/subscription.ts](/Users/can/Projects/MicroBreaks/constants/subscription.ts:1)
- [services/billing/revenuecat.ts](/Users/can/Projects/MicroBreaks/services/billing/revenuecat.ts:1)
- [.env.example](/Users/can/Projects/MicroBreaks/.env.example:1)

## 2. RevenueCat Project

- Create entitlement: `pro`
- Create offerings with active current offering
- Create packages that map to app product ids
- Ensure package product identifiers match the ids returned by App Store Connect / Play Console

Expected app-side behavior:
- Annual and monthly packages are read dynamically from RevenueCat
- If RevenueCat returns no active offering, the app falls back to local default offer copy instead of crashing

## 3. Apple / Google Products

- App Store Connect:
  - Create monthly and annual auto-renewable subscriptions
  - Add localization, review notes, screenshots if required
  - Confirm product status is Ready to Submit / Approved
- Google Play:
  - Create subscription base plans and offers
  - Verify package ids match production app id
  - Confirm tester access on internal track

## 4. Native Build Safety

- Run `npx expo prebuild` or the team’s normal native sync flow after dependency/env changes
- Verify `react-native-purchases` is linked in both iOS and Android builds
- Verify Android billing permission remains present:
  - [app.json](/Users/can/Projects/MicroBreaks/app.json:1)
  - [AndroidManifest.xml](/Users/can/Projects/MicroBreaks/android/app/src/main/AndroidManifest.xml:1)

## 5. Store Account Smoke Test

- Fresh install
- Open paywall from onboarding
- Open paywall from profile
- Open paywall from locked break
- Buy monthly
- Buy annual with trial
- Cancel purchase sheet before confirmation
- Restore purchases
- Kill and relaunch app
- Foreground app after entitlement changes

Expected results:
- Cancelled purchase should not show a failure alert
- Successful purchase should move state to `trial` or `premium`
- Restore should only succeed when an active entitlement exists
- Billing diagnostics should update instead of leaving stale loading state

## 6. Regression Checks

- Locked content routes to `/subscription` instead of opening break session
- Web build must never attempt native RevenueCat initialization
- Preview mode should still work in dev when env vars are absent

Reference tests:
- [billingService.test.ts](/Users/can/Projects/MicroBreaks/__tests__/unit/services/billingService.test.ts:1)
- [subscription.test.ts](/Users/can/Projects/MicroBreaks/__tests__/unit/constants/subscription.test.ts:1)
- [SubscriptionEntryPoints.test.tsx](/Users/can/Projects/MicroBreaks/__tests__/integration/screens/SubscriptionEntryPoints.test.tsx:1)

## 7. Analytics Checks

- Confirm these events reach the provider:
  - `offer_selected`
  - `trial_started`
  - `purchase_completed`
  - `purchase_restored`
  - `trial_converted`
- Confirm `billing_provider` and `subscription_status` user properties change after purchase/restore

Reference:
- [services/analytics/index.ts](/Users/can/Projects/MicroBreaks/services/analytics/index.ts:1)
- [services/billing/index.ts](/Users/can/Projects/MicroBreaks/services/billing/index.ts:1)

## 8. Release Gate

Do not switch production to `revenuecat` until all are true:

- Store products are approved
- RevenueCat offering is live
- Internal tester purchase succeeds on iOS
- Internal tester purchase succeeds on Android
- Restore succeeds on both platforms
- No stuck loading state after purchase cancellation
- No billing diagnostics degradation on launch for configured builds
