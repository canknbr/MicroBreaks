# Positioning Copy Tests

Last updated: 2026-05-07

## Goal

Shift MicroBreaks from a generic wellness utility into a clearer desk-recovery product for remote and hybrid knowledge workers.

Primary outcome:
- Improve visitor-to-install intent
- Improve paywall conversion intent
- Improve listing relevance for eye strain, neck pain, posture, and focus-reset searches

## Core positioning thesis

Do not lead with:
- wellness
- mindfulness
- productivity
- Pomodoro
- healthy habits

Lead with:
- eye strain relief
- neck and shoulder reset
- posture recovery
- focus recovery
- desk-worker fatigue

## Message hierarchy

1. Problem
- Long screen sessions create eye strain, tight shoulders, posture collapse, and focus drop.

2. Mechanism
- Short guided resets interrupt strain during the workday.

3. Outcome
- Better recovery rhythm across the week, not just one good break.

4. Trust
- Private-by-default core, optional sync, anonymous diagnostics for stability.

## Landing page tests

Implementation reference:
- [Web Copy Experiments](/Users/can/Projects/MicroBreaks/docs/marketing/WEB_COPY_EXPERIMENTS.md:1)

### Test A
- Headline: `2-minute resets for eyes, neck, posture, and focus.`
- Why: Broadest desk-recovery framing with the clearest problem list.

### Test B
- Headline: `Interrupt screen strain before it wrecks your afternoon.`
- Why: More emotional and fatigue-led. Better if users respond to pain language.

### Test C
- Headline: `Desk recovery for remote and hybrid work.`
- Why: More category-creating. Better if audience identity matters more than symptom search.

Success metric:
- Hero CTA clicks
- Scroll depth to reset-pack section
- Email update requests

## App Store tests

### Test A
- Subtitle: `2-minute resets for eyes, neck, posture & focus`
- Why: Highest search intent density

### Test B
- Subtitle: `Desk recovery for screen-heavy workdays`
- Why: Better category framing, weaker symptom specificity

### Test C
- Subtitle: `Guided resets for screen strain and focus drops`
- Why: Blends pain plus recovery mechanism

Success metric:
- Listing conversion rate
- Search impression relevance
- Browse-to-install rate

## Screenshot copy tests

### Screenshot 1
- Current direction:
  - `Eyes tired? Start here.`
  - `2-minute guided eye reset`

### Screenshot 2
- Current direction:
  - `Tight shoulders after meetings?`
  - `Desk Neck Reset in one tap`

### Screenshot 3
- Current direction:
  - `See your weekly recovery story`
  - `Know when strain is still building`

### Screenshot 4
- Current direction:
  - `Pick the relief you need right now`
  - `Eye Rescue, Posture Rescue, Focus Reset`

## Paywall tests

### Placement: onboarding
- Variant A headline:
  - `Unlock your full eye rescue plan`
- Variant B headline:
  - `Go beyond starter relief`

Hypothesis:
- Personalized problem naming should outperform generic Pro language.

### Placement: breaks
- Variant A headline:
  - `Go beyond starter neck relief`
- Variant B headline:
  - `Unlock the full reset library`

Hypothesis:
- Problem-specific copy should convert better than library-size copy.

### Placement: stats
- Variant A headline:
  - `See what your recovery story is missing`
- Variant B headline:
  - `Unlock deeper recovery analytics`

Hypothesis:
- Narrative framing should outperform analytics framing for non-technical users.

## Copy guardrails

Avoid:
- `AI coach`
- `revolutionary wellness`
- `healthy lifestyle`
- `optimize your productivity`
- `never forget a break again`

Prefer:
- `guided reset`
- `desk recovery`
- `screen strain`
- `tight shoulders`
- `focus drop`
- `weekly recovery story`

## Instrumentation to pair with copy tests

Track:
- `landing_hero_cta_clicked`
- `landing_secondary_cta_clicked`
- `landing_pack_section_viewed`
- `store_listing_variant_seen`
- `paywall_copy_variant_seen`
- `paywall_copy_variant_converted`

## Recommendation

Run only one message test per funnel layer at a time.

Priority order:
1. Landing headline
2. App Store subtitle
3. Screenshot 1 headline
4. Stats paywall headline
5. Breaks paywall headline
