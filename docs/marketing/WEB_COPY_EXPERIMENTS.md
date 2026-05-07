# Web Copy Experiments

Last updated: 2026-05-07

## Goal

Run safe headline and body-copy tests on the consumer and teams landing pages without changing page structure or introducing fragile client logic.

## Files

- [landing-page/experiments-config.js](/Users/can/Projects/MicroBreaks/landing-page/experiments-config.js:1)
- [landing-page/web-experiments.js](/Users/can/Projects/MicroBreaks/landing-page/web-experiments.js:1)

## Safety model

- If the script fails, the static HTML control copy still exists.
- If an experiment variant is unknown, the code falls back to `control`.
- If analytics is unavailable, variant exposure should not break rendering.

## How it works

Each page loads:
1. analytics bootstrap
2. experiment config
3. experiment runner

The runner:
- reads `exp_<experiment_name>` from the query string
- falls back to the default configured variant
- updates only the targeted text nodes
- sends `web_copy_variant_seen`

## Current experiments

### Consumer landing

Experiment:
- `consumer_hero_message`

Query param:
- `exp_consumer_hero_message`

Available variants:
- `control`
- `pain`
- `category`

Example URLs:
- `/index.html?exp_consumer_hero_message=control`
- `/index.html?exp_consumer_hero_message=pain`
- `/index.html?exp_consumer_hero_message=category`

### Teams landing

Experiment:
- `teams_hero_message`

Query param:
- `exp_teams_hero_message`

Available variants:
- `control`
- `manager`
- `pilot`

Example URLs:
- `/teams.html?exp_teams_hero_message=control`
- `/teams.html?exp_teams_hero_message=manager`
- `/teams.html?exp_teams_hero_message=pilot`

## Event

Event name:
- `web_copy_variant_seen`

Properties:
- `experiment_name`
- `variant_id`
- `page_type`
- `page_path`
- `page_title`
- `timestamp`

## Recommended first tests

### Consumer

Control:
- Symptom list plus fast reset framing

Pain:
- Stronger fatigue/pain language

Category:
- More category-creating “desk recovery” language

What to watch:
- `landing_hero_cta_clicked`
- `landing_secondary_cta_clicked`
- `landing_section_viewed` for `landing_reset_packs_section`

### Teams

Control:
- broad team recovery framing

Manager:
- lower-noise team operations framing

Pilot:
- commercial pilot framing

What to watch:
- `teams_hero_cta_clicked`
- `teams_section_viewed` for `teams_pricing_section`
- `teams_final_cta_clicked`

## Rule

Run one copy experiment per page at a time.

Do not layer multiple headline and CTA experiments together until the hero message test stabilizes.
