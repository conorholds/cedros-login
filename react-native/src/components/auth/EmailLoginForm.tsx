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
import { useCedrosTheme } from "../../context/ThemeContext";
import { useEmailAuth } from "../../hooks/useEmailAuth";
import { validateEmail } from "../../utils/validation";
import { TotpVerify } from "../totp/TotpVerify";

export interface EmailLoginFormStrings {
  /** Form title. Default: "Sign In" */
  title?: string;
  /** Subtitle below the title. Default: "Enter your email and password to continue" */
  subtitle?: string;
  /** Email field label. Default: "Email" */
  emailLabel?: string;
  /** Email field placeholder. Default: "Enter your email" */
  emailPlaceholder?: string;
  /** Password field label. Default: "Password" */
  passwordLabel?: string;
  /** Password field placeholder. Default: "Enter your password" */
  passwordPlaceholder?: string;
  /** Submit button text. Default: "Sign In" */
  submitButton?: string;
  /** Forgot password link text. Default: "Forgot Password?" */
  forgotPassword?: string;
  /** "No account" prompt text. Default: "Don't have an account?" */
  noAccount?: string;
  /** Sign-up link text. Default: "Sign Up" */
  signUpLink?: string;
  verificationTitle?: string;
  verificationBody?: string;
  resendVerification?: string;
  verificationSent?: string;
  backToSignIn?: string;
}

export interface EmailLoginFormStyleProps {
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  fieldContainerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
}

export interface EmailLoginFormProps {
  onSuccess?: () => void;
  onRegisterPress?: () => void;
  onForgotPasswordPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  /** Override any subset of user-facing strings. */
  strings?: EmailLoginFormStrings;
  /** Override style slots for layout sections. */
  styles?: EmailLoginFormStyleProps;
  testID?: string;
}

const DEFAULT_STRINGS: Required<EmailLoginFormStrings> = {
  title: "Sign In",
  subtitle: "Enter your email and password to continue",
  emailLabel: "Email",
  emailPlaceholder: "Enter your email",
  passwordLabel: "Password",
  passwordPlaceholder: "Enter your password",
  submitButton: "Sign In",
  forgotPassword: "Forgot Password?",
  noAccount: "Don't have an account?",
  signUpLink: "Sign Up",
  verificationTitle: "Check your email",
  verificationBody:
    "Your account for {email} is ready, but you are not signed in yet. Open the verification link we emailed you, then return to sign in.",
  resendVerification: "Send verification email",
  verificationSent:
    "If the account still needs verification, a new email is on its way.",
  backToSignIn: "Back to sign in",
};

export function EmailLoginForm({
  onSuccess,
  onRegisterPress,
  onForgotPasswordPress,
  containerStyle,
  strings,
  styles: styleSlots,
  testID = "email-login-form",
}: EmailLoginFormProps): React.ReactElement {
  const { colors, spacing, typography } = useCedrosTheme();
  const copy = { ...DEFAULT_STRINGS, ...strings };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  const { login, completeMfa, resendVerificationEmail, isLoading, error } =
    useEmailAuth();

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
      // Login must continue to accept credentials created under older policy.
      // Strength rules apply only when choosing a new password.
      setPasswordError(undefined);
    }

    return isValid;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await login(email.trim(), password);
      if ("mfaRequired" in response) setMfaToken(response.mfaToken);
      else onSuccess?.();
    } catch (cause) {
      if (
        typeof cause === "object" &&
        cause !== null &&
        "code" in cause &&
        String(cause.code).toUpperCase() === "EMAIL_NOT_VERIFIED"
      ) {
        setPendingVerificationEmail(email.trim());
      }
      // Error is handled by useEmailAuth hook
    } finally {
      setPassword("");
    }
  }, [email, password, login, onSuccess, validateForm]);

  const handleResendVerification = useCallback(async () => {
    if (!pendingVerificationEmail) return;
    try {
      await resendVerificationEmail(pendingVerificationEmail);
      setVerificationSent(true);
    } catch {
      // Error is rendered from the hook.
    }
  }, [pendingVerificationEmail, resendVerificationEmail]);

  if (mfaToken) {
    return (
      <TotpVerify
        onVerify={async (code) => {
          await completeMfa(mfaToken, code);
          setMfaToken(null);
          onSuccess?.();
        }}
      />
    );
  }

  if (pendingVerificationEmail) {
    return (
      <View
        style={[
          { flex: 1, padding: spacing.lg, gap: spacing.md },
          containerStyle,
        ]}
        testID="email-verification-pending"
      >
        <Text
          style={{
            fontSize: typography.sizes["3xl"],
            fontWeight: typography.weights.bold,
            color: colors.gray[900],
          }}
        >
          {copy.verificationTitle}
        </Text>
        <Text
          style={{ fontSize: typography.sizes.base, color: colors.gray[600] }}
        >
          {copy.verificationBody.replace("{email}", pendingVerificationEmail)}
        </Text>
        {verificationSent && (
          <Text
            style={{ fontSize: typography.sizes.sm, color: colors.gray[700] }}
          >
            {copy.verificationSent}
          </Text>
        )}
        {error && <ErrorMessage error={error} />}
        <Button
          title={copy.resendVerification}
          onPress={() => void handleResendVerification()}
          loading={isLoading}
          variant="secondary"
          testID="resend-verification-button"
        />
        <Button
          title={copy.backToSignIn}
          onPress={() => setPendingVerificationEmail(null)}
          variant="ghost"
          testID="verification-back-button"
        />
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
        bounces
        overScrollMode="always"
        testID={testID}
      >
        <View style={[{ marginBottom: spacing.xl }, styleSlots?.headerStyle]}>
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

        <View style={[{ gap: spacing.md }, styleSlots?.fieldContainerStyle]}>
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

          <Input
            label={copy.passwordLabel}
            placeholder={copy.passwordPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
            editable={!isLoading}
            testID="password-input"
          />

          {onForgotPasswordPress && (
            <Button
              title={copy.forgotPassword}
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
              title={copy.submitButton}
              onPress={handleLogin}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.md }}
              testID="sign-in-button"
            />
          )}

          {onRegisterPress && (
            <View
              style={[
                {
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: spacing.lg,
                  gap: spacing.xs,
                },
                styleSlots?.footerStyle,
              ]}
            >
              <Text style={{ color: colors.gray[600] }}>{copy.noAccount}</Text>
              <Button
                title={copy.signUpLink}
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
