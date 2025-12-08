# MicroBreaks - Component Architecture
## Zen Master Level Component Breakdown

---

## Component Hierarchy Overview

```
app/
├── _layout.tsx                     # Root: Theme + Auth + Navigation Provider
├── index.tsx                       # Entry: Redirect logic
│
├── (onboarding)/                   # Onboarding Stack
│   └── components/                 # Onboarding-specific components
│
├── (tabs)/                         # Main App (Tab Navigator)
│   ├── index.tsx                   # Home/Dashboard
│   ├── timer.tsx                   # Timer Screen
│   ├── exercises.tsx               # Exercise Library
│   ├── progress.tsx                # Progress & Analytics
│   └── settings.tsx                # Settings
│
└── (modals)/                       # Modal Screens
    ├── break-active.tsx            # Active Break Session
    ├── exercise-detail.tsx         # Exercise Detail
    └── premium-paywall.tsx         # Premium Upsell

components/
├── core/                           # Design System Primitives
├── timer/                          # Timer-specific components
├── exercises/                      # Exercise-related components
├── progress/                       # Progress tracking components
├── onboarding/                     # Onboarding components
├── feedback/                       # Toasts, Modals, Alerts
└── layout/                         # Layout components
```

---

## Core Design System Components

### 1. Typography Components

```typescript
// components/core/Typography.tsx

/**
 * Text Component Family
 * Usage: <Display>, <Headline>, <Title>, <Body>, <Label>, <Caption>
 */

interface TextProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'error' | 'success';
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}

// Display: Hero text (36-48px)
// - Welcome screens, celebration modals
<Display>Small breaks, big impact</Display>

// Headline: Section headers (24-32px)
// - Screen titles, major sections
<Headline>Today's Progress</Headline>

// Title: Card titles, list headers (18-22px)
<Title>Eye Care Exercises</Title>

// Body: Main content (16px)
<Body>Take a 20-second break to rest your eyes.</Body>

// Label: Button text, form labels (14-16px)
<Label>Start Break</Label>

// Caption: Helper text, timestamps (12-14px)
<Caption>Last break: 25 minutes ago</Caption>
```

### 2. Button Components

```typescript
// components/core/Button.tsx

/**
 * Button Component Family
 * Primary, Secondary, Ghost, Icon variants
 */

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'none';
}

// Primary Button
// - Main CTAs, start actions
// - White background, dark text
// - Scale animation on press
// - Medium haptic feedback
<PrimaryButton
  title="Start Break"
  onPress={handleStartBreak}
  icon={<PlayIcon />}
/>

// Secondary Button
// - Alternative actions
// - Transparent with border
// - Light haptic
<SecondaryButton
  title="Skip"
  onPress={handleSkip}
/>

// Ghost Button
// - Tertiary actions, links
// - No background
// - Opacity animation
<GhostButton
  title="Learn More"
  onPress={handleLearnMore}
/>

// Icon Button
// - Compact actions
// - Circle shape
<IconButton
  icon={<SettingsIcon />}
  onPress={handleSettings}
/>
```

### 3. Card Components

```typescript
// components/core/Card.tsx

/**
 * Card Component Family
 * Container, Interactive, Stat variants
 */

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
}

// Basic Card
<Card>
  <CardHeader>
    <Title>Next Break</Title>
    <Caption>in 12 minutes</Caption>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <PrimaryButton title="Start Now" />
  </CardFooter>
</Card>

// Interactive Card (selectable)
<InteractiveCard
  selected={isSelected}
  onPress={handleSelect}
>
  <ExercisePreview exercise={exercise} />
</InteractiveCard>

// Stat Card
<StatCard
  label="Today's Breaks"
  value={8}
  trend="+2 from yesterday"
  icon={<BreakIcon />}
/>
```

### 4. Input Components

