/**
 * Legal Content Constants
 * Privacy Policy and Terms of Service text
 */

export const PRIVACY_POLICY = `# Privacy Policy

**Last updated: May 2026**

## 1. Introduction

Unwind ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.

## 2. Information We Collect

### 2.1 Automatically Collected
- **Anonymous User ID**: A randomly generated identifier created via Firebase Anonymous Authentication. This is not linked to your real identity.
- **Device Information**: Device type, operating system version, and app version for crash reporting.
- **Usage Analytics**: Anonymous usage patterns such as which features you use, break completion rates, and session durations. Collected via Firebase Analytics.

### 2.2 User-Provided
- **Display Name**: An optional name you choose within the app.
- **Break History**: Records of completed break exercises, stored locally and optionally synced to the cloud.
- **Preferences**: Your app settings, notification preferences, and exercise preferences.
- **Onboarding Responses**: Work role, screen time habits, and pain area selections used to personalize recommendations.

### 2.3 What We Do NOT Collect
- Real names, email addresses, or phone numbers to use the core app experience
- Location data
- Contacts, photos, or other device data
- Health or medical data

## 3. How We Use Your Information

- **App Functionality**: To provide personalized break recommendations, track your progress, and maintain streaks.
- **Cloud Sync**: To synchronize your data across devices via Firebase Firestore (optional).
- **Push Notifications**: To send break reminders and streak alerts via Firebase Cloud Messaging (optional).
- **Crash Reporting**: To identify and fix bugs via Firebase Crashlytics.
- **Analytics**: To understand usage patterns and improve the app via Firebase Analytics.

## 4. Data Storage & Security

- Local data is stored on your device using AsyncStorage.
- Cloud data is stored in Firebase Firestore with security rules that ensure only you can access your own data.
- All data transmission uses HTTPS encryption.
- Firebase infrastructure is certified under ISO 27001, SOC 1/2/3, and other standards.

## 5. Data Retention

- Local data persists until you delete the app or clear app data.
- Cloud data is retained until you delete your account.
- Analytics data is retained for 14 months by Firebase Analytics.
- Crash reports are retained for 90 days by Firebase Crashlytics.

## 6. Your Rights

You have the right to:
- **Access**: View all your data within the app.
- **Export**: Download all your data as a JSON file via Profile > Download My Data.
- **Delete**: Permanently delete your account and all associated data via Profile > Delete Account.

## 7. Third-Party Services

We use the following third-party services:
- **Firebase** (Google): Authentication, Firestore, Analytics, Crashlytics, Cloud Messaging
- **Expo**: App framework and push notification infrastructure

## 7.1 Advertising & Tracking

Unwind does **not** use the Identifier for Advertisers (IDFA) and does **not** track you across other apps or websites. We do not participate in ad networks or share data with advertisers. Firebase Analytics collects anonymous usage data only within our app and does not link it to your identity or activities in other apps. Because we do not engage in tracking as defined by Apple's App Tracking Transparency framework, you will not be prompted with a tracking permission request.

## 8. Children's Privacy

Unwind is not intended for children under 13. We do not knowingly collect data from children.

## 9. Changes to This Policy

We may update this policy from time to time. Changes will be reflected in the "Last updated" date above.

## 10. Contact

For privacy-related inquiries, please contact us at:
**privacy@microbreaks.app**
`;

export const TERMS_OF_SERVICE = `# Terms of Service

**Last updated: May 2026**

## 1. Acceptance of Terms

By downloading, installing, or using Unwind ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the App.

## 2. Description of Service

Unwind is a wellness application that provides guided micro-break exercises, focus timers, and progress tracking to help reduce the negative effects of prolonged screen time and sedentary work.

## 3. User Accounts

- The App uses anonymous authentication. No personal information is required to create an account.
- You are responsible for maintaining the security of your device.
- You may delete your account at any time via the app settings.

## 4. Acceptable Use

You agree not to:
- Use the App for any illegal purpose.
- Attempt to reverse engineer, decompile, or disassemble the App.
- Interfere with or disrupt the App's infrastructure.
- Use the App in a way that could harm yourself or others.

## 5. Health Disclaimer

- Unwind provides general wellness exercises and is NOT a medical device or service.
- The exercises and recommendations are for informational purposes only.
- Always consult a healthcare professional before starting any exercise program.
- Stop any exercise immediately if you experience pain or discomfort.
- We are not responsible for any injuries resulting from the use of the App.

## 6. Intellectual Property

- The App, including its code, design, content, and exercises, is owned by Unwind, except for the third-party content identified below.
- Movement-library demonstration media (exercise animations and thumbnails) is © Gym visual — https://gymvisual.com/ — and is used with attribution at 180×180 resolution. Movement names, categories, and instruction text derive from the MIT-licensed open exercises dataset.
- You are granted a limited, non-exclusive, non-transferable license to use the App for personal, non-commercial purposes.

## 7. Disclaimer of Warranties

THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.

## 8. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP.

## 9. Modifications

We reserve the right to modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the modified Terms.

## 10. Termination

We may terminate or suspend your access to the App at any time, without notice, for conduct that we believe violates these Terms.

## 11. Governing Law

These Terms shall be governed by and construed in accordance with the laws of the Republic of Turkey, without regard to conflict of law principles.

## 12. Contact

For questions about these Terms, please contact us at:
**legal@microbreaks.app**
`;
