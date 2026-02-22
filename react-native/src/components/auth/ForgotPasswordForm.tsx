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
import { validateEmail } from "../../utils/validation";

export interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>;
  onBackToLogin?: () => void;
  onSuccess?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  onSuccess,
  containerStyle,
  testID = "forgot-password-form",
}: ForgotPasswordFormProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = useCallback((): boolean => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(undefined);
    return true;
  }, [email]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (onSubmit) {
        await onSubmit(email.trim());
      }
      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [email, onSubmit, onSuccess, validateForm]);

  if (isSuccess) {
    return (
      <View
        style={[
          {
            flex: 1,
            padding: spacing.lg,
            justifyContent: "center",
            alignItems: "center",
          },
          containerStyle,
        ]}
        testID={testID}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.success + "20",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: 30,
              color: colors.success,
            }}
          >
            &#10003;
          </Text>
        </View>
        <Text
          style={{
            fontSize: typography.sizes["2xl"],
            fontWeight: typography.weights.bold,
            color: colors.gray[900],
            marginBottom: spacing.md,
            textAlign: "center",
          }}
        >
          Check Your Email
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            textAlign: "center",
            marginBottom: spacing.xl,
          }}
        >
          We've sent password reset instructions to {email}
        </Text>
        {onBackToLogin && (
          <Button
            title="Back to Sign In"
            onPress={onBackToLogin}
            variant="primary"
            size="lg"
            testID="back-to-login-button"
          />
        )}
      </View>
    );
  }

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
            Reset Password
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
            }}
          >
            Enter your email and we'll send you instructions to reset your
            password
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

          {isLoading ? (
            <LoadingSpinner style={{ marginTop: spacing.md }} />
          ) : (
            <Button
              title="Send Reset Link"
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.md }}
              testID="send-reset-link-button"
            />
          )}

          {onBackToLogin && (
            <Button
              title="Back to Sign In"
              onPress={onBackToLogin}
              variant="ghost"
              size="md"
              style={{ marginTop: spacing.lg }}
              testID="back-to-login-button"
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
