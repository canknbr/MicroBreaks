# Image optimization (WebP migration)

Audit task D-PERF3.

## Current state (2026-06-07)

The repo ships **46 PNGs totalling ~30 MB** inside `assets/images/` (down
from 50 — four unreferenced Expo template logos were deleted on cleanup).
The bulk of the disk weight lives in the design-reference screenshots
under `assets/images/img/` (1.4–1.8 MB each), which Metro does **not**
bundle into the binary.

Numbers from `find assets -name '*.png' -exec stat -f "%z" {} \;`:

| Bucket | Files | Approx total | Bundled? |
|--------|------:|-------------:|:--------:|
| `assets/images/img/How We Feel ios Jul 2024 *.png` (design reference) | 20 | ~22 MB | No |
| App icons + splash + adaptive | 6 | ~510 KB | Yes — required by OS |
| Onboarding illustrations / break thumbnails | ~20 | ~6 MB | Mixed — check `require()` calls |

> Confirm Metro's actual bundle weight with `npx expo export && du -sh
> dist/assets` before and after any change in this section.

## Why the App-icon set stays PNG

The bundled icons (`icon.png`, `favicon.png`, `splash-icon.png`, the
three `android-icon-*.png` adaptive files) **cannot** be safely converted
to WebP. Apple's App Store and Android's adaptive-icon framework both
require PNG for these specific assets:

- App Store Connect rejects binaries whose `icon` declaration is WebP.
- Expo's splash plugin (`expo-splash-screen`) generates platform splash
  XML/Info.plist values that assume a PNG source.
- Android `AdaptiveIcon` foreground/background expects PNG with alpha;
  WebP alpha rendering on older Android is inconsistent.

Saving ~350 KB is not worth a store rejection. Leave them as-is.

## What IS worth converting

The onboarding illustrations and break thumbnails that are loaded via
`require('./assets/images/onboarding/*.png')` (or `expo-image`) are
viable WebP candidates. They are content images, not OS-managed icons,
so the format is up to us.

```bash
# 1. Install Squoosh CLI once
npm install -D @squoosh/cli

# 2. Convert content PNGs to WebP at quality 85 (~70% smaller, visually
#    identical at typical screen densities).
npx @squoosh/cli --webp '{"quality":85,"effort":4}' \
  assets/images/onboarding/*.png

# 3. Update each `require('./assets/images/onboarding/foo.png')` callsite
#    to `.webp`. Metro picks up the new extension automatically because
#    expo-image and `Image.source` accept WebP on iOS 14+ and Android 4.3+
#    (well below our minSdk).
```

After conversion verify with:

```bash
rm -rf dist
npx expo export
du -sh dist/assets
```

Expected bundle drop: ~3 MB.

## Skip these

- **`assets/images/img/How We Feel ios Jul 2024 *.png`** — design
  references only, not bundled. Move to a `design/` git submodule once
  the team has somewhere to put them; do not convert.
- **App icons + splash + adaptive** — see above. They must stay PNG.

## Cleanup already done (2026-06-07)

Removed unreferenced Expo template artefacts:

- `assets/images/partial-react-logo.png`
- `assets/images/react-logo.png`
- `assets/images/react-logo@2x.png`
- `assets/images/react-logo@3x.png`

These came from the `npx create-expo-app` template and were never
imported. Total saved: ~47 KB on disk + a cleaner directory.

## Wire into CI (follow-up)

Once content images are migrated, add a `verify:images` script that
asserts no new `.png` was introduced under
`assets/images/onboarding/**` so the repo doesn't slowly regress. Small
enough to live in `scripts/check-image-formats.js` next to
`validate-app-config.js`. Skip checks for the icon/splash/adaptive set
since those legitimately stay PNG.
