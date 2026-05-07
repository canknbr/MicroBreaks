# MicroBreaks Product Revision Plan

Last updated: May 7, 2026

## Purpose

This document translates the current app audit into a product redesign plan that can support:
- Better activation
- Better D7/D30 retention
- Stronger subscription conversion
- A realistic path to $50k gross MRR

This plan is intentionally written to be:
- Product-led
- Revenue-aware
- Crash-safe in implementation order

## Executive Summary

MicroBreaks currently behaves like a polished wellness utility:
- Long onboarding
- Nice visual design
- Good exercise depth
- Basic reminders, stats, and streaks

That is not enough for $50k MRR.

The product needs to move from:
- "break timer + guided wellness app"

to:
- "desk-worker recovery system for eyes, neck, posture, and focus"

The paid value should not be "more screens" or "more content."
The paid value should be:
- Better relief outcomes
- Better workday timing
- Better habit guidance
- Better reporting
- Better workplace fit

## Market Thesis

External benchmarks and competitors support this direction:
- Health & Fitness apps commonly anchor around `$9.99/mo` and annual plans are important to retention and revenue mix.
- Outcome-led products like Wakeout win by selling relief, focus, and energy, not utilities.
- Utility products that stay local and shallow often end up at one-time purchase pricing.
- Team wellness pricing ranges from small-business entry plans to `$per-user` or `$1k+ monthly` programs when reporting, engagement, or coaching are included.

Sources used:
- RevenueCat State of Subscription Apps 2026
- Wakeout App Store listing
- Standro pricing
- inKin pricing
- Fitsentive corporate wellness page
- Avidon pricing

## Product Diagnosis

### What is good already

- The app has a strong visual layer and strong perceived polish.
- The exercise data layer is deeper than the UI currently shows.
- Premium foundations now exist in code: paywall, gating, diagnostics, and analytics schema.
- There is enough content breadth to build meaningful paid packaging.

### What is weak

- The app asks too much before delivering enough value.
- The product speaks in categories and wellness language instead of user pain and outcomes.
- The home experience is dashboard-oriented, not need-oriented.
- "AI/personalization" is presented more strongly than the actual experience justifies.
- Some flows imply deeper functionality than currently exists.
- The desktop-at-work use case is not surfaced strongly enough for a desk-health product.

## Current Product Mismatches

### Onboarding length vs value density

The current onboarding is defined as a `21` screen flow:
- [app/(onboarding)/README.md](../app/(onboarding)/README.md)

This is too long for the category and too explanation-heavy for a relief product.

### False branch feeling

The "first session" screen gives two choices, but both routes go to the same place:
- [app/(onboarding)/first-session.tsx](../app/(onboarding)/first-session.tsx)

This weakens trust and makes the flow feel manipulative.

### AI claim vs actual logic

The onboarding positions recommendations as personalized/AI-shaped:
- [app/(onboarding)/recommendation.tsx](../app/(onboarding)/recommendation.tsx)

But the current plan generation is a straightforward rules engine:
- [services/recommendations/engine.ts](../services/recommendations/engine.ts)

This is acceptable technically, but the product claim needs to be more honest unless the personalization gets much stronger.

### Calendar promise vs actual capability

Calendar integration is currently promise-first and functionality-light:
- [app/(onboarding)/calendar-integration.tsx](../app/(onboarding)/calendar-integration.tsx)

### Home screen is dashboard-first

The home screen is built around summary UI and quick cards:
- [app/(tabs)/index.tsx](../app/(tabs)/index.tsx)

The data model behind it is also metric-first:
- [hooks/useHomeData.ts](../hooks/useHomeData.ts)

This is good for habit maintenance, but weak for first-session clarity and relief urgency.

### Demonstration and value proof are generic

The current demo and value screens are polished but generic:
- [app/(onboarding)/break-demo.tsx](../app/(onboarding)/break-demo.tsx)
- [app/(onboarding)/value-display.tsx](../app/(onboarding)/value-display.tsx)
- [app/(onboarding)/impact-education.tsx](../app/(onboarding)/impact-education.tsx)

They do not yet create a strong "this app solved my exact work problem" moment.

## New Product Thesis

### Category

Desk health and focus recovery

