# MicroBreaks - Screen Architecture
## Zen Master Level UI/UX Design System

**Tasarım Felsefesi:** "Small breaks, big impact" - Bilim-temelli, kişiselleştirilmiş masa başı wellness.

---

## Temel Tasarım Prensipleri

### 1. Minimalist & Focused
- Ekran başına MAX 1 primary action
- Progressive disclosure
- Beyaz alan (negative space) kullanımı
- Distraction-free interface

### 2. Dark-First Design
- Pure black (#000000) arka plan
- Göz yorgunluğunu azaltır
- OLED ekranlarda pil tasarrufu
- Modern, premium hissi

### 3. Cognitive Load Minimization
- Basit, anlaşılır ikonlar
- Tutarlı etkileşim kalıpları
- Hatırlanması kolay navigasyon
- Decision fatigue'den kaçınma

### 4. Instant Feedback
- Her etkileşimde haptic feedback
- Animasyonlu geçişler
- Başarı kutlamaları
- Real-time progress gösterimi

---

# EKRAN MİMARİSİ

## TAB 1: HOME (Dashboard)
**Amaç:** Günün özeti, bir bakışta durum, hızlı aksiyonlar

### 1.1 Home - Morning State
```
┌─────────────────────────────────────┐
│  Günaydın, Can                      │
│  Let's have a productive day        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  NEXT BREAK                         │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │      ⏱️ 23:47                   ││
│  │      until your next break      ││
│  │                                 ││
│  │      [Start Break Now]          ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  TODAY'S PROGRESS                   │
│  ┌───────┐ ┌───────┐ ┌───────┐     │
│  │  2/8  │ │ 45m   │ │ 🔥 7  │     │
│  │Breaks │ │ Focus │ │Streak │     │
│  └───────┘ └───────┘ └───────┘     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  QUICK ACTIONS                      │
│  ┌─────────────────────────────────┐│
│  │ 👁️ Eye Break      2 min    [>] ││
│  │ 🧘 Quick Stretch  3 min    [>] ││
│  │ 🌬️ Breathing      2 min    [>] ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### 1.2 Home - Active Session State
```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │         WORKING                 ││
│  │                                 ││
│  │      ⏱️ 18:32                   ││
│  │      ────────────────           ││
│  │      [███████████░░░] 74%       ││
│  │                                 ││
│  │      Deep Work Session          ││
│  │      50 min focus               ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────┐ ┌─────────┐           │
│  │  ⏸️     │ │  ⏹️     │           │
│  │  Pause  │ │  Stop   │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Up Next: 10 min break              │
│  • Neck rolls (30s)                 │
│  • Shoulder stretch (45s)           │
│  • Eye rest (20s)                   │
│                                     │
└─────────────────────────────────────┘
```

### 1.3 Home - Break Time State
```
┌─────────────────────────────────────┐
│                                     │
│  ═════════════════════════════════  │
│                                     │
│           ☀️ BREAK TIME             │
│                                     │
│            4:32                     │
│         remaining                   │
│                                     │
│  ═════════════════════════════════  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │     [Exercise Animation]        ││
│  │                                 ││
│  │        Neck Rolls               ││
│  │        Step 1 of 3              ││
│  │                                 ││
│  │  "Slowly roll your head in a    ││
│  │   circular motion..."           ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Progress: ● ○ ○                    │
│                                     │
│  [⏭️ Skip]  [+5 min]  [End Break]   │
│                                     │
└─────────────────────────────────────┘
```

### 1.4 Home - Session Complete Celebration
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│           🎉 🎊 🎉                  │
│                                     │
│        GREAT WORK!                  │
│                                     │
│    You completed a focus session    │
│                                     │
│    ┌─────────────────────────┐      │
│    │  50 min focus           │      │
│    │  3 exercises completed  │      │
│    │  +25 XP earned          │      │
│    └─────────────────────────┘      │
│                                     │
│         🔥 7 Day Streak!            │
│                                     │
│    ─────────────────────────────    │
│                                     │
│    How do you feel?                 │
│                                     │
│    [😴] [😊] [⚡] [🤷]               │
│    Tired Good Energized Meh         │
│                                     │
│    ─────────────────────────────    │
│                                     │
│    [Start Another]  [Done for Now]  │
│                                     │
└─────────────────────────────────────┘
```

---

## TAB 2: TIMER (Focus & Breaks)
**Amaç:** Timer kontrolü, preset seçimi, aktif session yönetimi

### 2.1 Timer - Idle State
```
┌─────────────────────────────────────┐
│  TIMER ⏱️                           │
│                                     │
│  Choose your focus mode             │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  PRESETS                            │
│  ┌────────────┐ ┌────────────┐     │
│  │     ⚡     │ │     🍅     │     │
│  │   MICRO    │ │  POMODORO  │     │
│  │   15/3     │ │   25/5     │     │
│  │            │ │     ✓      │     │
│  └────────────┘ └────────────┘     │
│                                     │
│  ┌────────────┐ ┌────────────┐     │
│  │     🧠     │ │     ⚙️     │     │
│  │ DEEP WORK  │ │   CUSTOM   │     │
│  │   50/10    │ │    ...     │     │
│  │            │ │            │     │
│  └────────────┘ └────────────┘     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  CURRENT SELECTION                  │
│  ┌─────────────────────────────────┐│
│  │  🍅 Pomodoro                    ││
│  │  25 min focus → 5 min break    ││
│  │                                 ││
│  │  Break includes:                ││
│  │  • Eye rest (20-20-20)          ││
│  │  • Desk stretch                 ││
│  │  • Deep breathing               ││
│  └─────────────────────────────────┘│
│                                     │
│  [▶ START SESSION]                  │
│                                     │
└─────────────────────────────────────┘
```

### 2.2 Timer - Running State
```
┌─────────────────────────────────────┐
│  ← Back                             │
│                                     │
│  ═════════════════════════════════  │
│                                     │
│              FOCUSING               │
│                                     │
│         ┌──────────────┐            │
│         │              │            │
│         │    19:42     │            │
│         │              │            │
│         │   ████████   │ ← Progress │
│         │   ████████   │   Ring     │
│         │   ████████   │            │
│         │   ░░░░░░░░   │            │
│         │              │            │
│         └──────────────┘            │
│                                     │
│         Pomodoro Session            │
│         25 min focus                │
│                                     │
│  ═════════════════════════════════  │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│     [⏸️ Pause]    [⏹️ End Early]    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  💡 Tip: Stay focused on one task   │
│     at a time for best results.     │
│                                     │
└─────────────────────────────────────┘
```

### 2.3 Timer - Custom Setup
```
┌─────────────────────────────────────┐
│  ← Timer                            │
│                                     │
│  CUSTOM TIMER                       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  FOCUS DURATION                     │
│  ┌─────────────────────────────────┐│
│  │  [──────●────────────] 30 min  ││
│  └─────────────────────────────────┘│
│  Min: 5 min          Max: 120 min   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  BREAK DURATION                     │
│  ┌─────────────────────────────────┐│
│  │  [────●──────────────] 5 min   ││
│  └─────────────────────────────────┘│
│  Min: 1 min           Max: 30 min   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  BREAK ACTIVITIES                   │
│  ┌─────────────────────────────────┐│
│  │  ✓ Eye exercises               ││
│  │  ✓ Neck & shoulder stretch     ││
│  │  ○ Back stretches              ││
│  │  ✓ Breathing exercises         ││
│  │  ○ Wrist exercises             ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Save as Preset]  [Start Session]  │
│                                     │
└─────────────────────────────────────┘
```

---

## TAB 3: EXERCISES (Library)
**Amaç:** Egzersiz kütüphanesi, kategorilere göre filtreleme, favoriler

### 3.1 Exercises - Library View
```
┌─────────────────────────────────────┐
│  EXERCISES 🏃                       │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  🔍 Search exercises...        ││
│  └─────────────────────────────────┘│
│                                     │
│  [All] [Eyes] [Neck] [Back] [...]   │
│   ═══                               │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  RECOMMENDED FOR YOU                │
│  Based on your profile              │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👁️ 20-20-20 Eye Rest     20s ❤️││
│  │    Reduce eye strain            ││
│  ├─────────────────────────────────┤│
│  │ 🔄 Neck Rolls            30s   ││
│  │    Release neck tension         ││
│  ├─────────────────────────────────┤│
│  │ 🙆 Shoulder Shrugs       45s   ││
│  │    Relieve shoulder tightness   ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ALL EXERCISES                      │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👁️ Eye Care                  12 ││
│  │ 🦒 Neck & Shoulders          15 ││
│  │ 🧘 Back & Posture            10 ││
│  │ ✋ Wrists & Hands             8 ││
│  │ 🌬️ Breathing                  6 ││
│  │ 🧠 Mindfulness                5 ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### 3.2 Exercise - Category View
```
┌─────────────────────────────────────┐
│  ← Exercises                        │
│                                     │
│  👁️ EYE CARE                        │
│  12 exercises                       │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Quick <1m] [Favorites] [Standing] │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 👁️ 20-20-20 Eye Rest           ││
│  │    20 sec • Easy          ❤️   ││
│  │    Look 20 feet away            ││
│  ├─────────────────────────────────┤│
│  │ 🔄 Eye Circles                  ││
│  │    30 sec • Easy                ││
│  │    Roll eyes in circles         ││
│  ├─────────────────────────────────┤│
│  │ ✋ Palming                       ││
│  │    60 sec • Easy                ││
│  │    Cover eyes with palms        ││
│  ├─────────────────────────────────┤│
│  │ 👀 Near-Far Focus               ││
│  │    45 sec • Easy                ││
│  │    Focus near then far          ││
│  ├─────────────────────────────────┤│
│  │ 😌 Blinking Exercise            ││
│  │    30 sec • Easy                ││
│  │    Conscious slow blinks        ││
│  └─────────────────────────────────┘│
│                                     │
│  [... more exercises]               │
│                                     │
└─────────────────────────────────────┘
```

### 3.3 Exercise - Detail View (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  ═════════════════════════════════  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │     [Animation Preview]         ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  20-20-20 Eye Rest            ❤️    │
│                                     │
│  👁️ Eye Care • 20 sec • Easy        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  DESCRIPTION                        │
│  Every 20 minutes, look at          │
│  something 20 feet away for 20      │
│  seconds to reduce eye strain.      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  STEPS                              │
│  1. Look away from your screen      │
│  2. Focus on an object 20+ feet     │
│     away (out the window, etc.)     │
│  3. Hold your gaze for 20 seconds   │
│  4. Blink naturally                 │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  BENEFITS                           │
│  • Reduces eye strain               │
│  • Prevents dry eyes                │
│  • Relaxes eye muscles              │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Start Exercise]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## TAB 4: PROGRESS (Analytics)
**Amaç:** İlerleme takibi, streakler, başarılar, insights

### 4.1 Progress - Overview
```
┌─────────────────────────────────────┐
│  PROGRESS 📊                        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  TODAY                              │
│  ┌─────────────────────────────────┐│
│  │         ┌──────────┐            ││
│  │         │    4     │            ││
│  │         │   /8     │            ││
│  │         │  breaks  │            ││
│  │         └──────────┘            ││
│  │            50%                  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐     │
│  │ 1h35m │ │   8   │ │  🔥7  │     │
│  │Focus  │ │ Exer. │ │Streak │     │
│  └───────┘ └───────┘ └───────┘     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  THIS WEEK                          │
│  ┌─────────────────────────────────┐│
│  │  M   T   W   T   F   S   S      ││
│  │  █   █   █   █   ░   ░   ░      ││
│  │  █   █   █   █                  ││
│  │  █   █   █   █      Today       ││
│  │  █   █   █   ◐                  ││
│  │  ━   ━   ━   ━   ━   ━   ━      ││
│  │  8   7   8   4   -   -   -      ││
│  └─────────────────────────────────┘│
│                                     │
│  Total: 27 breaks • 5h 20m focus    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [View Achievements]                │
│  [Weekly Insights] 🔒               │
│                                     │
└─────────────────────────────────────┘
```

### 4.2 Progress - Streak Display
```
┌─────────────────────────────────────┐
│  ← Progress                         │
│                                     │
│  YOUR STREAK 🔥                     │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │            🔥                   ││
│  │           🔥🔥                  ││
│  │          🔥🔥🔥                 ││
│  │                                 ││
│  │            7                    ││
│  │         day streak              ││
│  │                                 ││
│  │      Best: 23 days              ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  LAST 30 DAYS                       │
│  ┌─────────────────────────────────┐│
│  │ ● ● ● ● ○ ● ● ● ● ● ○ ● ● ● ● ││
│  │ ● ● ○ ● ● ● ● ● ● ● ● ● ● ● ◐ ││
│  └─────────────────────────────────┘│
│                                     │
│  ● = Complete  ○ = Missed  ◐ = Today│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  MILESTONES                         │
│  ┌─────────────────────────────────┐│
│  │  ✓ 3 days    +10 XP             ││
│  │  ✓ 7 days    +25 XP   ← Current ││
│  │  ○ 14 days   +50 XP             ││
│  │  ○ 30 days   +100 XP            ││
│  │  ○ 100 days  +500 XP            ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### 4.3 Progress - Achievements
```
┌─────────────────────────────────────┐
│  ← Progress                         │
│                                     │
│  ACHIEVEMENTS 🏆                    │
│                                     │
│  12/32 unlocked • 450 XP            │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  RECENTLY UNLOCKED                  │
│  ┌─────────────────────────────────┐│
│  │  🌅 Early Bird                  ││
│  │     Take a break before 8 AM    ││
│  │     Unlocked: Today             ││
│  ├─────────────────────────────────┤│
│  │  👁️ Eye Care Pro                ││
│  │     Complete 50 eye exercises   ││
│  │     Unlocked: 2 days ago        ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  IN PROGRESS                        │
│  ┌─────────────────────────────────┐│
│  │  🔥 Consistency King            ││
│  │     30 day streak               ││
│  │     [████████░░] 7/30           ││
│  ├─────────────────────────────────┤│
│  │  🧘 Stretch Master              ││
│  │     Try all stretch exercises   ││
│  │     [███████░░░] 12/15          ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [View All Achievements]            │
│                                     │
└─────────────────────────────────────┘
```