```typescript
// components/core/Input.tsx

/**
 * Input Component Family
 * Text, Select, Slider, Toggle, Checkbox
 */

// Text Input
<TextInput
  label="Custom Duration"
  value={duration}
  onChangeText={setDuration}
  placeholder="25"
  keyboardType="number-pad"
  suffix="minutes"
  error={error}
  helperText="Between 1-120 minutes"
/>

// Select/Dropdown
<Select
  label="Break Type"
  value={selectedType}
  onChange={setSelectedType}
  options={[
    { value: 'eye', label: 'Eye Care' },
    { value: 'stretch', label: 'Desk Stretch' },
    { value: 'movement', label: 'Movement' },
  ]}
/>

// Slider
<Slider
  label="Work Duration"
  value={workMinutes}
  onValueChange={setWorkMinutes}
  minimumValue={5}
  maximumValue={120}
  step={5}
  formatValue={(v) => `${v} min`}
/>

// Toggle
<Toggle
  label="Sound Notifications"
  value={soundEnabled}
  onValueChange={setSoundEnabled}
/>

// Option Card (Radio Group)
<OptionCardGroup
  value={selectedOption}
  onChange={setSelectedOption}
>
  <OptionCard
    value="gentle"
    title="Gentle"
    description="Soft reminders that don't interrupt"
    icon={<GentleIcon />}
  />
  <OptionCard
    value="balanced"
    title="Balanced"
    description="Regular reminders with flexibility"
    icon={<BalancedIcon />}
  />
</OptionCardGroup>
```

### 5. Feedback Components

```typescript
// components/core/Feedback.tsx

/**
 * Feedback Components
 * Toast, Modal, Alert, Progress
 */

// Toast
<Toast
  type="success" | "error" | "info" | "warning"
  message="Break completed! +10 XP"
  duration={3000}
  action={{ label: "Undo", onPress: handleUndo }}
/>

// Modal
<Modal
  visible={isVisible}
  onClose={handleClose}
  size="small" | "medium" | "large" | "fullscreen"
>
  <ModalHeader title="Great Job!" />
  <ModalContent>
    {/* Celebration content */}
  </ModalContent>
  <ModalFooter>
    <PrimaryButton title="Continue" onPress={handleContinue} />
  </ModalFooter>
</Modal>

// Alert Dialog
<AlertDialog
  visible={showAlert}
  title="End Break Early?"
  message="You'll miss out on the full benefits."
  actions={[
    { label: "Cancel", onPress: handleCancel },
    { label: "End", onPress: handleEnd, destructive: true },
  ]}
/>

// Progress Bar
<ProgressBar
  progress={0.65}
  variant="linear" | "circular"
  color="primary" | "accent"
  animated={true}
  showLabel={true}
/>

// Skeleton Loader
<SkeletonLoader
  variant="text" | "circular" | "rectangular"
  width={100}
  height={20}
/>
```

---

## Timer Components

### 1. Timer Display

```typescript
// components/timer/TimerDisplay.tsx

/**
 * Main Timer Display Component
 * Shows countdown, progress ring, current state
 */

interface TimerDisplayProps {
  mode: 'work' | 'break' | 'idle';
  totalSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  currentExercise?: Exercise;
}

// States:
// - IDLE: "Ready to start"
// - WORKING: Countdown with progress ring
// - BREAK: Exercise preview, countdown
// - PAUSED: Dimmed, "Paused" overlay

<TimerDisplay
  mode="work"
  totalSeconds={1500}
  remainingSeconds={847}
  isPaused={false}
/>

// Visual Structure:
┌─────────────────────────────────────┐
│                                     │
│         ┌──────────────┐            │
│         │              │            │
│         │   14:07      │  ← Countdown
│         │   ────────   │            │
│         │   [████░░░]  │  ← Progress ring
│         │              │            │
│         └──────────────┘            │
│                                     │
│         Working on...               │
│         "Deep focus session"        │
│                                     │
│    [⏸️ Pause]    [⏭️ Skip]          │
│                                     │
└─────────────────────────────────────┘
```

### 2. Timer Controls

```typescript
// components/timer/TimerControls.tsx

/**
 * Timer Control Buttons
 * Start, Pause, Resume, Stop, Skip
 */

interface TimerControlsProps {
  state: 'idle' | 'running' | 'paused' | 'break';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkip?: () => void;
  onExtend?: (minutes: number) => void;
}

// Idle State:
[▶ Start Session]

// Running State:
[⏸ Pause]  [⏹ Stop]

// Paused State:
[▶ Resume]  [⏹ End Session]

// Break State:
[⏭ Skip Break]  [+5 min]
```

### 3. Timer Presets

