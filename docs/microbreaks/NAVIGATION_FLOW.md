# MicroBreaks - Navigation Architecture
## Zen Master Level Navigation & Routing

---

## File Structure (Expo Router)

```
app/
├── _layout.tsx                    # Root layout (providers, theme, auth check)
├── index.tsx                      # Entry point (redirect logic)
├── +not-found.tsx                 # 404 handler
│
├── (auth)/                        # Auth group (unauthenticated)
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── forgot-password.tsx
│
├── (onboarding)/                  # Onboarding flow
│   ├── _layout.tsx                # Stack navigator, linear flow
│   ├── welcome.tsx                # Screen 1: Hook
│   ├── social-proof.tsx           # Screen 2: Trust signals
│   ├── value-promise.tsx          # Screen 3: Benefits
│   ├── work-role.tsx              # Screen 4: Job type
│   ├── screen-time.tsx            # Screen 5: Daily hours
│   ├── pain-assessment.tsx        # Screen 6: Pain areas
│   ├── work-pattern.tsx           # Screen 7: Work style
│   ├── ergonomic-setup.tsx        # Screen 8: Desk setup
│   ├── notification-preference.tsx # Screen 9: Alert style
│   ├── energy-pattern.tsx         # Screen 10: Energy levels
│   ├── break-style.tsx            # Screen 11: Break types
│   ├── recommendation.tsx         # Screen 12: AI recommendations
│   ├── break-demo.tsx             # Screen 13: Exercise preview
│   ├── value-display.tsx          # Screen 14: Personalization recap
│   ├── impact-education.tsx       # Screen 15: Health benefits
│   ├── timer-config.tsx           # Screen 16: Timer setup
│   ├── notification-permission.tsx # Screen 17: System permissions
│   ├── calendar-integration.tsx   # Screen 18: Calendar sync
│   ├── first-session.tsx          # Screen 19: First break guide
│   ├── premium-pitch.tsx          # Screen 20: Paywall
│   └── completion.tsx             # Screen 21: Done!
│
├── (tabs)/                        # Main app (authenticated)
│   ├── _layout.tsx                # Tab navigator
│   ├── index.tsx                  # Tab 1: Home/Dashboard
│   ├── timer.tsx                  # Tab 2: Timer
│   ├── exercises.tsx              # Tab 3: Exercise Library
│   ├── progress.tsx               # Tab 4: Progress & Analytics
│   └── settings.tsx               # Tab 5: Settings
│
├── (timer)/                       # Timer stack screens
│   ├── _layout.tsx
│   ├── session/[preset].tsx       # Active timer session
│   ├── break.tsx                  # Break screen
│   ├── complete.tsx               # Session complete
│   └── customize.tsx              # Custom timer setup
│
├── (exercises)/                   # Exercise stack screens
│   ├── _layout.tsx
│   ├── [id].tsx                   # Exercise detail
│   ├── category/[category].tsx    # Category view
│   └── favorites.tsx              # Favorite exercises
│
├── (progress)/                    # Progress stack screens
│   ├── _layout.tsx
│   ├── daily/[date].tsx           # Daily detail
│   ├── weekly.tsx                 # Weekly view
│   ├── achievements.tsx           # All achievements
│   └── insights.tsx               # AI insights (premium)
│
├── (settings)/                    # Settings stack screens
│   ├── _layout.tsx
│   ├── profile.tsx                # User profile
│   ├── notifications.tsx          # Notification settings
│   ├── timer-defaults.tsx         # Timer preferences
│   ├── appearance.tsx             # Theme, display
│   ├── sounds.tsx                 # Sound settings
│   ├── integrations.tsx           # Calendar, health
│   ├── subscription.tsx           # Premium management
│   ├── data.tsx                   # Export, privacy
│   └── help.tsx                   # FAQ, support, about
│
├── (modals)/                      # Modal screens
│   ├── break-active.tsx           # Full screen break
│   ├── exercise-detail.tsx        # Exercise bottom sheet
│   ├── achievement.tsx            # Achievement celebration
│   ├── streak-celebration.tsx     # Streak milestone
│   ├── premium-paywall.tsx        # Premium upsell
│   ├── quick-break.tsx            # Quick break selector
│   └── rating-prompt.tsx          # App Store rating
│
└── (widgets)/                     # Widget configuration
    ├── _layout.tsx
    └── configure.tsx              # Widget setup
```

