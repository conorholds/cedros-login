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
import { useAppleAuth } from "../../hooks/useAppleAuth";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { ErrorMessage } from "../shared/ErrorMessage";
import type { AuthError } from "../../types";

export interface AppleLoginButtonProps {
  /** Callback invoked on press; should trigger native Apple Sign-In and return the ID token. */
  onRequestToken: () => Promise<{ idToken: string }>;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Apple Sign-In button component.
 *
 * @remarks
 * This component uses the Apple logo Unicode character as a placeholder icon.
 * Consumers should provide their own custom Apple icon for production use to ensure
 * consistent rendering across all platforms and devices.
 * Consider using react-native-vector-icons or the official Apple Sign In button assets.
 */
export function AppleLoginButton({
  onRequestToken,
  onSuccess,
  onError,
  style,
  testID = "apple-login-button",
}: AppleLoginButtonProps): React.ReactElement {
  const { signIn, isLoading, error } = useAppleAuth();

  const handlePress = useCallback(async () => {
    try {
      const { idToken } = await onRequestToken();
      await signIn(idToken);
      onSuccess?.();
    } catch (e) {
      const authError: AuthError =
        e && typeof e === "object" && "code" in e
          ? (e as AuthError)
          : { code: "UNKNOWN_ERROR", message: String(e) };
      onError?.(authError);
    }
  }, [onRequestToken, signIn, onSuccess, onError]);

  return (
    <View style={style}>
      {error && (
        <ErrorMessage error={error} style={{ marginBottom: spacing.sm }} />
      )}
      <TouchableOpacity
        onPress={handlePress}
        disabled={isLoading}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.black,
          borderRadius: 8,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        }}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel="Sign in with Apple"
      >
        {isLoading ? (
          <LoadingSpinner size="small" color={colors.white} />
        ) : (
          <>
            <View
              style={{
                width: 20,
                height: 20,
                marginRight: spacing.md,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: typography.weights.bold,
                }}
              >
                &#63743;
              </Text>
            </View>
            <Text
              style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.white,
              }}
            >
              Continue with Apple
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
