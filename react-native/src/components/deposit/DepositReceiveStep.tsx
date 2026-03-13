/**
 * Receive-mode step: show deposit address, token/amount selector (React Native)
 *
 * User selects token, enters amount, sees deposit address, and confirms send.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import type { Token } from "./tokens";
import { SOL_TOKEN } from "./tokens";
import { TokenSelector } from "./TokenSelector";
import { TieredAmountSlider } from "./TieredAmountSlider";
import { getTierForAmount } from "./tierUtils";
import {
  getTotalFeeUsd,
  getTokenUsdPrice,
  formatTokenAmount,
} from "./depositFlowTypes";
import type { CurrencyMode } from "./depositFlowTypes";
import type { DepositConfigResponse } from "../../types/deposit";

export interface DepositReceiveStepProps {
  config: DepositConfigResponse;
  currencyMode: CurrencyMode;
  tokens: Token[];
  selectedToken: Token;
  onTokenSelect: (token: Token) => void;
  depositAddress: string | null;
  tokenPriceUsd?: Record<string, number>;
  onSent: () => void;
  onBack: () => void;
  onAmountChange?: (amountUsd: number) => void;
  testID?: string;
}

export function DepositReceiveStep({
  config,
  currencyMode,
  tokens,
  selectedToken,
  onTokenSelect,
  depositAddress,
  tokenPriceUsd,
  onSent,
  onBack,
  onAmountChange,
  testID = "deposit-receive",
}: DepositReceiveStepProps): React.ReactElement {
  const [amountUsd, setAmountUsd] = useState(config.privateMinUsd);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // R2-M20: Clear copy timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const tier = getTierForAmount(amountUsd, config);
  const isMicroTier = tier === "sol_micro";

  const totalFeeUsd = getTotalFeeUsd(config, amountUsd);
  // H-08: Don't floor zero fees to $0.01
  const feeTotalDisplay = totalFeeUsd === 0 ? 0 : totalFeeUsd < 0.01 ? 0.01 : totalFeeUsd;
  const feeLine = totalFeeUsd === 0 ? "No fees" : `Fees: $${feeTotalDisplay.toFixed(2)} total`;

  const activeToken = isMicroTier ? SOL_TOKEN : selectedToken;
  const tokenUsdPrice = getTokenUsdPrice(activeToken, config, tokenPriceUsd);
  const tokenAmount = tokenUsdPrice ? amountUsd / tokenUsdPrice : null;
  const sendAmountLabel = tokenAmount
    ? formatTokenAmount(tokenAmount, activeToken.symbol)
    : null;

  useEffect(() => {
    onAmountChange?.(amountUsd);
  }, [amountUsd, onAmountChange]);

  const handleCopy = useCallback(async () => {
    if (!depositAddress) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ClipboardModule = require("@react-native-clipboard/clipboard");
      const Clipboard = ClipboardModule.default ?? ClipboardModule;
      Clipboard.setString(depositAddress);
    } catch {
      // Clipboard not available
    }
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [depositAddress]);

  const handleExplorerPress = useCallback(() => {
    if (depositAddress) {
      Linking.openURL(
        `https://solscan.io/account/${depositAddress}`,
      ).catch(() => {});
    }
  }, [depositAddress]);

  if (!depositAddress) {
    return (
      <View style={[styles.container, styles.centered]} testID={testID}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.title}>Wallet Not Ready</Text>
        <Text style={styles.description}>
          Your embedded wallet is not set up. Please complete wallet enrollment
          first.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Send Deposit</Text>
      <Text style={styles.description}>
        Send funds to your deposit address. We'll confirm automatically.
      </Text>

      {/* Token selector — only for multi-token, non-micro */}
      {currencyMode === "multi-token" && !isMicroTier && (
        <View style={styles.field}>
          <Text style={styles.label}>Token</Text>
          <TokenSelector
            tokens={tokens}
            selectedToken={selectedToken}
            onSelect={onTokenSelect}
          />
        </View>
      )}

      {/* Amount */}
      <View style={styles.field}>
        <Text style={styles.label}>Deposit Amount</Text>
        <TieredAmountSlider
          config={config}
          valueUsd={amountUsd}
          onChange={setAmountUsd}
          maxUsd={10_000}
        />
      </View>

      {/* Deposit address */}
      <View style={styles.field}>
        <Text style={styles.label}>
          Send {sendAmountLabel ?? "--"}{" "}
          {isMicroTier ? "SOL" : activeToken.symbol} to this address
        </Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
            {depositAddress}
          </Text>
          <View style={styles.addressActions}>
            <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
              <Text style={styles.copyButtonText}>{copied ? "✓" : "Copy"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleExplorerPress}
              style={styles.copyButton}
            >
              <Text style={styles.copyButtonText}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>
        {copied && <Text style={styles.copiedMsg}>Copied!</Text>}
      </View>

      {/* Info stack */}
      <View style={styles.infoStack}>
        <InfoDot text="Send only on the Solana network." />
        <InfoDot text={feeLine} />
        <InfoDot text="Credits appear after confirmation (typically ~30s)." />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            amountUsd <= 0 && styles.buttonDisabled,
          ]}
          onPress={onSent}
          disabled={amountUsd <= 0}
        >
          <Text style={styles.primaryButtonText}>I've Sent It</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoDot({ text }: { text: string }) {
  return (
    <View style={styles.infoDot}>
      <View style={styles.dot} />
      <Text style={styles.infoText}>{text}</Text>
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
  },
  errorIcon: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  addressText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontFamily: "monospace",
    color: colors.gray[800],
  },
  addressActions: {
    flexDirection: "row",
    gap: 4,
    marginLeft: spacing.xs,
  },
  copyButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[200],
  },
  copyButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
  },
  copiedMsg: {
    fontSize: typography.sizes.xs,
    color: colors.success,
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
  buttonDisabled: {
    opacity: 0.5,
  },
});
