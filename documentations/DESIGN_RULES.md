# MicroBreaks Design Rules

## Visual Design Guidelines

### 1. No Icons Rule

**Rule**: Do not use icons or emojis in any screen designs.

**Rationale**: The app follows a sleek, modern, and minimalist design aesthetic. Icons and emojis can:
- Clutter the interface
- Distract from the core message
- Feel unprofessional or childish
- Reduce the premium feel of the app

**Implementation**:
- ✅ Use clear, descriptive text instead of icons
- ✅ Rely on typography hierarchy to communicate importance
- ✅ Use whitespace and layout to guide attention
- ✅ Leverage color and contrast for visual emphasis
- ❌ Do not use emoji icons in any UI elements
- ❌ Do not use icon fonts or SVG icons in onboarding or main screens
- ❌ Do not use decorative elements that don't serve a functional purpose

**Exceptions**:
- System icons in navigation bars (required by platform conventions)
- Checkmarks (✓) in selection states (functional, not decorative)
- Error/success indicators (when necessary for accessibility)

---

## 2. Black-White Color Scheme

**Primary Palette**:
- Pure Black (#000000) - Primary background
- Pure White (#FFFFFF) - Primary text and interactive elements
- Dark Gray (#1A1A1A) - Secondary background
- Medium Gray (#2A2A2A) - Card backgrounds
- Light Gray (#9CA3AF) - Secondary text

**Interactive Elements**:
- Primary buttons: White background with black text
- Secondary buttons: Transparent/Dark gray with white text
- Borders: Subtle dark gray (#2A2A2A)
- Selected states: White border with dark gray background

**Accent Colors** (use sparingly):
- Teal (#06FFA5) - For critical actions or progress indicators only
- Error Red (#EF476F) - For error states only
- Warning Orange (#FF9F1C) - For warning states only

---

## 3. Typography Hierarchy

**Purpose**: Clear typography replaces the need for icons and decorative elements.

**Hierarchy**:
1. **Display** - Large headlines for key moments (40-48px)
2. **Title** - Section headers (24-32px)
3. **Body Large** - Primary content (18-20px)
4. **Body Medium** - Standard text (16px)
5. **Body Small** - Secondary information (14px)

**Weights**:
- Regular (400) - Body text
- Bold (700) - Headlines and emphasis

---

## 4. Spacing System

**Consistent spacing** creates visual rhythm without needing decorative elements.

**Scale** (in pixels):
- XXS: 4px
- XS: 8px
- SM: 12px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px
- XXXL: 64px

---

## 5. Component Design

### Cards
- Simple rectangular cards with subtle borders
- No shadows or elevation (keep it flat)
- Padding: MD to LG
- Border radius: 8-12px

### Buttons
- Full-width or auto-width based on context
- White background for primary actions
- Clear text labels (no icon-only buttons)
- Min height: 48px for accessibility

### Selection States
- Border color change (white or teal)
- Background color change (darker gray)
- Checkmark (✓) for visual confirmation
- No icon badges or decorative elements

---

## 6. Layout Principles

**Minimalism**:
- One primary action per screen
- Maximum 2-3 elements per row
- Generous whitespace between elements
- Clear visual hierarchy

**Alignment**:
- Left-align text for readability
- Center-align headlines and CTAs
- Consistent padding throughout

---

## 7. Onboarding Screens

### Specific Rules:
1. **No welcome icons** - Start with a clear headline
2. **No benefit icons** - Use descriptive text and hierarchy
3. **No decorative emojis** - Professional text-only approach
4. **No progress icons** - Simple progress bar is sufficient
5. **Option cards** - Text-only, no leading icons

### What to Use Instead:
- Strong, clear headlines
- Descriptive subheadings
- Bullet points or simple lists
- Progress bars (not icon-based)
- Typography size/weight for emphasis

---

## 8. Professional vs. Playful

**Target**: Professional, sleek, modern

**Avoid**:
- Emojis and decorative icons
- Gradient backgrounds
- Playful illustrations
- Colorful, busy designs
- Multiple accent colors

**Embrace**:
- Clean, minimal layouts
- Black and white color scheme
- Professional typography
- Generous whitespace
- Subtle, elegant interactions

---

## Implementation Checklist

When designing a new screen:

- [ ] No icons or emojis used?
- [ ] Color scheme is black/white/gray only?
- [ ] Typography hierarchy is clear?
- [ ] Spacing is consistent with the system?
- [ ] Layout is minimal and focused?
- [ ] Text is clear and descriptive?
- [ ] Interactive elements are accessible (min 44x44px)?
- [ ] Design feels professional and modern?

---

## Enforcement

These rules are enforced through:
1. Code reviews
2. Design reviews
3. Linting and automated checks (where possible)
4. Team documentation and training

**Last Updated**: November 14, 2025
**Approved By**: Product & Design Team