---

## Navigation States & Flows

### 1. App Launch Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        APP LAUNCH                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Check Storage  │
                    │  (MMKV)         │
                    └─────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
     ┌───────────┐    ┌───────────────┐  ┌───────────────┐
     │  Fresh    │    │ Onboarding    │  │  Returning    │
     │  Install  │    │ Incomplete    │  │  User         │
     └───────────┘    └───────────────┘  └───────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
     ┌───────────┐    ┌───────────────┐  ┌───────────────┐
     │(onboarding)│   │ Resume at     │  │   (tabs)/     │
     │  welcome   │   │ lastStep      │  │    index      │
     └───────────┘    └───────────────┘  └───────────────┘

EDGE CASES:
├── Storage corrupted → Clear & fresh install flow
├── Onboarding data partial → Resume with defaults
├── App killed during onboarding → Resume from last saved step
├── Version upgrade → Check migration, may show what's new
└── Deep link on launch → Queue, process after init
```

### 2. Onboarding Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                          │
│                 (21 Screens, Linear)                        │
└─────────────────────────────────────────────────────────────┘

PHASE 1: HOOK (Screens 1-3)
┌─────────┐   ┌─────────────┐   ┌─────────────┐
│ Welcome │ → │ Social Proof│ → │ Value       │
│  (1/21) │   │   (2/21)    │   │ Promise     │
│         │   │             │   │  (3/21)     │
└─────────┘   └─────────────┘   └─────────────┘

PHASE 2: PROFILE (Screens 4-11)
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌──────────┐
│ Work    │ → │ Screen  │ → │ Pain    │ → │ Work     │
│ Role    │   │ Time    │   │ Areas   │   │ Pattern  │
│ (4/21)  │   │ (5/21)  │   │ (6/21)  │   │ (7/21)   │
└─────────┘   └─────────┘   └─────────┘   └──────────┘
                                               │
┌──────────┐   ┌─────────┐   ┌─────────┐   ┌──┴───────┐
│ Break    │ ← │ Energy  │ ← │ Notif   │ ← │ Ergo     │
│ Style    │   │ Pattern │   │ Pref    │   │ Setup    │
│ (11/21)  │   │ (10/21) │   │ (9/21)  │   │ (8/21)   │
└──────────┘   └─────────┘   └─────────┘   └──────────┘

PHASE 3: DEMONSTRATION (Screens 12-15)
┌────────────┐   ┌───────────┐   ┌─────────┐   ┌─────────┐
│ AI Recom-  │ → │ Break     │ → │ Value   │ → │ Impact  │
│ mendation  │   │ Demo      │   │ Display │   │ Edu     │
│ (12/21)    │   │ (13/21)   │   │ (14/21) │   │ (15/21) │
└────────────┘   └───────────┘   └─────────┘   └─────────┘

PHASE 4: ACTIVATION (Screens 16-19)
┌─────────┐   ┌───────────┐   ┌─────────┐   ┌─────────┐
│ Timer   │ → │ Notif     │ → │ Calendar│ → │ First   │
│ Config  │   │ Permiss.  │   │ Integr. │   │ Session │
│ (16/21) │   │ (17/21)   │   │ (18/21) │   │ (19/21) │
└─────────┘   └───────────┘   └─────────┘   └─────────┘

PHASE 5: MONETIZATION (Screens 20-21)
┌──────────┐   ┌────────────┐
│ Premium  │ → │ Completion │ → TO MAIN APP
│ Pitch    │   │ (21/21)    │
│ (20/21)  │   │            │
└──────────┘   └────────────┘
      │
      ├── Start Trial → (tabs)/ + trial state
      ├── Subscribe   → (tabs)/ + premium state
      └── Maybe Later → (tabs)/ + free state

NAVIGATION RULES:
├── Back button: Allowed on screens 2-21
├── Back on screen 1: Exit app confirmation
├── Progress saved: After each screen completion
├── Resume: Jump to last incomplete screen
├── Skip all: Not allowed
└── Skip individual: Only notification/calendar screens
```

