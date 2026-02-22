import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Input } from "../shared/Input";
import { Button } from "../shared/Button";
import { ErrorMessage } from "../shared/ErrorMessage";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

import { useEmailAuth } from "../../hooks/useEmailAuth";
import { validateEmail, validatePassword } from "../../utils/validation";

export interface EmailLoginFormProps {
  onSuccess?: () => void;
  onRegisterPress?: () => void;
  onForgotPasswordPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function EmailLoginForm({
  onSuccess,
  onRegisterPress,
  onForgotPasswordPress,
  containerStyle,
  testID = "email-login-form",
}: EmailLoginFormProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const { login, isLoading, error } = useEmailAuth();

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError(undefined);
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        const firstError = Object.values(passwordValidation.errors)[0];
        setPasswordError(firstError ?? "Invalid password");
        isValid = false;
      } else {
        setPasswordError(undefined);
      }
    }

    return isValid;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(email.trim(), password);
      onSuccess?.();
    } catch {
      // Error is handled by useEmailAuth hook
    } finally {
      setPassword("");
    }
  }, [email, password, login, onSuccess, validateForm]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[{ flex: 1 }, containerStyle]}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        testID={testID}
      >
        <View style={{ marginBottom: spacing.xl }}>
          <Text
            style={{
              fontSize: typography.sizes["3xl"],
              fontWeight: typography.weights.bold,
              color: colors.gray[900],
              marginBottom: spacing.sm,
            }}
          >
            Sign In
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
            }}
          >
            Enter your email and password to continue
          </Text>
        </View>

        {error && (
          <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
        )}

        <View style={{ gap: spacing.md }}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
            editable={!isLoading}
            testID="email-input"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
            editable={!isLoading}
            testID="password-input"
          />

          {onForgotPasswordPress && (
            <Button
              title="Forgot Password?"
              onPress={onForgotPasswordPress}
              variant="ghost"
              size="sm"
              style={{ alignSelf: "flex-end" }}
              testID="forgot-password-button"
            />
          )}

          {isLoading ? (
            <LoadingSpinner style={{ marginTop: spacing.md }} />
          ) : (
            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.md }}
              testID="sign-in-button"
            />
          )}

          {onRegisterPress && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: spacing.lg,
                gap: spacing.xs,
              }}
            >
              <Text style={{ color: colors.gray[600] }}>
                Don't have an account?
              </Text>
              <Button
                title="Sign Up"
                onPress={onRegisterPress}
                variant="ghost"
                size="sm"
                testID="sign-up-button"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
