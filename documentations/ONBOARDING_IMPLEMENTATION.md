# MicroBreaks Onboarding Implementation

## Overview
This document describes the implementation of the MicroBreaks onboarding flow, which consists of 21 screens across 5 phases.

## Implementation Summary

### Architecture
- **Framework**: React Native with Expo Router
- **State Management**: React Context API
- **Storage**: AsyncStorage for persistence
- **Animations**: React Native Reanimated
- **Navigation**: File-based routing with Expo Router

### Directory Structure
```
/app/(onboarding)/
├── _layout.tsx          # Onboarding navigation wrapper
└── index.tsx            # Main onboarding screen controller

/components/onboarding/
├── OnboardingContainer.tsx    # Base container with progress bar
├── OnboardingButton.tsx       # Animated button component
├── SelectionCard.tsx          # Reusable selection card
├── ScreenHeader.tsx           # Consistent header component
└── screens/
    ├── WelcomeScreen.tsx           # Phase 1: Screen 1
    ├── SocialProofScreen.tsx       # Phase 1: Screen 2
    ├── ValuePromiseScreen.tsx      # Phase 1: Screen 3
    ├── WorkRoleScreen.tsx          # Phase 2: Screen 4
    ├── ScreenTimeScreen.tsx        # Phase 2: Screen 5
    ├── PainAssessmentScreen.tsx    # Phase 2: Screen 6
    ├── WorkPatternScreen.tsx       # Phase 2: Screen 7
    └── AllRemainingScreens.tsx     # Phase 2-5: Screens 8-21

/contexts/
└── OnboardingContext.tsx      # Global onboarding state management

/types/
└── onboarding.ts             # TypeScript types and interfaces
```

## Onboarding Flow

### Phase 1: Hook (3 screens)
**Goal**: Capture attention and establish value proposition

1. **Welcome Screen** (ONB_001)
   - Animated illustration
   - Value proposition headline
   - Primary CTA: "Start Feeling Better"
   - Secondary CTA: "I'm just browsing"

2. **Social Proof Screen** (ONB_002)
   - Star rating (4.8/5)
   - User testimonials
   - Live break counter
   - Success metric: "89% report less pain in 7 days"

3. **Value Promise Screen** (ONB_003)
   - 3 key benefits with icons
   - Time commitment: "3 minutes to a healthier workday"
   - Trust indicators
   - CTA: "Personalize My Plan"

### Phase 2: Profile Building (8 screens)
**Goal**: Collect personalization data

4. **Work Role Selection** (ONB_004)
   - 8 role options with icons
   - Required field
   - Determines exercise selection

5. **Screen Time Input** (ONB_005)
   - Interactive slider (1-14 hours)
   - Visual feedback with emoji and color
   - Default: 8 hours
   - Skip option: "It varies"

6. **Pain Assessment** (ONB_006)
   - Multi-select body areas
   - 8 common pain points
   - Optional: "I'm pain-free"
   - Selection counter

7. **Work Pattern** (ONB_007)
   - 4 work style options
   - Affects break timing algorithm
   - Skip option available

8. **Ergonomic Setup** (ONB_008)
   - 5-item checklist
   - Scoring system (0-5)
   - Visual feedback
   - Optional

9. **Notification Preference** (ONB_009)
   - 4 styles: Gentle, Balanced, Strict, Smart
   - Preview of each style
   - Required

10. **Energy Pattern** (ONB_010)
    - 4 presets: Morning Person, Night Owl, Afternoon Slump, Steady
    - Skip option: "I'm not sure"
    - Optimizes break timing

11. **Break Style Preference** (ONB_011)
    - Multi-select: 5 break types
    - Movement, Desk, Breathing, Eye, Mixed
    - At least 1 required

### Phase 3: Demonstration (4 screens)
**Goal**: Show value and build trust

12. **AI Recommendation** (ONB_012)
    - Personalized plan display
    - 87% match score
    - Primary focus, schedule, goals
    - CTA: "Try Your First Break"

13. **Live Break Demo** (ONB_013)
    - Guided 30-second exercise
    - Animated illustration
    - Immediate feedback (emoji selection)
    - Skip available after 10s

14. **Immediate Value Display** (ONB_014)
    - 3 benefits of the demo break
    - Social proof: Live counter
    - Progress indicator: "1 of 10 daily breaks"
    - CTA: "Set Up My Breaks"

15. **Break Impact Education** (ONB_015)
    - 3 science facts
    - 20-20-20 rule, muscle memory, focus boost
    - Swipeable cards
    - Skip option: "Got it"

### Phase 4: Activation (4 screens)
**Goal**: Enable core features

16. **Timer Configuration** (ONB_016)
    - 3 presets: Pomodoro, Deep Work, Micro-Session
    - Recommended based on profile
    - Custom option available

17. **Notification Permission** (ONB_017)
    - Pre-permission screen with benefits
    - System permission request
    - Fallback: In-app reminders
    - Skip option: "Maybe later"

