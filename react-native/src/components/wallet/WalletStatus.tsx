import React from "react";
import {
  View,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { Button } from "../shared/Button";

export interface WalletStatusProps {
  isEnrolled: boolean;
  isUnlocked: boolean;
  publicKey?: string;
  hasExternalWallet: boolean;
  onEnroll?: () => void;
  onUnlock?: () => void;
  onLock?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function WalletStatus({
  isEnrolled,
  isUnlocked,
  publicKey,
  hasExternalWallet,
  onEnroll,
  onUnlock,
  onLock,
  containerStyle,
  testID = "wallet-status",
}: WalletStatusProps): React.ReactElement {
  const truncatePubkey = (key: string): string => {
    if (key.length <= 12) return key;
    return `${key.slice(0, 6)}...${key.slice(-6)}`;
  };

  const getStatusColor = (): string => {
    if (isUnlocked) return colors.success;
    if (isEnrolled) return colors.warning;
    return colors.gray[500];
  };

  const getStatusText = (): string => {
    if (isUnlocked) return "Unlocked";
    if (isEnrolled) return "Locked";
    if (hasExternalWallet) return "External Wallet";
    return "Not Enrolled";
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.gray[200],
        },
        containerStyle,
      ]}
      testID={testID}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: getStatusColor(),
            }}
          />
          <Text
            style={{
              fontSize: typography.sizes.base,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
            }}
          >
            Wallet
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getStatusColor() + "20",
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: getStatusColor(),
              fontWeight: typography.weights.medium,
            }}
          >
            {getStatusText()}
          </Text>
        </View>
      </View>

      {publicKey && (
        <View style={{ marginBottom: spacing.md }}>
          <Text
            style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[500],
              marginBottom: spacing.xs,
            }}
          >
            Public Key
          </Text>
          <Text
            style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[900],
              fontFamily: "monospace",
            }}
          >
            {truncatePubkey(publicKey)}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        {!isEnrolled && onEnroll && (
          <Button
            title="Set Up Wallet"
            onPress={onEnroll}
            variant="primary"
            size="md"
            style={{ flex: 1 }}
          />
        )}

        {isEnrolled && (
          <>
            {isUnlocked
              ? onLock && (
                  <Button
                    title="Lock"
                    onPress={onLock}
                    variant="outline"
                    size="md"
                    style={{ flex: 1 }}
                  />
                )
              : onUnlock && (
                  <Button
                    title="Unlock"
                    onPress={onUnlock}
                    variant="primary"
                    size="md"
                    style={{ flex: 1 }}
                  />
                )}
          </>
        )}
      </View>
    </View>
  );
}
