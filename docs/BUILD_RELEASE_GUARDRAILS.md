# Build & Release Guardrails

This repo now validates Expo/EAS release config before build jobs start.

## What is checked

- Required app assets referenced by Expo config exist.
- Notification plugin assets do not point to missing files.
- `extra.eas.projectId` resolves for `preview` and `production` builds.
- `updates.url` resolves for `preview` and `production` builds.
- Production builds do not run with `EXPO_PUBLIC_BILLING_PROVIDER=preview`.

## Local commands

```bash
npm run verify:config
npm run verify:expo-config
APP_ENV=preview npm run verify:config -- --profile preview
APP_ENV=production npm run verify:release
```

## Supported environment variables

- `EAS_PROJECT_ID`
- `EXPO_PUBLIC_EAS_PROJECT_ID`
- `EAS_UPDATE_URL`
- `EXPO_PUBLIC_EAS_UPDATE_URL`
- `EXPO_PUBLIC_BILLING_PROVIDER`

`app.config.js` will derive `updates.url` from the resolved EAS project ID when possible, so in most cases only `EAS_PROJECT_ID` is required.

## CI behavior

`.github/workflows/eas-build.yml` now:

- validates development config on every test run
- typechecks before lint/tests
- validates preview/production build config before EAS build starts

This is meant to fail fast on broken assets, unresolved Expo placeholders, or invalid billing mode before a release build is created.

## eas.json env routing (audit task E-PROD7)

Each EAS build profile pins its own `APP_ENV` and `EXPO_PUBLIC_BILLING_PROVIDER`
so a misconfigured local shell cannot accidentally ship a `preview` build
talking to real RevenueCat:

| Profile | `APP_ENV` | `EXPO_PUBLIC_BILLING_PROVIDER` | `channel` |
|---------|-----------|--------------------------------|-----------|
| development | `development` | `preview` (sandbox) | `development` |
| preview | `preview` | `preview` (sandbox) | `preview` |
| production | `production` | `revenuecat` (real) | `production` |

**Secrets that are NOT in `eas.json`** — these must be created with
`eas env:create` per profile so they live in EAS's encrypted store, not
the repo:

```bash
eas env:create --scope project \
  --visibility plaintext \
  --environment production \
  --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY \
  --value "<sandbox-or-prod-key>"
```

Required production secrets:

- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- `EAS_PROJECT_ID` (or `EXPO_PUBLIC_EAS_PROJECT_ID`)
- `EAS_UPDATE_URL` (optional — derived from project id when omitted)
- `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID` for submit

Required preview secrets (same names, scoped to `preview`):

- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` — point at the RevenueCat sandbox project
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` — same
- `EAS_PROJECT_ID`

`scripts/validate-app-config.js` enforces that the keys are present for the
profile it is invoked with — see `npm run verify:release`.

## OTA update policy (audit task E-PROD5)

We use Expo's hosted EAS Update service. The `app.json` `runtimeVersion`
policy is currently `appVersion`, which ties every OTA bundle to a single
native app version. This is the safest default — an OTA pushed to 1.0.0
will never reach a binary running 1.0.1 — but the trade-off is that
**every native version bump forces a fresh JS bundle deploy** to all
channels.

### Channels

| Channel | Promotes from | Used for |
|---------|---------------|----------|
| `production` | tagged `vX.Y.Z` commits on `master` | Production users. Default for App Store / Play Store builds. |
| `staging` | `master` after each CI-green merge | Internal pre-release smoke tests on TestFlight / Play Internal. |
| `preview` | PR builds | Per-PR builds used by reviewers + `.maestro/` E2E flows. |

### Rules

1. **Never publish to `production` from a non-tagged commit.** Use the
   `vX.Y.Z` tag flow so the release is reproducible and trivially rollbackable
   by re-tagging the previous version.
2. **Always bump `app.json` `version`** when the JS surface changes in a
   way that could break older native versions (new native module, new
   permission, removed bridge module). Bumping `version` invalidates the
   OTA channel for older binaries — which is the whole point.
3. **OTA-only fixes (i.e. JS-only) still publish on the same
   `runtimeVersion`**, so `app.json` `version` does not need a bump. Make
   sure the fix is JS-only (no new native deps, no permission change).
4. **Rollback procedure:** publish the previous OTA bundle to the same
   channel. EAS Update keeps prior bundles; use `eas update:list` to find
   the SHA and `eas update:republish --group <id>` to bring it back.
5. **Never let the placeholder `your-project-id` reach a published bundle.**
   `scripts/validate-app-config.js` enforces this in production profile
   builds — see B1 in the audit; the warning in dev profile is intentional.

### When to consider switching to `fingerprint`

The `appVersion` policy is conservative. If we ever ship many small JS-only
patches per native release, the next step is `runtimeVersion.policy:
fingerprint`, which derives the runtime version from the actual native
dependency hash. Defer this until the JS-bundle release cadence is faster
than the native release cadence by a 4× margin.
