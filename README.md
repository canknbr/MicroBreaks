# MicroBreaks

<div align="center">

**Your personal desk wellness companion**

A science-backed mobile wellness application that transforms desk workers' health and productivity through intelligent micro-break management.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Documentation](#documentation)

</div>

---

## 📖 Overview

MicroBreaks is a mobile-first wellness application that monitors work patterns and delivers timely, context-aware micro-breaks to prevent physical strain and mental fatigue. By combining ergonomic expertise, behavioral psychology, and adaptive technology, we create a personalized break coach that helps you build sustainable work habits.

### 🎯 Core Philosophy

**"Small breaks, big impact"** – We believe that consistent micro-interventions (1-3 minutes) are more sustainable and effective than longer, disruptive breaks.

### 💡 Why MicroBreaks?

- **Evidence-based**: Exercises developed with physiotherapists and ergonomics experts
- **Intelligent**: Adaptive recommendations based on your usage patterns
- **Non-intrusive**: Respects your workflow and context
- **Measurable**: Track your health improvements with tangible metrics
- **Delightful**: Makes wellness enjoyable, not a chore

---

## ✨ Features

### Core Functionality

- **🎯 Smart Timer System**
  - Multiple presets: Pomodoro (25/5), Deep Work (50/10), Custom intervals
  - Automatic pause detection
  - Focus mode with Do Not Disturb integration
  - Session history tracking

- **🧘 Comprehensive Exercise Library**
  - **Eye Care**: 20-20-20 rule, eye movements, palming techniques
  - **Neck & Shoulders**: Rotations, rolls, stretches, mobilization
  - **Back & Posture**: Spinal twists, posture resets, relief exercises
  - **Wrists & Hands**: Circles, stretches, carpal tunnel prevention
  - **Breathing & Mindfulness**: Box breathing, 4-7-8 technique, meditation

