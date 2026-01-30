import { ThemeMode, ThemeOverrides } from '../types';
export interface UseThemeManagerOptions {
    theme?: ThemeMode;
    themeOverrides?: ThemeOverrides;
}
/**
 * Hook that manages theme application to the document root.
 * Handles light/dark/auto themes and custom CSS variable overrides.
 * Properly cleans up styles on unmount to prevent memory leaks.
 */
export declare function useThemeManager({ theme, themeOverrides }: UseThemeManagerOptions): void;
