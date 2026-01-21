/**
 * i18n React Hooks
 * Premium-level translation hooks with type safety
 */

import { useCallback, useMemo } from 'react';
import { useTranslation as useI18nextTranslation, Trans } from 'react-i18next';
import { LANGUAGES, LanguageCode, changeLanguage as changeLang } from './config';
import type en from './locales/en';

// ============================================
// Types
// ============================================

type TranslationKeys = typeof en;
type NestedKeyOf<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K
  : never;

export type TranslationKey = NestedKeyOf<TranslationKeys>;

interface TranslationOptions {
  /** Interpolation values */
  [key: string]: string | number | boolean | undefined;
  /** Pluralization count */
  count?: number;
  /** Default value if key not found */
  defaultValue?: string;
}

// ============================================
// Main Translation Hook
// ============================================

/**
 * Enhanced useTranslation hook with type safety
 */
export function useTranslation() {
  const { t, i18n, ready } = useI18nextTranslation();

  /**
   * Translate a key with optional interpolation
   */
  const translate = useCallback(
    (key: string, options?: TranslationOptions): string => {
      return t(key, options);
    },
    [t]
  );

  /**
   * Current language code
   */
  const currentLanguage = i18n.language as LanguageCode;

  /**
   * Check if current language is RTL
   */
  const isRTL = useMemo(() => {
    return LANGUAGES[currentLanguage]?.rtl ?? false;
  }, [currentLanguage]);

  /**
   * Get available languages
   */
  const availableLanguages = useMemo(() => {
    return Object.entries(LANGUAGES).map(([code, info]) => ({
      code: code as LanguageCode,
      ...info,
    }));
  }, []);

  /**
   * Change language
   */
  const changeLanguage = useCallback(async (language: LanguageCode) => {
    await changeLang(language);
  }, []);

  /**
   * Format a date based on current locale
   */
  const formatDate = useCallback(
    (date: Date | string, format: 'short' | 'long' = 'short'): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';

      const options: Intl.DateTimeFormatOptions =
        format === 'long'
          ? { year: 'numeric', month: 'long', day: 'numeric' }
          : { year: 'numeric', month: '2-digit', day: '2-digit' };

      return dateObj.toLocaleDateString(locale, options);
    },
    [currentLanguage]
  );

  /**
   * Format a time based on current locale
   */
  const formatTime = useCallback(
    (date: Date | string, format: 'short' | 'long' = 'short'): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';

      const options: Intl.DateTimeFormatOptions =
        format === 'long'
          ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
          : { hour: '2-digit', minute: '2-digit' };

      return dateObj.toLocaleTimeString(locale, options);
    },
    [currentLanguage]
  );

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = useCallback(
    (date: Date | string): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) {
        return t('time.justNow');
      }
      if (diffMinutes < 60) {
        return t('time.minutesAgo', { count: diffMinutes });
      }
      if (diffHours < 24) {
        return t('time.hoursAgo', { count: diffHours });
      }
      return t('time.daysAgo', { count: diffDays });
    },
    [t]
  );

  /**
   * Format a number based on current locale
   */
  const formatNumber = useCallback(
    (num: number, options?: Intl.NumberFormatOptions): string => {
      const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
      return num.toLocaleString(locale, options);
    },
    [currentLanguage]
  );

  /**
   * Format a percentage
   */
  const formatPercent = useCallback(
    (value: number, decimals = 0): string => {
      const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
      return (value / 100).toLocaleString(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
    [currentLanguage]
  );

  /**
   * Format duration in human readable format
   */
  const formatDuration = useCallback(
    (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      const parts: string[] = [];

      if (hours > 0) {
        parts.push(t('time.hours', { count: hours }));
      }
      if (minutes > 0) {
        parts.push(t('time.minutes', { count: minutes }));
      }
      if (secs > 0 && hours === 0) {
        parts.push(t('time.seconds', { count: secs }));
      }

      return parts.join(' ');
    },
    [t]
  );

  return {
    // Core translation function
    t: translate,

    // Language info
    language: currentLanguage,
    isRTL,
    ready,
    availableLanguages,

    // Actions
    changeLanguage,

    // Formatters
    formatDate,
    formatTime,
    formatRelativeTime,
    formatNumber,
    formatPercent,
    formatDuration,

    // Re-export Trans component for complex translations
    Trans,
  };
}

// ============================================
// Specialized Hooks
// ============================================

/**
 * Hook for language selection UI
 */
export function useLanguageSelector() {
  const { language, availableLanguages, changeLanguage } = useTranslation();

  const currentLanguageInfo = useMemo(() => {
    return LANGUAGES[language];
  }, [language]);

  return {
    currentLanguage: language,
    currentLanguageInfo,
    languages: availableLanguages,
    selectLanguage: changeLanguage,
  };
}

/**
 * Hook for getting greeting based on time of day
 */
export function useGreeting() {
  const { t } = useTranslation();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return t('home.greeting.morning');
    }
    if (hour >= 12 && hour < 17) {
      return t('home.greeting.afternoon');
    }
    if (hour >= 17 && hour < 21) {
      return t('home.greeting.evening');
    }
    return t('home.greeting.night');
  }, [t]);

  return greeting;
}

/**
 * Hook for error messages
 */
export function useErrorMessages() {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      generic: t('errors.generic'),
      network: t('errors.network'),
      storage: t('errors.storage'),
      notificationPermission: t('errors.notificationPermission'),
      somethingWentWrong: t('errors.somethingWentWrong'),
      tryAgain: t('errors.tryAgain'),
      contactSupport: t('errors.contactSupport'),
    }),
    [t]
  );
}

// ============================================
// Export
// ============================================

export { Trans };
export default useTranslation;
