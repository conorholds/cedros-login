import React from "react";
import { ActivityIndicator, View, ViewStyle, StyleProp } from "react-native";
import { colors } from "../../theme/colors";

export interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function LoadingSpinner({
  size = "large",
  color = colors.primary[600],
  style,
  testID = "loading-spinner",
}: LoadingSpinnerProps): React.ReactElement {
  return (
    <View style={[{ justifyContent: "center", alignItems: "center" }, style]}>
      <ActivityIndicator size={size} color={color} testID={testID} />
    </View>
  );
}
