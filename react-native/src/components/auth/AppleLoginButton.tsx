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
import type { AppleSignInPayload } from "../../hooks/useAppleAuth";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { ErrorMessage } from "../shared/ErrorMessage";
import type { AuthError } from "../../types";
import {
  getAppleAuthModule,
  requestNativeAppleCredential,
} from "../../utils/nativeAuthModules";

type NativeAppleButtonProps = {
  buttonStyle?: unknown;
  buttonType?: unknown;
  cornerRadius?: number;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

type NativeAppleButtonComponent = React.ComponentType<NativeAppleButtonProps> & {
  Style?: {
    BLACK?: unknown;
  };
  Type?: {
    SIGN_IN?: unknown;
  };
};

export interface AppleLoginButtonProps {
  /** Callback invoked on press; should trigger native Apple Sign-In and return the auth payload. */
  onRequestToken?: () => Promise<AppleSignInPayload>;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Apple Sign-In button component.
 *
 * @remarks
 * Use the native Apple authentication UI in `onRequestToken`.
 * This component only submits the resulting credential to the Cedros backend.
 */
export function AppleLoginButton({
  onRequestToken,
  onSuccess,
  onError,
  style,
  testID = "apple-login-button",
}: AppleLoginButtonProps): React.ReactElement {
  const { signIn, isLoading, error } = useAppleAuth();
  const appleModule = getAppleAuthModule();
  const NativeAppleButton =
    (appleModule?.AppleButton as NativeAppleButtonComponent | undefined) ?? null;

  const handlePress = useCallback(async () => {
    try {
      const applePayload = await (onRequestToken ?? requestNativeAppleCredential)();
      await signIn(applePayload);
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
      {NativeAppleButton ? (
        <NativeAppleButton
          buttonStyle={NativeAppleButton.Style?.BLACK}
          buttonType={NativeAppleButton.Type?.SIGN_IN}
          cornerRadius={8}
          onPress={handlePress}
          disabled={isLoading}
          style={{ height: 44 }}
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
            backgroundColor: colors.black,
            borderWidth: 1,
            borderColor: colors.black,
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
            <Text
              style={{
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.medium,
                color: colors.white,
              }}
            >
              Sign in with Apple
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