### Primary user

Remote or hybrid knowledge worker with:
- Eye strain
- Neck tension
- Posture fatigue
- Focus drop
- End-of-day stiffness

### Core promise

"Take the right 1-3 minute reset at the right moment so you feel better and work better without breaking your flow."

### Core loop

1. User feels a workday problem
2. App identifies current state
3. App recommends the right reset
4. User completes a short session
5. App reflects immediate benefit
6. App schedules the next best moment
7. User sees progress over time

This loop is stronger than:
- Browse exercises
- Start random timer
- Look at stats later

## Product Architecture

### Jobs to be done

The app should solve these jobs clearly:
- "My neck is tight."
- "My eyes are burning."
- "I need a focus reset before the next task."
- "I just ended a meeting and feel foggy."
- "I want to avoid feeling wrecked at 6 PM."

### Core user states

These should become first-class entry points across app surfaces:
- Eyes
- Neck
- Posture / Back
- Focus
- Energy
- Stress

### Content packaging

Move away from content-as-catalog and toward content-as-outcome.

Free starter experiences:
- Eye Rescue
- Neck Reset
- 1-Min Focus Reset
- Quick Walk Reset
- Deep Breath Reset

Pro program packs:
- Tech Neck Reset
- Post-Meeting Recovery
- Afternoon Focus Recovery
- Digital Eye Strain Rescue
- End-of-Day Desk Unwind
- Deep Work Recovery
- Posture Rescue Week

## Redesign Principles

### Principle 1

Deliver relief before explanation.

### Principle 2

Speak in outcomes, not wellness abstractions.

### Principle 3

Do not claim intelligence deeper than the product actually provides.

### Principle 4

Do not force catalog browsing when the user wants a quick answer.

### Principle 5

Every premium surface must answer:
- What better result do I get?
- Why is that result ongoing?
- Why does that justify a subscription?

## Screen-by-Screen Revision Plan

## Onboarding

### Goal

Reduce onboarding from `21` screens to `6-7` screens and move the first value moment earlier.

### New onboarding structure

#### Screen 1: Problem picker

Replace the generic welcome sequence with a direct problem choice:
- Eyes feel tired
- Neck / shoulders hurt
- Focus is dropping
- I want healthier work breaks

Current files involved:
- `welcome.tsx`
- `social-proof.tsx`
- `value-promise.tsx`

Decision:
- Merge these into a single high-clarity opener.

#### Screen 2: Work context

Keep only the most useful setup fields:
- Work style
- Screen time band
- Main workday pattern

Current candidates:
- `work-role.tsx`
- `screen-time.tsx`
- `work-pattern.tsx`

Decision:
- Compress into one or two lightweight screens.

#### Screen 3: Pain/state selection

Keep this because it is one of the strongest personalization inputs:
- `pain-assessment.tsx`

Revision:
- Add "right now" framing.
- Ask "What bothers you most today?" not only "Where do you feel discomfort?"

#### Screen 4: First recommendation

Keep recommendation, but reposition it as:
- "Your starting plan"
- Not "AI Recommendation"

Current file:
- `recommendation.tsx`

Revision:
- Remove AI-style language.
- Show one suggested break now, plus one 3-day mini-plan.

#### Screen 5: Live relief demo

Keep the demo, but shorten and intensify it:
- `break-demo.tsx`

Revision:
- Move to a real `30-45` second relief moment.
- Use pain-linked instructions.
- Ask for one-tap feedback immediately after.

#### Screen 6: Setup next best moment

Replace part of the long activation flow with one compact setup screen:
- preferred reminder rhythm
- notification opt-in
- optional calendar sync

Current files:
- `timer-config.tsx`
- `notification-permission.tsx`
- `calendar-integration.tsx`
- `first-session.tsx`

Revision:
- Remove fake branches.
- If calendar is not real yet, label it clearly as upcoming.

#### Screen 7: Paywall or free start

Current file:
- `premium-pitch.tsx`

Revision:
- Show personalized value based on selected pain and work context.
- Default to annual.
- Let free users continue without trick copy.

### Onboarding copy strategy

Replace generic copy like:
- healthier workday
- wellness companion
- track improvements

