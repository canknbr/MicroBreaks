# Image optimization (WebP migration)

Audit task D-PERF3.

## Current state (2026-06-05)

The repo ships **50 PNGs totalling ~30 MB** inside `assets/images/`. The
biggest offenders are the design-reference screenshots under
`assets/images/img/` (1.4–1.8 MB each), but the app-shipped icons
(`icon.png`, splash, adaptive icons) also stay PNG.

Numbers from `find assets -name '*.png' -exec stat -f "%z" {} \;`:

| Bucket | Files | Approx total |
|--------|------:|-------------:|
| `assets/images/img/How We Feel ios Jul 2024 *.png` (reference, **not bundled**) | 20 | ~22 MB |
| App icons + splash + adaptive (bundled) | ~6 | ~1.5 MB |
| Onboarding illustrations / break thumbnails (bundled) | ~24 | ~6 MB |

> The reference screenshots are linked from the design system docs and were
> never imported via `require` — Metro doesn't bundle them. Confirm with
> `npx expo export && du -sh dist/assets` after the conversion below.

## Convert bundled assets

```bash
# 1. Install Squoosh CLI once
npm install -D @squoosh/cli

# 2. Convert every bundled PNG to WebP at quality 85 (near-lossless, ~70% smaller)
npx @squoosh/cli --webp '{"quality":85,"effort":4}' \
  assets/images/icon.png \
  assets/images/favicon.png \
  assets/images/splash-icon.png \
  assets/images/android-icon-foreground.png \
  assets/images/android-icon-background.png \
  assets/images/android-icon-monochrome.png \
  assets/images/adaptive-icon.png

# 3. For onboarding illustrations and break thumbnails, batch them:
npx @squoosh/cli --webp '{"quality":85,"effort":4}' assets/images/onboarding/*.png
```

`@squoosh/cli` writes the new file next to the source (`icon.webp` beside
`icon.png`). After conversion:

- Update `app.json` icon / splash / adaptiveIcon paths to point at the
  `.webp` files.
- Update any `require('./assets/...png')` import in TS/TSX to the new
  `.webp` path.
- Keep the `.png` originals in source control until the App Store / Play
  Console verification passes — Apple has been known to reject WebP-only
  bundles when the binary references both.

## Skip these

- **`assets/images/img/How We Feel ios Jul 2024 *.png`** — design references
  only, not bundled. Leave alone or move to a `design/` git submodule once
  the team has somewhere to put them.
- Adaptive icon foreground if it relies on alpha transparency — Android 12+
  treats WebP alpha differently. Spot-check on a Pixel device before
  shipping.

## Verify

```bash
# Before/after bundle weight
rm -rf dist
npx expo export
du -sh dist/assets

# Visual A/B
npx expo prebuild --clean && npm run ios
```

You should see the bundled assets directory drop from ~7 MB to ~2 MB and no
regression in icon rendering on the device.

## Wire into CI (follow-up)

The squoosh step is idempotent and fast. Once the manual conversion is
verified, add a `verify:images` script that asserts no new `.png` was
introduced under `assets/images/{icon,splash,adaptive,onboarding}/**` so
the repo doesn't slowly regress. This is small enough to live in
`scripts/check-image-formats.js` next to the existing config-validation
script.
