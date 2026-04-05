import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { Input } from "../shared/Input";
import { Button } from "../shared/Button";
import { ErrorMessage } from "../shared/ErrorMessage";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import { useCedrosTheme } from "../../context/ThemeContext";
import { validateEmail } from "../../utils/validation";

export interface ForgotPasswordFormStrings {
  /** Form title. Default: "Reset Password" */
  title?: string;
  /** Subtitle below the title. Default: "Enter your email and we'll send you instructions..." */
  subtitle?: string;
  /** Email field label. Default: "Email" */
  emailLabel?: string;
  /** Email field placeholder. Default: "Enter your email" */
  emailPlaceholder?: string;
  /** Submit button text. Default: "Send Reset Link" */
  submitButton?: string;
  /** Back-to-login button text on the form. Default: "Back to Sign In" */
  backToLogin?: string;
  /** Success screen title. Default: "Check Your Email" */
  successTitle?: string;
  /** Success screen body (email address is appended). Default: "We've sent password reset instructions to " */
  successMessage?: string;
  /** Back-to-login button text on the success screen. Default: "Back to Sign In" */
  successBackToLogin?: string;
}

export interface ForgotPasswordFormStyleProps {
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  fieldContainerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
}

export interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>;
  onBackToLogin?: () => void;
  onSuccess?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  /** Override any subset of user-facing strings. */
  strings?: ForgotPasswordFormStrings;
  /** Override style slots for layout sections. */
  styles?: ForgotPasswordFormStyleProps;
  testID?: string;
}

const DEFAULT_STRINGS: Required<ForgotPasswordFormStrings> = {
  title: "Reset Password",
  subtitle:
    "Enter your email and we'll send you instructions to reset your password",
  emailLabel: "Email",
  emailPlaceholder: "Enter your email",
  submitButton: "Send Reset Link",
  backToLogin: "Back to Sign In",
  successTitle: "Check Your Email",
  successMessage: "We've sent password reset instructions to ",
  successBackToLogin: "Back to Sign In",
};

export function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
  onSuccess,
  containerStyle,
  strings,
  styles: styleSlots,
  testID = "forgot-password-form",
}: ForgotPasswordFormProps): React.ReactElement {
  const { colors, spacing, typography } = useCedrosTheme();
  const {
    forgotPassword,
    isLoading: hookIsLoading,
    isSuccess: hookIsSuccess,
    error: hookError,
  } = useForgotPassword();
  const copy = { ...DEFAULT_STRINGS, ...strings };
  const usesInternalSubmit = !onSubmit;

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [didSubmitSucceed, setDidSubmitSucceed] = useState(false);
  const isLoading = usesInternalSubmit ? hookIsLoading : isSubmitting;
  const error = usesInternalSubmit ? hookError?.message ?? null : submitError;
  const isSuccess = usesInternalSubmit ? hookIsSuccess : didSubmitSucceed;

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

    try {
      if (onSubmit) {
        setIsSubmitting(true);
        setSubmitError(null);
        setDidSubmitSucceed(false);
        await onSubmit(email.trim());
        setDidSubmitSucceed(true);
      } else {
        await forgotPassword(email.trim());
      }
      onSuccess?.();
    } catch (err) {
      if (onSubmit) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Failed to send reset email. Please try again.",
        );
      }
    } finally {
      if (onSubmit) {
        setIsSubmitting(false);
      }
    }
  }, [email, forgotPassword, onSubmit, onSuccess, validateForm]);

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
          styleSlots?.containerStyle,
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
          style={[
            {
              fontSize: typography.sizes["2xl"],
              fontWeight: typography.weights.bold,
              color: colors.gray[900],
              marginBottom: spacing.md,
              textAlign: "center",
            },
            styleSlots?.titleStyle,
          ]}
        >
          {copy.successTitle}
        </Text>
        <Text
          style={[
            {
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              textAlign: "center",
              marginBottom: spacing.xl,
            },
            styleSlots?.subtitleStyle,
          ]}
        >
          {copy.successMessage}
          {email}
        </Text>
        {onBackToLogin && (
          <Button
            title={copy.successBackToLogin}
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
      style={[{ flex: 1 }, containerStyle, styleSlots?.containerStyle]}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        testID={testID}
      >
        <View
          style={[{ marginBottom: spacing.xl }, styleSlots?.headerStyle]}
        >
          <Text
            style={[
              {
                fontSize: typography.sizes["3xl"],
                fontWeight: typography.weights.bold,
                color: colors.gray[900],
                marginBottom: spacing.sm,
              },
              styleSlots?.titleStyle,
            ]}
          >
            {copy.title}
          </Text>
          <Text
            style={[
              {
                fontSize: typography.sizes.base,
                color: colors.gray[600],
              },
              styleSlots?.subtitleStyle,
            ]}
          >
            {copy.subtitle}
          </Text>
        </View>

        {error && (
          <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
        )}

        <View
          style={[{ gap: spacing.md }, styleSlots?.fieldContainerStyle]}
        >
          <Input
            label={copy.emailLabel}
            placeholder={copy.emailPlaceholder}
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
              title={copy.submitButton}
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.md }}
              testID="send-reset-link-button"
            />
          )}

          {onBackToLogin && (
            <View style={styleSlots?.footerStyle}>
              <Button
                title={copy.backToLogin}
                onPress={onBackToLogin}
                variant="ghost"
                size="md"
                style={{ marginTop: spacing.lg }}
                testID="back-to-login-button"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
