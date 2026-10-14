import { useMemo, type ReactNode } from 'react';
import { I18nContext } from './context';
import { defaultTranslations } from './defaultTranslations';
import { normalizeLocale } from './formatters';
import { mergeTranslations, type DeepPartial, type Translations } from './translations';

export interface I18nProviderProps {
  children: ReactNode;
  locale?: string;
  translations?: DeepPartial<Translations>;
}

/**
 * Provider for internationalization support.
 * Allows overriding default English translations with custom strings.
 */
export function I18nProvider({
  children,
  locale = 'en',
  translations: customTranslations,
}: I18nProviderProps) {
  const value = useMemo(() => {
    const normalizedLocale = normalizeLocale(locale);
    const t = customTranslations
      ? mergeTranslations(defaultTranslations, customTranslations)
      : defaultTranslations;

    return { t, locale: normalizedLocale };
  }, [customTranslations, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
