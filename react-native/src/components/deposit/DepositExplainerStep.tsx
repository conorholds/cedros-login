/**
 * Explainer step for the deposit flow (React Native)
 *
 * Introduces non-crypto-native users to deposits.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { ExplainerConfig } from "./depositFlowTypes";

export interface DepositExplainerStepProps {
  siteName?: string;
  explainerConfig?: ExplainerConfig;
  onContinue: () => void;
  onCancel?: () => void;
  testID?: string;
}

export function DepositExplainerStep({
  siteName,
  explainerConfig,
  onContinue,
  onCancel,
  testID = "deposit-explainer",
}: DepositExplainerStepProps): React.ReactElement {
  const title = explainerConfig?.title || "How Deposits Work";
  const body =
    explainerConfig?.body ||
    `${siteName || "This app"} uses Solana blockchain for fast, low-cost payments. ` +
      "You'll deposit cryptocurrency to fund your account, and credits will be " +
      "available almost instantly.";
  const exchangeUrl = explainerConfig?.exchangeUrl || "https://www.coinbase.com";
  const exchangeName = explainerConfig?.exchangeName || "Coinbase";
  const showExchange = explainerConfig?.showExchangeSuggestion !== false;

  const handleExchangePress = () => {
    // M-12: Only open https URLs to prevent javascript:, data:, or other scheme injection
    if (exchangeUrl.startsWith("https://")) {
      Linking.openURL(exchangeUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      <View style={styles.steps}>
        <StepItem number={1} text="Choose your token and amount" />
        <StepItem number={2} text="Send from your exchange or wallet" />
        <StepItem number={3} text="Credits appear within ~30 seconds" />
      </View>

      {showExchange && (
        <TouchableOpacity
          style={styles.exchangeLink}
          onPress={handleExchangePress}
        >
          <Text style={styles.exchangeLinkText}>
            Need crypto? Buy on {exchangeName} →
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onContinue}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepItem({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
  },
  body: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  steps: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[700],
  },
  stepText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.gray[700],
  },
  exchangeLink: {
    paddingVertical: spacing.xs,
  },
  exchangeLinkText: {
    fontSize: typography.sizes.sm,
    color: colors.primary[600],
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
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
