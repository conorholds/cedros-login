import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { Button } from "../shared/Button";
import { ErrorMessage } from "../shared/ErrorMessage";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { PasswordInput } from "../auth/PasswordInput";

export interface WalletUnlockProps {
  isVisible: boolean;
  onClose: () => void;
  onUnlock: (credential: string) => Promise<void>;
  title?: string;
  description?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function WalletUnlock({
  isVisible,
  onClose,
  onUnlock,
  title = "Unlock Wallet",
  description = "Enter your password to unlock your wallet for this session",
  containerStyle,
  testID = "wallet-unlock",
}: WalletUnlockProps): React.ReactElement {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = useCallback(async () => {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onUnlock(password);
      setPassword("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to unlock wallet. Please check your password and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [password, onUnlock, onClose]);

  const handleClose = () => {
    setPassword("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      testID={testID}
    >
      <View
        style={[
          {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.lg,
          },
          containerStyle,
        ]}
      >
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: spacing.lg,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                color: colors.gray[900],
              }}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Text
                style={{
                  fontSize: typography.sizes.xl,
                  color: colors.gray[500],
                }}
              >
                &#10005;
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.gray[600],
              marginBottom: spacing.lg,
            }}
          >
            {description}
          </Text>

          {error && (
            <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
          )}

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            containerStyle={{ marginBottom: spacing.lg }}
          />

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                size="md"
                style={{ flex: 1 }}
              />
              <Button
                title="Unlock"
                onPress={handleUnlock}
                variant="primary"
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
