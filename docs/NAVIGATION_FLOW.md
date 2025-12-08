# MindFlow - Navigation Architecture
## Zen Master Level Navigation & Routing

---

## Dosya Yapısı (Expo Router)

```
app/
├── _layout.tsx                    # Root layout (providers, auth check)
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
│   ├── _layout.tsx                # Linear flow, no back on first screen
│   ├── welcome.tsx                # Screen 1
│   ├── feeling.tsx                # Screen 2
│   ├── journey.tsx                # Screen 3
│   ├── struggles.tsx              # Screen 4
│   ├── value.tsx                  # Screen 5
│   ├── goal.tsx                   # Screen 6
│   ├── commitment.tsx             # Screen 7
│   └── paywall.tsx                # Screen 8
│
├── (tabs)/                        # Main app (authenticated)
│   ├── _layout.tsx                # Tab navigator
│   ├── index.tsx                  # Tab 1: Home
│   ├── focus.tsx                  # Tab 2: Focus Hub
│   ├── routines.tsx               # Tab 3: Routines
│   ├── tasks.tsx                  # Tab 4: Tasks
│   └── me.tsx                     # Tab 5: Me/Profile
│
├── (home)/                        # Home stack screens
│   ├── _layout.tsx
│   ├── morning-checkin.tsx
│   ├── evening-reflection.tsx
│   └── daily-summary.tsx
│
├── (focus)/                       # Focus stack screens
│   ├── _layout.tsx
│   ├── session/[id].tsx           # Active focus session
│   ├── body-double.tsx            # Body double matching
│   ├── break.tsx                  # Break screen
│   └── complete.tsx               # Session complete celebration
│
├── (routines)/                    # Routines stack screens
│   ├── _layout.tsx
│   ├── [id].tsx                   # Routine detail
│   ├── active/[id].tsx            # Active routine (step by step)
│   ├── create.tsx                 # Create new routine
│   ├── edit/[id].tsx              # Edit routine
│   └── templates.tsx              # Template gallery
│
├── (tasks)/                       # Tasks stack screens
│   ├── _layout.tsx
│   ├── [id].tsx                   # Task detail
│   ├── create.tsx                 # Create task (full screen)
│   └── completed.tsx              # Completed tasks archive
│
├── (me)/                          # Me/Profile stack screens
│   ├── _layout.tsx
│   ├── insights.tsx               # Analytics & insights
│   ├── mood-journal.tsx           # Mood history
│   ├── medication.tsx             # Medication tracker
│   ├── dopamine-menu.tsx          # Rewards system
│   ├── achievements.tsx           # Badges & achievements
│   ├── goals.tsx                  # Long-term goals
│   └── settings/
│       ├── index.tsx              # Settings main
│       ├── profile.tsx            # Profile edit
│       ├── notifications.tsx      # Notification settings
│       ├── appearance.tsx         # Theme, font size
│       ├── focus.tsx              # Focus defaults
│       ├── integrations.tsx       # Calendar, health
│       ├── subscription.tsx       # Plan management
│       ├── data.tsx               # Export, delete data
│       └── help.tsx               # FAQ, support
│
├── (modals)/                      # Modal screens (presented over tabs)
│   ├── quick-add-task.tsx         # Quick add task bottom sheet
│   ├── mood-check.tsx             # Quick mood check
│   ├── celebration.tsx            # Win celebration
│   ├── stuck-helper.tsx           # Stuck intervention
│   ├── crisis-support.tsx         # Crisis resources
│   └── body-double-session.tsx    # Active body double overlay
│
└── (crisis)/                      # Crisis screens (always accessible)
    ├── _layout.tsx
    ├── index.tsx                  # Main crisis support
    ├── breathing.tsx              # Guided breathing
    ├── grounding.tsx              # 5-4-3-2-1 exercise
    └── contacts.tsx               # Emergency contacts
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
                    │  (MMKV/Auth)    │
                    └─────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
     ┌───────────┐    ┌───────────────┐  ┌───────────────┐
     │  No Auth  │    │ Auth + No     │  │ Auth +        │
     │  Token    │    │ Onboarding    │  │ Onboarded     │
     └───────────┘    └───────────────┘  └───────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
     ┌───────────┐    ┌───────────────┐  ┌───────────────┐
     │  (auth)/  │    │ (onboarding)/ │  │   (tabs)/     │
     │  login    │    │   welcome     │  │    index      │
     └───────────┘    └───────────────┘  └───────────────┘

WORST CASES:
├── Storage corrupted → Clear & show login
├── Token expired → Silent refresh, fail → login
├── Onboarding incomplete → Resume from last step
└── App crash during onboarding → Resume with saved state
```

