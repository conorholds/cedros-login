import React, { useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  containerStyle,
  testID = "otp-input",
}: OtpInputProps): React.ReactElement {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0] && value.length === 0) {
      inputRefs.current[0]?.focus();
    }
  }, [value.length]);

  const handleChange = (text: string, index: number) => {
    if (disabled) return;

    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");

    if (numericText.length > 1) {
      // Handle paste - distribute across inputs
      const newValue = numericText.slice(0, length);
      onChange(newValue);

      // Focus the appropriate input
      const focusIndex = Math.min(newValue.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    } else {
      // Update the value at this position
      const newValue = value.split("");
      newValue[index] = numericText;
      const newValueStr = newValue.join("").slice(0, length);
      onChange(newValueStr);

      // Auto-focus next input if current has value
      if (numericText && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (
    event: { nativeEvent: { key: string } },
    index: number,
  ) => {
    if (disabled) return;

    if (event.nativeEvent.key === "Backspace") {
      if (!value[index] && index > 0) {
        // If current input is empty, move to previous and clear it
        const newValue = value.split("");
        newValue[index - 1] = "";
        onChange(newValue.join("").slice(0, length));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join("").slice(0, length));
      }
    }
  };

  const handleFocus = (index: number) => {
    // Select all text in the input
    inputRefs.current[index]?.setNativeProps({
      selection: { start: 0, end: 1 },
    });
  };

  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "center",
          gap: spacing.sm,
        },
        containerStyle,
      ]}
      testID={testID}
    >
      {Array.from({ length }, (_, index) => (
        <TouchableOpacity
          key={index}
          activeOpacity={1}
          onPress={() => inputRefs.current[index]?.focus()}
          style={{
            width: 48,
            height: 56,
            borderRadius: 8,
            borderWidth: 2,
            borderColor:
              value[index] && !disabled
                ? colors.primary[600]
                : colors.gray[300],
            backgroundColor: disabled ? colors.gray[100] : colors.white,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextInput
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            value={value[index] || ""}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!disabled}
            selectTextOnFocus
            style={{
              fontSize: typography.sizes["2xl"],
              fontWeight: typography.weights.bold,
              color: disabled ? colors.gray[400] : colors.gray[900],
              textAlign: "center",
              width: "100%",
              height: "100%",
              padding: 0,
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
