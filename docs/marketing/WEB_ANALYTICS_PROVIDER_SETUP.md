# Web Analytics Provider Setup

Last updated: 2026-05-07

## Goal

Enable real measurement on the static marketing pages without breaking rendering when provider IDs are missing.

Pages covered:
- `landing-page/index.html`
- `landing-page/teams.html`

## Files

- [landing-page/analytics-config.js](/Users/can/Projects/MicroBreaks/landing-page/analytics-config.js:1)
- [landing-page/web-analytics.js](/Users/can/Projects/MicroBreaks/landing-page/web-analytics.js:1)

## Safety model

The web analytics layer is intentionally defensive.

If no provider IDs are configured:
- pages still render
- CTA links still work
- events still collect in `window.microbreaksAnalyticsQueue`
- no exception should break the page

If provider IDs are configured:
- GA4 can load dynamically
- Plausible can load dynamically
- the same event names are forwarded to those providers

## Current config shape

Edit:
- [landing-page/analytics-config.js](/Users/can/Projects/MicroBreaks/landing-page/analytics-config.js:1)

Current keys:
- `ga4MeasurementId`
- `plausibleDomain`
- `plausibleScriptSrc`
- `enableDebugConsole`

## Example config

```js
(function () {
  window.MICROBREAKS_ANALYTICS_CONFIG = {
    ga4MeasurementId: 'G-XXXXXXXXXX',
    plausibleDomain: 'microbreaks.app',
    plausibleScriptSrc: 'https://plausible.io/js/script.js',
    enableDebugConsole: false
  };
})();
```

## Recommended rollout

### Option A
- Turn on only Plausible first
- Why: easiest low-friction page analytics setup

### Option B
- Turn on only GA4 first
- Why: easier if the team already uses Google tooling and dashboards

### Option C
- Turn on both
- Why: acceptable if one system is product/marketing reporting and the other is broad web attribution

## Validation checklist

1. Open the consumer landing page
2. Confirm there is no console error
3. Click hero CTA and final CTA
4. Scroll through all major sections
5. Open the teams page
6. Click pilot CTAs
7. Verify events exist in:
   - `window.microbreaksAnalyticsQueue`
   - GA4 realtime if enabled
   - Plausible dashboard if enabled

## Known event names

Consumer:
- `landing_page_viewed`
- `landing_hero_cta_clicked`
- `landing_secondary_cta_clicked`
- `landing_teams_cta_clicked`
- `landing_final_cta_clicked`
- `landing_section_viewed`

Teams:
- `teams_page_viewed`
- `teams_hero_cta_clicked`
- `teams_final_cta_clicked`
- `teams_section_viewed`

## Rule

Do not add more providers until one dashboard is live and trusted.
