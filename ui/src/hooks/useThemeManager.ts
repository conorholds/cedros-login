import { useExternalEffect } from './effects';
import { useMemo } from 'react';
import { useSystemPrefersDark } from './useSystemColorScheme';
import type { ThemeMode, ThemeOverrides } from '../types';

export interface UseThemeManagerOptions {
  theme?: ThemeMode;
  themeOverrides?: ThemeOverrides;
  /**
   * Mirror the resolved dark class onto document.documentElement (for portals
   * and modals rendered outside the wrapper). Default true. Embedded surfaces
   * (host runtime blocks) pass false so an embedded form never mutates the
   * host page's root element.
   */
  applyThemeToDocument?: boolean;
}

/**
 * Consumer theme keys this package has had to give up, mapped to their current
 * name. `--cedros-success-light` collides with the Cedros theme kernel, which
 * emits it as a mode-scoped brand color; our pale success wash moved to the
 * package namespace. Forwarding here keeps existing `themeOverrides` working.
 */
const RENAMED_THEME_TOKENS: Readonly<Record<string, string>> = {
  '--cedros-success-light': '--cedros-login-success-soft',
};

export interface ThemeResult {
  /** CSS class name to apply to the wrapper element (e.g. "cedros-dark") */
  className: string;
  /** Inline style object with CSS variable overrides */
  style: React.CSSProperties;
}

/**
 * Reference count for the cedros-dark class on document.documentElement.
 * Prevents one provider from removing the class while another still needs it.
 * We still apply to documentElement for components that render outside
 * the provider wrapper (e.g., portals, modals).
 */
let darkModeRefCount = 0;

/** @internal Reset ref count between tests */
export function _resetDarkModeRefCount(): void {
  darkModeRefCount = 0;
}

/**
 * Hook that resolves theme into a className + inline style for a wrapper element.
 *
 * Returns both a class name (e.g. "cedros-dark") and an inline style object
 * containing CSS variable overrides. The caller MUST apply both to the SAME
 * DOM element so that inline styles beat class-selector-based variable
 * declarations (CSS specificity: inline > class).
 *
 * Also continues to apply the dark class to document.documentElement for
 * components rendered outside the wrapper (portals, modals).
 */
export function useThemeManager({
  theme,
  themeOverrides,
  applyThemeToDocument = true,
}: UseThemeManagerOptions): ThemeResult {
  // Determine dark mode; system preference is tracked live (OS theme switches
  // re-resolve without a reload).
  const systemPrefersDark = useSystemPrefersDark();
  const wantsDark = theme === 'dark' || (theme !== 'light' && systemPrefersDark);

  // Apply/remove cedros-dark on documentElement for portals/modals
  useExternalEffect(() => {
    if (typeof document === 'undefined') return;
    if (!applyThemeToDocument) return;

    const root = document.documentElement;
    let addedRef = false;

    if (wantsDark) {
      darkModeRefCount++;
      addedRef = true;
      root.classList.add('cedros-dark');
    } else if (darkModeRefCount === 0) {
      root.classList.remove('cedros-dark');
    }

    return () => {
      if (addedRef) {
        darkModeRefCount--;
        if (darkModeRefCount === 0) {
          root.classList.remove('cedros-dark');
        }
      }
    };
  }, [wantsDark, applyThemeToDocument]);

  // Build the class name for the wrapper
  const className = wantsDark ? 'cedros-dark' : '';

  // Build inline style with CSS variable overrides
  const style = useMemo<React.CSSProperties>(() => {
    if (!themeOverrides) return {};
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(themeOverrides)) {
      if (value) {
        result[key] = value;
        const renamed = RENAMED_THEME_TOKENS[key];
        // Keep the legacy key working without letting it win over an explicit
        // value for the current name, whichever order they were declared in.
        if (renamed && !themeOverrides[renamed]) {
          result[renamed] = value;
        }
      }
    }
    return result as React.CSSProperties;
  }, [themeOverrides]);

  return { className, style };
}
