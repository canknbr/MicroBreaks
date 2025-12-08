# 🧩 COMPONENT BREAKDOWN
## ADHD Supporter App - Premium Component Architecture

> Zen Master Level Component Design with ADHD-First Approach

---

## 📚 İÇİNDEKİLER

1. [Design System & Tokens](#1-design-system--tokens)
2. [Atomic Components](#2-atomic-components)
3. [Molecular Components](#3-molecular-components)
4. [Organism Components](#4-organism-components)
5. [Screen Templates](#5-screen-templates)
6. [Animation Library](#6-animation-library)
7. [Accessibility Guidelines](#7-accessibility-guidelines)

---

## 1. DESIGN SYSTEM & TOKENS

### 1.1 Color Palette

```typescript
// theme/colors.ts
export const colors = {
  // Primary - Calming Blue (Focus & Trust)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary - Warm Orange (Energy & Motivation)
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Main
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },

  // Success - Fresh Green (Achievement)
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Warning - Soft Yellow
  warning: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFEB3B', // Main
    600: '#FDD835',
    700: '#FBC02D',
    800: '#F9A825',
    900: '#F57F17',
  },

  // Error - Gentle Red (Non-alarming)
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main - Softened
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Neutral - Warm Grays
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    dark: '#0F172A',
  },

  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
    disabled: '#CBD5E1',
  },

  // ADHD-Specific Mood Colors
  mood: {
    energized: '#FF6B6B',
    focused: '#4ECDC4',
    calm: '#95E1D3',
    tired: '#DDA0DD',
    anxious: '#F7DC6F',
    overwhelmed: '#BB8FCE',
  },

  // Focus Mode Gradients
  focus: {
    deep: ['#667eea', '#764ba2'],
    flow: ['#f093fb', '#f5576c'],
    calm: ['#4facfe', '#00f2fe'],
    night: ['#0c0c0c', '#1a1a2e'],
  },
} as const;
```

### 1.2 Typography

```typescript
// theme/typography.ts
export const typography = {
  // Font Families - ADHD Friendly (Clean, Sans-serif)
  fontFamily: {
    primary: 'Inter',
    secondary: 'SF Pro Display',
    mono: 'JetBrains Mono',
  },

  // Font Sizes - Larger for readability
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights - Generous for ADHD
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },

  // Pre-defined Text Styles
  textStyles: {
    // Headlines
    h1: {
      fontSize: 36,
      fontWeight: '700',
      lineHeight: 1.25,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 1.35,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.4,
      letterSpacing: 0,
    },

    // Body
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0,
    },

    // Labels
    labelLarge: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.5,
    },
    labelMedium: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 1.4,
      letterSpacing: 0.5,
    },

    // Caption
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.4,
      letterSpacing: 0.25,
    },
  },
} as const;
```

### 1.3 Spacing & Layout

```typescript
// theme/spacing.ts
export const spacing = {
  // Base unit: 4px
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,

  // Semantic spacing
  screen: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  card: {
    padding: 16,
    gap: 12,
  },

  section: {
    gap: 24,
    marginBottom: 32,
  },

  // Touch targets - ADHD friendly (larger)
  touchTarget: {
    minimum: 44,
    comfortable: 48,
    large: 56,
  },
} as const;

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// Shadows - Soft, non-distracting
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
```

### 1.4 Animation Tokens

```typescript
// theme/animations.ts
export const animations = {
  // Durations - Slightly slower for ADHD (less jarring)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
    slowest: 1000,
  },

  // Easing curves
  easing: {
    // Standard easings
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],

    // Custom ADHD-friendly (smooth, gentle)
    gentle: [0.25, 0.1, 0.25, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    spring: [0.175, 0.885, 0.32, 1.275],
  },

  // Spring configs for Reanimated
  spring: {
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1,
    },
    bouncy: {
      damping: 12,
      stiffness: 180,
      mass: 1,
    },
    snappy: {
      damping: 15,
      stiffness: 400,
      mass: 0.8,
    },
    slow: {
      damping: 25,
      stiffness: 60,
      mass: 1.2,
    },
  },
} as const;
```

---

## 2. ATOMIC COMPONENTS

### 2.1 Button

```typescript
// components/atoms/Button/Button.tsx

interface ButtonProps {
  // Content
  label: string;
  icon?: IconName;
  iconPosition?: 'left' | 'right';

  // Variants
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';

  // States
  disabled?: boolean;
  loading?: boolean;

  // Behavior
  onPress: () => void;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'none';

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;

  // Style
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Size configurations
const sizeConfig = {
  sm: { height: 36, paddingHorizontal: 12, fontSize: 14, iconSize: 16 },
  md: { height: 44, paddingHorizontal: 16, fontSize: 16, iconSize: 20 },
  lg: { height: 52, paddingHorizontal: 20, fontSize: 18, iconSize: 24 },
  xl: { height: 60, paddingHorizontal: 24, fontSize: 20, iconSize: 28 },
};

// Variant configurations
const variantConfig = {
  primary: {
    backgroundColor: colors.primary[500],
    textColor: colors.text.inverse,
    borderColor: 'transparent',
    pressedBg: colors.primary[600],
  },
  secondary: {
    backgroundColor: colors.primary[50],
    textColor: colors.primary[600],
    borderColor: colors.primary[200],
    pressedBg: colors.primary[100],
  },
  tertiary: {
    backgroundColor: 'transparent',
    textColor: colors.primary[600],
    borderColor: 'transparent',
    pressedBg: colors.primary[50],
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: colors.text.secondary,
    borderColor: 'transparent',
    pressedBg: colors.neutral[100],
  },
  danger: {
    backgroundColor: colors.error[500],
    textColor: colors.text.inverse,
    borderColor: 'transparent',
    pressedBg: colors.error[600],
  },
};
```

**Button Animasyonları:**

```typescript
// Reanimated kullanarak
const AnimatedButton = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, animations.spring.snappy);
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animations.spring.bouncy);
    opacity.value = withTiming(1, { duration: 100 });
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={animatedStyle}>
        {/* Button content */}
      </Animated.View>
    </Pressable>
  );
};
```

### 2.2 Text Input

```typescript
// components/atoms/TextInput/TextInput.tsx

interface TextInputProps {
  // Value
  value: string;
  onChangeText: (text: string) => void;

  // Content
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;

  // Type
  type?: 'text' | 'email' | 'password' | 'number' | 'phone' | 'search';
  multiline?: boolean;
  maxLength?: number;

  // Icons
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;

  // States
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  // Validation
  isValid?: boolean;
  showValidation?: boolean;

  // Style
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'underlined';
}

// ADHD-Friendly Features:
// 1. Clear visual focus state
// 2. Character counter for multiline
// 3. Auto-clear button
// 4. Voice input option
// 5. Shake animation on error
```

**TextInput Kullanım Örnekleri:**

```typescript
// Task Title Input
<TextInput
  label="Ne yapacaksın?"
  placeholder="Örn: Raporu bitir"
  value={taskTitle}
  onChangeText={setTaskTitle}
  maxLength={100}
  rightIcon="microphone"
  onRightIconPress={startVoiceInput}
  helperText={`${taskTitle.length}/100`}
/>

// Search Input
<TextInput
  type="search"
  placeholder="Görev ara..."
  value={search}
  onChangeText={setSearch}
  leftIcon="search"
  rightIcon={search ? "close" : undefined}
  onRightIconPress={() => setSearch('')}
/>
```

### 2.3 Checkbox & Radio

```typescript
// components/atoms/Checkbox/Checkbox.tsx

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;

  // Content
  label?: string;
  description?: string;

  // Variants
  variant?: 'default' | 'card' | 'chip';
  size?: 'sm' | 'md' | 'lg';

  // States
  disabled?: boolean;
  indeterminate?: boolean;

  // Animation
  celebrateOnCheck?: boolean;
}

// ADHD-Friendly Checkbox Features:
// 1. Satisfying check animation (confetti burst)
// 2. Sound feedback option
// 3. Large touch target
// 4. Clear visual state change
```

**Checkbox Animasyonu:**

```typescript
const AnimatedCheckbox = ({ checked, celebrateOnCheck }) => {
  const scale = useSharedValue(1);
  const checkmarkProgress = useSharedValue(0);

  useEffect(() => {
    if (checked) {
      // Bounce animation
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );

      // Checkmark draw animation
      checkmarkProgress.value = withTiming(1, { duration: 300 });

      // Celebration
      if (celebrateOnCheck) {
        triggerConfetti();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      checkmarkProgress.value = withTiming(0, { duration: 200 });
    }
  }, [checked]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Svg>
        <AnimatedPath
          d="M5 12l5 5 10-10"
          strokeDasharray={30}
          strokeDashoffset={interpolate(checkmarkProgress.value, [0, 1], [30, 0])}
        />
      </Svg>
    </Animated.View>
  );
};
```

### 2.4 Icon

```typescript
// components/atoms/Icon/Icon.tsx

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;

  // Animation
  animated?: boolean;
  animationType?: 'pulse' | 'bounce' | 'spin' | 'shake';

  // Touch
  onPress?: () => void;
  hitSlop?: number;
}

// Icon Library (phosphor-react-native recommended)
type IconName =
  // Navigation
  | 'home' | 'focus' | 'calendar' | 'list' | 'user'
  // Actions
  | 'plus' | 'check' | 'close' | 'edit' | 'trash'
  // Focus
  | 'timer' | 'brain' | 'lightning' | 'pause' | 'play'
  // Mood
  | 'happy' | 'neutral' | 'sad' | 'anxious' | 'energized'
  // Tasks
  | 'flag' | 'star' | 'tag' | 'calendar-check' | 'repeat'
  // Misc
  | 'settings' | 'bell' | 'search' | 'microphone' | 'camera';
```

### 2.5 Badge

```typescript
// components/atoms/Badge/Badge.tsx

interface BadgeProps {
  // Content
  label?: string;
  count?: number;
  maxCount?: number; // Default 99

  // Variants
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';

  // Dot mode
  dot?: boolean;

  // Animation
  pulse?: boolean;

  // Position (when used as overlay)
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Usage Examples:
<Badge count={5} variant="error" /> // Shows "5"
<Badge count={150} maxCount={99} /> // Shows "99+"
<Badge dot variant="success" pulse /> // Pulsing green dot
```

### 2.6 Avatar

```typescript
// components/atoms/Avatar/Avatar.tsx

interface AvatarProps {
  // Source
  source?: ImageSourcePropType;
  uri?: string;

  // Fallback
  name?: string; // For initials
  fallbackIcon?: IconName;

  // Style
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'rounded' | 'square';

  // Status
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;

  // Border
  bordered?: boolean;
  borderColor?: string;
}

// Size mapping
const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 96,
};
```

### 2.7 Progress Indicators

```typescript
// components/atoms/Progress/CircularProgress.tsx

interface CircularProgressProps {
  // Value
  progress: number; // 0-100

  // Style
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;

  // Content
  showValue?: boolean;
  valueFormat?: 'percent' | 'fraction' | 'custom';
  customValue?: string;

  // Animation
  animated?: boolean;
  duration?: number;
}

// components/atoms/Progress/LinearProgress.tsx

interface LinearProgressProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  rounded?: boolean;
  animated?: boolean;

  // Segments (for multi-step progress)
  segments?: number;
  activeSegment?: number;
}
```

---

## 3. MOLECULAR COMPONENTS

### 3.1 Task Card

```typescript
// components/molecules/TaskCard/TaskCard.tsx

interface TaskCardProps {
  task: Task;

  // Actions
  onPress: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;

  // Display options
  showDueDate?: boolean;
  showPriority?: boolean;
  showTags?: boolean;
  showSubtasks?: boolean;
  showTimeEstimate?: boolean;

  // Interaction
  swipeEnabled?: boolean;
  dragEnabled?: boolean;

  // State
  isSelected?: boolean;
  isExpanded?: boolean;
}

// Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  dueTime?: string;
  estimatedMinutes?: number;
  tags: string[];
  subtasks: Subtask[];
  energyLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
}
```

**TaskCard Layout:**

```
┌────────────────────────────────────────────────────┐
│ ○ Raporu tamamla                          ⚡ Yüksek │
│   └─ 3/5 alt görev                                 │
│                                                    │
│   🏷️ İş  📅 Bugün 14:00  ⏱️ 45dk                   │
│                                                    │
│   [████████░░░░░░░░░░░░] %60                       │
└────────────────────────────────────────────────────┘

Swipe Left:  [🗑️ Sil]  [✏️ Düzenle]
Swipe Right: [✅ Tamamla]
```

**TaskCard Implementation:**

```typescript
const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onComplete,
  swipeEnabled = true,
}) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(CARD_HEIGHT);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        // Complete task with animation
        runOnJS(handleComplete)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // Show actions
        translateX.value = withSpring(-ACTION_WIDTH);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const handleComplete = () => {
    // Celebration animation
    opacity.value = withTiming(0.5, { duration: 200 });
    itemHeight.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onComplete)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    height: itemHeight.value,
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <Pressable onPress={onPress}>
          <Card>
            <Row>
              <Checkbox
                checked={task.completed}
                onChange={handleComplete}
                celebrateOnCheck
              />
              <Column flex={1}>
                <Text style={task.completed && styles.completedText}>
                  {task.title}
                </Text>
                {task.subtasks.length > 0 && (
                  <Text variant="caption">
                    {task.subtasks.filter(s => s.completed).length}/
                    {task.subtasks.length} alt görev
                  </Text>
                )}
              </Column>
              <PriorityBadge priority={task.priority} />
            </Row>

            <Row style={styles.metaRow}>
              {task.tags.map(tag => (
                <Tag key={tag} label={tag} size="sm" />
              ))}
              {task.dueDate && (
                <DueDate date={task.dueDate} time={task.dueTime} />
              )}
              {task.estimatedMinutes && (
                <TimeEstimate minutes={task.estimatedMinutes} />
              )}
            </Row>

            {task.subtasks.length > 0 && (
              <LinearProgress
                progress={getSubtaskProgress(task.subtasks)}
                height={4}
                rounded
              />
            )}
          </Card>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};
```

### 3.2 Focus Timer

```typescript
// components/molecules/FocusTimer/FocusTimer.tsx

interface FocusTimerProps {
  // Timer state
  duration: number; // Total seconds
  elapsed: number;  // Elapsed seconds
  isRunning: boolean;
  isPaused: boolean;

  // Session info
  sessionType: 'focus' | 'short_break' | 'long_break';
  currentSession: number;
  totalSessions: number;

  // Actions
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkip: () => void;

  // Options
  showControls?: boolean;
  showSessionIndicator?: boolean;
  size?: 'sm' | 'md' | 'lg';

  // Customization
  focusColor?: string;
  breakColor?: string;
}
```

**FocusTimer Visual:**

```
         ╭─────────────────────╮
        ╱                       ╲
       │                         │
       │        23:45            │
       │     ────────────        │
       │     Odaklanıyor         │
       │                         │
        ╲                       ╱
         ╰─────────────────────╯
              ● ● ○ ○
           Oturum 2/4

      [⏸️ Duraklat]  [⏹️ Bitir]
```

**FocusTimer Implementation:**

```typescript
const FocusTimer: React.FC<FocusTimerProps> = ({
  duration,
  elapsed,
  isRunning,
  sessionType,
  currentSession,
  totalSessions,
  onPause,
  onResume,
  onStop,
}) => {
  const progress = elapsed / duration;
  const remaining = duration - elapsed;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Animated progress ring
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    progressAnimation.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [progress]);

  // Pulse animation when running
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1, // Infinite
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRunning]);

  const getSessionColor = () => {
    switch (sessionType) {
      case 'focus': return colors.primary[500];
      case 'short_break': return colors.success[500];
      case 'long_break': return colors.secondary[500];
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.neutral[200]}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={getSessionColor()}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={interpolate(
            progressAnimation.value,
            [0, 1],
            [CIRCUMFERENCE, 0]
          )}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      <View style={styles.centerContent}>
        <Text style={styles.timeText}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>
        <Text style={styles.statusText}>
          {sessionType === 'focus' ? 'Odaklanıyor' : 'Mola'}
        </Text>
      </View>

      {/* Session indicators */}
      <View style={styles.sessionIndicators}>
        {Array.from({ length: totalSessions }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.sessionDot,
              i < currentSession && styles.sessionDotCompleted,
              i === currentSession - 1 && styles.sessionDotActive,
            ]}
          />
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Button
          icon={isRunning ? 'pause' : 'play'}
          variant="primary"
          size="lg"
          onPress={isRunning ? onPause : onResume}
        />
        <Button
          icon="stop"
          variant="ghost"
          size="md"
          onPress={onStop}
        />
      </View>
    </Animated.View>
  );
};
```

### 3.3 Mood Selector

```typescript
// components/molecules/MoodSelector/MoodSelector.tsx

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onSelect: (mood: MoodType) => void;

  // Display
  variant?: 'emoji' | 'slider' | 'wheel';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;

  // Options
  moods?: MoodType[];
  allowCustom?: boolean;
}

type MoodType =
  | 'energized'   // 🚀 Enerjik
  | 'focused'     // 🎯 Odaklanmış
  | 'calm'        // 😌 Sakin
  | 'neutral'     // 😐 Normal
  | 'tired'       // 😴 Yorgun
  | 'anxious'     // 😰 Kaygılı
  | 'overwhelmed' // 🤯 Bunalmış
  | 'frustrated'; // 😤 Sinirli

// Mood configurations
const moodConfig: Record<MoodType, MoodConfig> = {
  energized: {
    emoji: '🚀',
    label: 'Enerjik',
    color: colors.mood.energized,
    suggestedActions: ['challenging_task', 'exercise', 'creative_work'],
  },
  focused: {
    emoji: '🎯',
    label: 'Odaklanmış',
    color: colors.mood.focused,
    suggestedActions: ['deep_work', 'important_task', 'learning'],
  },
  calm: {
    emoji: '😌',
    label: 'Sakin',
    color: colors.mood.calm,
    suggestedActions: ['planning', 'organizing', 'routine_tasks'],
  },
  // ... diğer mood'lar
};
```

**MoodSelector Wheel Variant:**

```typescript
const MoodWheel: React.FC<MoodSelectorProps> = ({ selectedMood, onSelect }) => {
  const rotation = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      rotation.value += e.velocityX * 0.001;
    })
    .onEnd(() => {
      // Snap to nearest mood
      const snappedRotation = Math.round(rotation.value / SEGMENT_ANGLE) * SEGMENT_ANGLE;
      rotation.value = withSpring(snappedRotation);
      runOnJS(setActiveIndex)(Math.abs(snappedRotation / SEGMENT_ANGLE) % moods.length);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={{ transform: [{ rotate: `${rotation.value}deg` }] }}>
        {moods.map((mood, index) => (
          <MoodWheelSegment
            key={mood}
            mood={mood}
            index={index}
            isActive={index === activeIndex}
            onPress={() => onSelect(mood)}
          />
        ))}
      </Animated.View>
    </GestureDetector>
  );
};
```

### 3.4 Quick Action Button (FAB)

```typescript
// components/molecules/QuickActionButton/QuickActionButton.tsx

interface QuickActionButtonProps {
  // Main action
  mainIcon: IconName;
  onMainPress: () => void;

  // Sub actions (expandable)
  actions?: QuickAction[];

  // Position
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';

  // State
  expanded?: boolean;

  // Style
  size?: 'md' | 'lg';
  color?: string;
}

interface QuickAction {
  icon: IconName;
  label: string;
  color?: string;
  onPress: () => void;
}

// Default actions for ADHD app
const defaultActions: QuickAction[] = [
  { icon: 'plus', label: 'Yeni Görev', onPress: () => {} },
  { icon: 'timer', label: 'Odaklan', onPress: () => {} },
  { icon: 'brain', label: 'Beyin Dökümü', onPress: () => {} },
  { icon: 'lightning', label: 'Hızlı Not', onPress: () => {} },
];
```

**FAB Expansion Animation:**

```typescript
const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  actions = defaultActions,
  expanded,
  onMainPress,
}) => {
  const isExpanded = useSharedValue(false);
  const rotation = useSharedValue(0);

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
    rotation.value = withSpring(isExpanded.value ? 45 : 0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      {/* Sub actions */}
      {actions.map((action, index) => {
        const translateY = useAnimatedStyle(() => ({
          transform: [
            {
              translateY: withSpring(
                isExpanded.value ? -(index + 1) * 60 : 0,
                animations.spring.bouncy
              ),
            },
            {
              scale: withSpring(isExpanded.value ? 1 : 0),
            },
          ],
          opacity: withTiming(isExpanded.value ? 1 : 0),
        }));

        return (
          <Animated.View key={action.label} style={translateY}>
            <Pressable
              style={[styles.subAction, { backgroundColor: action.color }]}
              onPress={action.onPress}
            >
              <Icon name={action.icon} color="white" size={20} />
            </Pressable>
            {isExpanded.value && (
              <Text style={styles.actionLabel}>{action.label}</Text>
            )}
          </Animated.View>
        );
      })}

      {/* Main button */}
      <Animated.View style={{ transform: [{ rotate: `${rotation.value}deg` }] }}>
        <Pressable style={styles.mainButton} onPress={toggleExpand}>
          <Icon name="plus" color="white" size={28} />
        </Pressable>
      </Animated.View>
    </View>
  );
};
```

### 3.5 Streak Counter

```typescript
// components/molecules/StreakCounter/StreakCounter.tsx

interface StreakCounterProps {
  // Data
  currentStreak: number;
  longestStreak: number;
  streakType: 'daily_check_in' | 'tasks_completed' | 'focus_sessions';

  // Display
  showFlame?: boolean;
  showCalendar?: boolean;
  size?: 'sm' | 'md' | 'lg';

  // Animation
  celebrateOnMilestone?: boolean;
  milestones?: number[]; // Default: [7, 14, 30, 60, 90, 180, 365]
}
```

**StreakCounter Visual:**

```
    🔥
   ┌───┐
   │ 7 │ gün
   └───┘

  En uzun: 14 gün

  ○ ○ ● ● ● ● ● ● ●
  P S Ç P C C P (Bu hafta)
```

### 3.6 Energy Level Indicator

```typescript
// components/molecules/EnergyLevelIndicator/EnergyLevelIndicator.tsx

interface EnergyLevelIndicatorProps {
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

  // Display
  variant?: 'battery' | 'bar' | 'emoji' | 'gauge';
  showLabel?: boolean;
  interactive?: boolean;

  // Actions
  onLevelChange?: (level: EnergyLevel) => void;
}

// Energy-based task suggestions
const energySuggestions = {
  very_low: {
    icon: '🪫',
    label: 'Çok Düşük',
    color: colors.error[400],
    suggestions: [
      'Küçük, hızlı görevler',
      'Mola ver',
      'Yürüyüş yap',
    ],
  },
  low: {
    icon: '🔋',
    label: 'Düşük',
    color: colors.warning[500],
    suggestions: [
      'Rutin görevler',
      'E-posta kontrolü',
      'Düzenleme',
    ],
  },
  medium: {
    icon: '🔋',
    label: 'Orta',
    color: colors.success[400],
    suggestions: [
      'Standart görevler',
      'Toplantılar',
      'Planlama',
    ],
  },
  high: {
    icon: '🔋',
    label: 'Yüksek',
    color: colors.success[500],
    suggestions: [
      'Zorlu görevler',
      'Yaratıcı çalışma',
      'Öğrenme',
    ],
  },
  very_high: {
    icon: '⚡',
    label: 'Çok Yüksek',
    color: colors.primary[500],
    suggestions: [
      'En zor görevler',
      'Derin çalışma',
      'Önemli kararlar',
    ],
  },
};
```

---

## 4. ORGANISM COMPONENTS

### 4.1 Task List

```typescript
// components/organisms/TaskList/TaskList.tsx

interface TaskListProps {
  // Data
  tasks: Task[];

  // Grouping
  groupBy?: 'none' | 'date' | 'priority' | 'tag' | 'energy';
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'energyMatch';

  // Filtering
  filter?: TaskFilter;
  searchQuery?: string;

  // Display
  emptyState?: React.ReactNode;
  headerComponent?: React.ReactNode;

  // Interaction
  onTaskPress: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onReorder?: (tasks: Task[]) => void;

  // Features
  enableDrag?: boolean;
  enableSwipe?: boolean;
  enableBulkSelect?: boolean;
  showQuickAdd?: boolean;

  // Performance
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
}

interface TaskFilter {
  completed?: boolean;
  priority?: Priority[];
  tags?: string[];
  dueDate?: 'today' | 'tomorrow' | 'week' | 'overdue';
  energyLevel?: EnergyLevel[];
}
```

**TaskList with Drag & Drop:**

```typescript
const TaskList: React.FC<TaskListProps> = ({
  tasks,
  groupBy = 'none',
  onTaskComplete,
  onReorder,
  enableDrag = true,
}) => {
  const [orderedTasks, setOrderedTasks] = useState(tasks);

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') return { all: orderedTasks };

    return orderedTasks.reduce((acc, task) => {
      const key = getGroupKey(task, groupBy);
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [orderedTasks, groupBy]);

  // Drag handler
  const handleDragEnd = useCallback(({ data }: DragEndParams<Task>) => {
    setOrderedTasks(data);
    onReorder?.(data);
  }, [onReorder]);

  return (
    <DraggableFlatList
      data={orderedTasks}
      keyExtractor={(item) => item.id}
      onDragEnd={handleDragEnd}
      renderItem={({ item, drag, isActive }) => (
        <ScaleDecorator>
          <TaskCard
            task={item}
            onPress={() => {}}
            onComplete={() => onTaskComplete(item.id)}
            onLongPress={enableDrag ? drag : undefined}
            style={isActive && styles.dragging}
          />
        </ScaleDecorator>
      )}
      ListEmptyComponent={<EmptyTaskState />}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      contentContainerStyle={styles.listContent}
    />
  );
};
```

### 4.2 Daily Planner

```typescript
// components/organisms/DailyPlanner/DailyPlanner.tsx

interface DailyPlannerProps {
  date: Date;

  // Data
  tasks: Task[];
  routines: Routine[];
  events: CalendarEvent[];
  focusSessions: FocusSession[];

  // Time blocks
  timeBlocks?: TimeBlock[];

  // Display
  viewMode?: 'timeline' | 'list' | 'calendar';
  startHour?: number; // Default 6
  endHour?: number;   // Default 23

  // Actions
  onTaskMove: (taskId: string, newTime: Date) => void;
  onTimeBlockCreate: (block: TimeBlock) => void;
  onTimeBlockEdit: (block: TimeBlock) => void;
}

interface TimeBlock {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: 'focus' | 'meeting' | 'break' | 'routine' | 'buffer';
  color?: string;
  linkedTaskIds?: string[];
}
```

**DailyPlanner Timeline View:**

```
┌──────────────────────────────────────────────────────┐
│  📅 Bugün - 8 Aralık Pazar                    ⚡ Orta │
├──────────────────────────────────────────────────────┤
│                                                      │
│  06:00  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
│                                                      │
│  07:00  ┌─────────────────────┐                      │
│         │ 🌅 Sabah Rutini     │                      │
│  08:00  └─────────────────────┘                      │
│                                                      │
│  09:00  ┌─────────────────────────────────────┐      │
│         │ 🎯 Derin Çalışma                    │      │
│  10:00  │    - Raporu tamamla                 │      │
│         │    - Sunum hazırla                  │      │
│  11:00  └─────────────────────────────────────┘      │
│                                                      │
│  12:00  ┌─────────────────────┐                      │
│         │ 🍽️ Öğle Molası      │                      │
│  13:00  └─────────────────────┘                      │
│                                                      │
│  14:00  ┌───────────────────────────────┐            │
│         │ 📧 E-posta & Mesajlar         │            │
│  15:00  └───────────────────────────────┘            │
│                                                      │
│         + Zaman bloğu ekle                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 4.3 Focus Session Panel

```typescript
// components/organisms/FocusSessionPanel/FocusSessionPanel.tsx

interface FocusSessionPanelProps {
  // Session state
  session?: ActiveFocusSession;
  isActive: boolean;

  // Task context
  currentTask?: Task;

  // Configuration
  config: FocusConfig;
  onConfigChange: (config: FocusConfig) => void;

  // Actions
  onStart: (config: FocusConfig, task?: Task) => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onAbandon: () => void;

  // Body double
  bodyDoubleEnabled?: boolean;
  bodyDoublePartner?: User;
  onFindPartner: () => void;

  // Environment
  ambientSound?: AmbientSound;
  onAmbientSoundChange: (sound: AmbientSound | null) => void;
}

interface FocusConfig {
  focusDuration: number;   // Minutes (default 25)
  shortBreakDuration: number;  // Minutes (default 5)
  longBreakDuration: number;   // Minutes (default 15)
  sessionsUntilLongBreak: number; // Default 4
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

type AmbientSound =
  | 'rain'
  | 'forest'
  | 'cafe'
  | 'ocean'
  | 'fireplace'
  | 'white_noise'
  | 'brown_noise'
  | 'lofi';
```

### 4.4 Routine Builder

```typescript
// components/organisms/RoutineBuilder/RoutineBuilder.tsx

interface RoutineBuilderProps {
  // Data
  routine?: Routine;

  // Mode
  mode: 'create' | 'edit';

  // Actions
  onSave: (routine: Routine) => void;
  onCancel: () => void;
  onDelete?: () => void;

  // Templates
  showTemplates?: boolean;
}

interface Routine {
  id: string;
  name: string;
  description?: string;
  type: 'morning' | 'evening' | 'work' | 'custom';

  // Schedule
  schedule: {
    days: DayOfWeek[];
    startTime: string; // "07:00"
    reminderBefore?: number; // Minutes
  };

  // Steps
  steps: RoutineStep[];

  // Settings
  settings: {
    strictOrder: boolean;
    allowSkip: boolean;
    trackStreak: boolean;
  };

  // Stats
  stats: {
    completionRate: number;
    averageDuration: number;
    currentStreak: number;
    longestStreak: number;
  };
}

interface RoutineStep {
  id: string;
  title: string;
  duration?: number; // Minutes
  icon?: string;
  isOptional: boolean;
  skipReason?: string;
}
```

### 4.5 Brain Dump Interface

```typescript
// components/organisms/BrainDump/BrainDump.tsx

interface BrainDumpProps {
  // Mode
  mode?: 'voice' | 'text' | 'mixed';

  // Output
  onComplete: (items: BrainDumpItem[]) => void;
  onItemCreate: (item: BrainDumpItem) => void;

  // AI Features
  enableAISorting?: boolean;
  enableAITaskCreation?: boolean;

  // Session
  sessionTimeLimit?: number; // Minutes
}

interface BrainDumpItem {
  id: string;
  content: string;
  type: 'task' | 'idea' | 'note' | 'reminder' | 'unknown';
  priority?: Priority;
  suggestedDueDate?: Date;
  tags?: string[];
  createdAt: Date;
}
```

**BrainDump Interface:**

```
┌──────────────────────────────────────────────────────┐
│  🧠 Beyin Dökümü                              ⏱️ 5:00 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Aklındaki her şeyi yaz veya söyle.                 │
│  Organize etme, sadece dök!                          │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ Raporu bitirmem lazım                          │  │
│  │ Anne'yi aramayı unutma                         │  │
│  │ O toplantı ne zamandı?                         │  │
│  │ Süt almam gerek                                │  │
│  │ Yeni proje fikri: ...                          │  │
│  │ _                                              │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│         [🎤 Sesle Ekle]    [✨ AI ile Organize Et]   │
│                                                      │
├──────────────────────────────────────────────────────┤
│  📝 5 öğe eklendi                                    │
│                                                      │
│  ┌─────────────────┐ ┌─────────────────┐            │
│  │ ✓ Görevler (2)  │ │ 💡 Fikirler (1) │            │
│  └─────────────────┘ └─────────────────┘            │
│  ┌─────────────────┐ ┌─────────────────┐            │
│  │ 🔔 Hatırlatıcı  │ │ 📝 Notlar (1)   │            │
│  │    (1)          │ │                 │            │
│  └─────────────────┘ └─────────────────┘            │
│                                                      │
│              [Tamamla ve Görevlere Ekle]            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 4.6 Celebration Overlay

```typescript
// components/organisms/CelebrationOverlay/CelebrationOverlay.tsx

interface CelebrationOverlayProps {
  // Trigger
  visible: boolean;

  // Achievement
  achievement: Achievement;

  // Customization
  intensity?: 'subtle' | 'normal' | 'epic';
  duration?: number; // Auto-dismiss ms

  // Actions
  onDismiss: () => void;
  onShare?: () => void;
}

interface Achievement {
  type:
    | 'task_completed'
    | 'streak_milestone'
    | 'focus_session_completed'
    | 'routine_completed'
    | 'level_up'
    | 'badge_earned';

  title: string;
  description?: string;

  // Visuals
  emoji?: string;
  icon?: IconName;

  // Stats
  stat?: {
    label: string;
    value: number | string;
  };

  // Rewards
  xpEarned?: number;
  coinsEarned?: number;
}

// Celebration configs
const celebrationConfigs = {
  task_completed: {
    confettiCount: 30,
    haptic: 'success',
    sound: 'task_complete',
    duration: 2000,
  },
  streak_milestone: {
    confettiCount: 100,
    haptic: 'success',
    sound: 'milestone',
    duration: 4000,
    showFireworks: true,
  },
  level_up: {
    confettiCount: 150,
    haptic: 'success',
    sound: 'level_up',
    duration: 5000,
    showFireworks: true,
    fullScreen: true,
  },
};
```

---

## 5. SCREEN TEMPLATES

### 5.1 Standard Screen Template

```typescript
// components/templates/ScreenTemplate/ScreenTemplate.tsx

interface ScreenTemplateProps {
  // Header
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;

  // Navigation
  showBackButton?: boolean;
  onBack?: () => void;

  // Content
  children: React.ReactNode;

  // Scroll
  scrollable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;

  // Bottom
  bottomComponent?: React.ReactNode;
  showFAB?: boolean;
  fabActions?: QuickAction[];

  // Safe area
  edges?: Edge[];

  // Background
  backgroundColor?: string;
  backgroundGradient?: string[];
}
```

### 5.2 Tab Screen Template

```typescript
// components/templates/TabScreenTemplate/TabScreenTemplate.tsx

interface TabScreenTemplateProps extends ScreenTemplateProps {
  // Tab-specific
  showTabBar?: boolean;

  // Quick stats (shown at top of tab screens)
  quickStats?: QuickStat[];

  // Today's focus
  todayFocus?: {
    task?: Task;
    message?: string;
  };
}

interface QuickStat {
  label: string;
  value: number | string;
  icon?: IconName;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
```

### 5.3 Modal Screen Template

```typescript
// components/templates/ModalTemplate/ModalTemplate.tsx

interface ModalTemplateProps {
  // Header
  title: string;
  subtitle?: string;

  // Actions
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;

  // Content
  children: React.ReactNode;

  // Style
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  showHandle?: boolean;

  // Behavior
  dismissOnBackdrop?: boolean;
  keyboardAvoidingView?: boolean;
}
```

### 5.4 Onboarding Screen Template

```typescript
// components/templates/OnboardingTemplate/OnboardingTemplate.tsx

interface OnboardingTemplateProps {
  // Progress
  currentStep: number;
  totalSteps: number;

  // Content
  title: string;
  subtitle?: string;
  illustration?: React.ReactNode;
  children: React.ReactNode;

  // Navigation
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;

  // Buttons
  nextLabel?: string;
  showSkip?: boolean;

  // Animation
  animationDirection?: 'left' | 'right';
}
```

---

## 6. ANIMATION LIBRARY

### 6.1 Micro-interactions

```typescript
// animations/microInteractions.ts

// Button press
export const buttonPressAnimation = {
  scale: withSpring(0.96, { damping: 15, stiffness: 400 }),
  opacity: withTiming(0.9, { duration: 100 }),
};

// Checkbox check
export const checkboxAnimation = {
  scale: withSequence(
    withSpring(1.2, { damping: 8 }),
    withSpring(1, { damping: 12 })
  ),
  checkmark: withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
};

// Card hover/focus
export const cardFocusAnimation = {
  scale: withSpring(1.02, { damping: 20 }),
  elevation: withTiming(8, { duration: 200 }),
};

// Swipe actions reveal
export const swipeRevealAnimation = {
  translateX: withSpring(-80, { damping: 20, stiffness: 200 }),
  actionOpacity: withTiming(1, { duration: 200 }),
};

// Toggle switch
export const toggleAnimation = {
  translateX: withSpring(20, { damping: 15, stiffness: 300 }),
  backgroundColor: withTiming(colors.primary[500], { duration: 200 }),
};
```

### 6.2 Page Transitions

```typescript
// animations/pageTransitions.ts

// Slide from right
export const slideFromRight = {
  entering: SlideInRight.duration(300).easing(Easing.out(Easing.quad)),
  exiting: SlideOutLeft.duration(300).easing(Easing.in(Easing.quad)),
};

// Fade scale
export const fadeScale = {
  entering: FadeIn.duration(300).springify(),
  exiting: FadeOut.duration(200),
};

// Modal slide up
export const modalSlideUp = {
  entering: SlideInDown.duration(400).springify().damping(20),
  exiting: SlideOutDown.duration(300),
};

// Onboarding page transition
export const onboardingTransition = {
  entering: (direction: 'left' | 'right') =>
    direction === 'left'
      ? SlideInLeft.duration(400).springify()
      : SlideInRight.duration(400).springify(),
  exiting: (direction: 'left' | 'right') =>
    direction === 'left'
      ? SlideOutRight.duration(300)
      : SlideOutLeft.duration(300),
};
```

### 6.3 Celebration Animations

```typescript
// animations/celebrations.ts

// Confetti burst
export const triggerConfetti = (config?: ConfettiConfig) => {
  const defaultConfig = {
    count: 50,
    origin: { x: 0.5, y: 0.6 },
    colors: [
      colors.primary[500],
      colors.secondary[500],
      colors.success[500],
      colors.warning[500],
    ],
    fadeOut: true,
    gravity: 0.3,
  };

  ConfettiCannon.start({ ...defaultConfig, ...config });
};

// Star burst
export const starBurst = (x: number, y: number) => {
  // Create 5-8 stars that burst outward
  const starCount = Math.floor(Math.random() * 4) + 5;

  return Array.from({ length: starCount }).map((_, i) => {
    const angle = (i / starCount) * Math.PI * 2;
    const distance = 100 + Math.random() * 50;

    return {
      translateX: withSpring(Math.cos(angle) * distance),
      translateY: withSpring(Math.sin(angle) * distance),
      scale: withSequence(
        withSpring(1.5),
        withTiming(0, { duration: 500 })
      ),
      opacity: withTiming(0, { duration: 600 }),
    };
  });
};

// Level up animation
export const levelUpAnimation = {
  // Number counting up
  numberRoll: (from: number, to: number, duration: number) => {
    return withTiming(to, { duration, easing: Easing.out(Easing.quad) });
  },

  // Badge appearance
  badgeAppear: {
    scale: withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 12 })
    ),
    rotate: withSequence(
      withTiming('-10deg', { duration: 100 }),
      withSpring('0deg', { damping: 10 })
    ),
  },

  // XP bar fill
  xpBarFill: (progress: number) => ({
    width: withTiming(`${progress}%`, { duration: 1500, easing: Easing.out(Easing.quad) }),
  }),
};
```

### 6.4 Loading States

```typescript
// animations/loading.ts

// Skeleton shimmer
export const skeletonShimmer = {
  translateX: withRepeat(
    withTiming(300, { duration: 1000, easing: Easing.linear }),
    -1,
    false
  ),
};

// Pulse loading
export const pulseLoading = {
  opacity: withRepeat(
    withSequence(
      withTiming(0.3, { duration: 500 }),
      withTiming(1, { duration: 500 })
    ),
    -1,
    true
  ),
};

// Dots loading
export const dotsLoading = (index: number) => ({
  translateY: withRepeat(
    withSequence(
      withDelay(index * 100, withTiming(-8, { duration: 300 })),
      withTiming(0, { duration: 300 })
    ),
    -1,
    true
  ),
});

// Spinner
export const spinnerAnimation = {
  rotate: withRepeat(
    withTiming('360deg', { duration: 1000, easing: Easing.linear }),
    -1,
    false
  ),
};
```

---

## 7. ACCESSIBILITY GUIDELINES

### 7.1 ADHD-Specific Accessibility

```typescript
// accessibility/adhdAccessibility.ts

export const adhdAccessibilityGuidelines = {
  // 1. Reduced motion option
  reducedMotion: {
    // Respect system setting
    checkSystemPreference: () => AccessibilityInfo.isReduceMotionEnabled(),

    // Provide app-level toggle
    appSetting: 'accessibility.reducedMotion',

    // Fallback animations
    fallbackAnimations: {
      fadeOnly: true,
      duration: 200,
      noSpring: true,
    },
  },

  // 2. Focus indicators
  focusIndicators: {
    // High contrast focus ring
    focusRing: {
      borderWidth: 3,
      borderColor: colors.primary[500],
      borderRadius: borderRadius.md + 2,
    },

    // Skip to content
    skipToContent: true,
  },

  // 3. Time management
  timeManagement: {
    // No auto-advancing content
    noAutoAdvance: true,

    // Extended timeouts
    toastDuration: 6000, // Instead of 3000

    // Pausable timers
    pausableTimers: true,
  },

  // 4. Cognitive load reduction
  cognitiveLoad: {
    // Simple language option
    simpleLanguage: true,

    // Icon + text (not icon only)
    alwaysShowLabels: true,

    // Chunked information
    maxItemsPerView: 7,
  },

  // 5. Distraction reduction
  distractionReduction: {
    // Focus mode (hide non-essential UI)
    focusMode: true,

    // Muted colors option
    mutedColors: true,

    // No auto-play media
    noAutoPlay: true,
  },
};
```

### 7.2 Screen Reader Support

```typescript
// accessibility/screenReader.ts

export const screenReaderLabels = {
  // Task card
  taskCard: (task: Task) => ({
    accessibilityLabel: `
      ${task.completed ? 'Tamamlandı: ' : ''}
      ${task.title}.
      ${task.priority === 'high' ? 'Yüksek öncelikli.' : ''}
      ${task.dueDate ? `Son tarih: ${formatDate(task.dueDate)}.` : ''}
      ${task.subtasks.length > 0
        ? `${task.subtasks.filter(s => s.completed).length} / ${task.subtasks.length} alt görev tamamlandı.`
        : ''}
    `.trim(),
    accessibilityHint: 'Detayları görmek için çift dokunun. Tamamlamak için sola kaydırın.',
    accessibilityRole: 'button',
  }),

  // Focus timer
  focusTimer: (remaining: number, isRunning: boolean) => ({
    accessibilityLabel: `
      Odaklanma zamanlayıcısı.
      ${isRunning ? 'Çalışıyor.' : 'Duraklatıldı.'}
      ${formatTime(remaining)} kaldı.
    `.trim(),
    accessibilityHint: isRunning
      ? 'Duraklatmak için çift dokunun.'
      : 'Devam etmek için çift dokunun.',
  }),

  // Progress
  progress: (current: number, total: number, label: string) => ({
    accessibilityLabel: `${label}: ${current} / ${total}. Yüzde ${Math.round(current/total*100)}.`,
    accessibilityRole: 'progressbar',
    accessibilityValue: {
      min: 0,
      max: total,
      now: current,
    },
  }),
};
```

### 7.3 Touch Target Sizes

```typescript
// accessibility/touchTargets.ts

export const touchTargets = {
  // Minimum sizes (iOS: 44pt, Android: 48dp)
  minimum: {
    width: 44,
    height: 44,
  },

  // Comfortable (recommended for ADHD)
  comfortable: {
    width: 48,
    height: 48,
  },

  // Large (for important actions)
  large: {
    width: 56,
    height: 56,
  },

  // Helper
  ensureMinimumSize: (style: ViewStyle): ViewStyle => ({
    ...style,
    minWidth: touchTargets.minimum.width,
    minHeight: touchTargets.minimum.height,
  }),
};
```

---

## 📁 DOSYA YAPISI

```
components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   ├── Button.types.ts
│   │   └── index.ts
│   ├── TextInput/
│   ├── Checkbox/
│   ├── Radio/
│   ├── Icon/
│   ├── Badge/
│   ├── Avatar/
│   ├── Progress/
│   │   ├── CircularProgress.tsx
│   │   └── LinearProgress.tsx
│   └── Text/
│
├── molecules/
│   ├── TaskCard/
│   ├── FocusTimer/
│   ├── MoodSelector/
│   ├── QuickActionButton/
│   ├── StreakCounter/
│   ├── EnergyLevelIndicator/
│   ├── TimeBlockCard/
│   ├── RoutineStepCard/
│   └── NotificationCard/
│
├── organisms/
│   ├── TaskList/
│   ├── DailyPlanner/
│   ├── FocusSessionPanel/
│   ├── RoutineBuilder/
│   ├── BrainDump/
│   ├── CelebrationOverlay/
│   ├── StuckHelper/
│   ├── BodyDoublePanel/
│   └── SettingsPanel/
│
├── templates/
│   ├── ScreenTemplate/
│   ├── TabScreenTemplate/
│   ├── ModalTemplate/
│   └── OnboardingTemplate/
│
└── index.ts

theme/
├── colors.ts
├── typography.ts
├── spacing.ts
├── animations.ts
└── index.ts

animations/
├── microInteractions.ts
├── pageTransitions.ts
├── celebrations.ts
├── loading.ts
└── index.ts

accessibility/
├── adhdAccessibility.ts
├── screenReader.ts
├── touchTargets.ts
└── index.ts
```

---

## ✅ SONRAKI ADIMLAR

1. **Implementation Priority:**
   - Design System (colors, typography, spacing)
   - Atomic components (Button, TextInput, Checkbox)
   - Molecular components (TaskCard, FocusTimer)
   - Screen templates
   - Organism components

2. **Testing:**
   - Unit tests for each component
   - Accessibility testing
   - Visual regression testing

3. **Documentation:**
   - Storybook setup
   - Component usage examples
   - Props documentation

---

> 💡 **Not:** Bu döküman "Atomic Design" prensiplerini takip eder:
> - **Atoms:** En küçük, yeniden kullanılabilir UI birimleri
> - **Molecules:** Atom'ların birleşimi
> - **Organisms:** Molecule'lerin birleşimi (karmaşık UI bölümleri)
> - **Templates:** Sayfa düzeni şablonları
