# MicroBreaks MRR Execution Backlog

Last updated: May 7, 2026

## Goal

Reach $50k gross MRR by November 30, 2026 with a hybrid model:
- Consumer Pro subscriptions
- Team pilots and small-business plans

## Revenue Model

- Consumer target: 3,800 active payers at ~$8.10 blended MRR
- Teams target: 16 active accounts at ~$1.3k average account MRR
- Total target: ~$51.6k gross MRR

## Product Positioning

- Category: desk health and focus recovery
- Core promise: reduce screen-related fatigue without disrupting work
- Paid value: structured programs, advanced insights, automation, desktop presence, and team reporting

## P0 Backlog

- `MB-101` Truth-sync all public copy with actual product behavior
- `MB-102` Add revenue analytics event schema
- `MB-103` Integrate billing stack and entitlements
- `MB-104` Replace placeholder premium pitch with a real paywall
- `MB-105` Define free vs Pro feature gates
- `MB-106` Replace hardcoded break catalog with data-driven content

## P1 Backlog

- `MB-107` Add advanced stats and weekly recovery reports
- `MB-108` Wire positive-session review prompting
- `MB-109` Replace brochure landing page with a conversion funnel
- `MB-110` Build real calendar integration or clearly mark it as unavailable

## P2 Backlog

- `MB-201` Employer landing page and demo funnel
- `MB-202` Team beta foundations: orgs, seats, admin summaries
- `MB-203` Desktop surface: macOS companion or browser extension
- `MB-204` Slack nudges and manager insights

## Sprint Sequence

### Sprint 0
- Truth-sync copy and privacy messaging
- Revenue analytics schema

### Sprint 1
- Billing integration
- Onboarding paywall
- Profile upgrade flow

### Sprint 2
- Feature gating
- Catalog-driven breaks experience

### Sprint 3
- Advanced stats
- Weekly recovery report
- Review prompt loop

### Sprint 4
- Landing funnel
- Employer CTA
- Calendar integration decision

### Sprint 5
- Team beta foundations
- Demo workflow

## KPI Tree

### Acquisition
- Landing visitor to store click: >12%
- Employer landing visitor to demo request: >3.5%
- Cumulative installs by Nov 30, 2026: 120k

### Activation
- Onboarding completion: >80%
- Notification opt-in: >65%
- First break completed on day 0: >45%

### Retention
- D7 retained: >25%
- D30 retained: >12%
- Paying user week-4 retention: >70%

### Monetization
- Paywall view to trial start: >18%
- Trial to paid: >40%
- Install to paid by day 35: >3.2%
- Annual share of new subscription revenue: >60%

### B2B
- Qualified leads: 250
- Demos: 60
- Pilots: 24
- Paid team accounts: 16

## Current Risks

- Public messaging still needs a second pass in long-tail marketing assets
- Billing and paywall systems are not implemented yet
- The product surface understates the content depth available in the data layer
- Team functionality does not exist in the shipped app
- Desktop presence is missing even though the use case is desktop-centric

## Immediate Next PRs

1. Truth + Analytics
2. Billing + Paywall
3. Premium Value Surface