### 2. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      AUTH FLOW                              │
└─────────────────────────────────────────────────────────────┘

                    ┌───────────────┐
                    │    Login      │
                    └───────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌───────────┐   ┌───────────┐    ┌───────────────┐
    │   Email   │   │  Google   │    │    Apple      │
    │  Login    │   │  OAuth    │    │   Sign-In     │
    └───────────┘   └───────────┘    └───────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  Auth Success?  │
                  └─────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        ┌───────────┐            ┌───────────────┐
        │  SUCCESS  │            │    FAILURE    │
        └───────────┘            └───────────────┘
              │                         │
              ▼                         ▼
    ┌─────────────────┐        ┌─────────────────┐
    │ Check Onboard   │        │  Show Error     │
    │ Status          │        │  Stay on Login  │
    └─────────────────┘        └─────────────────┘
              │
     ┌────────┴────────┐
     ▼                 ▼
┌─────────┐      ┌───────────┐
│Onboarded│      │Not Onboard│
└─────────┘      └───────────┘
     │                 │
     ▼                 ▼
 (tabs)/         (onboarding)/
  index            welcome

WORST CASES:
├── Network timeout → Retry with exponential backoff, offline mode option
├── Invalid credentials → Clear error message, don't clear form
├── OAuth cancelled → Return to login, no error shown
├── OAuth provider down → Fallback to email, show provider status
├── Account suspended → Show specific message with support contact
├── Rate limited → Show countdown timer, suggest password reset
└── Server error (500) → "Something went wrong, try again" + retry button
```

### 3. Onboarding Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                          │
│              (Linear, can't skip screens)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────┐   ┌─────────┐   ┌─────────┐   ┌──────────┐
│ Welcome │ → │ Feeling │ → │ Journey │ → │ Struggles│
│  (1/8)  │   │  (2/8)  │   │  (3/8)  │   │  (4/8)   │
└─────────┘   └─────────┘   └─────────┘   └──────────┘
                                               │
┌─────────┐   ┌─────────┐   ┌──────────┐   ┌──┴───────┐
│ Paywall │ ← │ Commit  │ ← │   Goal   │ ← │  Value   │
│  (8/8)  │   │  (7/8)  │   │   (6/8)  │   │  (5/8)   │
└─────────┘   └─────────┘   └──────────┘   └──────────┘
     │
     ▼
┌───────────────────────────────────────┐
│            PAYWALL OPTIONS            │
├───────────────────────────────────────┤
│  • Start Trial → (tabs)/ + trial      │
│  • Subscribe   → (tabs)/ + premium    │
│  • Maybe Later → (tabs)/ + free       │
└───────────────────────────────────────┘

NAVIGATION RULES:
├── Back button: Allowed on screens 2-8
├── Back on screen 1: Exit app confirmation
├── Progress saved: After each screen
├── Resume: Jump to last incomplete screen
└── Skip all: Not allowed (premium insight gathering)

WORST CASES:
├── App killed mid-onboarding → Resume from currentStep (persisted)
├── User force quits at paywall → Next launch = paywall screen
├── Payment fails → Show error, allow retry, "Maybe Later" still works
├── Trial already used → Don't show trial option
├── Network down → Allow completion, sync selections when online
└── Back button spam → Debounce navigation, prevent double-back
```

### 4. Main Tab Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                     TAB NAVIGATION                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [CURRENT SCREEN]                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🏠      │   🎯     │   📋      │   ✓      │   👤         │
│  Home    │  Focus   │ Routines  │  Tasks   │    Me        │
│  ════    │          │           │          │              │
└─────────────────────────────────────────────────────────────┘

TAB BEHAVIORS:
├── Home: Landing tab, shows today's overview
├── Focus: Focus hub, or active session if one exists
├── Routines: List view, or active routine if one exists
├── Tasks: Today view by default
└── Me: Dashboard with links to sub-screens

