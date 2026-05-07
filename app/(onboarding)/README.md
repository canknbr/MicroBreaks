# MicroBreaks Onboarding Flow

This directory contains the onboarding experience for MicroBreaks.

As of May 7, 2026, the product now uses a shorter active onboarding path focused on faster value delivery. Legacy screens are still present in the directory for safe migration, experimentation, and fallback.

## Structure

```
app/(onboarding)/
├── components/          # Shared onboarding components
│   ├── OnboardingLayout.tsx
│   ├── PrimaryButton.tsx
│   ├── SecondaryButton.tsx
│   └── OptionCard.tsx
├── types.ts            # TypeScript type definitions
├── constants.ts        # Screen data and configuration
├── _layout.tsx         # Stack navigator configuration
├── index.tsx           # Entry point
└── [screens].tsx       # Individual screen components
```

## Active Flow

The active onboarding path is now:

```
welcome → work-role → pain-assessment → recommendation →
break-demo → notification-permission → premium-pitch → completion → /(tabs)
```

This shorter flow is designed to:
- reach the first relief moment faster
- reduce explanation-heavy drop-off
- collect only the highest-value personalization inputs
- move users into the app before habit momentum is lost

## Legacy Screens

The following legacy screens are still in the codebase but are no longer part of the main path:
- `social-proof.tsx`
- `value-promise.tsx`
- `screen-time.tsx`
- `work-pattern.tsx`
- `ergonomic-setup.tsx`
- `notification-preference.tsx`
- `energy-pattern.tsx`
- `break-style.tsx`
- `value-display.tsx`
- `impact-education.tsx`
- `timer-config.tsx`
- `calendar-integration.tsx`
- `first-session.tsx`

## Legacy Flow Phases

### Phase 1: Hook (Screens 1-3)
- **ONB_001** - `welcome.tsx`: Welcome & Problem Recognition
- **ONB_002** - `social-proof.tsx`: Authority & Social Proof
- **ONB_003** - `value-promise.tsx`: Value Promise & Expectation Setting

### Phase 2: Profile Building (Screens 4-11)
- **ONB_004** - `work-role.tsx`: Work Role Selection
- **ONB_005** - `screen-time.tsx`: Daily Screen Time
- **ONB_006** - `pain-assessment.tsx`: Current Pain Assessment
- **ONB_007** - `work-pattern.tsx`: Work Pattern
- **ONB_008** - `ergonomic-setup.tsx`: Ergonomic Setup Assessment
- **ONB_009** - `notification-preference.tsx`: Notification Preference
- **ONB_010** - `energy-pattern.tsx`: Energy Pattern
- **ONB_011** - `break-style.tsx`: Break Style Preference

### Phase 3: Demonstration (Screens 12-15)
- **ONB_012** - `recommendation.tsx`: AI Recommendation
- **ONB_013** - `break-demo.tsx`: Live Break Demo
- **ONB_014** - `value-display.tsx`: Immediate Value Display
- **ONB_015** - `impact-education.tsx`: Break Impact Education

### Phase 4: Activation (Screens 16-19)
- **ONB_016** - `timer-config.tsx`: Timer Configuration
- **ONB_017** - `notification-permission.tsx`: Notification Permission
- **ONB_018** - `calendar-integration.tsx`: Calendar Integration (Optional)
- **ONB_019** - `first-session.tsx`: First Session Start

### Phase 5: Monetization (Screens 20-21)
- **ONB_020** - `premium-pitch.tsx`: Premium Soft Pitch
- **ONB_021** - `completion.tsx`: Completion Celebration

## Key Features

- **Short Active Flow**: The main path is optimized for faster activation and earlier value delivery
- **Safe Migration**: Legacy screens remain available while the shorter flow is rolled out
- **Analytics Integration**: Each screen tracks relevant user interactions
- **Theme Integration**: Uses centralized theme system from `/theme`
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Accessibility**: WCAG AA compliant with proper touch targets and screen reader support

## Usage

To start the onboarding flow, navigate to:
```typescript
router.push('/(onboarding)');
```

To check if onboarding is completed:
```typescript
// Read the persisted onboarding store
const raw = await AsyncStorage.getItem('microbreaks-onboarding');
```

## Analytics Events

Each screen tracks the following events:
- Screen view: `onb_[screen_id]_viewed`
- User interaction: `onb_[screen_id]_[action]`
- Screen completion: `onb_[screen_id]_completed`
- Skip events: `onb_[screen_id]_skipped`

See `types.ts` for complete event definitions.

## Customization

To customize the onboarding flow:
1. Update constants in `constants.ts`
2. Modify screen order in `_layout.tsx`
3. Adjust theme values in `/theme`
4. Update analytics events in individual screens

## Testing

To test the onboarding flow:
1. Clear AsyncStorage: `AsyncStorage.removeItem('onboarding_completed')`
2. Restart the app
3. The onboarding flow will start automatically

## Future Enhancements

- A/B testing framework integration
- Personalization engine
- Advanced analytics and funnel tracking
- Adaptive screen ordering based on user behavior
- Multi-language support
