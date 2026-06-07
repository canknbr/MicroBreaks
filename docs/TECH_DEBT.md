# Tech Debt Tracker

Live list of known shortcuts. When you close one, delete the section.

## Type strictness

### `noUncheckedIndexedAccess` is off

**Why it matters:** `arr[i]` and `obj[key]` currently return `T` instead of `T | undefined`, which means index-out-of-bounds bugs are silent. The audit (A3) recommends enabling this.

**Why it stays off for now:** Turning it on produces 289 errors total — 189 in
production code, 100 in tests (see the `npx tsc --noEmit` run on 2026-06-05
after the flag was flipped temporarily). Fixing them safely is a multi-day pass
because the existing code routinely uses `array.find()` results without a
null check (`selectedPack` in `app/(tabs)/breaks.tsx`, `selectedRecoveryState`
in `app/(tabs)/index.tsx`, etc.).

**Ratchet plan:**

1. Pick one directory (suggested: `services/recommendations/`).
2. Flip `noUncheckedIndexedAccess` to `true` in a scratch
   `tsconfig.strict.json` that only includes that directory.
3. Fix the errors with a mix of `?` chains, `??` defaults, and explicit
   `!` where invariants prove non-null.
4. Run the full test suite — any regression is the indicator that an
   assumed non-null access was actually nullable.
5. Once green, move that directory into the main `tsconfig` via path-based
   `include` adjustments, leaving the flag itself off globally until every
   directory is converted.

**Estimated effort:** 1–2 engineering days per ~50 errors.

## Backend / Cloud

### `onAuthUserDelete` is the only Cloud Function

The function ships in `functions/src/index.ts` (audit task E-SEC6). When we
add more functions, refactor into per-domain files (e.g., `auth.ts`,
`firestore-triggers.ts`) and wire them through the same `src/index.ts`
exports.

## Performance

### Manual `React.memo` wrappers under the React Compiler

`app.json` has `experiments.reactCompiler = true`. With the compiler enabled,
the compiler emits prop-equality memoization automatically for components
that read props. Manual `React.memo(...)` wraps still work, but they are
now redundant — they add code and a tiny render-time overhead for no extra
benefit.

**Already removed:** `components/home/MotivationalQuote.tsx`.

**Remaining wrappers to consider:**

- `components/home/WeeklyInsights.tsx`
- `components/home/StreakCalendar.tsx`
- `components/home/CountdownTimer.tsx`
- `components/home/PresetPicker.tsx`
- `components/home/AnimatedStat.tsx`
- `components/home/HeaderActions.tsx`
- `components/home/TimerWidget.tsx`
- `components/home/QuickBreakCard.tsx`
- `components/home/LevelBadge.tsx`
- `components/home/SmartInsight.tsx`

Drop them gradually as each one is touched for unrelated work. Verify
visually on device after each removal — a regression here looks like
unnecessary re-renders during scroll.

### Skia is 435MB on disk for one consumer

`@shopify/react-native-skia` is imported only by
`components/home/ProgressRing.tsx`, which uses Skia's `Canvas` + `Path` to
draw an animated progress arc on the home screen. The package is **435MB
in `node_modules`** (most of it precompiled platform binaries) and its
runtime adds a couple of megabytes to each installed binary per
architecture.

Options, ranked by effort:

1. **Replace `ProgressRing` with `react-native-svg`.** SVG already ships
   for `expo-linear-gradient` and friends, so this trades 435MB of Skia
   for zero net new dependency weight. The animation can be driven by
   Reanimated's `useAnimatedProps`. Effort: ~2 hours including parity
   testing on iOS + Android.
2. **Lazy-load Skia from `ProgressRing` only.** Wrap the import in
   `React.lazy` / a dynamic `import()`. Cuts startup cost but does not
   reduce binary weight. Useful if we add more Skia surfaces later.
3. **Keep it.** Only worthwhile if a forthcoming feature needs Skia
   (canvas paths, custom paints). Document the decision in this section.

Decision recorded 2026-06-05: leave as-is for v1.0.0 (the ProgressRing
visual is on the critical home-screen path and a re-implementation needs
a designer review). Revisit before v1.1.0.

### Stats screen still uses ScrollView

`app/(tabs)/stats.tsx` renders multiple data-driven sections inside a single
`ScrollView`. The notifications screen has been migrated to `FlashList`
(see `app/notifications.tsx`). Stats has a more complex section layout
that would need careful flattening before the same migration is safe.

**Action when:** the longest list inside Stats exceeds ~50 items in
practice, or we see scroll jank on lower-end Android.

## Onboarding

### `features/` vs `components/` boundary is informal

We have both `features/onboarding/runtime.ts` (state machine helpers) and
`components/onboarding/` (UI components). The intended split (audit A5):

| Folder | Owns |
|--------|------|
| `features/<domain>/` | Domain logic, state machines, side-effect runtimes, request/response shapes specific to the domain |
| `components/<area>/` | Pure UI — accepts props, renders, never imports stores or services directly |
| `services/` | Cross-cutting infra (Firebase wrappers, sync queue, storage adapters) |
| `store/<slice>/` | Zustand slices and selectors |

When you next touch onboarding, move any business logic in
`components/onboarding/**` down into `features/onboarding/` and have the
component import from there. Do not rename files preemptively — wait for
a feature change to give the move a real test.
