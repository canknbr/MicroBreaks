# Maestro E2E flows for MicroBreaks

Each YAML file under `.maestro/` describes a real user flow exercised against
an installed build of the app. These were scaffolded as part of audit task
C-TEST3 — they are intentionally lightweight; we extend them as we add
features.

## Running locally

```bash
# Install once
curl -Ls "https://get.maestro.mobile.dev" | bash

# iOS Simulator
maestro test .maestro/onboarding.yaml

# Android emulator
maestro --platform=android test .maestro/onboarding.yaml

# Whole suite, sequential
maestro test .maestro
```

## Flows

| File | Validates |
|------|-----------|
| `onboarding.yaml` | Welcome → permissions → completion path lands on the home tab. |
| `pomodoro_background.yaml` | Starting a 25-minute focus session, sending the app to background, returning ~5s later still keeps the session and timer ticking. |
| `purchase_trial.yaml` | Opening the paywall, selecting the annual offer, completing the sandbox purchase, and verifying the "Pro" badge appears. |
| `account_delete.yaml` | Profile → Delete Account → confirm → fresh anonymous session is restored. |
| `notification_coldstart.yaml` | Tap a delivered break_reminder push → app cold-starts on the Breaks tab. |

## Conventions

- IDs and copy strings used in selectors come from the actual code (see the
  `# source:` comment at the top of every file). When you rename a label,
  update the corresponding flow in the same PR.
- Flows are non-destructive against shared cloud state: each one resets the
  fixture user at the start with `clearState` / `launchApp` and signs out
  at the end.
- We default to **anonymous sessions** for E2E so the flows can run in CI
  without a credentialed test account. The `purchase_trial.yaml` flow uses
  the StoreKit / Play Billing test environment.

## CI wiring

These flows are not wired into CI yet — see audit task C-TEST3 follow-up.
The skeleton lives in the repo so engineering work that adds new screens
can extend the relevant flow without first having to choose a tool.