```typescript
// components/timer/TimerPresets.tsx

/**
 * Preset Selection Cards
 * Quick selection of timer configurations
 */

interface PresetCardProps {
  name: string;
  workMinutes: number;
  breakMinutes: number;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

<PresetGrid>
  <PresetCard
    name="Micro"
    workMinutes={15}
    breakMinutes={3}
    description="Quick bursts of focus"
    icon={<ZapIcon />}
    selected={preset === 'micro'}
    onSelect={() => setPreset('micro')}
  />
  <PresetCard
    name="Pomodoro"
    workMinutes={25}
    breakMinutes={5}
    description="Classic productivity"
    icon={<TomatoIcon />}
    selected={preset === 'pomodoro'}
    onSelect={() => setPreset('pomodoro')}
  />
  <PresetCard
    name="Deep Work"
    workMinutes={50}
    breakMinutes={10}
    description="Extended focus"
    icon={<BrainIcon />}
    selected={preset === 'deep'}
    onSelect={() => setPreset('deep')}
  />
  <PresetCard
    name="Custom"
    workMinutes={customWork}
    breakMinutes={customBreak}
    description="Your settings"
    icon={<SliderIcon />}
    selected={preset === 'custom'}
    onSelect={() => setPreset('custom')}
  />
</PresetGrid>
```

### 4. Session Summary

```typescript
// components/timer/SessionSummary.tsx

/**
 * Post-session summary card
 * Shows stats, streak, celebration
 */

<SessionSummary
  duration={25}
  breakType="stretch"
  exercisesCompleted={3}
  streak={7}
  xpEarned={25}
>
  <CelebrationAnimation type="confetti" />

  <StatRow>
    <Stat label="Focus Time" value="25 min" />
    <Stat label="Break" value="5 min" />
    <Stat label="Exercises" value="3" />
  </StatRow>

  <StreakBadge streak={7} />

  <XPGain amount={25} />

  <ActionRow>
    <SecondaryButton title="View Details" />
    <PrimaryButton title="Start Another" />
  </ActionRow>
</SessionSummary>
```

---

## Exercise Components

### 1. Exercise Card

```typescript
// components/exercises/ExerciseCard.tsx

/**
 * Exercise Preview Card
 * Shows in library, break screens
 */

interface ExerciseCardProps {
  exercise: Exercise;
  variant: 'compact' | 'detailed' | 'active';
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  progress?: number; // For active state
}

// Compact (Library list)
┌─────────────────────────────────────┐
│ [Icon] Neck Rolls          ❤️  >   │
│        30 sec • Neck & Shoulders    │
└─────────────────────────────────────┘

// Detailed (Selection)
┌─────────────────────────────────────┐
│         [Animation Preview]         │
│                                     │
│   Neck Rolls                        │
│   30 seconds                        │
│                                     │
│   Gently roll your head in a        │
│   circular motion to release        │
│   tension in your neck muscles.     │
│                                     │
│   Target: Neck & Shoulders          │
│   Difficulty: Easy                  │
│                                     │
│   [Start Exercise]                  │
└─────────────────────────────────────┘

// Active (During break)
┌─────────────────────────────────────┐
│                                     │
│     [Large Animation/Video]         │
│                                     │
│          Neck Rolls                 │
│           0:18 / 0:30               │
│          ═══════════░░░             │
│                                     │
│     "Roll your head slowly to       │
│      the right..."                  │
│                                     │
│  [⏸ Pause]  [⏭ Skip]  [🔇 Mute]    │
│                                     │
└─────────────────────────────────────┘
```

### 2. Exercise Library

```typescript
// components/exercises/ExerciseLibrary.tsx

/**
 * Filterable, searchable exercise list
 */

interface ExerciseLibraryProps {
  exercises: Exercise[];
  selectedCategory?: ExerciseCategory;
  onSelectExercise: (exercise: Exercise) => void;
}

<ExerciseLibrary>
  <SearchBar
    placeholder="Search exercises..."
    value={searchQuery}
    onChangeText={setSearchQuery}
  />

  <CategoryTabs
    categories={['All', 'Eyes', 'Neck', 'Back', 'Wrists', 'Breathing']}
    selected={selectedCategory}
    onSelect={setSelectedCategory}
  />

  <FilterChips>
    <Chip label="Quick (<1 min)" selected={quickFilter} />
    <Chip label="Favorites" selected={favoritesFilter} />
    <Chip label="Standing" selected={standingFilter} />
  </FilterChips>

  <ExerciseList
    exercises={filteredExercises}
    onSelect={handleSelectExercise}
    renderItem={(exercise) => (
      <ExerciseCard
        exercise={exercise}
        variant="compact"
      />
    )}
  />
</ExerciseLibrary>
```

### 3. Exercise Animation

