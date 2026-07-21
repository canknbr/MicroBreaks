/**
 * Base color + font constants — "Outsiders" redesign (dark-only).
 * Consumed by the Expo-template ThemedText/ThemedView + navigation chrome.
 * Both schemes point at the same dark palette so the app is dark-only.
 */

import { Platform } from 'react-native';

const tint = '#FF2472'; // brand pink

const scheme = {
  text: '#FFFFFF',
  background: '#0C0B0F',
  tint,
  icon: '#9A98A3',
  tabIconDefault: '#9A98A3',
  tabIconSelected: tint,
};

export const Colors = {
  light: scheme,
  dark: scheme,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'GeneralSans-Regular',
    serif: 'GeneralSans-Semibold',
    rounded: 'GeneralSans-Medium',
    mono: 'JetBrainsMono-Regular',
  },
  default: {
    sans: 'GeneralSans-Regular',
    serif: 'GeneralSans-Semibold',
    rounded: 'GeneralSans-Medium',
    mono: 'JetBrainsMono-Regular',
  },
  web: {
    sans: "'General Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "'General Sans', Georgia, 'Times New Roman', serif",
    rounded: "'General Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  },
});