---

## TAB 5: SETTINGS
**Amaç:** Tüm tercihler, premium yönetimi, hesap ayarları

### 5.1 Settings - Main
```
┌─────────────────────────────────────┐
│  SETTINGS ⚙️                        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  TIMER                              │
│  ┌─────────────────────────────────┐│
│  │  Default preset        Pomodoro ││
│  │  Auto-start breaks          ON  ││
│  │  Sound effects              ON  ││
│  │  Vibration                  ON  ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  NOTIFICATIONS                      │
│  ┌─────────────────────────────────┐│
│  │  Break reminders            ON  ││
│  │  Reminder style        Balanced ││
│  │  Daily summary              ON  ││
│  │  Streak alerts              ON  ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  APPEARANCE                         │
│  ┌─────────────────────────────────┐│
│  │  Theme                    Dark  ││
│  │  Sounds               Nature 🔒 ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  PREMIUM ⭐                         │
│  ┌─────────────────────────────────┐│
│  │  Upgrade to Premium    [View]   ││
│  │  Unlock all features            ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  SUPPORT                            │
│  ┌─────────────────────────────────┐│
│  │  Help & FAQ                  >  ││
│  │  Contact us                  >  ││
│  │  Rate the app                >  ││
│  │  Privacy policy              >  ││
│  │  About                       >  ││
│  └─────────────────────────────────┘│
│                                     │
│  v1.0.0                             │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 Settings - Notifications
```
┌─────────────────────────────────────┐
│  ← Settings                         │
│                                     │
│  NOTIFICATIONS                      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  BREAK REMINDERS                    │
│  ┌─────────────────────────────────┐│
│  │  Enable reminders        [ON]   ││
│  │                                 ││
│  │  Reminder style:                ││
│  │  ○ Gentle                       ││
│  │     Subtle, dismissible         ││
│  │  ● Balanced                     ││
│  │     Regular reminders           ││
│  │  ○ Strict                       ││
│  │     Persistent until action     ││
│  │  ○ Smart 🔒                     ││
│  │     AI-powered timing           ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  QUIET HOURS                        │
│  ┌─────────────────────────────────┐│
│  │  Enable quiet hours      [ON]   ││
│  │                                 ││
│  │  Start time           10:00 PM  ││
│  │  End time              7:00 AM  ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  OTHER NOTIFICATIONS                │
│  ┌─────────────────────────────────┐│
│  │  Daily summary          [ON]    ││
│  │  Streak alerts          [ON]    ││
│  │  Achievement unlocks    [ON]    ││
│  │  Weekly insights        [OFF]   ││
│  │  Tips & motivation      [ON]    ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## MODAL SCREENS