With copy like:
- reduce eye strain during screen-heavy days
- reset neck tension between meetings
- protect focus without losing momentum

## Home

### Goal

Turn home into the fastest route from discomfort to action.

### New home structure

#### Section 1: Current state picker

Top module:
- "What do you need right now?"
- Eyes
- Neck
- Focus
- Energy
- Stress

#### Section 2: Recommended next reset

One clear recommended action:
- title
- duration
- why now

Example:
- `Eye Rescue`
- `1 min`
- `You have not taken a visual break in 94 minutes`

#### Section 3: Workday rhythm

Show:
- time since last break
- next suggested break window
- current work rhythm

#### Section 4: Progress and habit reinforcement

Keep:
- streak
- daily goal
- weekly summary

But move these below the action layer.

### What to de-emphasize

- Decorative dashboard metrics above the first action
- XP-heavy framing for first-week users
- Too many equal-priority cards

Current file:
- [app/(tabs)/index.tsx](../app/(tabs)/index.tsx)

## Breaks

### Goal

Make the library feel like a system, not a list.

### New structure

#### Above-the-fold

- Recommended for now
- Popular desk resets
- Starter packs or Pro packs

#### Group content by outcome

Instead of only category sections:
- Relieve Eye Strain
- Fix Desk Neck
- Restore Focus
- Recover After Meetings
- End-of-Day Release

#### Pro packaging

Pro should unlock:
- full packs
- saved routines
- custom sequences
- deeper protocols

Current file:
- [app/(tabs)/breaks.tsx](../app/(tabs)/breaks.tsx)

## Stats

### Goal

Change stats from "activity history" into "recovery intelligence."

### New framing

Keep totals, but lead with:
- recovery score
- best recovery window
- most needed reset type
- consistency trend

### Free vs Pro

Free:
- simple streak
- this week totals
- last few sessions

Pro:
- weekly recovery report
- time-pattern analysis
- relief mix analysis
- trend narratives
- recovery recommendations

Current file:
- [app/(tabs)/stats.tsx](../app/(tabs)/stats.tsx)

## Profile

### Goal

Profile should become less of a settings dump and more of an account/value center.

### Priorities

- subscription status
- billing health
- plan benefits
- account preferences
- support

### De-emphasize

- achievement-first framing on early-user profiles
- non-core settings above subscription/account clarity

Current file:
- [app/(tabs)/profile.tsx](../app/(tabs)/profile.tsx)

## Monetization Strategy

## Free plan

Keep the free plan useful enough to spread organically:
- reminder rhythm
- starter resets
- simple streaks
- basic weekly counts

## Pro plan

Charge for:
- full outcome packs
- advanced recovery insights
- custom routines
- favorites and deeper organization
- sync-ready account state
- future desktop access

## Team plan

Do not launch broad B2B yet.
Start with team pilots after the consumer loop is strong.

Early team offer:
- admin invite
- shared challenge or cadence
- team usage summary
- optional Slack reminders later

## Recommended pricing

- Pro Monthly: `$9.99`
- Pro Annual: `$59.99`
- Team Pilot: `$299-$999/mo`
- Team Growth: `$2-$4/user/mo` with minimum commitment

## Paywall Strategy

### Paywall placements

- End of onboarding
- Locked break packs
- Locked advanced analytics
- Team invite flow

### Paywall language

Use:
- result language
- timing language
- workday-fit language

Avoid:
- feature laundry lists as the lead
- fake urgency
- overclaiming AI

### Personalized paywall variants

- `placement=onboarding`
- `placement=breaks`
- `placement=stats`
- `placement=profile`

Each variant should map to the user intent of that surface.

## Growth Strategy

## App Store positioning

The app should compete on:
- desk relief
- eye strain
- neck pain from screen work
- focus recovery

Not just:
- wellness
- mindfulness
- productivity timer

## Organic loop

Best organic loop:
- user gets relief
- user sees weekly improvement
- user shares report or recommends app to coworkers

## Content and landing

Landing and store assets should be built around:
- desk worker pain
- before/after energy
- eye/neck relief
- short format work-safe movement

## Team wedge

Best first B2B wedge:
- remote-first teams
- engineering teams
- design/product/ops-heavy teams
- founders and people-ops buyers

