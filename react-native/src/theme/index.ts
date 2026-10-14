import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { radii } from "./radii";
import { motion } from "./motion";

export const theme = {
  colors,
  spacing,
  typography,
  radii,
  motion,
};

export type Theme = typeof theme;

export { colors, spacing, typography, radii, motion };
export type { Colors } from "./colors";
export type { Spacing } from "./spacing";
export type { Typography } from "./typography";
export type { Radii } from "./radii";
export type { Motion } from "./motion";