### M.1 Quick Break Selector
```
┌─────────────────────────────────────┐
│  ═════════════════════════════════  │
│                                     │
│  QUICK BREAK                        │
│  Choose a quick break activity      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  👁️ Eye Rest                    ││
│  │     20-20-20 rule • 20 sec      ││
│  ├─────────────────────────────────┤│
│  │  🔄 Neck Stretch                ││
│  │     Gentle neck rolls • 30 sec  ││
│  ├─────────────────────────────────┤│
│  │  🙆 Shoulder Release            ││
│  │     Shrugs & circles • 45 sec   ││
│  ├─────────────────────────────────┤│
│  │  🌬️ Deep Breathing              ││
│  │     4-7-8 technique • 2 min     ││
│  ├─────────────────────────────────┤│
│  │  🚶 Walk Break                  ││
│  │     Get up and move • 5 min     ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Cancel]                           │
│                                     │
└─────────────────────────────────────┘
```

### M.2 Premium Paywall
```
┌─────────────────────────────────────┐
│                              [×]    │
│                                     │
│           ⭐ PREMIUM                │
│                                     │
│    Unlock the full MicroBreaks      │
│            experience               │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ✓ Unlimited custom timers          │
│  ✓ 50+ premium exercises            │
│  ✓ AI-powered recommendations       │
│  ✓ Advanced analytics & insights    │
│  ✓ Calendar integration             │
│  ✓ Custom themes & sounds           │
│  ✓ Streak freezes                   │
│  ✓ Export your data                 │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  YEARLY              BEST VALUE ││
│  │  $29.99/year                    ││
│  │  $2.49/month • Save 50%         ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │  MONTHLY                        ││
│  │  $4.99/month                    ││
│  └─────────────────────────────────┘│
│                                     │
│  [Start 7-Day Free Trial]           │
│                                     │
│  Cancel anytime • Restore purchases │
│                                     │
└─────────────────────────────────────┘
```