```typescript
// components/exercises/ExerciseAnimation.tsx

/**
 * Animated exercise demonstration
 * Lottie or video-based
 */

interface ExerciseAnimationProps {
  exercise: Exercise;
  isPlaying: boolean;
  showInstructions: boolean;
  size: 'small' | 'medium' | 'large';
}

// Implementation options:
// 1. Lottie animations (lightweight, scalable)
// 2. Video clips (realistic demonstrations)
// 3. Illustrated step sequences (simple, clear)

<ExerciseAnimation
  exercise={neckRolls}
  isPlaying={true}
  showInstructions={true}
  size="large"
/>

// Sub-components:
<AnimationPlayer />      // Lottie/Video player
<InstructionOverlay />   // Step-by-step text
<ProgressIndicator />    // Current step indicator
<RepCounter />           // "Rep 3 of 5"
```

### 4. Exercise Queue

```typescript
// components/exercises/ExerciseQueue.tsx

/**
 * Break session exercise sequence
 */

<ExerciseQueue
  exercises={breakExercises}
  currentIndex={currentExerciseIndex}
  onComplete={handleExerciseComplete}
  onSkip={handleSkip}
>
  <QueueProgress
    total={breakExercises.length}
    current={currentExerciseIndex + 1}
  />

  <ExerciseCard
    exercise={breakExercises[currentExerciseIndex]}
    variant="active"
  />

  <UpNext
    exercise={breakExercises[currentExerciseIndex + 1]}
  />
</ExerciseQueue>
```

---

## Progress Components

### 1. Daily Summary

```typescript
// components/progress/DailySummary.tsx

/**
 * Today's progress overview
 */

<DailySummary date={today}>
  <ProgressRing
    value={completedBreaks}
    target={dailyGoal}
    label="Breaks"
  />

  <StatGrid>
    <StatCard
      icon={<ClockIcon />}
      label="Focus Time"
      value="3h 25m"
      comparison="+45m vs avg"
    />
    <StatCard
      icon={<EyeIcon />}
      label="Eye Breaks"
      value="12"
    />
    <StatCard
      icon={<StretchIcon />}
      label="Stretches"
      value="8"
    />
    <StatCard
      icon={<FlameIcon />}
      label="Streak"
      value="7 days"
    />
  </StatGrid>

  <TimelineView
    events={todayEvents}
  />
</DailySummary>
```

### 2. Weekly Chart

```typescript
// components/progress/WeeklyChart.tsx

/**
 * 7-day activity visualization
 */

<WeeklyChart
  data={weeklyData}
  metric="breaks" | "focusTime" | "exercises"
>
  <ChartHeader>
    <Title>This Week</Title>
    <MetricSelector
      options={['Breaks', 'Focus Time', 'Exercises']}
      selected={selectedMetric}
      onSelect={setSelectedMetric}
    />
  </ChartHeader>

  <BarChart
    data={weeklyData}
    highlightToday={true}
    showAverage={true}
    onBarPress={handleDaySelect}
  />

  <WeekSummary
    total={weeklyTotal}
    average={weeklyAverage}
    trend={weekOverWeekChange}
  />
</WeeklyChart>
```

### 3. Streak Display

```typescript
// components/progress/StreakDisplay.tsx

/**
 * Streak visualization and celebration
 */

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  streakHistory: boolean[]; // Last 30 days
  freezesAvailable?: number; // Premium feature
}

<StreakDisplay
  currentStreak={7}
  longestStreak={23}
  streakHistory={last30Days}
>
  <StreakFlame streak={7} animated={true} />

  <StreakInfo>
    <StreakValue value={7} label="Day Streak" />
    <StreakBest value={23} label="Best Streak" />
  </StreakInfo>

  <StreakCalendar
    history={last30Days}
    today={todayIndex}
  />

  {isPremium && (
    <StreakFreeze
      available={2}
      onUse={handleUseFreeze}
    />
  )}
</StreakDisplay>
```

### 4. Achievement Card

```typescript
// components/progress/AchievementCard.tsx

/**
 * Achievement/Badge display
 */

interface AchievementCardProps {
  achievement: Achievement;
  progress: number; // 0-1 for in-progress
  unlocked: boolean;
  unlockedAt?: Date;
}

// Locked state
┌─────────────────────────────────────┐
│     [🔒 Dimmed Icon]                │
│                                     │
│     Early Bird                      │
│     Take a break before 8 AM        │
│                                     │
│     [░░░░░░░░░░] 0/1                │
└─────────────────────────────────────┘

// Unlocked state
┌─────────────────────────────────────┐
│     [🌅 Glowing Icon]               │
│                                     │
│     Early Bird                      │
│     Unlocked Dec 5, 2025            │
│                                     │
│     +50 XP                          │
└─────────────────────────────────────┘
```