### 3. Main Tab Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                     TAB NAVIGATION                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [CURRENT SCREEN]                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🏠      │   ⏱️     │   🏃     │   📊     │   ⚙️         │
│  Home    │  Timer   │ Exercise │ Progress │ Settings      │
│  ════    │          │          │          │               │
└─────────────────────────────────────────────────────────────┘

TAB BEHAVIORS:
├── Home: Today's overview, quick actions, next break countdown
├── Timer: Timer controls, preset selection, active session
├── Exercises: Library browse, categories, favorites
├── Progress: Daily/weekly stats, streaks, achievements
└── Settings: All preferences, premium, account

DEEP NAVIGATION FROM TABS:
├── Home → (timer)/session/[preset] (start quick break)
├── Home → (modals)/quick-break (break type selector)
├── Timer → (timer)/session/[preset] (start session)
├── Timer → (timer)/customize (custom timer)
├── Exercises → (exercises)/[id] (exercise detail)
├── Exercises → (exercises)/category/[cat] (category filter)
├── Progress → (progress)/daily/[date] (daily detail)
├── Progress → (progress)/achievements (all badges)
├── Settings → (settings)/notifications (notif settings)
└── Settings → (settings)/subscription (premium)

EDGE CASES:
├── Tab pressed while loading → Ignore, show loading state
├── Active break session → Timer tab shows active session
├── Deep link while in session → Queue, don't interrupt
└── Memory pressure → Tabs may unmount, restore from store
```

### 4. Timer Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   TIMER SESSION FLOW                        │
└─────────────────────────────────────────────────────────────┘

                    ┌───────────────┐
                    │  Timer Tab    │
                    │  (tabs)/timer │
                    └───────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌───────────┐   ┌───────────┐    ┌───────────┐
    │  Select   │   │  Quick    │    │  Custom   │
    │  Preset   │   │  Start    │    │  Setup    │
    └───────────┘   └───────────┘    └───────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                  ┌─────────────────┐
                  │ START SESSION   │
                  │(timer)/session  │
                  └─────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │  Working  │  │   Pause   │  │   Stop    │
     │  (timer)  │  │  (modal)  │  │  (alert)  │
     └───────────┘  └───────────┘  └───────────┘
            │              │              │
            │              ▼              ▼
            │       ┌───────────┐  ┌───────────────┐
            │       │ Resume or │  │ Confirm End   │
            │       │   End     │  │ (lose credit) │
            │       └───────────┘  └───────────────┘
            ▼
     ┌─────────────────┐
     │  TIMER ENDS     │
     └─────────────────┘
            │
            ▼
     ┌─────────────────┐
     │  BREAK TIME     │
     │  (timer)/break  │
     │                 │
     │ [Exercise Queue]│
     │ [Skip Option]   │
     │ [Extend Option] │
     └─────────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
┌─────────┐  ┌───────────┐
│ Complete│  │ Skip/End  │
│ Break   │  │ Early     │
└─────────┘  └───────────┘
     │             │
     └──────┬──────┘
            ▼
     ┌─────────────────┐
     │  SESSION        │
     │  COMPLETE       │
     │  (timer)/       │
     │  complete       │
     └─────────────────┘
            │
            ▼
     ┌─────────────────┐
     │  Summary &      │
     │  Celebration    │
     │  +XP, Streak    │
     └─────────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
┌─────────┐  ┌───────────┐
│ Another │  │ Back to   │
│ Session │  │ Home      │
└─────────┘  └───────────┘

EDGE CASES:
├── App backgrounded during session
│   └── Timer continues, local notification at end
├── App killed during session
│   └── Persist state, offer resume on next launch
├── Phone call during session
│   └── Auto-pause, resume prompt when call ends
├── Timer drift (phone sleep)
│   └── Use timestamps, not intervals
├── Network lost
│   └── Works fully offline, sync later
├── Session > 2 hours
│   └── Gentle prompt, no force end
└── Start new session while one active
    └── Prompt: "End current session?"
```