### M.3 Achievement Celebration
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         ✨ ✨ ✨ ✨ ✨                │
│                                     │
│           🏆                        │
│                                     │
│    ACHIEVEMENT UNLOCKED!            │
│                                     │
│    ─────────────────────            │
│                                     │
│         🔥 Week Warrior             │
│                                     │
│    Complete a 7-day streak          │
│                                     │
│         +25 XP earned               │
│                                     │
│    ─────────────────────            │
│                                     │
│    "Consistency is the key to       │
│     success. Keep it up!"           │
│                                     │
│                                     │
│         [Awesome! 🎉]               │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## NOTIFICATION PATTERNS

### N.1 Break Reminder
```
┌─────────────────────────────────────┐
│  MicroBreaks ⏱️                     │
│  Time for a break!                  │
│  You've been working for 25 min     │
│  [Start Break]  [5 min]  [15 min]   │
└─────────────────────────────────────┘
```

### N.2 Streak Alert (Morning)
```
┌─────────────────────────────────────┐
│  MicroBreaks 🔥                     │
│  Keep your 6-day streak alive!      │
│  Take at least one break today      │
│  [Open App]                         │
└─────────────────────────────────────┘
```

### N.3 Daily Summary (Evening)
```
┌─────────────────────────────────────┐
│  MicroBreaks 📊                     │
│  Great day! You took 8 breaks       │
│  2h 15m focus time • 🔥 7 day streak│
│  [View Details]                     │
└─────────────────────────────────────┘
```