- **🏋️ Animated Movement Library**
  - 118 curated desk-friendly movements with looping demo animations (media © [Gym visual](https://gymvisual.com/))
  - Body-zone browsing (neck, back, chest, arms, core, legs, cardio) with space filters (at desk / standing / floor)
  - Localized names and step-by-step instructions (EN + TR), difficulty levels, and muscle maps
  - Every movement converts into a guided, voice-coached micro-session
  - **Today's plan**: three daily moves picked deterministically from your pain areas
  - **Zone circuits**: auto-composed 3-move chained sessions per body zone
  - **Custom routines (Pro)**: chain 2–8 moves into named personal sessions
  - Favorites, post-session "next move" momentum, and pain-reminder deep links into the right zone
  - Regenerate from the open dataset with `npm run generate:exercises -- <dataset-dir>` (see `scripts/generate-exercise-library.mjs`)

- **🔔 Context-Aware Notifications**
  - Smart scheduling that avoids interruptions
  - Customizable frequency
  - Motivational messages
  - Quick actions from notifications

- **📊 Progress Tracking**
  - Daily break streaks
  - Weekly consistency scores
  - Focus time trends
  - Exercise preferences
  - Health improvement indicators

### Premium Features (Planned)

- 🤖 AI-powered personalization engine
- 📈 Advanced analytics and detailed health reports
- 🎨 Customization options and themes
- 👥 Team features and social challenges
- 🔗 Calendar and productivity tool integrations

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native 0.81.5 with Expo ~54.0
- **Language**: TypeScript 5.9.2
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: Custom themed components
- **Animations**: React Native Reanimated 4.1.1
- **Icons**: Expo Vector Icons & Expo Symbols
- **Gestures**: React Native Gesture Handler

### Development Tools
- **Linting**: ESLint with Expo config
- **Package Manager**: npm
- **Build System**: Expo Application Services (EAS)

### Platform Support
- ✅ iOS 13.0+
- ✅ Android (API 21+ / 5.0 Lollipop)
- ✅ Web (React Native Web)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
- Expo Go app (for physical device testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/canknbr/MicroBreaks.git
   cd MicroBreaks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS Simulator
   npm run ios

   # Android Emulator
   npm run android

   # Web Browser
   npm run web
   ```

### Development Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device
npm run web        # Run in web browser
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
npm run verify:config   # Validate Expo/EAS config and asset references
npm run verify:expo-config  # Ensure Expo can resolve the final app config
npm run verify:release  # Run config validation, typecheck, lint, and tests
npm run reset-project  # Reset to blank project
```

Release guardrails are documented in [docs/BUILD_RELEASE_GUARDRAILS.md](docs/BUILD_RELEASE_GUARDRAILS.md).

---

## 📁 Project Structure

```
MicroBreaks/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab-based navigation
│   │   ├── index.tsx        # Home screen
│   │   ├── explore.tsx      # Explore screen
│   │   └── _layout.tsx      # Tabs layout
│   ├── (onboarding)/        # Onboarding flow
│   │   ├── components/      # Onboarding components
│   │   ├── welcome.tsx      # Welcome screen
│   │   └── ...              # Other onboarding screens
│   ├── _layout.tsx          # Root layout
│   └── modal.tsx            # Modal screens
├── components/              # Reusable components
│   ├── ui/                  # UI components
│   ├── themed-view.tsx      # Themed view wrapper
│   ├── themed-text.tsx      # Themed text component
│   └── ...
├── theme/                   # Design system tokens
│   ├── colors.ts            # Color palette
│   ├── typography.ts        # Typography styles
│   ├── spacing.ts           # Spacing & layout
│   ├── shadows.ts           # Shadow definitions
│   ├── animations.ts        # Animation configs
│   └── index.ts             # Theme exports
├── constants/               # App constants
├── hooks/                   # Custom React hooks
│   ├── use-theme-color.ts
│   └── use-color-scheme.ts
├── documentations/          # Project documentation
│   ├── PRD_MicroBreaks_Enhanced_v2.md
│   └── Onboarding_Flow_MicroBreaks_v3.md
├── assets/                  # Images, fonts, etc.
│   └── images/              # Image assets
│       └── img/             # Reference images
├── scripts/                 # Utility scripts
└── ...config files
```

---

## 🎨 Design System

MicroBreaks is a **modern, vibrant productivity wellness app** — designed to energize the user with a saturated, expressive palette rather than fade into the background. We trade the "ambient/calm tech" aesthetic for clear, high-contrast moments that catch the eye when it's time to reset.

### Visual Style

- **Pure Black Background**: `#000000` for the main interface, premium OLED-friendly feel
- **Clean White Elements**: White text and buttons for maximum contrast and readability
- **Vibrant Accent Colors**: Bright, saturated tones that signal action and emotional state
  - **Energized / Goal-positive**: Yellows and oranges (`#FFD166`, `#FF9F1C`)
  - **Focus / Wellness**: Teals and greens (`#4ECDC4`, `#06FFA5`)
  - **Alert / Streak-at-risk**: Reds and corals (`#EF476F`, `#E63946`)
  - **Premium / Calm-down moments**: Blues and purples (`#118AB2`, `#7B68EE`)

### Typography

- **Serif Headings**: Georgia for elegant, readable display text
- **Sans-Serif Body**: Inter for clean, modern UI text
- **Clear Hierarchy**: From 48px display to 12px captions
- **Generous Spacing**: Line heights at 1.5x for optimal readability

### Components

- **Primary Button**: White, fully-rounded (28px border radius), black text
- **Secondary Button**: Simple text-only, gray color
- **Cards**: Dark gray (`#1A1A1A`) with subtle borders
- **Progress Bars**: White fill on dark backgrounds

### Design Principles

1. **Confident & Vibrant**: Saturated accents earn attention at the right moments — no apology for being expressive
2. **Emotional Connection**: Colors that reflect feelings and progress states
3. **Accessibility First**: WCAG AA contrast targets, Reduce Motion respected, screen-reader labels on every interactive element
4. **Purposeful Motion**: Spring physics for moments that matter; no animation for animation's sake
5. **Consistent Design Language**: One palette, one icon system, one motion language across every surface

---

## 📱 Screenshots

> Coming soon! Screenshots will showcase the timer interface, exercise library, progress tracking, and more.

---

## 🗺 Roadmap

### Phase 1: MVP (Months 1-3) ✅
- [x] Project setup and architecture
- [ ] Core timer functionality
- [ ] Basic exercise library (20 exercises)
- [ ] Notification system
- [ ] Usage tracking

### Phase 2: Enhancement (Months 4-6)
- [ ] Expanded exercise library (100+ exercises)
- [ ] Advanced analytics dashboard
- [ ] Subscription system
- [ ] Social sharing features

### Phase 3: Intelligence (Months 7-9)
- [ ] ML-based personalization
- [ ] Health score algorithm
- [ ] Calendar integration
- [ ] Widget support
- [ ] Apple Health / Google Fit sync

### Phase 4: Expansion (Months 10-12)
- [ ] Team features
- [ ] Corporate dashboard
- [ ] Wearable integration
- [ ] Third-party API
- [ ] Advanced analytics

---

## 📚 Documentation

Comprehensive documentation is available in the `/documentations` folder:

- **[Product Requirements Document](./documentations/PRD_MicroBreaks_Enhanced_v2.md)** - Complete product specifications, market analysis, and technical requirements
- **[Onboarding Flow](./documentations/Onboarding_Flow_MicroBreaks_v3.md)** - User onboarding experience and flows

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team & Contact

**Product Team** - MicroBreaks Development

- 📧 Email: [contact@microbreaks.app](mailto:contact@microbreaks.app)
- 🐛 Issues: [GitHub Issues](https://github.com/canknbr/MicroBreaks/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/canknbr/MicroBreaks/discussions)

---

## 🙏 Acknowledgments

- Physiotherapists and ergonomics experts for exercise content
- Expo team for the amazing development framework
- React Native community for continuous support
- All our beta testers and early adopters

---

## 📊 Project Status

**Current Version**: 1.0.0 (MVP Development)
**Status**: 🚧 Active Development
**Last Updated**: November 2025

---

<div align="center">

**Made with ❤️ for healthier desk workers everywhere**

[⬆ Back to Top](#microbreaks)

</div>
