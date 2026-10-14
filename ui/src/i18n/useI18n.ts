import { useContext } from 'react';
import { I18nContext } from './context';
import { defaultTranslations } from './defaultTranslations';
import type { Translations } from './translations';
import {
  formatDate,
  formatDateTime,
  formatMessage,
  formatNumber,
  formatRelativeDays,
  localeCompare,
  localizePath,
  type MessageValues,
} from './formatters';

/**
 * Hook to access translations
 */
export function useTranslations(): Translations {
  const context = useContext(I18nContext);
  return context?.t ?? defaultTranslations;
}

/**
 * Hook to access current locale
 */
export function useLocale(): string {
  const context = useContext(I18nContext);
  return context?.locale ?? 'en';
}

export function useI18n() {
  const t = useTranslations();
  const locale = useLocale();

  return {
    t,
    locale,
    message: (message: string, values?: MessageValues) => formatMessage(message, values, locale),
    number: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, locale, options),
    date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(value, locale, options),
    dateTime: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDateTime(value, locale, options),
    relativeDays: (dayOffset: number, options?: Intl.RelativeTimeFormatOptions) =>
      formatRelativeDays(dayOffset, locale, options),
    compare: (left: string, right: string) => localeCompare(locale, left, right),
    path: (path: string, defaultLocale?: string) => localizePath(path, locale, defaultLocale),
  };
}
