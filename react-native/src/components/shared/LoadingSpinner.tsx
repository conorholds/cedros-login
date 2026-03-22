import React from "react";
import { ActivityIndicator, View, ViewStyle, StyleProp } from "react-native";
import { useCedrosTheme } from "../../context/ThemeContext";

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function LoadingSpinner({
  size = "large",
  color,
  style,
  testID = "loading-spinner",
}: LoadingSpinnerProps): React.ReactElement {
  const { colors } = useCedrosTheme();
  const resolvedColor = color ?? colors.primary[600];

  return (
    <View style={[{ justifyContent: "center", alignItems: "center" }, style]}>
      <ActivityIndicator size={size} color={resolvedColor} testID={testID} />
    </View>
  );
}
