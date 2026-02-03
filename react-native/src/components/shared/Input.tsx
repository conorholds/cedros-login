import React, { useState, forwardRef } from "react";
import {
  TextInput,
  View,
  Text,
  ViewStyle,
  TextStyle,
  TextInputProps,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      secureTextEntry,
      testID = "input",
      ...textInputProps
    },
    ref,
  ): React.ReactElement => {
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
        <TextInput
          ref={ref}
          style={[
            {
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: error
                ? colors.error
                : isFocused
                  ? colors.primary[500]
                  : colors.gray[300],
              borderRadius: 8,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              fontSize: typography.sizes.base,
              color: colors.gray[900],
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.gray[400]}
          secureTextEntry={secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />
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

Input.displayName = "Input";
