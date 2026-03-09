/**
 * Wallet enrollment wizard (React Native, password-only)
 *
 * Flow: enter password → generate wallet → show recovery phrase → complete.
 * No passkey/set-password flows on mobile.
 */

import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { useCedrosLogin } from "../../context";
import { useWalletEnrollment } from "../../hooks/useWalletEnrollment";
import { PasswordInput } from "../auth/PasswordInput";
import { RecoveryPhraseDisplay } from "./RecoveryPhraseDisplay";
import { Button } from "../shared/Button";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { ErrorMessage } from "../shared/ErrorMessage";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export interface WalletEnrollmentProps {
  onComplete?: (solanaPubkey: string) => void;
  onCancel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function WalletEnrollment({
  onComplete,
  onCancel,
  containerStyle,
  testID = "wallet-enrollment",
}: WalletEnrollmentProps): React.ReactElement {
  const { user } = useCedrosLogin();
  const {
    state,
    startEnrollmentWithPassword,
    confirmRecoveryPhrase,
    cancel,
    isEnrolling,
  } = useWalletEnrollment();

  const [password, setPassword] = useState("");

  useEffect(() => {
    setPassword("");
  }, [user?.id]);

  const handlePasswordSubmit = useCallback(async () => {
    await startEnrollmentWithPassword(password);
  }, [password, startEnrollmentWithPassword]);

  const handleRecoveryConfirm = useCallback(() => {
    confirmRecoveryPhrase();
    if (state.solanaPubkey) {
      onComplete?.(state.solanaPubkey);
    }
  }, [confirmRecoveryPhrase, state.solanaPubkey, onComplete]);

  const handleCancel = useCallback(() => {
    cancel();
    onCancel?.();
  }, [cancel, onCancel]);

  // Progress states
  if (
    state.step === "generating_seed" ||
    state.step === "splitting_shares"
  ) {
    return (
      <View style={containerStyle} testID={testID}>
        <LoadingSpinner />
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            textAlign: "center",
            marginTop: spacing.md,
          }}
        >
          Generating secure wallet...
        </Text>
      </View>
    );
  }

  if (state.step === "encrypting_shares") {
    return (
      <View style={containerStyle} testID={testID}>
        <LoadingSpinner />
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            textAlign: "center",
            marginTop: spacing.md,
          }}
        >
          Encrypting wallet shares...
        </Text>
      </View>
    );
  }

  if (state.step === "uploading") {
    return (
      <View style={containerStyle} testID={testID}>
        <LoadingSpinner />
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            textAlign: "center",
            marginTop: spacing.md,
          }}
        >
          Saving wallet...
        </Text>
      </View>
    );
  }

  if (state.step === "showing_recovery" && state.recoveryPhrase) {
    return (
      <View style={containerStyle} testID={testID}>
        <RecoveryPhraseDisplay
          phrase={state.recoveryPhrase.join(" ")}
          onConfirm={handleRecoveryConfirm}
        />
      </View>
    );
  }

  if (state.step === "complete") {
    return (
      <View
        style={[{ alignItems: "center", padding: spacing.lg }, containerStyle]}
        testID={testID}
      >
        <Text
          style={{
            fontSize: typography.sizes["2xl"],
            fontWeight: typography.weights.bold,
            color: colors.success,
            marginBottom: spacing.md,
          }}
        >
          Wallet Created!
        </Text>
        {state.solanaPubkey && (
          <Text
            style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[700],
              fontFamily: "monospace",
              textAlign: "center",
              marginBottom: spacing.md,
            }}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {state.solanaPubkey}
          </Text>
        )}
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            textAlign: "center",
          }}
        >
          Your non-custodial Solana wallet is ready to use.
        </Text>
      </View>
    );
  }

  if (state.step === "error") {
    return (
      <View style={[{ padding: spacing.lg }, containerStyle]} testID={testID}>
        <ErrorMessage
          error={state.error || "Enrollment failed"}
          style={{ marginBottom: spacing.lg }}
        />
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="md"
            style={{ flex: 1 }}
          />
          <Button
            title="Try Again"
            onPress={() => cancel()}
            variant="primary"
            size="md"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    );
  }

  // Default: password entry form
  return (
    <View style={[{ padding: spacing.lg }, containerStyle]} testID={testID}>
      <Text
        style={{
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.bold,
          color: colors.gray[900],
          marginBottom: spacing.xs,
        }}
      >
        Create Wallet
      </Text>
      <Text
        style={{
          fontSize: typography.sizes.base,
          color: colors.gray[600],
          marginBottom: spacing.lg,
        }}
      >
        Enter your account password to secure your wallet.
      </Text>

      <PasswordInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your account password"
        editable={!isEnrolling}
      />

      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginTop: spacing.lg,
        }}
      >
        {onCancel && (
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="md"
            disabled={isEnrolling}
            style={{ flex: 1 }}
          />
        )}
        <Button
          title={isEnrolling ? "Creating..." : "Continue"}
          onPress={handlePasswordSubmit}
          variant="primary"
          size="md"
          disabled={isEnrolling || !password}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
