import React, { useState, useCallback } from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { Button } from "../shared/Button";
import { ErrorMessage } from "../shared/ErrorMessage";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { OtpInput } from "./OtpInput";

export interface TotpVerifyProps {
  onVerify: (code: string) => Promise<void>;
  onUseBackupCode?: () => void;
  title?: string;
  description?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function TotpVerify({
  onVerify,
  onUseBackupCode,
  title = "Two-Factor Authentication",
  description = "Enter the 6-digit code from your authenticator app to continue",
  containerStyle,
  testID = "totp-verify",
}: TotpVerifyProps): React.ReactElement {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onVerify(code);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid code. Please try again.",
      );
      setCode("");
    } finally {
      setIsLoading(false);
    }
  }, [code, onVerify]);

  return (
    <View
      style={[
        {
          flex: 1,
          padding: spacing.lg,
          justifyContent: "center",
        },
        containerStyle,
      ]}
      testID={testID}
    >
      <View
        style={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: spacing.xl,
          borderWidth: 1,
          borderColor: colors.gray[200],
        }}
      >
        <View
          style={{
            alignItems: "center",
            marginBottom: spacing.lg,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: colors.primary[100],
              justifyContent: "center",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 30,
              }}
            >
              &#128274;
            </Text>
          </View>
          <Text
            style={{
              fontSize: typography.sizes.xl,
              fontWeight: typography.weights.bold,
              color: colors.gray[900],
              marginBottom: spacing.sm,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              textAlign: "center",
            }}
          >
            {description}
          </Text>
        </View>

        {error && (
          <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
        )}

        <OtpInput
          value={code}
          onChange={setCode}
          length={6}
          containerStyle={{ marginBottom: spacing.lg }}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Button
            title="Verify"
            onPress={handleVerify}
            variant="primary"
            size="lg"
            disabled={code.length !== 6}
          />
        )}

        {onUseBackupCode && (
          <Button
            title="Use Backup Code"
            onPress={onUseBackupCode}
            variant="ghost"
            size="sm"
            style={{ marginTop: spacing.lg }}
          />
        )}
      </View>
    </View>
  );
}
