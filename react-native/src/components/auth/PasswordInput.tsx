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
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

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
    },
    ref,
  ): React.ReactElement => {
    const [isVisible, setIsVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

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
          <TouchableOpacity
            onPress={() => setIsVisible(!isVisible)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            }}
            accessibilityLabel={isVisible ? "Hide password" : "Show password"}
            accessibilityRole="button"
            testID="password-toggle"
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.primary[600],
                fontWeight: typography.weights.medium,
              }}
            >
              {isVisible ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
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
