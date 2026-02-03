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
import { validateEmail } from "../../utils/validation";

export interface EmailRegisterFormProps {
  onSuccess?: () => void;
  onLoginPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function EmailRegisterForm({
  onSuccess,
  onLoginPress,
  containerStyle,
  testID = "email-register-form",
}: EmailRegisterFormProps): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | undefined
  >();

  const { register, isLoading, error } = useEmailAuth();

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError(undefined);
    }

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
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordError(
        "Password must contain uppercase, lowercase, and a number",
      );
      isValid = false;
    } else {
      setPasswordError(undefined);
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError(undefined);
    }

    return isValid;
  }, [name, email, password, confirmPassword]);

  const handleRegister = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register(email.trim(), password, name.trim());
      onSuccess?.();
    } catch {
      // Error is handled by useEmailAuth hook
    } finally {
      setPassword("");
      setConfirmPassword("");
    }
  }, [email, password, name, register, onSuccess, validateForm]);

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
            Create Account
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
            }}
          >
            Fill in your details to get started
          </Text>
        </View>

        {error && (
          <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
        )}

        <View style={{ gap: spacing.md }}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={nameError}
            editable={!isLoading}
            testID="name-input"
          />

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
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
            editable={!isLoading}
            testID="password-input"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={confirmPasswordError}
            editable={!isLoading}
            testID="confirm-password-input"
          />

          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: colors.gray[500],
              marginTop: spacing.xs,
            }}
          >
            Password must be at least 8 characters with uppercase, lowercase,
            and a number.
          </Text>

          {isLoading ? (
            <LoadingSpinner style={{ marginTop: spacing.md }} />
          ) : (
            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.md }}
              testID="create-account-button"
            />
          )}

          {onLoginPress && (
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
                Already have an account?
              </Text>
              <Button
                title="Sign In"
                onPress={onLoginPress}
                variant="ghost"
                size="sm"
                testID="sign-in-button"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
