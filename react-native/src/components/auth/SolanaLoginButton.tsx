import React, { useCallback } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Platform,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useSolanaAuth } from "../../hooks/useSolanaAuth";
import { useMobileWalletAuth } from "../../hooks/useMobileWalletAuth";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { ErrorMessage } from "../shared/ErrorMessage";
import type { AuthError } from "../../types";

export interface SolanaLoginButtonProps {
  /**
   * Optional callback to provide wallet credentials.
   *
   * When provided, this overrides the built-in MWA flow (useful for custom
   * wallet integrations or iOS where MWA is unavailable).
   *
   * When omitted on Android, the built-in MWA challenge-sign flow is used.
   */
  onRequestToken?: () => Promise<{
    walletAddress: string;
    signature: string;
    nonce: string;
  }>;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Solana wallet sign-in button.
 *
 * On Android, uses the built-in Mobile Wallet Adapter (MWA) flow by default.
 * On iOS, requires `onRequestToken` to be provided (MWA is Android-only).
 *
 * The button auto-hides on iOS when no `onRequestToken` override is provided,
 * unless the consumer explicitly renders it.
 */
export function SolanaLoginButton({
  onRequestToken,
  onSuccess,
  onError,
  style,
  testID = "solana-login-button",
}: SolanaLoginButtonProps): React.ReactElement | null {
  const { signIn, isLoading: signInLoading, error: signInError } = useSolanaAuth();
  const mwa = useMobileWalletAuth();

  const isLoading = signInLoading || mwa.isLoading;
  const error = signInError || mwa.error;

  const handlePress = useCallback(async () => {
    try {
      // If consumer provides a custom handler, use it (backwards compatible)
      if (onRequestToken) {
        const { walletAddress, signature, nonce } = await onRequestToken();
        await signIn(walletAddress, signature, nonce);
        onSuccess?.();
        return;
      }

      // Built-in MWA flow (Android only)
      const { walletAddress, signature, nonce } = await mwa.connect();
      await signIn(walletAddress, signature, nonce);
      onSuccess?.();
    } catch (e) {
      const authError: AuthError =
        e && typeof e === "object" && "code" in e
          ? (e as AuthError)
          : { code: "UNKNOWN_ERROR", message: String(e) };
      onError?.(authError);
    }
  }, [onRequestToken, signIn, mwa, onSuccess, onError]);

  // On iOS without an override callback, don't render (MWA is Android-only)
  if (Platform.OS !== "android" && !onRequestToken) {
    return null;
  }

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
          backgroundColor: colors.primary[600],
          borderRadius: 8,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        }}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel="Sign in with Solana wallet"
      >
        {isLoading ? (
          <LoadingSpinner size="small" color={colors.white} />
        ) : (
          <>
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: colors.white,
                borderRadius: 4,
                marginRight: spacing.md,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.primary[600],
                  fontSize: 10,
                  fontWeight: typography.weights.bold,
                }}
              >
                SOL
              </Text>
            </View>
            <Text
              style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.white,
              }}
            >
              Use Installed Wallet
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
