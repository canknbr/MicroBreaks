# Subscription Smoke Test Checklist

Last updated: May 7, 2026

## Goal

Catch subscription, paywall, entitlement, and hydration regressions before release without depending on a full billing provider rollout.

## Environments

- Development build with preview billing enabled
- Production-like build with billing provider disabled
- At least one cold-launch pass after reinstall
- At least one foreground/background pass after the app has been idle

## Must-Pass Scenarios

### 1. Clean Install

- Install the app fresh.
- Complete onboarding until the first premium surface appears.
- Confirm the app opens without crashes.
- Confirm the paywall renders with offers, health panel, and fallback copy.
- Confirm no stale loading spinner remains visible after the paywall settles.

### 2. Profile Entry

- Open Profile.
- Tap the premium card.
- Confirm the subscription modal opens and dismisses cleanly.
- Confirm the premium card shows a billing health summary.
- Confirm health state does not show obviously stale errors from a previous session.

### 3. Preview Trial Purchase

- In a development build, select the annual plan.
- Start the preview trial.
- Confirm success alert appears.
- Confirm Profile and Stats immediately unlock Pro surfaces.
- Confirm the paywall badge changes to active access.
- Confirm app relaunch preserves access without crashes.

### 4. Preview Monthly Purchase

- Reset subscription state.
- Select the monthly plan.
- Confirm preview Pro access is activated.
- Confirm no missing entitlement or offer warning appears in the billing health panel.

### 5. Restore Flow

- With active preview access, tap Restore Purchases.
- Confirm success alert appears.
- Confirm access level does not downgrade unexpectedly.
- With no active preview access, confirm restore fails gracefully with no crash.

### 6. Foreground Refresh

- Put the app in background for at least 30 seconds.
- Reopen the app.
- Confirm no crash on foreground.
- Confirm billing state refreshes cleanly.
- Confirm the premium card and paywall health labels remain consistent.

### 7. Hydration Safety

- Launch once with active preview access.
- Fully close the app.
- Reopen the app.
- Confirm no stale loading state appears.
- Confirm no stale purchase error banner appears automatically.
- Confirm paywall selections and subscription state remain sane.

### 8. Expired or Invalid State Fallback

- Force an expired or malformed subscription payload in storage during testing.
- Relaunch the app.
- Confirm the app still opens.
- Confirm state normalizes to a safe fallback instead of crashing.
- Confirm the health panel shows warning or offline state instead of breaking navigation.

### 9. Production-Like Offline Billing

- Run a build where the provider is disabled.
- Open every paywall entry point:
- Onboarding
- Profile
- Break locks
- Stats locks
- Confirm purchase attempts fail with user-facing messaging, not silent failure.
- Confirm restore also fails gracefully.

### 10. Screen Coverage

- Visit Breaks, Stats, Profile, and Subscription after a purchase and after a reset.
- Confirm locked and unlocked surfaces stay consistent.
- Confirm no route loops or modal stacking issues appear.

## Visual Checks

- Premium card copy fits on small devices.
- Billing health summary does not overlap the chevron.
- Subscription modal still scrolls correctly on short screens.
- Health panel text wraps cleanly in dark and light themes.

## Release Blockers

- Any crash during onboarding, profile, or paywall open
- Infinite loading state in subscription UI
- Active subscription without entitlement or offer ID
- Expired or free state still showing unlocked Pro access
- Foreground refresh changing access unexpectedly
- Corrupted persisted state causing blank or broken subscription UI

## Notes to Capture When Something Fails

- Build type
- Device and OS version
- Entry point used
- Whether the app was cold-launched or resumed
- Current billing health label
- Current entitlement warning text
- Screenshot of the failing surface