### 5. Break Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     BREAK SESSION                           │
│                   (Full Screen Modal)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│         BREAK TIME! ☀️                  │
│                                         │
│         4:32 remaining                  │
│         ════════════░░░                 │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│     ┌─────────────────────────────┐    │
│     │                             │    │
│     │    [Exercise Animation]     │    │
│     │                             │    │
│     │       Neck Rolls            │    │
│     │       1 of 3                │    │
│     │                             │    │
│     └─────────────────────────────┘    │
│                                         │
│     "Slowly roll your head in a         │
│      circular motion..."                │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [⏭ Skip Exercise]  [⏭ Skip Break]     │
│                                         │
│  [Extend +5 min]                        │
│                                         │
└─────────────────────────────────────────┘

EXERCISE QUEUE:
├── Exercise 1: Completed
├── Exercise 2: Current ◀
├── Exercise 3: Up next
└── (Auto-advance or manual next)

BREAK END OPTIONS:
├── Complete all exercises → Full credit + bonus XP
├── Skip some exercises → Partial credit
├── Skip entire break → Minimal credit
└── Extend break → Additional time, more exercises
```

### 6. Modal & Sheet Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    MODAL HIERARCHY                          │
│           (Bottom to top, z-index order)                    │
└─────────────────────────────────────────────────────────────┘

Layer 0: Tab Navigator (always present)
         │
Layer 1: Stack screens (push on top of tabs)
         │
Layer 2: Bottom sheets (quick actions)
         │   ├── Exercise detail
         │   ├── Quick break selector
         │   ├── Timer preset selector
         │   └── Filter/sort options
         │
Layer 3: Modal screens (full or partial)
         │   ├── Active break session
         │   ├── Achievement celebration
         │   ├── Premium paywall
         │   └── Settings sub-screens
         │
Layer 4: Alert dialogs (confirmation)
         │   ├── "End session?"
         │   ├── "Skip break?"
         │   └── "Cancel subscription?"
         │
Layer 5: Toast notifications (always on top)
             └── Success, error, info messages

PRESENTATION STYLES:
├── Bottom Sheet:
│   └── snapPoints: ['25%', '50%', '90%']
│   └── Dismissible by swipe down or tap outside
│
├── Modal (Card):
│   └── iOS: pageSheet presentation
│   └── Android: slide from bottom
│   └── Dismissible by swipe down
│
├── Modal (Full Screen):
│   └── Break sessions, premium paywall
│   └── Has explicit close/done button
│   └── NOT dismissible by gesture
│
└── Alert:
    └── Centered, dimmed background
    └── Requires explicit action
    └── Back button = cancel

EDGE CASES:
├── Multiple modals requested → Queue, show one at a time
├── Modal open + notification → Modal persists
├── Gesture conflict (scroll vs dismiss) → Lock dismiss when scrolled
├── Sheet content > screen → Enable internal scrolling
└── Keyboard + modal → Sheet adjusts height
```

---

## Deep Linking

### URL Scheme

```
microbreaks://                           # Open app (home)
microbreaks://timer                      # Open timer tab
microbreaks://timer/start?preset=pomodoro # Start specific preset
microbreaks://exercises                  # Open exercise library
microbreaks://exercises/[id]             # Specific exercise
microbreaks://progress                   # Open progress tab
microbreaks://progress/achievements      # Achievements screen
microbreaks://settings                   # Open settings
microbreaks://settings/premium           # Premium/subscription
microbreaks://break/start                # Start immediate break
```

### Universal Links

