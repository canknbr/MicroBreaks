/**
 * Icon Types
 * Type-safe icon name definitions for @expo/vector-icons
 */

import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

// Extract the icon name type from Ionicons
export type IoniconsName = ComponentProps<typeof Ionicons>['name'];

// Common icon names used in the app for type safety
export const ICON_NAMES = {
  // Navigation
  home: 'home' as IoniconsName,
  homeOutline: 'home-outline' as IoniconsName,
  settings: 'settings' as IoniconsName,
  settingsOutline: 'settings-outline' as IoniconsName,
  person: 'person' as IoniconsName,
  personOutline: 'person-outline' as IoniconsName,

  // Actions
  close: 'close' as IoniconsName,
  chevronForward: 'chevron-forward' as IoniconsName,
  chevronBack: 'chevron-back' as IoniconsName,
  arrowForward: 'arrow-forward' as IoniconsName,

  // Status
  notifications: 'notifications' as IoniconsName,
  notificationsOutline: 'notifications-outline' as IoniconsName,
  alarm: 'alarm' as IoniconsName,
  time: 'time' as IoniconsName,
  flame: 'flame' as IoniconsName,
  flag: 'flag' as IoniconsName,
  moon: 'moon' as IoniconsName,
  sunny: 'sunny' as IoniconsName,

  // Content
  star: 'star' as IoniconsName,
  starOutline: 'star-outline' as IoniconsName,
  trophy: 'trophy' as IoniconsName,
  sparkles: 'sparkles' as IoniconsName,
  bulb: 'bulb' as IoniconsName,
  alertCircle: 'alert-circle' as IoniconsName,

  // Preferences
  colorPalette: 'color-palette' as IoniconsName,
  volumeHigh: 'volume-high' as IoniconsName,
  phonePortrait: 'phone-portrait' as IoniconsName,
  mic: 'mic' as IoniconsName,

  // About
  helpCircle: 'help-circle' as IoniconsName,
  shieldCheckmark: 'shield-checkmark' as IoniconsName,
  documentText: 'document-text' as IoniconsName,
  informationCircle: 'information-circle' as IoniconsName,

  // Other
  cloudOffline: 'cloud-offline' as IoniconsName,
  pencil: 'pencil' as IoniconsName,
} as const;
