# MicroBreaks Design System

This folder contains the complete design system for the MicroBreaks application. All design tokens are centralized here to ensure consistency across the entire application.

## 📁 Structure

```
theme/
├── colors.ts       # Color palette and semantic colors
├── typography.ts   # Font families, sizes, and text styles
├── spacing.ts      # Spacing scale, layout, and sizing
├── shadows.ts      # Shadow and elevation system
├── animations.ts   # Animation timings and transitions
├── index.ts        # Central export point
└── README.md       # This file
```

## 🎨 Design Tokens

### Colors (`colors.ts`)

Comprehensive color system supporting both light and dark modes:

- **Primary Colors**: Calm Blue (#4A90E2), Energy Green (#7ED321)
- **Secondary Colors**: Soft Purple (#9013FE), Warm Orange (#F5A623)
- **Neutral Colors**: Full grayscale palette
- **Semantic Colors**: Error, Warning, Success, Info
- **Component Colors**: Button, Input, Card, etc.

```typescript
import { Colors, ColorPalette } from '@/theme';

// Use in components
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background.primary,
  },
  text: {
    color: Colors.light.text.primary,
  },
});
```

### Typography (`typography.ts`)

Font system based on Inter font family:

- **Font Families**: Regular, Medium, SemiBold, Bold
- **Font Sizes**: Display, Headline, Title, Body, Label, Button
- **Line Heights**: Optimized for readability
- **Typography Presets**: Ready-to-use text styles

```typescript
import { Typography, FontSize } from '@/theme';

const styles = StyleSheet.create({
  headline: Typography.headlineLarge,
  body: Typography.bodyMedium,
  button: Typography.buttonMedium,
});
```

### Spacing (`spacing.ts`)

8px grid-based spacing system:

- **Base Scale**: xs (8px), sm (16px), md (24px), lg (32px), xl (40px), xxl (48px)
- **Component Spacing**: Predefined spacing for common components
- **Border Radius**: Consistent corner rounding
- **Icon Sizes**: Standard icon dimensions
- **Touch Targets**: Minimum 44px for accessibility

```typescript
import { Spacing, BorderRadius, ComponentSpacing } from '@/theme';

const styles = StyleSheet.create({
  card: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.card,
    gap: ComponentSpacing.card.gap,
  },
});
```

### Shadows (`shadows.ts`)

Elevation system for depth and hierarchy:

- **Shadow Levels**: none, xs, sm, md, lg, xl, xxl
- **Component Shadows**: Predefined shadows for common components
- **Colored Shadows**: Brand-colored shadow effects
- **Platform Support**: iOS and Android specific implementations

```typescript
import { Shadows, ComponentShadows } from '@/theme';

const styles = StyleSheet.create({
  card: {
    ...ComponentShadows.card,
  },
  modal: {
    ...Shadows.xxl,
  },
});
```

### Animations (`animations.ts`)

Timing and easing for smooth animations:

- **Durations**: Fast (200ms), Normal (300ms), Slow (500ms)
- **Easing Functions**: Standard, Decelerate, Accelerate, Spring
- **Transitions**: Fade, Slide, Scale, Collapse
- **Micro-interactions**: Button press, hover, focus
- **Component Animations**: Timer, Break exercises, Celebrations

```typescript
import { Duration, Easing, Transition } from '@/theme';

// With Animated API
Animated.timing(value, {
  toValue: 1,
  duration: Duration.normal,
  easing: Easing.standard,
  useNativeDriver: true,
});

// With Reanimated
withTiming(value.value, {
  duration: Duration.normal,
});
```

## 🚀 Usage

### Importing

```typescript
// Import specific tokens
import { Colors, Typography, Spacing } from '@/theme';

// Import everything
import Theme from '@/theme';

// Import types
import type { ThemeMode, ColorScheme, TypographyPreset } from '@/theme';
```

### Using with StyleSheet

```typescript
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, ComponentShadows } from '@/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background.primary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.card,
    ...ComponentShadows.card,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.light.text.primary,
    marginBottom: Spacing.xs,
  },
  button: {
    ...Typography.buttonMedium,
    backgroundColor: Colors.light.brand.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.button,
  },
});
```

### Using with Dark Mode

```typescript
import { useColorScheme } from 'react-native';
import { Colors } from '@/theme';

function MyComponent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>Hello World</Text>
    </View>
  );
}
```

### Using Theme Context

```typescript
import { getTheme } from '@/theme';

const theme = getTheme('light'); // or 'dark'

// Access all design tokens through theme object
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.sm,
  },
});
```

## 🎯 Design Principles

### 1. **Consistency**
All design tokens are centralized to ensure consistent usage across the app.

### 2. **Accessibility**
- Minimum contrast ratio of 4.5:1 for text
- Touch targets minimum 44x44px
- Support for reduced motion
- High contrast mode support

### 3. **Responsive**
- 8px grid system for consistent spacing
- Flexible typography scale
- Breakpoints for different screen sizes

### 4. **Dark Mode**
Full dark mode support with optimized colors for both light and dark themes.

### 5. **Performance**
- Use StyleSheet.create() for optimized styles
- Enable useNativeDriver for animations
- Avoid inline styles

## 📐 Design System Guidelines

### Spacing

Always use spacing tokens from the 8px grid:

```typescript
// ✅ Good
padding: Spacing.sm // 16px

// ❌ Bad
padding: 15 // Arbitrary value
```

### Colors

Use semantic color names instead of raw hex values:

```typescript
// ✅ Good
color: Colors.light.text.primary

// ❌ Bad
color: '#2C3E50'
```

### Typography

Use typography presets instead of manual font styling:

```typescript
// ✅ Good
...Typography.headlineLarge

// ❌ Bad
fontSize: 32,
fontWeight: '700',
fontFamily: 'Inter-Bold'
```

### Shadows

Use predefined shadow levels:

```typescript
// ✅ Good
...ComponentShadows.card

// ❌ Bad
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 3,
```

## 🔧 Customization

To add new design tokens:

1. Add the token to the appropriate file
2. Export it from that file
3. Update the main index.ts if needed
4. Document the new token in this README

Example:

```typescript
// In colors.ts
export const NewColor = {
  light: '#FFFFFF',
  dark: '#000000',
} as const;

// In index.ts
export { NewColor } from './colors';
```

## 📱 Platform Considerations

### iOS
- Uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
- Inter font family
- Native safe area handling

### Android
- Uses elevation for shadows
- Inter font family with sans-serif fallback
- Material Design principles

### Web
- CSS-compatible values
- System font stack fallbacks
- Responsive breakpoints

## 🧪 Testing

When working with the design system:

- Test in both light and dark modes
- Verify accessibility (contrast, touch targets)
- Check on different screen sizes
- Test animations at 60fps

## 📚 References

- [Material Design 3](https://m3.material.io/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Expo Documentation](https://docs.expo.dev/)

## 🤝 Contributing

When modifying the design system:

1. Follow existing patterns and naming conventions
2. Update this README with any changes
3. Test on both platforms
4. Ensure accessibility compliance
5. Document breaking changes

## 📝 Notes

- All spacing is based on 8px grid
- Typography uses Inter font family
- Colors support both light and dark modes
- Shadows work on both iOS and Android
- Animations are optimized for 60fps

---

**Version**: 1.0
**Last Updated**: November 2025
**Maintained By**: MicroBreaks Team
