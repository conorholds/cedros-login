/**
 * Result step components: Waiting, Success, Error (React Native)
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { Token } from "./tokens";
import { SOL_TOKEN } from "./tokens";
import { getTotalFeeUsd } from "./depositFlowTypes";
import type { DepositFlowResult } from "./depositFlowTypes";
import type { DepositConfigResponse } from "../../types/deposit";

// ─── Waiting Step ────────────────────────────────────────────────────────────

export interface WaitingStepProps {
  token: Token;
  depositAddress: string | null;
  feeLine: string;
  testID?: string;
}

export function WaitingStep({
  token,
  depositAddress,
  feeLine,
  testID = "deposit-waiting",
}: WaitingStepProps): React.ReactElement {
  return (
    <View style={[styles.container, styles.centered]} testID={testID}>
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text style={styles.title}>Waiting for Deposit</Text>
      <Text style={styles.description}>
        Looking for incoming {token.symbol} deposits...
      </Text>

      <View style={styles.waitingInfo}>
        <Text style={styles.waitingText}>
          Once your transaction is confirmed on the Solana network, your account
          will be credited automatically. This usually takes 20-30 seconds.
        </Text>

        {depositAddress && (
          <View style={styles.field}>
            <Text style={styles.label}>Deposit address</Text>
            <View style={styles.addressBox}>
              <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                {depositAddress}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoStack}>
          <InfoDot text="Send only on the Solana network." />
          <InfoDot text={feeLine} />
        </View>
      </View>
    </View>
  );
}

// ─── Success Step ────────────────────────────────────────────────────────────

export interface SuccessStepProps {
  result: DepositFlowResult;
  config: DepositConfigResponse;
  onNewDeposit: () => void;
  testID?: string;
}

export function SuccessStep({
  result,
  config,
  onNewDeposit,
  testID = "deposit-success",
}: SuccessStepProps): React.ReactElement {
  const token = result.token ?? SOL_TOKEN;
  const amountUsd =
    token.symbol === "SOL" && config.solPriceUsd > 0
      ? result.amount * config.solPriceUsd
      : result.amount;
  const totalFeeUsd = getTotalFeeUsd(config, amountUsd);
  const creditsUsd = Math.max(amountUsd - totalFeeUsd, 0);
  // H-08: Don't floor zero fees to $0.01
  const totalFeeDisplay = totalFeeUsd === 0 ? 0 : totalFeeUsd < 0.01 ? 0.01 : totalFeeUsd;

  const handleTxPress = () => {
    Linking.openURL(
      `https://solscan.io/tx/${result.txSignature}`,
    ).catch(() => {});
  };

  return (
    <View style={[styles.container, styles.centered]} testID={testID}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.title}>Deposit Successful!</Text>
      <Text style={styles.description}>
        Your deposit of {result.amount.toLocaleString()} {token.symbol} has been
        received.
      </Text>

      <View style={styles.summary}>
        <SummaryRow label="Transaction">
          <TouchableOpacity onPress={handleTxPress}>
            <Text style={styles.txLink}>
              {result.txSignature.slice(0, 8)}...{result.txSignature.slice(-8)}{" "}
              ↗
            </Text>
          </TouchableOpacity>
        </SummaryRow>
        <SummaryRow label="Deposit Amount">
          <Text style={styles.summaryValue}>${amountUsd.toFixed(2)}</Text>
        </SummaryRow>
        <SummaryRow label="Total Fees">
          <Text style={[styles.summaryValue, styles.feeColor]}>
            -${totalFeeDisplay.toFixed(2)}
          </Text>
        </SummaryRow>
        <SummaryRow label="Credits Added">
          <Text style={[styles.summaryValue, styles.creditColor]}>
            +${creditsUsd.toFixed(2)}
          </Text>
        </SummaryRow>
        <SummaryRow label="Available">
          <Text style={styles.summaryValue}>Immediately</Text>
        </SummaryRow>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onNewDeposit}
      >
        <Text style={styles.primaryButtonText}>Make Another Deposit</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Error Step ──────────────────────────────────────────────────────────────

export interface ErrorStepProps {
  error: string;
  onRetry: () => void;
  onCancel?: () => void;
  testID?: string;
}

export function ErrorStep({
  error,
  onRetry,
  onCancel,
  testID = "deposit-error",
}: ErrorStepProps): React.ReactElement {
  return (
    <View style={[styles.container, styles.centered]} testID={testID}>
      <View style={styles.errorIconCircle}>
        <Text style={styles.errorIconText}>✕</Text>
      </View>
      <Text style={styles.title}>Deposit Failed</Text>
      <Text style={styles.errorMessage}>{error}</Text>

      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryButton, !onCancel && { flex: 1 }]}
          onPress={onRetry}
        >
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InfoDot({ text }: { text: string }) {
  return (
    <View style={styles.infoDot}>
      <View style={styles.dot} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  centered: {
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    textAlign: "center",
  },
  field: {
    gap: spacing.xs,
    width: "100%",
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
  },
  addressBox: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  addressText: {
    fontSize: typography.sizes.xs,
    fontFamily: "monospace",
    color: colors.gray[800],
  },
  waitingInfo: {
    gap: spacing.md,
    width: "100%",
    paddingTop: spacing.sm,
  },
  waitingText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    lineHeight: 20,
    textAlign: "center",
  },
  infoStack: {
    gap: 6,
  },
  infoDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[400],
  },
  infoText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  successIconText: {
    fontSize: 24,
    color: colors.success,
    fontWeight: typography.weights.bold,
  },
  summary: {
    width: "100%",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
  },
  summaryValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
  },
  txLink: {
    fontSize: typography.sizes.xs,
    color: colors.primary[600],
    fontFamily: "monospace",
  },
  feeColor: {
    color: colors.error,
  },
  creditColor: {
    color: colors.success,
  },
  errorIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.error + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  errorIconText: {
    fontSize: 24,
    color: colors.error,
    fontWeight: typography.weights.bold,
  },
  errorMessage: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  primaryButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
  },
});
