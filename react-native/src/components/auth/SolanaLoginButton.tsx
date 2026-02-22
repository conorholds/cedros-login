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
import { useSolanaAuth } from "../../hooks/useSolanaAuth";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { ErrorMessage } from "../shared/ErrorMessage";
import type { AuthError } from "../../types";

export interface SolanaLoginButtonProps {
  /** Callback invoked on press; should trigger wallet adapter and return credentials. */
  onRequestToken: () => Promise<{
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
 * Solana wallet connection button component.
 *
 * @remarks
 * This component includes a placeholder icon ("SOL" text in a colored box).
 * Consumers should provide their own custom Solana icon for production use.
 * Consider using the official Solana logo or a custom SVG/PNG icon.
 */
export function SolanaLoginButton({
  onRequestToken,
  onSuccess,
  onError,
  style,
  testID = "solana-login-button",
}: SolanaLoginButtonProps): React.ReactElement {
  const { signIn, isLoading, error } = useSolanaAuth();

  const handlePress = useCallback(async () => {
    try {
      const { walletAddress, signature, nonce } = await onRequestToken();
      await signIn(walletAddress, signature, nonce);
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
              Connect Wallet
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
