import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
  colors,
  spacing,
  typography,
};

export type Theme = typeof theme;

export { colors, spacing, typography };
export type { Colors } from "./colors";
export type { Spacing } from "./spacing";
export type { Typography } from "./typography";
