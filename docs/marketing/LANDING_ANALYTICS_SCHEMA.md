# Landing Analytics Schema

Last updated: 2026-05-07

## Goal

Track whether the new desk-recovery positioning actually improves intent across:
- consumer landing
- teams landing
- launch-update CTA flow
- team-pilot CTA flow

## Implementation

The static pages now use shared files:
- [landing-page/analytics-config.js](/Users/can/Projects/MicroBreaks/landing-page/analytics-config.js:1)
- [landing-page/web-analytics.js](/Users/can/Projects/MicroBreaks/landing-page/web-analytics.js:1)

The client-side helper is defensive:
- pushes into `window.microbreaksAnalyticsQueue`
- pushes into `window.dataLayer` when available
- calls `gtag` when available
- calls `plausible` when available

If none of those exist, the page still works and no exception should surface.

## Consumer landing events

### `landing_page_viewed`

When:
- page loads

Properties:
- `page_type`
- `page_path`
- `page_title`
- `timestamp`

### `landing_hero_cta_clicked`

When:
- hero primary CTA clicked

Current labels:
- `launch_updates`

### `landing_secondary_cta_clicked`

When:
- hero secondary CTA clicked

Current labels:
- `find_first_reset`

### `landing_qualifier_started`

When:
- a visitor meaningfully interacts with the consumer starter-plan qualifier for the first time in a session

Properties:
- `page_type`
- `symptom`
- `workday`
- `time_window`
- `goal`
- `recommended_pack`

### `landing_qualifier_cta_clicked`

When:
- a CTA inside the consumer starter-plan qualifier is clicked

Current labels:
- `launch_updates_from_qualifier_eye_rescue`
- `launch_updates_from_qualifier_desk_neck_reset`
- `launch_updates_from_qualifier_posture_rescue`
- `launch_updates_from_qualifier_focus_reset`
- `launch_updates_from_qualifier_energy_lift`
- `see_reset_packs_from_qualifier`

### `landing_qualifier_lead_sent`

When:
- the qualifier primary CTA is clicked and the outbound email is filled with the current starter-plan recommendation

Properties:
- `page_type`
- `symptom`
- `workday`
- `time_window`
- `goal`
- `recommended_pack`

### `landing_teams_cta_clicked`

When:
- teams panel CTA clicked

Current labels:
- `explore_teams`
- `request_pilot`

### `landing_final_cta_clicked`

When:
- footer CTA block clicked

Current labels:
- `launch_updates`
- `read_faq`

### `landing_section_viewed`

When:
- a key section is seen with intersection observer

Current section names:
- `landing_hero`
- `landing_qualifier_section`
- `landing_recovery_section`
- `landing_reset_packs_section`
- `landing_social_proof_section`
- `landing_privacy_section`
- `landing_teams_section`
- `landing_final_cta_section`

## Teams landing events

### `teams_page_viewed`

When:
- teams page loads

Properties:
- `page_type`
- `page_path`
- `page_title`
- `timestamp`

### `teams_hero_cta_clicked`

When:
- hero CTA clicked

Current labels:
- `request_pilot`
- `see_pilot_model`

### `teams_final_cta_clicked`

When:
- final CTA block clicked

Current labels:
- `request_team_pilot`
- `back_to_consumer_app`

### `teams_roi_calculator_used`

When:
- a visitor changes the ROI calculator inputs for the first time in a session

Properties:
- `page_type`
- `team_size`
- `participation_rate`
- `recovered_minutes_per_week`
- `hourly_cost`
- `suggested_plan`

### `teams_roi_cta_clicked`

When:
- a CTA inside the ROI calculator block is clicked

Current labels:
- `request_pilot_from_roi_team_pilot`
- `request_pilot_from_roi_growth_team`
- `compare_pilot_plans`

### `teams_roi_model_sent`

When:
- the ROI calculator primary CTA is clicked and the current model is attached to the outbound pilot email

Properties:
- `page_type`
- `suggested_plan`
- `team_size`
- `participation_rate`
- `recovered_minutes_per_week`
- `implied_monthly_value`
- `payback_multiple`

### `teams_intake_started`

When:
- a visitor meaningfully interacts with the pilot brief form for the first time in a session

Properties:
- `page_type`
- `suggested_plan`
- `seat_band`
- `strain_pattern`
- `timeline`

### `teams_intake_cta_clicked`

When:
- a CTA inside the pilot brief section is clicked

Current labels:
- `send_pilot_brief_team_pilot`
- `send_pilot_brief_growth_team`
- `back_to_roi_model`

### `teams_pilot_brief_sent`

When:
- the structured pilot brief CTA is clicked and the outbound email is filled with current qualification data

Properties:
- `page_type`
- `suggested_plan`
- `seat_band`
- `strain_pattern`
- `timeline`
- `owner`
- `has_context`

### `teams_section_viewed`

When:
- a key section is seen with intersection observer

Current section names:
- `teams_hero`
- `teams_outcomes_section`
- `teams_operations_section`
- `teams_pilot_process_section`
- `teams_roi_section`
- `teams_pricing_section`
- `teams_faq_section`
- `teams_intake_section`
- `teams_final_cta_section`

## Shared CTA properties

All CTA click events currently send:
- `cta_label`
- `href`
- `link_text`
- `page_path`
- `page_title`
- `timestamp`

## Copy experiment event

### `web_copy_variant_seen`

When:
- a configured consumer or teams copy variant is applied

Properties:
- `experiment_name`
- `variant_id`
- `page_type`
- `page_path`
- `page_title`
- `timestamp`

## Minimum dashboard to build

1. Consumer landing
- page views
- hero CTA CTR
- qualifier start rate
- qualifier lead send rate
- teams panel CTR
- final CTA CTR

2. Teams landing
- page views
- hero CTA CTR
- ROI calculator usage rate
- ROI CTA CTR
- pilot brief start rate
- pilot brief send rate
- pricing section view rate
- final pilot CTA CTR

3. Cross-page
- consumer `explore_teams` clicks -> teams page views
- teams page views -> pilot CTA clicks

## Rule

Do not add more marketing events until these are visible in one dashboard first.
