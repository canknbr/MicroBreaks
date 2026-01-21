/**
 * i18n Module - Main Export
 * Premium-level internationalization infrastructure
 */

// Configuration
export {
  default as i18n,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getDeviceLanguage,
  getStoredLanguage,
  storeLanguage,
  changeLanguage,
  type LanguageCode,
} from './config';

// Hooks
export {
  useTranslation,
  useLanguageSelector,
  useGreeting,
  useErrorMessages,
  Trans,
  type TranslationKey,
} from './hooks';

// Re-export locales for direct access if needed
export { default as enTranslations } from './locales/en';
export { default as trTranslations } from './locales/tr';
