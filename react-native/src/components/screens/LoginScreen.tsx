import React, { useState } from "react";
import {
  View,
  Text,
  Platform,
  SafeAreaView,
  ScrollView,
  ViewStyle,
  StyleProp,
} from "react-native";
import { EmailLoginForm } from "../auth/EmailLoginForm";
import { EmailRegisterForm } from "../auth/EmailRegisterForm";
import { ForgotPasswordForm } from "../auth/ForgotPasswordForm";
import { GoogleLoginButton } from "../auth/GoogleLoginButton";
import { AppleLoginButton } from "../auth/AppleLoginButton";
import { SolanaLoginButton } from "../auth/SolanaLoginButton";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type AuthMode = "login" | "register" | "forgot-password";

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
  headerTitle?: string;
  headerSubtitle?: string;
  containerStyle?: StyleProp<ViewStyle>;
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
  headerTitle = "Welcome",
  headerSubtitle = "Sign in to continue",
  containerStyle,
  testID = "login-screen",
}: LoginScreenProps): React.ReactElement {
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const showGoogle = enableGoogle && !!onRequestGoogleToken;
  const showApple = enableApple && !!onRequestAppleToken;
  // On Android, show Solana button even without onRequestSolanaToken (uses built-in MWA).
  // On iOS, require the callback since MWA is Android-only.
  const showSolana = enableSolana && (Platform.OS === "android" || !!onRequestSolanaToken);
  const showSocialDivider = (showGoogle || showApple || showSolana) && enableEmail;

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
                  or continue with
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
          />
        );

      case "forgot-password":
        return (
          <ForgotPasswordForm
            onSubmit={onForgotPasswordSubmit}
            onBackToLogin={() => setAuthMode("login")}
          />
        );
    }
  };

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.gray[50] }, containerStyle]}
      testID={testID}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            padding: spacing.lg,
            paddingTop: spacing["3xl"],
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: colors.primary[600],
              justifyContent: "center",
              alignItems: "center",
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: 36,
                fontWeight: typography.weights.bold,
                color: colors.white,
              }}
            >
              C
            </Text>
          </View>
          <Text
            style={{
              fontSize: typography.sizes["2xl"],
              fontWeight: typography.weights.bold,
              color: colors.gray[900],
              marginBottom: spacing.xs,
            }}
          >
            {headerTitle}
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
            }}
          >
            {headerSubtitle}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: spacing.lg,
            minHeight: 400,
          }}
        >
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
