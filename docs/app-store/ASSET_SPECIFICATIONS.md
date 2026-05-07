# App Store Asset Specifications

This document outlines all required and recommended assets for App Store and Google Play submissions.

---

## App Icon

### iOS App Store
| Size | Usage | Format |
|------|-------|--------|
| 1024x1024 | App Store | PNG (no alpha) |
| 180x180 | iPhone @3x | PNG |
| 120x120 | iPhone @2x | PNG |
| 167x167 | iPad Pro @2x | PNG |
| 152x152 | iPad @2x | PNG |
| 76x76 | iPad @1x | PNG |

### Android Google Play
| Size | Usage | Format |
|------|-------|--------|
| 512x512 | Play Store Hi-res | PNG |
| 192x192 | xxxhdpi | PNG |
| 144x144 | xxhdpi | PNG |
| 96x96 | xhdpi | PNG |
| 72x72 | hdpi | PNG |
| 48x48 | mdpi | PNG |

### Android Adaptive Icon
| Asset | Size | Description |
|-------|------|-------------|
| Foreground | 108x108dp | Main icon graphic (within 72dp safe zone) |
| Background | 108x108dp | Background color/gradient |
| Monochrome | 108x108dp | Single-color version for themed icons |

### Design Guidelines
- No transparency on iOS App Store icon
- Keep main graphic within 72dp safe zone for adaptive icons
- Avoid text in icon (doesn't scale well)
- Use simple, recognizable shapes
- Test at smallest sizes (16x16) for visibility

---

## Screenshots

### iOS App Store

#### iPhone 6.7" (Required)
- Size: 1290 x 2796 pixels
- Devices: iPhone 15 Pro Max, 15 Plus, 14 Pro Max
- Minimum: 3 screenshots
- Maximum: 10 screenshots

#### iPhone 6.5" (Required)
- Size: 1284 x 2778 pixels
- Devices: iPhone 14 Plus, 13 Pro Max, 12 Pro Max
- Minimum: 3 screenshots
- Maximum: 10 screenshots

#### iPhone 5.5" (Required)
- Size: 1242 x 2208 pixels
- Devices: iPhone 8 Plus, 7 Plus, 6s Plus
- Minimum: 3 screenshots
- Maximum: 10 screenshots

#### iPad Pro 12.9" (Recommended)
- Size: 2048 x 2732 pixels
- Minimum: 3 screenshots
- Maximum: 10 screenshots

### Android Google Play

#### Phone Screenshots (Required)
- Size: 1080 x 1920 to 1440 x 2560 pixels
- Aspect ratio: 16:9 recommended
- Minimum: 2 screenshots
- Maximum: 8 screenshots

#### 7-inch Tablet (Recommended)
- Size: 1200 x 1920 pixels

#### 10-inch Tablet (Recommended)
- Size: 1920 x 1200 or 2560 x 1600 pixels

### Screenshot Content Strategy

| # | Focus | Title (EN) | Title (TR) |
|---|-------|------------|------------|
| 1 | Home | Eyes tired? Start here. | Gözlerin yoruldu mu? Buradan başla. |
| 2 | Timer | Build a better work rhythm. | Daha iyi bir çalışma ritmi kur. |
| 3 | Guided Session | Reset neck, posture, and breathing fast. | Boyun, duruş ve nefesi hızlıca resetle. |
| 4 | Library | Go beyond starter relief. | Başlangıç rahatlamasının ötesine geç. |
| 5 | Recovery Story | See your weekly recovery story. | Haftalık recovery hikayeni gör. |
| 6 | Trust | Stay private. Keep improving. | Gizli kal. Daha iyi hissetmeye devam et. |

### Screenshot Design Guidelines
- Show actual app UI (not mockups)
- Use device frames for professional look
- Add text overlays to highlight features
- Use consistent branding colors
- Avoid too much text (keep it readable)
- First screenshot is most important (visible in search)

---

## App Preview Video

### iOS App Store
| Specification | Value |
|---------------|-------|
| Duration | 15-30 seconds |
| Resolution (6.7") | 1290 x 2796 pixels |
| Resolution (6.5") | 1284 x 2778 pixels |
| Resolution (5.5") | 1080 x 1920 pixels |
| Format | H.264, HEVC |
| Frame Rate | 30 fps |
| Audio | AAC, optional |

### Google Play
| Specification | Value |
|---------------|-------|
| Duration | 30 seconds to 2 minutes |
| Resolution | 1920 x 1080 (landscape) |
| Format | YouTube link |
| Aspect Ratio | 16:9 |

### Video Content Script

```
[0:00-0:05] Opening
- App icon animation
- Text: "MicroBreaks"

[0:05-0:10] Problem Statement
- Show person at computer, rubbing eyes
- Text: "Spending hours on screens?"

[0:10-0:15] Solution Introduction
- Phone notification appears
- Text: "Get smart break reminders"

[0:15-0:20] Exercise Demo
- Quick cuts of different exercises
- Eye, neck, back, wrist, breathing

[0:20-0:25] Progress Tracking
- Show streaks and achievements
- Text: "Track your progress"

[0:25-0:30] Call to Action
- App icon
- Text: "Download MicroBreaks - Free"
```

---

## Feature Graphic (Android)

| Specification | Value |
|---------------|-------|
| Size | 1024 x 500 pixels |
| Format | PNG or JPEG |
| Usage | Play Store header |

### Design Guidelines
- No text required (Google adds title)
- Use brand colors and imagery
- Simple, clean design
- Works well when cropped

---

## Promotional Assets

### Social Media Sizes

| Platform | Image Type | Size |
|----------|------------|------|
| Instagram | Post | 1080 x 1080 |
| Instagram | Story | 1080 x 1920 |
| Twitter/X | Post | 1200 x 675 |
| Twitter/X | Header | 1500 x 500 |
| Facebook | Post | 1200 x 630 |
| LinkedIn | Post | 1200 x 627 |

### Press Kit Assets
- [ ] App icon (PNG, 1024x1024)
- [ ] Logo (PNG, SVG)
- [ ] Logo (inverted/white)
- [ ] Screenshots (all sizes)
- [ ] Feature graphic
- [ ] App preview video
- [ ] Brand guidelines PDF

---

## Color Palette

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Primary Blue | #4A90D9 | 74, 144, 217 | Primary actions, branding |
| Secondary Teal | #34C4B5 | 52, 196, 181 | Accents, success |
| Light Background | #E6F4FE | 230, 244, 254 | Light mode bg |
| Dark Background | #1A1A2E | 26, 26, 46 | Dark mode bg |
| Text Primary | #1A1A2E | 26, 26, 46 | Main text |
| Text Secondary | #6B7280 | 107, 114, 128 | Secondary text |
| Success | #10B981 | 16, 185, 129 | Success states |
| Warning | #F59E0B | 245, 158, 11 | Warning states |
| Error | #EF4444 | 239, 68, 68 | Error states |

---

## Typography

### App Fonts
- **iOS:** SF Pro Display (headings), SF Pro Text (body)
- **Android:** Roboto (all)

### Marketing Fonts
- **Headings:** Space Grotesk Bold
- **Body:** Inter Regular

---

## Checklist

### App Icon
- [ ] 1024x1024 PNG (no alpha)
- [ ] All iOS sizes generated
- [ ] Android adaptive icon set
- [ ] Tested at small sizes

### Screenshots
- [ ] iPhone 6.7" (6 screenshots)
- [ ] iPhone 6.5" (6 screenshots)
- [ ] iPhone 5.5" (6 screenshots)
- [ ] iPad Pro 12.9" (6 screenshots)
- [ ] Android phone (6 screenshots)
- [ ] Text overlays added
- [ ] Device frames applied
- [ ] EN and TR versions

### Video
- [ ] iOS App Preview (15-30s)
- [ ] Android promo video (YouTube)
- [ ] Captions added

### Other
- [ ] Feature graphic (1024x500)
- [ ] Social media templates
- [ ] Press kit assembled

---

*Last Updated: January 2025*