---

## Onboarding Components

### 1. Onboarding Layout

```typescript
// components/onboarding/OnboardingLayout.tsx

/**
 * Base layout for all onboarding screens
 * Provides consistent structure and animations
 */

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  onBack?: () => void;
  backgroundVariant?: 'default' | 'gradient' | 'illustration';
}

<OnboardingLayout
  currentStep={5}
  totalSteps={21}
  canGoBack={true}
  onBack={handleBack}
>
  {/* Progress Bar - animated */}
  <ProgressBar progress={5/21} />

  {/* Back Button (conditional) */}
  {canGoBack && <BackButton onPress={onBack} />}

  {/* Content Area - scroll enabled */}
  <ScrollView>
    {children}
  </ScrollView>

  {/* Safe Area for bottom content */}
  <SafeAreaBottom />
</OnboardingLayout>
```

### 2. Option Card (Enhanced)

```typescript
// components/onboarding/OptionCard.tsx

/**
 * Selectable option for onboarding questions
 */

interface OptionCardProps {
  title: string;
  description?: string;
  icon?: string | React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  variant?: 'single' | 'multi'; // Radio vs Checkbox
  disabled?: boolean;
}

// Visual States:
// Default: Dark card, white border, white text
// Selected: Teal border, checkmark visible, scale animation
// Disabled: 50% opacity, no interaction

<OptionCard
  title="Developer"
  description="Software, web, or mobile development"
  icon="💻"
  selected={role === 'developer'}
  onSelect={() => setRole('developer')}
/>
```

### 3. Pain Area Selector

```typescript
// components/onboarding/PainAreaSelector.tsx

/**
 * Interactive body diagram for pain selection
 */

interface PainAreaSelectorProps {
  selectedAreas: PainArea[];
  onToggle: (area: PainArea) => void;
}

// Visual: Simplified human figure with tappable areas
// Areas: eyes, head, neck, shoulders, upperBack, lowerBack, wrists, hands

<PainAreaSelector
  selectedAreas={['neck', 'shoulders']}
  onToggle={handleToggle}
>
  <BodyDiagram>
    <PainPoint area="eyes" position={{top: 15, left: 50}} />
    <PainPoint area="head" position={{top: 10, left: 50}} />
    <PainPoint area="neck" position={{top: 25, left: 50}} />
    <PainPoint area="shoulders" position={{top: 30, left: 50}} />
    {/* ... more areas */}
  </BodyDiagram>

  <SelectedList areas={selectedAreas} />
</PainAreaSelector>
```

### 4. Value Display

```typescript
// components/onboarding/ValueDisplay.tsx

/**
 * Personalized value/benefit presentation
 */

<ValueDisplay profile={userProfile}>
  <PersonalizedGreeting name={userName} />

  <RecommendationCard
    title="Your Personalized Plan"
    items={[
      `Focus on ${topPainArea} relief`,
      `${recommendedPreset.name} timer (${recommendedPreset.work}/${recommendedPreset.break})`,
      `${breakStyle} break activities`,
    ]}
  />

  <ProjectedBenefits>
    <Benefit
      icon={<EyeIcon />}
      title="Eye Strain"
      value="-40%"
      description="Reduced eye fatigue"
    />
    <Benefit
      icon={<NeckIcon />}
      title="Neck Pain"
      value="-35%"
      description="Less tension"
    />
  </ProjectedBenefits>
</ValueDisplay>
```

---

## Layout Components

### 1. Screen Container

```typescript
// components/layout/ScreenContainer.tsx

/**
 * Base container for all screens
 */

interface ScreenContainerProps {
  children: React.ReactNode;
  safeArea?: boolean | { top?: boolean; bottom?: boolean };
  backgroundColor?: string;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
}

<ScreenContainer
  safeArea={{ top: true, bottom: true }}
  scrollable={true}
  keyboardAvoiding={true}
>
  {children}
</ScreenContainer>
```

### 2. Header

```typescript
// components/layout/Header.tsx

/**
 * Screen header with navigation
 */

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'transparent' | 'large';
}

<Header
  title="Settings"
  showBack={true}
  rightAction={<IconButton icon={<InfoIcon />} />}
  variant="default"
/>
```

### 3. Tab Bar