### N.4 Session Complete
```
┌─────────────────────────────────────┐
│  MicroBreaks ✅                     │
│  Focus session complete!            │
│  Time for your 5-minute break       │
│  [Start Break]  [Skip]              │
└─────────────────────────────────────┘
```

---

## WIDGET DESIGNS

### W.1 Small Widget
```
┌───────────────────┐
│  MicroBreaks      │
│  ─────────────    │
│  Next: 12:34      │
│  🔥 7 days        │
└───────────────────┘
```

### W.2 Medium Widget
```
┌─────────────────────────────────────┐
│  MicroBreaks                  🔥 7  │
│  ───────────────────────────────    │
│  Next break in: 12:34              │
│  Today: 4/8 breaks                  │
│                                     │
│  [Start Break Now]                  │
└─────────────────────────────────────┘
```

### W.3 Large Widget
```
┌─────────────────────────────────────┐
│  MicroBreaks                        │
│                                     │
│  ⏱️ Next break: 12:34              │
│                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐     │
│  │  4/8  │ │ 1h35m │ │ 🔥 7  │     │
│  │Breaks │ │ Focus │ │Streak │     │
│  └───────┘ └───────┘ └───────┘     │
│                                     │
│  Quick:  [👁️]  [🔄]  [🌬️]          │
│                                     │
└─────────────────────────────────────┘
```

