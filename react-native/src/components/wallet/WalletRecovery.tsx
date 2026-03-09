/**
 * Wallet recovery component (React Native, password-only)
 *
 * Two-phase flow:
 * 1. Enter 12-word recovery phrase
 * 2. Set new password for wallet access
 */

import React, { useState, useCallback } from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { useWalletRecovery } from "../../hooks/useWalletRecovery";
import { RecoveryPhraseInput } from "./RecoveryPhraseInput";
import { PasswordInput } from "../auth/PasswordInput";
import { Button } from "../shared/Button";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { ErrorMessage } from "../shared/ErrorMessage";
import { validatePassword } from "../../utils/validation";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export interface WalletRecoveryProps {
  onComplete?: () => void;
  onCancel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

type RecoveryPhase = "phrase" | "password";

export function WalletRecovery({
  onComplete,
  onCancel,
  containerStyle,
  testID = "wallet-recovery",
}: WalletRecoveryProps): React.ReactElement {
  const { state, startRecovery, cancel, isRecovering } = useWalletRecovery();

  const [phase, setPhase] = useState<RecoveryPhase>("phrase");
  const [words, setWords] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePhraseComplete = useCallback((completedWords: string[]) => {
    setWords(completedWords);
    setPhase("password");
  }, []);

  const handlePasswordSubmit = useCallback(async () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      setPasswordError(firstError ?? "Password does not meet requirements");
      return;
    }

    setPasswordError(null);
    await startRecovery(words, "password", password);
  }, [password, confirmPassword, words, startRecovery]);

  const handleCancel = useCallback(() => {
    cancel();
    onCancel?.();
  }, [cancel, onCancel]);

  // Progress states
  if (state.step === "validating") {
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
          Validating recovery phrase...
        </Text>
      </View>
    );
  }

  if (state.step === "encrypting") {
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
          Encrypting wallet...
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
          Saving recovered wallet...
        </Text>
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
          Wallet Recovered!
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            textAlign: "center",
            marginBottom: spacing.lg,
          }}
        >
          Your wallet has been restored with a new password.
        </Text>
        <Button
          title="Done"
          onPress={() => onComplete?.()}
          variant="primary"
          size="md"
        />
      </View>
    );
  }

  if (state.step === "error") {
    return (
      <View style={[{ padding: spacing.lg }, containerStyle]} testID={testID}>
        <ErrorMessage
          error={state.error || "Recovery failed"}
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
            onPress={() => {
              cancel();
              setPhase("phrase");
              setWords([]);
              setPassword("");
              setConfirmPassword("");
            }}
            variant="primary"
            size="md"
            style={{ flex: 1 }}
          />
        </View>
      </View>
    );
  }

  // Phase 1: Enter recovery phrase
  if (phase === "phrase") {
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
          Recover Wallet
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
            marginBottom: spacing.lg,
          }}
        >
          Enter your 12-word recovery phrase to restore your wallet.
        </Text>

        <RecoveryPhraseInput onComplete={handlePhraseComplete} />

        {onCancel && (
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            size="md"
            style={{ marginTop: spacing.lg }}
          />
        )}
      </View>
    );
  }

  // Phase 2: Set new password
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
        Set New Password
      </Text>
      <Text
        style={{
          fontSize: typography.sizes.base,
          color: colors.gray[600],
          marginBottom: spacing.lg,
        }}
      >
        Choose a new password for your recovered wallet.
      </Text>

      <View style={{ marginBottom: spacing.md }}>
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          editable={!isRecovering}
        />
      </View>

      <View style={{ marginBottom: spacing.md }}>
        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          editable={!isRecovering}
        />
      </View>

      {passwordError && (
        <ErrorMessage
          error={passwordError}
          style={{ marginBottom: spacing.md }}
        />
      )}

      <View
        style={{
          flexDirection: "row",
          gap: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <Button
          title="Back"
          onPress={() => setPhase("phrase")}
          variant="outline"
          size="md"
          disabled={isRecovering}
          style={{ flex: 1 }}
        />
        <Button
          title={isRecovering ? "Recovering..." : "Recover Wallet"}
          onPress={handlePasswordSubmit}
          variant="primary"
          size="md"
          disabled={isRecovering || !password || !confirmPassword}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
