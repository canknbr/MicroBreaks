# Deep Linking Configuration

Universal Links (iOS) and App Links (Android) setup for MicroBreaks.

---

## URL Scheme

### Custom URL Scheme
```
microbreaks://
```

### Supported Deep Links

| Path | Description | Example |
|------|-------------|---------|
| `/` | Open app home | `microbreaks://` |
| `/break` | Start a break | `microbreaks://break` |
| `/break/:category` | Start specific category | `microbreaks://break/eyes` |
| `/settings` | Open settings | `microbreaks://settings` |
| `/profile` | Open profile | `microbreaks://profile` |
| `/exercise/:id` | Start specific exercise | `microbreaks://exercise/eye-roll` |

---

## Universal Links (iOS)

### apple-app-site-association

Host this file at: `https://microbreaks.app/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.cankanbur.MicroBreaks",
        "paths": [
          "/break",
          "/break/*",
          "/exercise/*",
          "/settings",
          "/profile",
          "/share/*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": [
      "TEAM_ID.com.cankanbur.MicroBreaks"
    ]
  }
}
```

### iOS Configuration

In `app.json`:
```json
{
  "expo": {
    "ios": {
      "associatedDomains": [
        "applinks:microbreaks.app",
        "webcredentials:microbreaks.app"
      ]
    }
  }
}
```

---

## App Links (Android)

### assetlinks.json

Host this file at: `https://microbreaks.app/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.cankanbur.MicroBreaks",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

### Getting SHA256 Fingerprint

```bash
# For debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For EAS managed credentials
eas credentials -p android
```

### Android Configuration

In `app.json`:
```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "microbreaks.app",
              "pathPrefix": "/break"
            },
            {
              "scheme": "https",
              "host": "microbreaks.app",
              "pathPrefix": "/exercise"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## Implementation

### Link Handler

```typescript
// app/_layout.tsx or root component
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }
    };

    // Handle incoming URLs
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    const { path, queryParams } = Linking.parse(url);

    switch (path) {
      case 'break':
        router.push('/break-session');
        break;
      case 'break/eyes':
        router.push('/break-session?category=eyes');
        break;
      case 'settings':
        router.push('/(tabs)/settings');
        break;
      case 'profile':
        router.push('/(tabs)/profile');
        break;
      default:
        // Handle unknown paths
        break;
    }
  };

  return (
    // ... layout content
  );
}
```

### Create Shareable Links

```typescript
import * as Linking from 'expo-linking';

export const createShareableLink = (path: string): string => {
  // Use universal link for sharing
  return `https://microbreaks.app${path}`;
};

export const createDeepLink = (path: string): string => {
  // Use custom scheme for internal navigation
  return Linking.createURL(path);
};

// Usage
const shareLink = createShareableLink('/break/eyes');
// Result: https://microbreaks.app/break/eyes

const internalLink = createDeepLink('break/eyes');
// Result: microbreaks://break/eyes
```

---

## Share Functionality

### Share Current Exercise

```typescript
import { Share } from 'react-native';

const shareExercise = async (exerciseId: string, exerciseName: string) => {
  try {
    await Share.share({
      message: `Check out this exercise on MicroBreaks: ${exerciseName}`,
      url: `https://microbreaks.app/exercise/${exerciseId}`,
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
```

### Share Achievement

```typescript
const shareAchievement = async (achievementName: string, streakCount: number) => {
  try {
    await Share.share({
      message: `I just earned "${achievementName}" on MicroBreaks! ${streakCount} day streak! 🎉`,
      url: 'https://microbreaks.app',
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
```

---

## Testing Deep Links

### iOS Simulator
```bash
# Test custom URL scheme
xcrun simctl openurl booted "microbreaks://break/eyes"

# Test universal link
xcrun simctl openurl booted "https://microbreaks.app/break/eyes"
```

### Android Emulator
```bash
# Test custom URL scheme
adb shell am start -a android.intent.action.VIEW -d "microbreaks://break/eyes"

# Test app link
adb shell am start -a android.intent.action.VIEW -d "https://microbreaks.app/break/eyes"
```

### Expo Development
```bash
# Using Expo CLI
npx uri-scheme open "microbreaks://break/eyes" --ios
npx uri-scheme open "microbreaks://break/eyes" --android
```

---

## Debugging

### Verify iOS Configuration
```bash
# Check associated domains entitlement
codesign -d --entitlements :- /path/to/app.app
```

### Verify Android Configuration
```bash
# Check intent filters
adb shell pm get-app-links com.cankanbur.MicroBreaks

# Verify domain
adb shell am start -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "https://microbreaks.app/break"
```

### Common Issues

1. **Universal links not working**
   - Check AASA file is served with `application/json` content type
   - Verify HTTPS is properly configured
   - Clear Safari cache and reinstall app

2. **App links not verified**
   - Ensure assetlinks.json is accessible
   - Verify SHA256 fingerprint matches
   - Check `autoVerify: true` in manifest

3. **Deep links open browser instead of app**
   - App may not be installed
   - Domain verification failed
   - User may have chosen "Open in Browser" previously

---

## Marketing Links

### QR Code Generation

Create QR codes for:
- App Store download: `https://microbreaks.app/download`
- Specific exercise: `https://microbreaks.app/exercise/eye-palming`
- Campaign tracking: `https://microbreaks.app/?utm_source=...`

### Campaign Tracking

```
https://microbreaks.app/download?utm_source=instagram&utm_medium=social&utm_campaign=launch
```

Track these parameters in your analytics to measure marketing effectiveness.

---

*Last Updated: January 2025*