```
https://microbreaks.app/share/exercise/[id]   # Shared exercise
https://microbreaks.app/invite/[code]         # Referral link
https://microbreaks.app/challenge/[id]        # Team challenge (future)
```

### Notification Deep Links

```typescript
// Break reminder notification
{
  type: 'break_reminder',
  data: { presetId: 'pomodoro' },
  action: 'microbreaks://break/start',
  actions: [
    { id: 'start', title: 'Start Break' },
    { id: 'snooze_5', title: '5 min' },
    { id: 'snooze_15', title: '15 min' }
  ]
}

// Streak reminder
{
  type: 'streak_reminder',
  data: { currentStreak: 6 },
  action: 'microbreaks://timer',
  message: "Don't lose your 6-day streak! Take a break today."
}

// Achievement unlocked
{
  type: 'achievement',
  data: { achievementId: 'early_bird' },
  action: 'microbreaks://progress/achievements'
}

// Weekly summary
{
  type: 'weekly_summary',
  action: 'microbreaks://progress'
}
```

### Deep Link Handling

```
┌─────────────────────────────────────────────────────────────┐
│                  DEEP LINK HANDLING                         │
└─────────────────────────────────────────────────────────────┘

              ┌───────────────┐
              │  Deep Link    │
              │   Received    │
              └───────────────┘
                     │
                     ▼
              ┌───────────────┐
              │ App Running?  │
              └───────────────┘
                     │
           ┌─────────┴─────────┐
           ▼                   ▼
        [YES]               [NO]
           │                   │
           ▼                   ▼
    ┌───────────┐       ┌───────────────┐
    │ Is Active │       │ Launch App    │
    │ Session?  │       │ Queue Link    │
    └───────────┘       └───────────────┘
           │                   │
    ┌──────┴──────┐            │
    ▼             ▼            │
 [YES]         [NO]            │
    │             │            │
    ▼             ▼            │
┌─────────┐  ┌─────────┐       │
│ Queue   │  │Navigate │       │
│ for     │  │ to      │       │
│ later   │  │ target  │       │
└─────────┘  └─────────┘       │
                               │
                               ▼
                    ┌─────────────────┐
                    │  After Init     │
                    │  Process Link   │
                    └─────────────────┘

EDGE CASES:
├── Invalid deep link → Navigate to home, don't crash
├── Link to premium feature (free user) → Show paywall
├── Link while onboarding → Queue until complete
├── Multiple links rapidly → Process only last one
└── Link with expired session → Navigate anyway
```

---

## Navigation Guards

### 1. Onboarding Guard

```typescript
// middleware/onboardingGuard.ts

// Check on app launch and after auth
const OnboardingGuard = () => {
  const { isOnboardingComplete, currentStep } = useOnboardingStore();

  useEffect(() => {
    if (!isOnboardingComplete) {
      const targetScreen = getOnboardingScreenByStep(currentStep);
      router.replace(`/(onboarding)/${targetScreen}`);
    }
  }, [isOnboardingComplete, currentStep]);

  return null;
};

// Navigation blocked until onboarding complete
const protectedRoutes = ['(tabs)', '(timer)', '(exercises)', '(progress)', '(settings)'];
```

### 2. Session Guard

```typescript
// middleware/sessionGuard.ts

// Prevent accidental navigation away from active session
const SessionGuard = ({ children }) => {
  const { activeSession } = useTimerStore();
  const router = useRouter();

  useEffect(() => {
    if (activeSession && activeSession.status === 'running') {
      // Block navigation, show warning
      const unsubscribe = router.addListener('beforeRemove', (e) => {
        e.preventDefault();

        Alert.alert(
          'Session Active',
          'End your current session before navigating away?',
          [
            { text: 'Stay', style: 'cancel' },
            { text: 'End Session', onPress: () => {
              endSession();
              router.dispatch(e.data.action);
            }},
          ]
        );
      });

      return unsubscribe;
    }
  }, [activeSession]);

  return children;
};
```

### 3. Premium Guard