NAVIGATION FROM TABS:
├── Home → (home)/morning-checkin (push)
├── Home → (focus)/session/[id] (push, starts focus)
├── Focus → (focus)/session/[id] (push)
├── Focus → (focus)/body-double (push)
├── Routines → (routines)/[id] (push)
├── Routines → (routines)/active/[id] (present full screen)
├── Tasks → (tasks)/[id] (push)
├── Tasks → (modals)/quick-add-task (present bottom sheet)
├── Me → (me)/insights (push)
└── Me → (me)/settings/index (push)

WORST CASES:
├── Tab pressed while loading → Ignore, show loading state
├── Active session exists → Focus tab shows session, not hub
├── Active routine exists → Routines tab shows routine, not list
├── Deep link while in session → Queue notification, don't interrupt
└── Memory pressure → Tabs may unmount, restore state from store
```

### 5. Focus Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   FOCUS SESSION FLOW                        │
└─────────────────────────────────────────────────────────────┘

                    ┌───────────────┐
                    │  Focus Hub    │
                    │  (tabs)/focus │
                    └───────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌───────────┐   ┌───────────┐    ┌───────────┐
    │  Select   │   │  Select   │    │  Body     │
    │   Task    │   │   Mode    │    │  Double   │
    └───────────┘   └───────────┘    └───────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                  ┌─────────────────┐
                  │ START SESSION   │
                  │(focus)/session  │
                  └─────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌───────────┐
     │  Working  │  │   Pause   │  │   Stuck   │
     │  (timer)  │  │  (modal)  │  │  (modal)  │
     └───────────┘  └───────────┘  └───────────┘
            │              │              │
            │              ▼              ▼
            │       ┌───────────┐  ┌───────────────┐
            │       │  Resume/  │  │ Break Task/   │
            │       │   End     │  │ 2min Version/ │
            │       └───────────┘  │ Body Double   │
            │                      └───────────────┘
            ▼
     ┌─────────────────┐
     │  TIME'S UP or   │
     │  EARLY DONE     │
     └─────────────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
┌─────────┐  ┌───────────┐
│  BREAK  │  │ COMPLETE  │
│ (focus/ │  │ (focus/   │
│  break) │  │ complete) │
└─────────┘  └───────────┘
     │             │
     ▼             ▼
┌─────────┐  ┌───────────┐
│ Another │  │Celebration│
│ Session │  │  Modal    │
└─────────┘  └───────────┘

WORST CASES:
├── App backgrounded during session
│   └── Timer continues, local notification at end
├── App killed during session
│   └── Restore session from persisted state, show "continue?" prompt
├── Phone call during session
│   └── Auto-pause, resume when call ends
├── Body double disconnects
│   └── Show "partner disconnected", offer to continue solo or find new
├── Network lost during body double
│   └── Continue session solo, show "offline" indicator
├── Timer drift (phone sleep)
│   └── Use actual timestamps, not intervals
├── Session longer than 2 hours
│   └── Gentle prompt to take break, don't force end
└── User starts new session with one active
    └── Prompt: "End current session?" or "Switch task?"
```

### 6. Routine Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     ROUTINE FLOW                            │
└─────────────────────────────────────────────────────────────┘

              ┌───────────────────┐
              │   Routines Tab    │
              │ (tabs)/routines   │
              └───────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌───────────┐ ┌───────────┐  ┌───────────┐
  │  Morning  │ │  Evening  │  │  Custom   │
  │  Routine  │ │  Routine  │  │  Routine  │
  └───────────┘ └───────────┘  └───────────┘
        │
        ▼ [START]
  ┌─────────────────────────────────┐
  │        ACTIVE ROUTINE           │
  │    (routines)/active/[id]       │
  │                                 │
  │  ┌─────────────────────────┐   │
  │  │      STEP 1 of N        │   │
  │  │                         │   │
  │  │    [Icon + Title]       │   │
  │  │    [Timer: 0:00]        │   │
  │  │                         │   │
  │  │  [SKIP]      [DONE ✓]   │   │
  │  └─────────────────────────┘   │
  └─────────────────────────────────┘
        │
        ├── [DONE] → Next step
        ├── [SKIP] → Next step (marked skipped)
        └── [PAUSE] → Routine paused modal
                │
        ┌───────┴───────┐
        ▼               ▼
   ┌─────────┐    ┌───────────┐
   │  RESUME │    │ END EARLY │
   └─────────┘    └───────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Save Progress? │
              │  (Partial done) │
              └─────────────────┘