---

## ACCESSIBILITY FEATURES

### Her Ekranda Bulunması Gerekenler

1. **Dynamic Type Support**
   - Min 16pt body text
   - Scalable typography
   - No fixed heights

2. **Color Contrast**
   - WCAG AA compliance (4.5:1)
   - Don't rely on color alone
   - High contrast mode support

3. **VoiceOver/TalkBack**
   - Meaningful accessibility labels
   - Proper heading structure
   - Action descriptions

4. **Motion Sensitivity**
   - Reduce motion option
   - No essential info in animations
   - Static alternatives

5. **Touch Targets**
   - Minimum 44x44pt
   - Adequate spacing
   - Clear tap feedback

---

## PREMIUM VS FREE FEATURES

### FREE
- 3 timer presets (Micro, Pomodoro, Deep Work)
- 15 basic exercises
- Daily streak tracking
- Basic progress (today & this week)
- Standard notifications
- 1 theme (Dark)

### PREMIUM ($4.99/mo or $29.99/yr)
- Custom timer creation
- 50+ premium exercises
- AI-powered recommendations
- Full analytics & insights
- Calendar integration
- Smart notifications
- All themes & sounds
- Streak freezes (2/month)
- Export data
- Priority support

---

**Document Version:** 1.0
**Created:** December 8, 2025
**Total Screens:** 25+ unique screens
**Design Philosophy:** Minimalist, dark-first, science-backed wellness