```typescript
// middleware/premiumGuard.ts

const premiumRoutes = [
  '(progress)/insights',
  '(settings)/integrations',
  '(exercises)/advanced/*',
];

const PremiumGuard = ({ children, route }) => {
  const { isPremium } = useSubscriptionStore();

  if (isPremiumRoute(route) && !isPremium) {
    return <PremiumPaywallScreen />;
  }

  return children;
};
```

---

## Transition Animations

### Screen Transitions

```typescript
// Screen transition configurations

const screenOptions = {
  // Stack screens (default)
  animation: 'slide_from_right',

  // Modal presentations
  presentation: 'modal',
  animationTypeForReplace: 'pop',

  // Full screen modals (break, paywall)
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
};

// Tab transitions
const tabScreenOptions = {
  animation: 'shift',
  tabBarHideOnKeyboard: true,
};

// Reduced motion support
const useReducedMotion = () => {
  const prefersReducedMotion = useAccessibilityInfo().reduceMotion;

  if (prefersReducedMotion) {
    return { animation: 'none' };
  }

  return {};
};
```

### Custom Animations

```typescript
// Onboarding slide animation
const onboardingAnimation = {
  animation: 'slide_from_right',
  animationDuration: 300,
  gestureEnabled: false, // Disable swipe back
};

// Modal appear animation
const modalAnimation = {
  animation: 'fade_from_bottom',
  animationDuration: 250,
};

// Celebration animation
const celebrationAnimation = {
  animation: 'zoom_in',
  animationDuration: 400,
};
```

---

## Error Boundaries

### Per-Route Error Handling

```typescript
// app/(tabs)/_error.tsx
function TabErrorFallback({ error, retry }) {
  return (
    <ScreenContainer>
      <ErrorIcon />
      <Title>Something went wrong</Title>
      <Body>{error.message}</Body>
      <PrimaryButton title="Try Again" onPress={retry} />
      <SecondaryButton title="Go Home" onPress={() => router.replace('/')} />
    </ScreenContainer>
  );
}

// app/(timer)/_error.tsx
function TimerErrorFallback({ error, retry }) {
  // Timer-specific error handling
  // May need to reset timer state
  return (
    <ScreenContainer>
      <Title>Timer Error</Title>
      <Body>Your session data has been saved.</Body>
      <PrimaryButton title="Return to Timer" onPress={() => {
        resetTimerState();
        router.replace('/(tabs)/timer');
      }} />
    </ScreenContainer>
  );
}
```

---

## Performance Optimizations

```typescript
// 1. Lazy loading for heavy screens
const InsightsScreen = lazy(() => import('./(progress)/insights'));
const PremiumPaywall = lazy(() => import('./(modals)/premium-paywall'));

// 2. Preloading critical screens
useEffect(() => {
  // Preload break screen when timer is running
  if (timerState === 'running') {
    router.prefetch('/(timer)/break');
  }
}, [timerState]);

// 3. Tab persistence
<Tabs
  screenOptions={{
    lazy: true,
    freezeOnBlur: true, // Prevent background updates
  }}
/>

// 4. Screen options memoization
const screenOptions = useMemo(() => ({
  headerShown: false,
  animation: 'slide_from_right',
}), []);
```

---

## Navigation State Persistence

```typescript
// Save navigation state on background
const NAVIGATION_STATE_KEY = 'NAVIGATION_STATE';

const persistNavigationState = async (state) => {
  try {
    await storage.set(NAVIGATION_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to persist navigation state');
  }
};

const loadNavigationState = async () => {
  try {
    const state = await storage.getString(NAVIGATION_STATE_KEY);
    return state ? JSON.parse(state) : undefined;
  } catch (e) {
    return undefined;
  }
};

// Use in navigation container
<NavigationContainer
  initialState={initialState}
  onStateChange={persistNavigationState}
/>
```

---

**Document Version:** 1.0
**Last Updated:** December 8, 2025
**Total Screens:** 45+ unique screens
**Navigation Philosophy:** Linear onboarding, tab-based main app, modal breaks
