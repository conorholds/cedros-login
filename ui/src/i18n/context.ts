import { createContext } from 'react';
import type { Translations } from './translations';

export interface I18nContextValue {
  t: Translations;
  locale: string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
