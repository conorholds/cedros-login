import React, { createContext, useContext, useMemo } from "react";
import { colors as defaultColors } from "../theme/colors";
import { spacing as defaultSpacing } from "../theme/spacing";
import { typography as defaultTypography } from "../theme/typography";
import type { Colors } from "../theme/colors";
import type { Spacing } from "../theme/spacing";
import type { Typography } from "../theme/typography";

/**
 * Full merged theme shape consumed by all components.
 *
 * Inputs: defaultColors/Spacing/Typography
 * Outputs: merged object via useCedrosTheme()
 */
export interface CedrosTheme {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
}

/**
 * Partial overrides accepted by CedrosThemeProvider.
 * All keys are optional — unspecified values fall back to defaults.
 */
export interface CedrosThemeOverrides {
  colors?: Partial<{
    primary: Partial<Colors["primary"]>;
    gray: Partial<Colors["gray"]>;
    success: string;
    warning: string;
    error: string;
    info: string;
    white: string;
    black: string;
    transparent: string;
  }>;
  spacing?: Partial<Spacing>;
  typography?: Partial<{
    sizes: Partial<Typography["sizes"]>;
    weights: Partial<Typography["weights"]>;
  }>;
}

const defaultTheme: CedrosTheme = {
  colors: defaultColors,
  spacing: defaultSpacing,
  typography: defaultTypography,
};

const ThemeContext = createContext<CedrosTheme>(defaultTheme);

export interface CedrosThemeProviderProps {
  overrides?: CedrosThemeOverrides;
  children: React.ReactNode;
}

/**
 * Wraps children with a merged theme. Overrides are shallowly merged
 * per sub-object (colors, spacing, typography).
 */
export function CedrosThemeProvider({
  overrides,
  children,
}: CedrosThemeProviderProps): React.ReactElement {
  const theme = useMemo((): CedrosTheme => {
    if (!overrides) return defaultTheme;

    const mergedColors: Colors = {
      ...defaultColors,
      ...overrides.colors,
      primary: {
        ...defaultColors.primary,
        ...(overrides.colors?.primary ?? {}),
      },
      gray: {
        ...defaultColors.gray,
        ...(overrides.colors?.gray ?? {}),
      },
    };

    const mergedSpacing: Spacing = {
      ...defaultSpacing,
      ...(overrides.spacing ?? {}),
    };

    const mergedTypography: Typography = {
      sizes: {
        ...defaultTypography.sizes,
        ...(overrides.typography?.sizes ?? {}),
      },
      weights: {
        ...defaultTypography.weights,
        ...(overrides.typography?.weights ?? {}),
      },
    };

    return {
      colors: mergedColors,
      spacing: mergedSpacing,
      typography: mergedTypography,
    };
  }, [overrides]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

/**
 * Returns the merged theme from the nearest CedrosThemeProvider.
 * Falls back to defaults when used outside a provider.
 */
export function useCedrosTheme(): CedrosTheme {
  return useContext(ThemeContext);
}