AFTER ALL STEPS:
        │
        ▼
  ┌─────────────────┐
  │   COMPLETE!     │
  │                 │
  │  🎉 Celebration │
  │  +50 XP         │
  │  Streak: 12     │
  └─────────────────┘

WORST CASES:
├── App killed mid-routine
│   └── Persist current step, offer resume on next launch
├── Step timer overruns significantly (2x+ expected)
│   └── Gentle nudge: "Taking longer than usual - that's okay!"
├── All steps skipped
│   └── Still count as "attempted", encourage to try again
├── Routine started but never finished (abandoned)
│   └── After 2 hours, auto-end with "incomplete" status
├── User tries to start routine while one is active
│   └── "Finish or end current routine first?"
├── Notification dismissed, user forgets routine
│   └── Persistent notification until ended/completed
└── Step has no timer (untimed step)
    └── Show "Take your time" instead of countdown
```

### 7. Modal & Sheet Hierarchy

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
         │   ├── Quick Add Task
         │   ├── Mood Check
         │   ├── Stuck Helper
         │   └── Filter/Sort options
         │
Layer 3: Modal screens (full or partial)
         │   ├── Celebration
         │   ├── Body Double Session
         │   └── Settings sub-screens
         │
Layer 4: Alert dialogs (confirmation)
         │   ├── "End session?"
         │   ├── "Delete routine?"
         │   └── "Discard changes?"
         │
Layer 5: Crisis Support (ALWAYS ON TOP)
             └── Can be triggered from anywhere
             └── Never blocked by other modals
             └── Physical back button = doesn't dismiss

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
│   └── Active sessions, routines
│   └── Has explicit close/done button
│   └── NOT dismissible by gesture (prevent accidents)
│
└── Alert:
    └── Centered, dimmed background
    └── Requires explicit action (confirm/cancel)
    └── Back button = cancel

WORST CASES:
├── Multiple sheets requested simultaneously
│   └── Queue them, show one at a time
├── Sheet open + incoming call/notification
│   └── Sheet persists, returns when app resumes
├── Gesture conflict (scroll vs dismiss)
│   └── Lock dismiss gesture when content is scrolled
├── Sheet content taller than screen
│   └── Enable internal scrolling at max snap point
└── Keyboard open + sheet
    └── Sheet adjusts height, content remains visible
```

---

## Deep Linking

### URL Scheme

```
mindflow://                           # Open app (home)
mindflow://focus                      # Open focus tab
mindflow://focus/start?task=123       # Start focus with task
mindflow://routine/456                # Open routine detail
mindflow://routine/456/start          # Start routine
mindflow://task/789                   # Open task detail
mindflow://mood                       # Open mood check
mindflow://crisis                     # Open crisis support (priority)
mindflow://settings                   # Open settings
mindflow://settings/notifications     # Specific settings screen
```

### Universal Links

```
https://mindflow.app/invite/ABC123    # Referral link
https://mindflow.app/routine/456      # Shared routine template
https://mindflow.app/bodydouble/789   # Join body double session
```

### Notification Deep Links

