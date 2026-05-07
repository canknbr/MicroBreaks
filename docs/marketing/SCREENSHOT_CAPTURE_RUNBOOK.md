# Screenshot Capture Runbook

Last updated: 2026-05-07

## Goal

Capture store screenshots that match the current product positioning and the current product surfaces.

Use this with:
- [ASO Screenshot Copy](/Users/can/Projects/MicroBreaks/docs/marketing/ASO_SCREENSHOT_COPY.md:1)
- [ASO Screenshot Production Brief](/Users/can/Projects/MicroBreaks/docs/marketing/ASO_SCREENSHOT_PRODUCTION_BRIEF.md:1)
- [ASO Preview Page](/Users/can/Projects/MicroBreaks/landing-page/aso-preview.html:1)

## General capture rules

- Use a clean seeded account or a deterministic dev state
- Turn off debug overlays
- Prefer light-mode marketing captures unless a dark-mode campaign is specifically needed
- Keep status bar clean and neutral
- Avoid visible placeholder copy or preview-billing diagnostics in store screenshots
- Remove states that expose incomplete or internal-only controls

## Pre-capture setup

Before taking any screenshot:

1. Use a build that includes:
   - onboarding compression
   - state-based home
   - outcome-packaged Breaks
   - Recovery Story stats

2. Seed enough data so that:
   - Home has a recommended reset
   - Breaks shows outcome-pack framing
   - Stats shows Recovery Story and deeper signals
   - Profile looks calm and trustworthy

3. Make sure:
   - no alerts are visible
   - no system permission prompts are visible
   - no loading skeletons are visible
   - no crash or billing health warnings are visible

## Shot-by-shot capture targets

### 01 Home

Target surface:
- [app/(tabs)/index.tsx](/Users/can/Projects/MicroBreaks/app/(tabs)/index.tsx:640)

Must show:
- state selector
- recommended reset card
- clean upper fold

Avoid:
- lower-page clutter
- noisy smart insight states

Best state:
- free user
- one selected recovery state
- recommended card visible

### 02 Timer

Target surface:
- timer widget on Home

Must show:
- active preset or visible preset context
- clear work/break rhythm behavior

Avoid:
- empty or collapsed timer state
- unrelated lower sections stealing focus

Best state:
- timer visible above the fold or captured in a dedicated crop

### 03 Guided Session

Target surface:
- [app/break-session.tsx](/Users/can/Projects/MicroBreaks/app/break-session.tsx:1)

Must show:
- exercise title
- live instruction
- obvious session progress

Avoid:
- pre-session idle state
- end-of-session modal clutter

Best state:
- mid-session with the instruction and visual guide clearly readable

### 04 Library

Target surface:
- [app/(tabs)/breaks.tsx](/Users/can/Projects/MicroBreaks/app/(tabs)/breaks.tsx:838)

Must show:
- reset pack framing
- one selected pack
- featured pack or library area with clear outcome language

Avoid:
- raw filter-heavy state
- no-results search state
- locked-content overload

Best state:
- selected pack visible
- featured content aligned to the selected pack

### 05 Recovery

Target surface:
- [app/(tabs)/stats.tsx](/Users/can/Projects/MicroBreaks/app/(tabs)/stats.tsx:1100)

Must show:
- Recovery Story card
- some deeper signal or weekly layer

Avoid:
- empty state
- only dense bar charts with no narrative
- share alert or modal

Best state:
- active Pro preview or seeded Pro access
- Recovery Story visible first

### 06 Trust

Target surface:
- [app/(tabs)/profile.tsx](/Users/can/Projects/MicroBreaks/app/(tabs)/profile.tsx:834)

Must show:
- calm settings/profile surface
- privacy/support/account continuity feel

Avoid:
- diagnostics-heavy billing state
- obvious internal or preview-only messaging
- noisy long scroll capture

Best state:
- stable top portion of profile
- trust and continuity over monetization urgency

## Locale workflow

Recommended order:
1. Capture all EN masters
2. Confirm overlay fit in preview page
3. Switch app locale where needed
4. Capture TR masters
5. Re-check line breaks against the preview page

## Device workflow

Recommended order:
1. Capture one master on iPhone 6.7
2. Validate text fit on 6.5 and 5.5 crops
3. Capture Android master
4. Apply same overlay system

## QA checklist

- Screenshot 1 communicates desk recovery immediately
- Screenshot 4 shows outcome packaging, not generic category clutter
- Screenshot 5 makes stats feel worth paying for
- Screenshot 6 closes on trust, not gamification
- EN and TR overlays both remain readable
- No internal debug, preview, or diagnostic UI leaks into the final assets

## Rule

If the screenshot makes the app look like a generic break timer, retake it.
