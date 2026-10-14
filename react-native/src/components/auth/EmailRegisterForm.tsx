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
import { useCedrosLogin } from "../../context/CedrosLoginProvider";
import type { SignupAvailability } from "../../types";
import { useCurrentSignupAvailability } from "../../hooks/useCurrentSignupAvailability";
import {
  isEmailVerificationPending,
  useEmailAuth,
} from "../../hooks/useEmailAuth";
import { validateEmail } from "../../utils/validation";

export interface EmailRegisterFormStrings {
  /** Form title. Default: "Create Account" */
  title?: string;
  /** Subtitle below the title. Default: "Fill in your details to get started" */
  subtitle?: string;
  /** Full name field label. Default: "Full Name" */
  nameLabel?: string;
  /** Full name field placeholder. Default: "Enter your full name" */
  namePlaceholder?: string;
  /** Email field label. Default: "Email" */
  emailLabel?: string;
  /** Email field placeholder. Default: "Enter your email" */
  emailPlaceholder?: string;
  /** Password field label. Default: "Password" */
  passwordLabel?: string;
  /** Password field placeholder. Default: "Create a password" */
  passwordPlaceholder?: string;
  /** Confirm password field label. Default: "Confirm Password" */
  confirmPasswordLabel?: string;
  /** Confirm password field placeholder. Default: "Confirm your password" */
  confirmPasswordPlaceholder?: string;
  /** Password hint text. Default: "Password must be at least 8 characters..." */
  passwordHint?: string;
  /** Submit button text. Default: "Create Account" */
  submitButton?: string;
  /** "Already have account" prompt. Default: "Already have an account?" */
  hasAccount?: string;
  /** Sign-in link text. Default: "Sign In" */
  signInLink?: string;
  /** Pending-verification title. Default: "Check your email" */
  verificationTitle?: string;
  /** Pending-verification explanation. Supports {email}. */
  verificationBody?: string;
  /** Resend action. Default: "Send verification email" */
  resendVerification?: string;
  /** Resend confirmation. */
  verificationSent?: string;
  /** Remaining-capacity message. Supports {remaining}, {limit}, and {period}. */
  availabilityRemaining?: string;
  /** Full-capacity message. Supports {resetsAt}. */
  availabilityFull?: string;
  /** Accuracy note displayed with a non-full capacity snapshot. */
  availabilityDisclaimer?: string;
  /** Daily period label used in availability messages. */
  availabilityDailyPeriod?: string;
  /** Weekly period label used in availability messages. */
  availabilityWeeklyPeriod?: string;
  /** Monthly period label used in availability messages. */
  availabilityMonthlyPeriod?: string;
}

export interface EmailRegisterFormStyleProps {
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  fieldContainerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  availabilityStyle?: StyleProp<ViewStyle>;
  availabilityTextStyle?: StyleProp<TextStyle>;
}

export interface EmailRegisterFormProps {
  onSuccess?: () => void;
  onLoginPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  /** Override any subset of user-facing strings. */
  strings?: EmailRegisterFormStrings;
  /** Override style slots for layout sections. */
  styles?: EmailRegisterFormStyleProps;
  testID?: string;
}

const DEFAULT_STRINGS: Required<EmailRegisterFormStrings> = {
  title: "Create Account",
  subtitle: "Fill in your details to get started",
  nameLabel: "Full Name",
  namePlaceholder: "Enter your full name",
  emailLabel: "Email",
  emailPlaceholder: "Enter your email",
  passwordLabel: "Password",
  passwordPlaceholder: "Create a password",
  confirmPasswordLabel: "Confirm Password",
  confirmPasswordPlaceholder: "Confirm your password",
  passwordHint:
    "Password must be at least 8 characters with uppercase, lowercase, and a number.",
  submitButton: "Create Account",
  hasAccount: "Already have an account?",
  signInLink: "Sign In",
  verificationTitle: "Check your email",
  verificationBody:
    "Your account for {email} is ready, but you are not signed in yet. Open the verification link we emailed you, then return to sign in.",
  resendVerification: "Send verification email",
  verificationSent:
    "If the account still needs verification, a new email is on its way.",
  availabilityRemaining:
    "{remaining} of {limit} signup spots available {period}.",
  availabilityFull:
    "Registration is currently full. New spots open {resetsAt}.",
  availabilityDisclaimer:
    "Availability is confirmed when you create your account.",
  availabilityDailyPeriod: "today",
  availabilityWeeklyPeriod: "this week",
  availabilityMonthlyPeriod: "this month",
};

