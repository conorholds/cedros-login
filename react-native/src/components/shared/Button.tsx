import React from "react";
import {
  Pressable,
  Animated,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from "react-native";
import { useCedrosTheme } from "../../context/ThemeContext";

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const { colors, spacing, typography, radii, motion } = useCedrosTheme();
  const [scale] = React.useState(() => new Animated.Value(1));

  const animateScale = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      ...motion.springs.responsive,
      useNativeDriver: true,
    }).start();
  };

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
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => animateScale(0.975)}
      onPressOut={() => animateScale(1)}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: radii.control,
          borderWidth: variant === "outline" ? 2 : 0,
          borderColor:
            variant === "outline" ? colors.primary[600] : colors.transparent,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          ...padding,
        },
        style,
        { transform: [{ scale }] },
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
    </AnimatedPressable>
  );
}
