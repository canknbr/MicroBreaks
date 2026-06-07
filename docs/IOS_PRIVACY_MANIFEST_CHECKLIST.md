# iOS Privacy Manifest Verification

Apple now requires every app submitted to the App Store to declare every
required-reason API used by the binary, including the APIs vended by every
third-party SDK linked into it. This document records what we own and what
each SDK is expected to ship.

If Apple rejects the binary with **ITMS-91056** ("Invalid privacy manifest"),
work from the table below to find the missing manifest and update.

> **Reference:** [Required reason API list](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api)

## 1. App-owned manifest (we declare)

Defined in `app.json` → `expo.ios.privacyManifests.NSPrivacyAccessedAPITypes`:

| API Category | Reason code we declare | Where it's used in our code | OK ✓ |
|--------------|------------------------|-----------------------------|------|
| `NSPrivacyAccessedAPICategoryUserDefaults` | `CA92.1` (access info from same app group) | Zustand persist via MMKV / AsyncStorage migration adapter, i18n locale cache | ✓ |
| `NSPrivacyAccessedAPICategorySystemBootTime` | `35F9.1` (measure time intervals only on the device) | Timer service background recovery in `services/timerService.ts handleForegroundResume`, streak DST calc in `services/breakHistory.ts` | ✓ |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | `C617.1` (display to user / used by the same app) | Data export file naming in `services/data-export.ts` | ✓ |
| `NSPrivacyAccessedAPICategoryDiskSpace` | `E174.1` (write or delete files on behalf of the user) | Firestore offline persistence cache size negotiation in `services/firebase/firestore.ts` | ✓ |

If you add a screen that reads any new required-reason API directly
(e.g. accessing `UIDevice.identifierForVendor`, `NSURLSession.timeIntervalSince1970`),
add the new category + reason to `app.json` in the same PR.

## 2. Third-party SDK manifests (they declare)

For every SDK linked into the app, Apple expects the SDK itself to ship a
`PrivacyInfo.xcprivacy` resource. We do not edit those files; we verify they
are present after `pod install`.

| SDK | Source manifest location (after pod install) | Verified |
|-----|----------------------------------------------|---------|
| `@react-native-firebase/app` (FirebaseCore) | `Pods/FirebaseCore/.../PrivacyInfo.xcprivacy` | Check before each submission |
| `@react-native-firebase/analytics` (FirebaseAnalytics) | `Pods/FirebaseAnalytics/.../PrivacyInfo.xcprivacy` | Check |
| `@react-native-firebase/crashlytics` (FirebaseCrashlytics) | `Pods/FirebaseCrashlytics/.../PrivacyInfo.xcprivacy` | Check |
| `@react-native-firebase/auth` (FirebaseAuth) | `Pods/FirebaseAuth/.../PrivacyInfo.xcprivacy` | Check |
| `@react-native-firebase/firestore` (FirebaseFirestore + FirebaseFirestoreInternal) | `Pods/FirebaseFirestoreInternal/.../PrivacyInfo.xcprivacy` | Check |
| `@react-native-firebase/messaging` (FirebaseMessaging) | `Pods/FirebaseMessaging/.../PrivacyInfo.xcprivacy` | Check |
| `react-native-purchases` (RevenueCat) | `Pods/PurchasesHybridCommon/PrivacyInfo.xcprivacy` | Check |
| `expo-modules-core` | `Pods/ExpoModulesCore/.../PrivacyInfo.xcprivacy` | Check |
| `expo-notifications` | `Pods/EXNotifications/.../PrivacyInfo.xcprivacy` | Check |
| `expo-haptics` | `Pods/EXHaptics/.../PrivacyInfo.xcprivacy` | Check |
| `expo-image` | `Pods/EXImage/.../PrivacyInfo.xcprivacy` | Check |
| `expo-localization` | `Pods/EXLocalization/.../PrivacyInfo.xcprivacy` | Check |
| `expo-store-review` | `Pods/EXStoreReview/.../PrivacyInfo.xcprivacy` | Check |
| `expo-file-system` | `Pods/EXFileSystem/.../PrivacyInfo.xcprivacy` | Check |
| `react-native-mmkv` (NitroMMKV) | `Pods/NitroMmkv/.../PrivacyInfo.xcprivacy` | Check |
| `@react-native-async-storage/async-storage` | `Pods/RNAsyncStorage/.../PrivacyInfo.xcprivacy` | Check (legacy — only needed for the migration window) |
| `react-native-reanimated` | `Pods/RNReanimated/.../PrivacyInfo.xcprivacy` | Check |
| `@shopify/react-native-skia` | `Pods/RNSkia/.../PrivacyInfo.xcprivacy` | Check |

## 3. Verification ritual before each release

Add the following Xcode build phase to `ios/MicroBreaks/MicroBreaks.xcodeproj`
under **Targets → MicroBreaks → Build Phases → New Run Script Phase**:

```bash
# Privacy manifest spot-check (runs in CI release builds only)
if [ "${CONFIGURATION}" != "Release" ]; then exit 0; fi

REQUIRED_SDKS=(
  "Pods/FirebaseCore"
  "Pods/FirebaseAnalytics"
  "Pods/FirebaseCrashlytics"
  "Pods/FirebaseAuth"
  "Pods/FirebaseFirestoreInternal"
  "Pods/FirebaseMessaging"
  "Pods/PurchasesHybridCommon"
)

MISSING=()
for SDK in "${REQUIRED_SDKS[@]}"; do
  if ! find "${SRCROOT}/${SDK}" -name "PrivacyInfo.xcprivacy" -maxdepth 4 -print -quit | grep -q .; then
    MISSING+=("${SDK}")
  fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
  echo "error: Missing PrivacyInfo.xcprivacy in: ${MISSING[*]}"
  exit 1
fi
```

This fails the build locally and in CI if a SDK regresses on shipping its
manifest. Cheaper than learning about it from App Store Connect.

## 4. When ITMS-91056 hits anyway

1. Read the rejection body — it lists the missing API + reason category.
2. Search `Pods/**/PrivacyInfo.xcprivacy` for that category. The one missing
   the reason is the offender.
3. If the offender is an Expo / RN library, the fix is usually a version
   bump — Apple's enforcement started 2024-05; older SDKs ship pre-manifest
   binaries. Check the lib's CHANGELOG for "Privacy Manifest" entries.
4. If it's our own app, add the category + reason to `app.json` and rebuild.
