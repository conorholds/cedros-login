import React, { useCallback } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { radii } from "../../theme/radii";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { ErrorMessage } from "../shared/ErrorMessage";
import type { AuthError, MfaRequiredResponse } from "../../types";
import {
  getGoogleSignInModule,
  requestNativeGoogleIdToken,
} from "../../utils/nativeAuthModules";

export interface GoogleLoginButtonProps {
  /** Callback invoked on press; should trigger native Google Sign-In and return the ID token. */
  onRequestToken?: () => Promise<{ idToken: string }>;
  onSuccess?: () => void;
  onMfaRequired?: (response: MfaRequiredResponse) => void;
  onError?: (error: AuthError) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Google Sign-In button component.
 *
 * @remarks
 * This component intentionally avoids placeholder Google artwork.
 * Consumers can wrap it with native Google branding if their app design requires it.
 */
export function GoogleLoginButton({
  onRequestToken,
  onSuccess,
  onMfaRequired,
  onError,
  style,
  testID = "google-login-button",
}: GoogleLoginButtonProps): React.ReactElement {
  const { signIn, isLoading, error } = useGoogleAuth();
  const googleModule = getGoogleSignInModule();
  const NativeGoogleButton = googleModule?.GoogleSigninButton ?? null;

  const handlePress = useCallback(async () => {
    try {
      const { idToken } = await (
        onRequestToken ?? requestNativeGoogleIdToken
      )();
      const response = await signIn(idToken);
      if ("mfaRequired" in response) onMfaRequired?.(response);
      else onSuccess?.();
    } catch (e) {
      const authError: AuthError =
        e && typeof e === "object" && "code" in e
          ? (e as AuthError)
          : { code: "UNKNOWN_ERROR", message: String(e) };
      onError?.(authError);
    }
  }, [onRequestToken, signIn, onSuccess, onMfaRequired, onError]);

  return (
    <View style={style}>
      {error && (
        <ErrorMessage error={error} style={{ marginBottom: spacing.sm }} />
      )}
      {NativeGoogleButton ? (
        <NativeGoogleButton
          onPress={handlePress}
          disabled={isLoading}
          size={NativeGoogleButton.Size?.Wide}
          color={NativeGoogleButton.Color?.Light}
          style={{ width: "100%", height: 48 }}
        />
      ) : (
        <TouchableOpacity
          onPress={handlePress}
          disabled={isLoading}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.gray[300],
            borderRadius: radii.control,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
          }}
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
        >
          {isLoading ? (
            <LoadingSpinner size="small" color={colors.gray[600]} />
          ) : (
            <Text
              style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.gray[700],
              }}
            >
              Sign in with Google
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
