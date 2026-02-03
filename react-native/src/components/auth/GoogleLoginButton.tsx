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
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { ErrorMessage } from "../shared/ErrorMessage";

export interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Google Sign-In button component.
 *
 * @remarks
 * This component includes a placeholder Google icon (letter "G" in a colored circle).
 * Consumers should provide their own custom Google icon component for production use.
 * Consider using react-native-vector-icons or a custom SVG/PNG icon.
 *
 * @example
 * ```tsx
 * // With custom icon (recommended for production)
 * <GoogleLoginButton
 *   onSuccess={() => console.log('Signed in!')}
 * />
 * ```
 */
export function GoogleLoginButton({
  onSuccess,
  style,
  testID = "google-login-button",
}: GoogleLoginButtonProps): React.ReactElement {
  const { signIn, isLoading, error } = useGoogleAuth();

  const handlePress = useCallback(async () => {
    try {
      await signIn();
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  }, [signIn, onSuccess]);

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
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.gray[300],
          borderRadius: 8,
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
          <>
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: colors.error,
                borderRadius: 10,
                marginRight: spacing.md,
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 12,
                  fontWeight: typography.weights.bold,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                G
              </Text>
            </View>
            <Text
              style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.gray[700],
              }}
            >
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
