import React from "react";
import { View, Text, ViewStyle, TextStyle, StyleProp } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { DisplayError } from "../../types";

export interface ErrorMessageProps {
  error: DisplayError;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export function ErrorMessage({
  error,
  style,
  textStyle,
  testID = "error-message",
}: ErrorMessageProps): React.ReactElement | null {
  if (!error) {
    return null;
  }

  const message = typeof error === "string" ? error : error.message;

  return (
    <View
      style={[
        {
          backgroundColor: colors.error + "20",
          borderRadius: 8,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.error,
        },
        style,
      ]}
      testID={testID}
    >
      <Text
        style={[
          {
            color: colors.error,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
          },
          textStyle,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}