## KPI Tree

## Acquisition

- Store page conversion
- Landing visitor to app-store click
- Employer landing visitor to demo request

## Activation

- Onboarding completion
- Time to first completed break
- Notification opt-in
- First session positive feedback

## Retention

- D1 active
- D7 active
- D30 active
- Weekly active users with `2+` completed breaks

## Monetization

- Paywall viewed
- Trial started
- Trial converted
- Install to paid by day 35
- Annual mix

## Outcome signals

These matter as much as classic product metrics:
- Repeat use of same relief category
- Share of users with `3+` active days in a week
- Improvement in first-session feedback vs later sessions
- Return rate after the first relief demo

## Crash-Safe Delivery Strategy

This redesign should not be implemented as one giant rewrite.

### Rule 1

Keep current routes alive while redesigning internals.

### Rule 2

Ship behind flags where possible.

### Rule 3

Do not add fragile native dependencies early unless the product win is immediate and clear.

### Rule 4

Prefer adapting existing screens before deleting flows.

### Rule 5

Every phase must leave the app in a stable shippable state.

## Recommended implementation phases

### Phase A: Positioning and copy correction

- Rewrite onboarding lead copy
- Remove inflated AI language
- Clarify calendar status
- Update store and landing messaging

Risk:
- low

### Phase B: Onboarding compression

- Reduce to `6-7` screens
- Preserve existing route safety until new path is stable
- Keep analytics on old and new funnels during migration

Risk:
- medium

### Phase C: Home redesign

- Introduce state picker
- Introduce single recommended action
- Push dashboard metrics lower

Risk:
- medium

### Phase D: Outcome library packaging

- Reframe breaks around outcomes
- Add starter packs and Pro packs

Risk:
- low to medium

### Phase E: Premium value expansion

- Stronger narratives in stats
- Better Pro packaging
- Better upgrade moments

Risk:
- low

### Phase F: Desktop and team wedge

- Only after consumer loop is working

Risk:
- high if attempted too early

## File-Level Priority Map

### Highest-leverage product files

- [app/(onboarding)/welcome.tsx](../app/(onboarding)/welcome.tsx)
- [app/(onboarding)/social-proof.tsx](../app/(onboarding)/social-proof.tsx)
- [app/(onboarding)/value-promise.tsx](../app/(onboarding)/value-promise.tsx)
- [app/(onboarding)/pain-assessment.tsx](../app/(onboarding)/pain-assessment.tsx)
- [app/(onboarding)/recommendation.tsx](../app/(onboarding)/recommendation.tsx)
- [app/(onboarding)/break-demo.tsx](../app/(onboarding)/break-demo.tsx)
- [app/(onboarding)/timer-config.tsx](../app/(onboarding)/timer-config.tsx)
- [app/(onboarding)/calendar-integration.tsx](../app/(onboarding)/calendar-integration.tsx)
- [app/(onboarding)/first-session.tsx](../app/(onboarding)/first-session.tsx)
- [app/(tabs)/index.tsx](../app/(tabs)/index.tsx)
- [app/(tabs)/breaks.tsx](../app/(tabs)/breaks.tsx)
- [app/(tabs)/stats.tsx](../app/(tabs)/stats.tsx)

### Supporting logic files

- [hooks/useHomeData.ts](../hooks/useHomeData.ts)
- [hooks/useStatsData.ts](../hooks/useStatsData.ts)
- [services/recommendations/engine.ts](../services/recommendations/engine.ts)
- [constants/subscription.ts](../constants/subscription.ts)

## What Not to Build Yet

- Generic AI coach chat
- Community feed
- Social graph
- Wearables expansion before core retention works
- Large B2B admin surface before the consumer loop proves itself
- Complicated multi-plan pricing

## Definition of Success

The redesign is working when:
- onboarding is shorter and clearer
- users get to first relief faster
- home answers "what should I do right now?"
- paid value maps to outcomes, not just access
- the app feels built for desk workers, not generic wellness users

## Immediate Next Product PRs

1. Onboarding compression brief and route map
2. Home screen information architecture redesign
3. Break library outcome-packaging redesign
4. Stats narrative and recovery framing pass
5. Landing/store copy rewrite aligned with desk-worker recovery