```typescript
// components/layout/TabBar.tsx

/**
 * Custom bottom tab navigation
 */

<TabBar>
  <TabItem
    icon={<HomeIcon />}
    label="Home"
    active={activeTab === 'home'}
    onPress={() => setActiveTab('home')}
  />
  <TabItem
    icon={<TimerIcon />}
    label="Timer"
    active={activeTab === 'timer'}
    onPress={() => setActiveTab('timer')}
  />
  <TabItem
    icon={<ExerciseIcon />}
    label="Exercises"
    active={activeTab === 'exercises'}
    onPress={() => setActiveTab('exercises')}
  />
  <TabItem
    icon={<ChartIcon />}
    label="Progress"
    active={activeTab === 'progress'}
    onPress={() => setActiveTab('progress')}
  />
  <TabItem
    icon={<SettingsIcon />}
    label="Settings"
    active={activeTab === 'settings'}
    onPress={() => setActiveTab('settings')}
  />
</TabBar>
```

### 4. Bottom Sheet

```typescript
// components/layout/BottomSheet.tsx

/**
 * Modal bottom sheet component
 */

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
}

<BottomSheet
  visible={showExerciseDetail}
  onClose={() => setShowExerciseDetail(false)}
  snapPoints={['50%', '90%']}
>
  <ExerciseDetail exercise={selectedExercise} />
</BottomSheet>
```

---

## Notification Components

### 1. Break Reminder

```typescript
// components/notifications/BreakReminder.tsx

/**
 * Break reminder notification (in-app banner)
 */

<BreakReminder
  visible={showReminder}
  breakType="eye"
  timeUntilBreak={0}
  onStartBreak={handleStartBreak}
  onSnooze={handleSnooze}
  onDismiss={handleDismiss}
>
  <ReminderContent>
    <Icon type="eye" />
    <Text>Time for an eye break!</Text>
    <Text variant="caption">Rest your eyes for 20 seconds</Text>
  </ReminderContent>

  <ReminderActions>
    <GhostButton title="5 min" onPress={() => handleSnooze(5)} />
    <PrimaryButton title="Start" onPress={handleStartBreak} />
  </ReminderActions>
</BreakReminder>
```

### 2. Achievement Popup

```typescript
// components/notifications/AchievementPopup.tsx

/**
 * Celebration popup for achievements
 */

<AchievementPopup
  achievement={unlockedAchievement}
  visible={showAchievement}
  onClose={() => setShowAchievement(false)}
>
  <ConfettiAnimation />

  <AchievementIcon icon={achievement.icon} glowing />

  <AchievementInfo>
    <Title>{achievement.title}</Title>
    <Description>{achievement.description}</Description>
    <XPBadge amount={achievement.xp} />
  </AchievementInfo>

  <PrimaryButton title="Awesome!" onPress={handleClose} />
</AchievementPopup>
```

---

## Component Best Practices

### 1. Animation Guidelines

```typescript
// Animation Constants
const ANIMATION = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    default: Easing.bezier(0.25, 0.1, 0.25, 1),
    spring: { damping: 15, stiffness: 150 },
  },
};

// Standard Press Animation
const usePressAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.97, ANIMATION.easing.spring);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, ANIMATION.easing.spring);
  };

  return { animatedStyle, onPressIn, onPressOut };
};
```

### 2. Accessibility Requirements

```typescript
// Every interactive component must have:
// - accessibilityLabel
// - accessibilityRole
// - accessibilityHint (if not obvious)
// - accessibilityState (for toggles, selections)

<PrimaryButton
  title="Start Break"
  onPress={handleStart}
  accessibilityLabel="Start break timer"
  accessibilityRole="button"
  accessibilityHint="Begins a 5 minute break session"
/>

<OptionCard
  title="Eyes"
  selected={isSelected}
  accessibilityLabel={`Eyes pain area, ${isSelected ? 'selected' : 'not selected'}`}
  accessibilityRole="checkbox"
  accessibilityState={{ checked: isSelected }}
/>
```

### 3. Performance Patterns

```typescript
// 1. Memoize expensive components
const ExerciseCard = React.memo(({ exercise, ...props }) => {
  // ...
});

// 2. Use callback refs for lists
const renderExercise = useCallback(({ item }) => (
  <ExerciseCard exercise={item} />
), []);

// 3. Optimize re-renders with selectors
const breaks = useBreakStore(state => state.todayBreaks);

// 4. Use FlashList for long lists
<FlashList
  data={exercises}
  renderItem={renderExercise}
  estimatedItemSize={80}
/>
```

---

**Document Version:** 1.0
**Created:** December 8, 2025
**Total Components:** 50+ unique components
**Design Philosophy:** Modular, accessible, performant