export function EmailRegisterForm({
  onSuccess,
  onLoginPress,
  containerStyle,
  strings,
  styles: styleSlots,
  testID = "email-register-form",
}: EmailRegisterFormProps): React.ReactElement {
  const { colors, spacing, typography } = useCedrosTheme();
  const { config } = useCedrosLogin();
  const copy = { ...DEFAULT_STRINGS, ...strings };
  const availability = useCurrentSignupAvailability(config.signupAvailability);
  const signupFull = availability?.remaining === 0;

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
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
    string | null
  >(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const { register, resendVerificationEmail, isLoading, error } =
    useEmailAuth();

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
      const response = await register(email.trim(), password, name.trim());
      if (isEmailVerificationPending(response)) {
        setPendingVerificationEmail(response.user.email ?? email.trim());
        return;
      }
      onSuccess?.();
    } catch {
      // Error is handled by useEmailAuth hook
    } finally {
      setPassword("");
      setConfirmPassword("");
    }
  }, [email, password, name, register, onSuccess, validateForm]);

  const handleResendVerification = useCallback(async () => {
    if (!pendingVerificationEmail) return;
    try {
      await resendVerificationEmail(pendingVerificationEmail);
      setVerificationSent(true);
    } catch {
      // Error is rendered from the hook.
    }
  }, [pendingVerificationEmail, resendVerificationEmail]);

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
        {onLoginPress && (
          <Button
            title={copy.signInLink}
            onPress={onLoginPress}
            variant="ghost"
            testID="verification-sign-in-button"
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
          {availability && (
            <View
              accessible
              accessibilityRole="text"
              accessibilityLiveRegion="polite"
              style={[
                {
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: spacing.sm,
                  marginTop: spacing.md,
                  padding: spacing.md,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    availability.remaining === 0
                      ? colors.warning
                      : colors.primary[200],
                  backgroundColor: colors.primary[50],
                },
                styleSlots?.availabilityStyle,
              ]}
              testID="signup-availability"
            >
              <Text
                style={[
                  {
                    flex: 1,
                    color: colors.gray[700],
                    fontSize: typography.sizes.sm,
                    lineHeight: typography.sizes.sm * 1.45,
                  },
                  styleSlots?.availabilityTextStyle,
                ]}
              >
                {formatAvailability(copy, availability)}
              </Text>
            </View>
          )}
        </View>

        {error && (
          <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
        )}

        <View style={[{ gap: spacing.md }, styleSlots?.fieldContainerStyle]}>
          <Input
            label={copy.nameLabel}
            placeholder={copy.namePlaceholder}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={nameError}
            editable={!isLoading}
            testID="name-input"
          />

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

          <Input
            label={copy.confirmPasswordLabel}
            placeholder={copy.confirmPasswordPlaceholder}
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
            {copy.passwordHint}
          </Text>

          {isLoading ? (
            <LoadingSpinner style={{ marginTop: spacing.md }} />
          ) : (
            <Button
              title={copy.submitButton}
              onPress={handleRegister}
              disabled={signupFull}
              variant="primary"
              size="lg"
              style={{ marginTop: spacing.md }}
              testID="create-account-button"
            />
          )}

          {onLoginPress && (
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
              <Text style={{ color: colors.gray[600] }}>{copy.hasAccount}</Text>
              <Button
                title={copy.signInLink}
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

function formatAvailability(
  copy: Required<EmailRegisterFormStrings>,
  availability: SignupAvailability,
): string {
  if (availability.remaining === 0) {
    const resetsAt = new Date(availability.resetsAt).toLocaleString();
    return copy.availabilityFull.replace("{resetsAt}", resetsAt);
  }
  const period = {
    daily: copy.availabilityDailyPeriod,
    weekly: copy.availabilityWeeklyPeriod,
    monthly: copy.availabilityMonthlyPeriod,
  }[availability.period];
  const primary = copy.availabilityRemaining
    .replace("{remaining}", String(availability.remaining))
    .replace("{limit}", String(availability.limit))
    .replace("{period}", period);
  return `${primary} ${copy.availabilityDisclaimer}`;
}
