import React, { useState, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { useCedrosTheme } from "../../context/ThemeContext";

export interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  editable?: boolean;
  testID?: string;
  /** Label for the show-password toggle. Default: "Show" */
  showLabel?: string;
  /** Label for the hide-password toggle. Default: "Hide" */
  hideLabel?: string;
  /** Style applied to the toggle TouchableOpacity. */
  toggleStyle?: StyleProp<ViewStyle>;
  /** Style applied to the toggle label Text. */
  toggleLabelStyle?: StyleProp<TextStyle>;
  /**
   * Render a custom toggle element.
   * When provided, the default text toggle is replaced entirely.
   *
   * @param visible - whether the password is currently visible
   * @param onToggle - call to toggle visibility
   */
  renderToggle?: (visible: boolean, onToggle: () => void) => React.ReactNode;
}

export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(
  (
    {
      label,
      placeholder = "Enter password",
      value,
      onChangeText,
      error,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      editable = true,
      testID = "password-input",
      showLabel = "Show",
      hideLabel = "Hide",
      toggleStyle,
      toggleLabelStyle,
      renderToggle,
    },
    ref,
  ): React.ReactElement => {
    const { colors, spacing, typography } = useCedrosTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleToggle = () => setIsVisible((v) => !v);

    const defaultToggle = (
      <TouchableOpacity
        onPress={handleToggle}
        style={[
          {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
          toggleStyle,
        ]}
        accessibilityLabel={isVisible ? "Hide password" : "Show password"}
        accessibilityRole="button"
        testID="password-toggle"
      >
        <Text
          style={[
            {
              fontSize: typography.sizes.sm,
              color: colors.primary[600],
              fontWeight: typography.weights.medium,
            },
            toggleLabelStyle,
          ]}
        >
          {isVisible ? hideLabel : showLabel}
        </Text>
      </TouchableOpacity>
    );

    return (
      <View style={[{ width: "100%" }, containerStyle]} testID={testID}>
        {label && (
          <Text
            style={[
              {
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.medium,
                color: colors.gray[700],
                marginBottom: spacing.xs,
              },
              labelStyle,
            ]}
          >
            {label}
          </Text>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: editable ? colors.white : colors.gray[100],
            borderWidth: 1,
            borderColor: error
              ? colors.error
              : isFocused
                ? colors.primary[500]
                : colors.gray[300],
            borderRadius: 8,
          }}
        >
          <TextInput
            ref={ref}
            style={[
              {
                flex: 1,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                fontSize: typography.sizes.base,
                color: editable ? colors.gray[900] : colors.gray[500],
              },
              inputStyle,
            ]}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={!isVisible}
            placeholder={placeholder}
            placeholderTextColor={colors.gray[400]}
            editable={editable}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            accessibilityLabel={label || "Password input"}
            accessibilityHint={
              isVisible ? "Password is visible" : "Password is hidden"
            }
          />
          {renderToggle
            ? renderToggle(isVisible, handleToggle)
            : defaultToggle}
        </View>
        {error && (
          <Text
            style={[
              {
                fontSize: typography.sizes.xs,
                color: colors.error,
                marginTop: spacing.xs,
              },
              errorStyle,
            ]}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
