import { Translations } from './translations';
export interface I18nContextValue {
    t: Translations;
    locale: string;
}
export declare const I18nContext: import('react').Context<I18nContextValue | null>;
