import { useCedrosLogin } from '../context/useCedrosLogin';
import { useThemeManager } from './useThemeManager';
import type { ThemeMode, ThemeOverrides } from '../types';

/**
 * Theme state exposed to consumers for custom theming.
 */
export interface UseCedrosThemeReturn {
  /** Current theme mode: 'light', 'dark', or 'auto' */
  mode: ThemeMode;
  /** Whether dark mode is currently active */
  isDark: boolean;
  /** CSS class name for the current theme (e.g. 'cedros-dark' or '') */
  className: string;
  /** Inline style object with CSS variable overrides */
  style: React.CSSProperties;
  /** Whether `unstyled` mode is active (no default cedros styles) */
  unstyled: boolean;
  /** The resolved theme overrides from config */
  overrides: ThemeOverrides | undefined;
}

/**
 * Hook exposing the current cedros-login theme state.
 *
 * Use this to read theme values and apply them to custom components
 * that need to match the cedros-login theme.
 *
 * @example
 * ```tsx
 * function MyCustomCard() {
 *   const { isDark, className, style } = useCedrosTheme();
 *   return (
 *     <div className={className} style={style}>
 *       {isDark ? 'Dark mode' : 'Light mode'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCedrosTheme(): UseCedrosThemeReturn {
  const { config } = useCedrosLogin();

  const mode = config.theme ?? 'auto';
  const isUnstyled = config.unstyled ?? false;
  const themeResult = useThemeManager({
    theme: isUnstyled ? undefined : mode,
    themeOverrides: isUnstyled ? undefined : config.themeOverrides,
  });

  return {
    mode,
    isDark: themeResult.className === 'cedros-dark',
    className: themeResult.className,
    style: themeResult.style,
    unstyled: isUnstyled,
    overrides: config.themeOverrides,
  };
}
