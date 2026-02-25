/**
 * Firebase Services - Main Export
 */

export { initializeFirebase } from './config';
export { crashlyticsService, initializeCrashlytics } from './crashlytics-adapter';
export { initializeAuth, getCurrentUser, getCurrentUserId, onAuthStateChanged, signOut } from './auth';
export { initializeFirestore, getUserDoc, getBreaksCollection } from './firestore';
export { registerForPushNotifications, onTokenRefresh } from './messaging';
