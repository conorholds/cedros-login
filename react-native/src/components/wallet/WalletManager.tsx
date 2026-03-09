/**
 * Wallet manager - orchestrates wallet flows (React Native)
 *
 * State machine: status -> enroll/unlock/recover_intro/recover
 */

import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { useWallet } from "../../hooks/useWallet";
import { WalletEnrollment } from "./WalletEnrollment";
import { WalletRecovery } from "./WalletRecovery";
import { WalletStatus } from "./WalletStatus";
import { WalletUnlock } from "./WalletUnlock";
import { Button } from "../shared/Button";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type WalletManagerView =
  | "status"
  | "enroll"
  | "unlock"
  | "recover_intro"
  | "recover";

export interface WalletManagerProps {
  showActions?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function WalletManager({
  showActions = true,
  containerStyle,
  testID = "wallet-manager",
}: WalletManagerProps): React.ReactElement {
  const wallet = useWallet();
  const [view, setView] = useState<WalletManagerView>("status");

  const header = useMemo(() => {
    switch (view) {
      case "enroll":
        return { title: "Create Wallet", description: "Set up your embedded wallet." };
      case "unlock":
        return { title: "Unlock Wallet", description: "Unlock to sign transactions." };
      case "recover_intro":
      case "recover":
        return {
          title: "Recover Wallet",
          description: "Restore access using your recovery phrase.",
        };
      default:
        return null;
    }
  }, [view]);

  const handleBackToStatus = useCallback(() => setView("status"), []);

  const handleEnrollComplete = useCallback(async () => {
    setView("status");
    await wallet.refreshWallet();
  }, [wallet]);

  const handleUnlockComplete = useCallback(async () => {
    setView("status");
    await wallet.refreshWallet();
  }, [wallet]);

  const handleRecoverComplete = useCallback(async () => {
    setView("status");
    await wallet.refreshWallet();
  }, [wallet]);

  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderRadius: 12,
          overflow: "hidden",
        },
        containerStyle,
      ]}
      testID={testID}
    >
      {/* Header for sub-views */}
      {view !== "status" && header && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.gray[200],
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
                color: colors.gray[900],
              }}
            >
              {header.title}
            </Text>
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.gray[500],
                marginTop: 2,
              }}
            >
              {header.description}
            </Text>
          </View>
          <Button
            title="Back"
            onPress={handleBackToStatus}
            variant="outline"
            size="sm"
          />
        </View>
      )}

      {view === "status" && (
        <WalletStatus
          isEnrolled={wallet.status?.enrolled ?? false}
          isUnlocked={wallet.status?.unlocked ?? false}
          publicKey={wallet.publicKey ?? undefined}
          hasExternalWallet={wallet.status?.hasExternalWallet ?? false}
          onEnroll={showActions ? () => setView("enroll") : undefined}
          onUnlock={showActions ? () => setView("unlock") : undefined}
          onLock={showActions ? () => setView("status") : undefined}
        />
      )}

      {view === "enroll" && (
        <WalletEnrollment
          onComplete={() => void handleEnrollComplete()}
          onCancel={handleBackToStatus}
        />
      )}

      <WalletUnlock
        isVisible={view === "unlock"}
        onClose={handleBackToStatus}
        onUnlock={async () => {
          await handleUnlockComplete();
        }}
      />

      {view === "recover_intro" && (
        <View style={{ padding: spacing.lg }}>
          <Text
            style={{
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.semibold,
              color: colors.gray[900],
              marginBottom: spacing.md,
            }}
          >
            Before you start
          </Text>
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={bulletStyle}>
              You'll need your 12-word recovery phrase.
            </Text>
            <Text style={bulletStyle}>
              You'll set a new password for this wallet.
            </Text>
            <Text style={bulletStyle}>
              Avoid copying the phrase into other apps.
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Button
              title="Cancel"
              onPress={handleBackToStatus}
              variant="outline"
              size="md"
              style={{ flex: 1 }}
            />
            <Button
              title="Start Recovery"
              onPress={() => setView("recover")}
              variant="primary"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}

      {view === "recover" && (
        <WalletRecovery
          onComplete={() => void handleRecoverComplete()}
          onCancel={handleBackToStatus}
        />
      )}
    </View>
  );
}

const bulletStyle = {
  fontSize: typography.sizes.base,
  color: colors.gray[700],
  marginBottom: spacing.sm,
  paddingLeft: spacing.md,
};
