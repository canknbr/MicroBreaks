# MicroBreaks Onboarding Flow

This directory contains the onboarding experience for MicroBreaks.

As of May 10, 2026, the product uses a shorter active onboarding path focused on faster value delivery. The older 21-screen onboarding flow has been removed from the runtime and from this directory.

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

## Active Screen Map

- `welcome.tsx`: problem picker and initial intent
- `work-role.tsx`: role, work pattern, and screen-time capture
- `pain-assessment.tsx`: pain areas plus severity capture
- `recommendation.tsx`: starting plan and first reset suggestion
- `break-demo.tsx`: first relief moment
- `notification-permission.tsx`: honest notification opt-in
- `premium-pitch.tsx`: paid value framing
- `completion.tsx`: goal seed and handoff to the main app

## Key Features

- **Short Active Flow**: The main path is optimized for faster activation and earlier value delivery
- **Smaller Surface Area**: Removed legacy screens to eliminate direct route drift and stale onboarding paths
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

## Notes

- If onboarding expands again, add new screens intentionally rather than reviving the removed legacy flow.
- Keep onboarding claims aligned with real runtime capability; avoid placeholder calendar or AI-style value claims.