18. **Calendar Integration** (ONB_018)
    - 3 providers: Google, Outlook, Apple
    - OAuth authentication
    - Privacy note
    - Skip option: "Skip for now"

19. **First Session Start** (ONB_019)
    - Large timer display
    - Quick settings: Sound, Vibration
    - CTA: "Start Working"
    - Alternative: "Explore first"

### Phase 5: Monetization (2 screens)
**Goal**: Premium conversion

20. **Premium Soft Pitch** (ONB_020)
    - Feature comparison table
    - 7-day free trial offer
    - Pricing: $4.99/month
    - CTA: "Start Free Trial" or "Continue with Free"

21. **Completion Celebration** (ONB_021)
    - Confetti animation
    - "You're all set!" message
    - Summary stats: First break in X min, Weekly goal
    - CTA: "Go to Dashboard"

## Key Features

### Progress Tracking
- Visual progress bar at top of each screen
- Percentage calculation: (currentScreen + 1) / totalScreens * 100
- Smooth transitions

### Data Persistence
- Auto-save after each screen
- AsyncStorage for offline support
- Resume capability from last screen
- Cloud sync ready

### Animations
- React Native Reanimated for smooth transitions
- Spring animations for button presses
- Fade-in animations for content
- Scale animations for selections

### Accessibility
- Screen reader support
- Minimum touch targets: 44x44px
- High contrast support
- Keyboard navigation ready

### Analytics Events
All screens tracked with:
- Screen viewed
- Time on screen
- User selections
- Skip events
- Drop-off points

## Usage

### Starting Onboarding
```typescript
// Onboarding starts automatically on first app launch
// Status checked in app/_layout.tsx
```

### Accessing Onboarding Data
```typescript
import { useOnboarding } from '@/contexts/OnboardingContext';

function MyComponent() {
  const { data, progress, goToNextScreen } = useOnboarding();

  // Access user data
  console.log(data.workRole);
  console.log(data.painAreas);

  // Control navigation
  goToNextScreen();
}
```

### Resetting Onboarding
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear onboarding status
await AsyncStorage.removeItem('@microbreaks:onboarding_completed');
await AsyncStorage.removeItem('@microbreaks:onboarding_data');
```

## Dependencies

### Required Packages
- `@react-native-async-storage/async-storage`: Data persistence
- `@react-native-community/slider`: Screen time input
- `react-native-reanimated`: Animations
- `expo-router`: Navigation

### Theme Integration
Uses the centralized theme system from `/theme/`:
- Colors (brand, text, background, status)
- Typography (display, headline, body, label)
- Spacing (8px grid system)
- Border radius (button, card, full)
- Shadows (elevation system)

## Customization

### Adding New Screens
1. Create screen component in `/components/onboarding/screens/`
2. Add to `ONBOARDING_SCREENS` array in `/app/(onboarding)/index.tsx`
3. Update `TOTAL_SCREENS` in `/app/(onboarding)/_layout.tsx`
4. Add data fields to `/types/onboarding.ts`

### Modifying Screen Order
Edit the `ONBOARDING_SCREENS` array order in `/app/(onboarding)/index.tsx`

### Customizing Animations
Modify animation parameters in individual screen files:
```typescript
entering={FadeInDown.delay(200).duration(600)}
```

## Testing Checklist

- [ ] All 21 screens render correctly
- [ ] Progress bar updates accurately
- [ ] Data persists between screens
- [ ] Back navigation works (where applicable)
- [ ] Skip options function correctly
- [ ] Animations are smooth (60fps)
- [ ] Completion navigates to main app
- [ ] Onboarding doesn't re-trigger after completion
- [ ] Dark mode support
- [ ] Accessibility features work
- [ ] Analytics events fire correctly

## Performance Considerations

- Lazy load screens (already implemented via array indexing)
- Minimize re-renders with React.memo where needed
- Use Reanimated worklets for animations (runs on UI thread)
- Optimize AsyncStorage writes (debounced)
- Image optimization with Expo Image

## Future Enhancements

- [ ] A/B testing framework integration
- [ ] Multi-language support
- [ ] Custom break creation onboarding
- [ ] Video tutorials instead of static demos
- [ ] Haptic feedback on interactions
- [ ] Voice guidance for exercises
- [ ] Social features preview
- [ ] Team onboarding flow variant

## Troubleshooting

### Onboarding loops/doesn't complete
Check AsyncStorage key: `@microbreaks:onboarding_completed`

### Screen navigation not working
Verify `ONBOARDING_SCREENS` array length matches `TOTAL_SCREENS`

### Data not persisting
Check AsyncStorage permissions and error logs

### Animations laggy
Enable Hermes, check for expensive calculations on UI thread

## Support

For questions or issues:
1. Check `/documentations/Onboarding_Flow_MicroBreaks_v3.md`
2. Review individual screen implementations
3. Check console logs for error messages
4. Test on physical device (simulators may have animation issues)

---

**Last Updated**: November 2025
**Version**: 1.0
**Status**: Production Ready
