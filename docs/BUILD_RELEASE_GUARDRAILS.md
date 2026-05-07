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
