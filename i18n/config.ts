/**
 * i18n Configuration
 * Premium-level internationalization setup with expo-localization + i18next
 */

import i18n, { InitOptions, Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './locales/en';
import tr from './locales/tr';

// ============================================
// Configuration Constants
// ============================================

export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', rtl: false },
  tr: { name: 'Turkish', nativeName: 'Turkce', rtl: false },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const FALLBACK_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'microbreaks-language';

// ============================================
// Language Detection
// ============================================

/**
 * Get device locale code (first 2 characters)
 */
export function getDeviceLanguage(): LanguageCode {
  const locale = Localization.getLocales()[0];
  if (!locale) return DEFAULT_LANGUAGE;

  const languageCode = locale.languageCode?.toLowerCase() as LanguageCode;

  // Check if we support this language
  if (languageCode && LANGUAGES[languageCode]) {
    return languageCode;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get stored language preference
 */
export async function getStoredLanguage(): Promise<LanguageCode | null> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && LANGUAGES[stored as LanguageCode]) {
      return stored as LanguageCode;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Store language preference
 */
export async function storeLanguage(language: LanguageCode): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to store language preference:', error);
  }
}

// ============================================
// Resources
// ============================================

const resources: Resource = {
  en: { translation: en },
  tr: { translation: tr },
};

// ============================================
// Language Detector Plugin
// ============================================

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // First check stored preference
      const storedLanguage = await getStoredLanguage();
      if (storedLanguage) {
        callback(storedLanguage);
        return;
      }

      // Fall back to device language
      const deviceLanguage = getDeviceLanguage();
      callback(deviceLanguage);
    } catch {
      callback(DEFAULT_LANGUAGE);
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await storeLanguage(language as LanguageCode);
    } catch {
      // Ignore storage errors
    }
  },
};

// ============================================
// i18n Configuration Options
// ============================================

const i18nConfig: InitOptions = {
  compatibilityJSON: 'v4',
  resources,
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: Object.keys(LANGUAGES),
  ns: ['translation'],
  defaultNS: 'translation',

  interpolation: {
    escapeValue: false, // React already escapes
    formatSeparator: ',',
    format: (value, format, _lng) => {
      if (format === 'uppercase') return value?.toUpperCase();
      if (format === 'lowercase') return value?.toLowerCase();
      if (format === 'capitalize') {
        return value?.charAt(0).toUpperCase() + value?.slice(1);
      }
      return value;
    },
  },

  react: {
    useSuspense: false, // Disable suspense for React Native
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
  },

  // Debug in development
  debug: __DEV__,

  // Caching
  load: 'languageOnly', // Don't load region-specific (en-US, just en)

  // Missing key handling
  saveMissing: __DEV__,
  missingKeyHandler: (lngs, _ns, key, _fallbackValue) => {
    if (__DEV__) {
      console.warn(`[i18n] Missing translation: ${key} in ${lngs.join(', ')}`);
    }
  },
};

// ============================================
// Initialize i18n
// ============================================

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

// ============================================
// Language Change Helper
// ============================================

export async function changeLanguage(language: LanguageCode): Promise<void> {
  if (!LANGUAGES[language]) {
    console.warn(`[i18n] Unsupported language: ${language}`);
    return;
  }

  await i18n.changeLanguage(language);
  await storeLanguage(language);
}

// ============================================
// Export
// ============================================

export default i18n;