```javascript
// Focus session complete
{
  type: 'focus_complete',
  data: { sessionId: '123' },
  action: 'mindflow://focus/complete/123'
}

// Medication reminder
{
  type: 'medication',
  data: { medicationId: '456' },
  actions: [
    { id: 'taken', title: 'Aldım ✓' },
    { id: 'snooze', title: '10dk sonra' }
  ]
}

// Routine reminder
{
  type: 'routine_reminder',
  data: { routineId: '789' },
  action: 'mindflow://routine/789/start'
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
              │ Is Crisis?    │
              │ (priority)    │
              └───────────────┘
                     │
           ┌────────┴────────┐
           ▼                 ▼
        [YES]             [NO]
           │                 │
           ▼                 ▼
    ┌───────────┐    ┌───────────────┐
    │ Open      │    │ Is User       │
    │ Crisis    │    │ Authenticated?│
    │ IMMEDIATE │    └───────────────┘
    └───────────┘           │
                    ┌───────┴───────┐
                    ▼               ▼
                 [YES]           [NO]
                    │               │
                    ▼               ▼
           ┌─────────────┐  ┌───────────────┐
           │ Is Session  │  │ Save target   │
           │ Active?     │  │ Navigate after│
           └─────────────┘  │ auth complete │
                  │         └───────────────┘
          ┌───────┴───────┐
          ▼               ▼
       [YES]           [NO]
          │               │
          ▼               ▼
   ┌───────────┐  ┌───────────────┐
   │ Queue for │  │ Navigate to   │
   │ after     │  │ target screen │
   │ session   │  └───────────────┘
   └───────────┘

WORST CASES:
├── Invalid deep link → Navigate to home, don't crash
├── Deep link to deleted content → Show "not found" message
├── Deep link to premium feature (free user) → Show upgrade prompt
├── Multiple deep links rapidly → Process only last one
├── Deep link while app loading → Wait for ready, then navigate
└── Deep link with expired session → Re-authenticate, then navigate
```

---

## Navigation Guards

### Auth Guard

```typescript
// middleware/authGuard.ts
const protectedRoutes = [
  '(tabs)',
  '(home)',
  '(focus)',
  '(routines)',
  '(tasks)',
  '(me)',
];

const publicRoutes = [
  '(auth)',
  '(onboarding)',
  '(crisis)', // Crisis always accessible
];
```

### Onboarding Guard

```typescript
// Check on app launch and after auth
if (isAuthenticated && !onboardingCompleted) {
  // Navigate to last incomplete step
  router.replace(`/(onboarding)/${getNextOnboardingScreen()}`);
}
```

### Session Guard

```typescript
// Prevent navigation away from active focus session
if (activeFocusSession && targetRoute !== focusRoutes) {
  showAlert({
    title: 'Aktif oturum var',
    message: 'Focus oturumunu bitirmek ister misin?',
    actions: [
      { text: 'Devam Et', onPress: () => {} },
      { text: 'Bitir', onPress: () => endSession() },
    ]
  });
  return false; // Block navigation
}
```

### Premium Guard

```typescript
const premiumRoutes = [
  '(me)/insights', // Full insights
  '(routines)/templates', // All templates
  // etc.
];

if (premiumRoutes.includes(targetRoute) && !isPremium) {
  showUpgradeModal();
  return false;
}
```

---

## Transition Animations

```typescript
// Screen transitions
const screenOptions = {
  // Stack screens
  animation: 'slide_from_right',

  // Modal presentations
  presentation: 'modal',
  animationTypeForReplace: 'pop',

  // Full screen modals (focus, routine)
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
};

// Tab transitions
const tabScreenOptions = {
  animation: 'shift', // Subtle shift animation
  tabBarHideOnKeyboard: true,
};

// Reduced motion support
if (prefersReducedMotion) {
  screenOptions.animation = 'none';
}
```

---

## Error Boundaries

```typescript
// Per-route error handling
app/
├── (tabs)/
│   ├── _error.tsx          # Tab error fallback
│   └── ...
├── (focus)/
│   ├── _error.tsx          # Focus-specific errors
│   └── ...

// Error fallback UI
function TabErrorFallback({ error, retry }) {
  return (
    <View>
      <Text>Bir şeyler yanlış gitti</Text>
      <Button onPress={retry}>Tekrar Dene</Button>
      <Button onPress={goHome}>Ana Sayfaya Dön</Button>
    </View>
  );
}
```

---

## Performance Considerations

```typescript
// Lazy loading for heavy screens
const Insights = lazy(() => import('./(me)/insights'));
const Templates = lazy(() => import('./(routines)/templates'));

// Preloading critical screens
useEffect(() => {
  // Preload focus session screen when user opens Focus tab
  if (currentTab === 'focus') {
    router.prefetch('/(focus)/session/[id]');
  }
}, [currentTab]);

// Tab persistence (prevent re-renders)
<Tabs
  screenOptions={{
    lazy: true,
    freezeOnBlur: true, // Prevent background updates
  }}
/>
```

---

**Document Version:** 1.0
**Last Updated:** December 8, 2025
