import React from "react";
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID = "button",
}: ButtonProps): React.ReactElement {
  const getBackgroundColor = (): string => {
    if (disabled || loading) {
      return colors.gray[300];
    }
    switch (variant) {
      case "primary":
        return colors.primary[600];
      case "secondary":
        return colors.gray[200];
      case "outline":
        return colors.transparent;
      case "ghost":
        return colors.transparent;
      default:
        return colors.primary[600];
    }
  };

  const getTextColor = (): string => {
    if (disabled || loading) {
      return colors.gray[500];
    }
    switch (variant) {
      case "primary":
        return colors.white;
      case "secondary":
        return colors.gray[800];
      case "outline":
        return colors.primary[600];
      case "ghost":
        return colors.primary[600];
      default:
        return colors.white;
    }
  };

  const getPadding = (): {
    paddingVertical: number;
    paddingHorizontal: number;
  } => {
    switch (size) {
      case "sm":
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case "lg":
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case "sm":
        return typography.sizes.sm;
      case "lg":
        return typography.sizes.lg;
      default:
        return typography.sizes.base;
    }
  };

  const padding = getPadding();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: 8,
          borderWidth: variant === "outline" ? 2 : 0,
          borderColor:
            variant === "outline" ? colors.primary[600] : colors.transparent,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          ...padding,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={{ marginRight: spacing.sm }}
        />
      )}
      <Text
        style={[
          {
            color: getTextColor(),
            fontSize: getFontSize(),
            fontWeight: typography.weights.semibold,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
