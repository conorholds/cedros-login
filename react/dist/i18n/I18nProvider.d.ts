import { ReactNode } from 'react';
import { Translations } from './translations';
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export interface I18nProviderProps {
    children: ReactNode;
    locale?: string;
    translations?: DeepPartial<Translations>;
}
/**
 * Provider for internationalization support.
 * Allows overriding default English translations with custom strings.
 */
export declare function I18nProvider({ children, locale, translations: customTranslations, }: I18nProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
