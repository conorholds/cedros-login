import React, { useState } from "react";
import {
  View,
  Text,
  Platform,
  SafeAreaView,
  ScrollView,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { EmailLoginForm } from "../auth/EmailLoginForm";
import { EmailRegisterForm } from "../auth/EmailRegisterForm";
import { ForgotPasswordForm } from "../auth/ForgotPasswordForm";
import { GoogleLoginButton } from "../auth/GoogleLoginButton";
import { AppleLoginButton } from "../auth/AppleLoginButton";
import { SolanaLoginButton } from "../auth/SolanaLoginButton";
import { useCedrosTheme } from "../../context/ThemeContext";
import type {
  EmailLoginFormStrings,
  EmailLoginFormStyleProps,
} from "../auth/EmailLoginForm";
import type {
  EmailRegisterFormStrings,
  EmailRegisterFormStyleProps,
} from "../auth/EmailRegisterForm";
import type {
  ForgotPasswordFormStrings,
  ForgotPasswordFormStyleProps,
} from "../auth/ForgotPasswordForm";

type AuthMode = "login" | "register" | "forgot-password";

export interface LoginScreenStrings {
  /** Header title. Default: "Welcome" */
  headerTitle?: string;
  /** Header subtitle. Default: "Sign in to continue" */
  headerSubtitle?: string;
  /** Social divider label. Default: "or continue with" */
  socialDivider?: string;
  /** Strings forwarded to the embedded EmailLoginForm. */
  loginForm?: EmailLoginFormStrings;
  /** Strings forwarded to the embedded EmailRegisterForm. */
  registerForm?: EmailRegisterFormStrings;
  /** Strings forwarded to the embedded ForgotPasswordForm. */
  forgotPasswordForm?: ForgotPasswordFormStrings;
}

export interface LoginScreenStyleProps {
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  logoStyle?: StyleProp<ViewStyle>;
  logoTextStyle?: StyleProp<TextStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  /** Style slots forwarded to the embedded EmailLoginForm. */
  loginFormStyles?: EmailLoginFormStyleProps;
  /** Style slots forwarded to the embedded EmailRegisterForm. */
  registerFormStyles?: EmailRegisterFormStyleProps;
  /** Style slots forwarded to the embedded ForgotPasswordForm. */
  forgotPasswordFormStyles?: ForgotPasswordFormStyleProps;
}

export interface LoginScreenProps {
  enableEmail?: boolean;
  enableGoogle?: boolean;
  enableApple?: boolean;
  enableSolana?: boolean;
  /** Callback to trigger native Google Sign-In and return the ID token. */
  onRequestGoogleToken?: () => Promise<{ idToken: string }>;
  /** Callback to trigger native Apple Sign-In and return the ID token. */
  onRequestAppleToken?: () => Promise<{ idToken: string }>;
  /**
   * Optional callback to trigger Solana wallet adapter and return credentials.
   *
   * On Android, this is optional — the built-in MWA flow is used when omitted.
   * On iOS, this must be provided for the Solana button to appear.
   */
  onRequestSolanaToken?: () => Promise<{
    walletAddress: string;
    signature: string;
    nonce: string;
  }>;
  onLoginSuccess?: () => void;
  onRegisterSuccess?: () => void;
  onForgotPasswordSubmit?: (email: string) => Promise<void>;
  /** @deprecated Use strings.headerTitle instead. Still supported for backwards compatibility. */
  headerTitle?: string;
  /** @deprecated Use strings.headerSubtitle instead. Still supported for backwards compatibility. */
  headerSubtitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** Override any subset of user-facing strings for this screen and its forms. */
  strings?: LoginScreenStrings;
  /** Override style slots for layout sections of this screen and its forms. */
  styles?: LoginScreenStyleProps;
  testID?: string;
}

export function LoginScreen({
  enableEmail = true,
  enableGoogle = true,
  enableApple = true,
  enableSolana = true,
  onRequestGoogleToken,
  onRequestAppleToken,
  onRequestSolanaToken,
  onLoginSuccess,
  onRegisterSuccess,
  onForgotPasswordSubmit,
  headerTitle,
  headerSubtitle,
  containerStyle,
  strings,
  styles: styleSlots,
  testID = "login-screen",
}: LoginScreenProps): React.ReactElement {
  const { colors, spacing, typography } = useCedrosTheme();
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Backwards-compat: legacy props win over strings object
  const resolvedHeaderTitle =
    headerTitle ?? strings?.headerTitle ?? "Welcome";
  const resolvedHeaderSubtitle =
    headerSubtitle ?? strings?.headerSubtitle ?? "Sign in to continue";
  const socialDividerText = strings?.socialDivider ?? "or continue with";

  const showGoogle = enableGoogle && !!onRequestGoogleToken;
  const showApple = enableApple && !!onRequestAppleToken;
  // On Android, show Solana button even without onRequestSolanaToken (uses built-in MWA).
  // On iOS, require the callback since MWA is Android-only.
  const showSolana =
    enableSolana &&
    (Platform.OS === "android" || !!onRequestSolanaToken);
  const showSocialDivider =
    (showGoogle || showApple || showSolana) && enableEmail;

  const renderContent = () => {
    switch (authMode) {
      case "login":
        return (
          <View style={{ gap: spacing.md }}>
            {enableEmail && (
              <EmailLoginForm
                onSuccess={onLoginSuccess}
                onRegisterPress={() => setAuthMode("register")}
                onForgotPasswordPress={() => setAuthMode("forgot-password")}
                strings={strings?.loginForm}
                styles={styleSlots?.loginFormStyles}
              />
            )}

            {showSocialDivider && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: spacing.lg,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.gray[200],
                  }}
                />
                <Text
                  style={{
                    marginHorizontal: spacing.md,
                    color: colors.gray[500],
                    fontSize: typography.sizes.sm,
                  }}
                >
                  {socialDividerText}
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: colors.gray[200],
                  }}
                />
              </View>
            )}

            <View style={{ gap: spacing.md }}>
              {showGoogle && (
                <GoogleLoginButton
                  onRequestToken={onRequestGoogleToken}
                  onSuccess={onLoginSuccess}
                />
              )}
              {showApple && (
                <AppleLoginButton
                  onRequestToken={onRequestAppleToken}
                  onSuccess={onLoginSuccess}
                />
              )}
              {showSolana && (
                <SolanaLoginButton
                  onRequestToken={onRequestSolanaToken}
                  onSuccess={onLoginSuccess}
                />
              )}
            </View>
          </View>
        );

      case "register":
        return (
          <EmailRegisterForm
            onSuccess={onRegisterSuccess}
            onLoginPress={() => setAuthMode("login")}
            strings={strings?.registerForm}
            styles={styleSlots?.registerFormStyles}
          />
        );

      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSubmit={onForgotPasswordSubmit}
            onBackToLogin={() => setAuthMode("login")}
            strings={strings?.forgotPasswordForm}
            styles={styleSlots?.forgotPasswordFormStyles}
          />
        );
    }
  };

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: colors.gray[50] },
        containerStyle,
        styleSlots?.containerStyle,
      ]}
      testID={testID}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            {
              padding: spacing.lg,
              paddingTop: spacing["3xl"],
              alignItems: "center",
            },
            styleSlots?.headerStyle,
          ]}
        >
          <View
            style={[
              {
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: colors.primary[600],
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing.lg,
              },
              styleSlots?.logoStyle,
            ]}
          >
            <Text
              style={[
                {
                  fontSize: 36,
                  fontWeight: typography.weights.bold,
                  color: colors.white,
                },
                styleSlots?.logoTextStyle,
              ]}
            >
              C
            </Text>
          </View>
          <Text
            style={[
              {
                fontSize: typography.sizes["2xl"],
                fontWeight: typography.weights.bold,
                color: colors.gray[900],
                marginBottom: spacing.xs,
              },
              styleSlots?.titleStyle,
            ]}
          >
            {resolvedHeaderTitle}
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
            {resolvedHeaderSubtitle}
          </Text>
        </View>

        <View
          style={[
            {
              flex: 1,
              backgroundColor: colors.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: spacing.lg,
              minHeight: 400,
            },
            styleSlots?.cardStyle,
          ]}
        >
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
