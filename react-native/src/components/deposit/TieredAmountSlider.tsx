/**
 * Tiered amount input with deposit tier indicator (React Native)
 *
 * Shows which deposit tier applies based on USD amount.
 * Uses TextInput for amount entry (no HTML range slider).
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { DepositTier, DepositConfigResponse } from "../../types/deposit";
import { getTierForAmount } from "./tierUtils";

export interface TieredAmountSliderProps {
  config: DepositConfigResponse;
  valueUsd: number;
  onChange: (valueUsd: number) => void;
  maxUsd?: number;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "$0";
  return `$${Math.round(value)}`;
}

function getTierInfo(
  tier: DepositTier,
  config: DepositConfigResponse,
): { label: string; detail: string; note: string | null; color: string } {
  switch (tier) {
    case "private":
      return {
        label: "Private",
        detail: "Private transaction, instant credit",
        note: null,
        color: colors.primary[600],
      };
    case "public":
      return {
        label: "Public",
        detail: "Visible on-chain, instant credit",
        note: null,
        color: colors.info,
      };
    case "sol_micro":
      return {
        label: "SOL Only",
        detail: `SOL only under ${formatUsd(config.solMicroMaxUsd)}`,
        note: "Small deposits must be sent in SOL and are visible on-chain. Increase the amount to use tokens.",
        color: colors.success,
      };
  }
}

function roundUsd(value: number): number {
  if (value < 10) return Math.round(value * 100) / 100;
  if (value < 100) return Math.round(value);
  if (value < 500) return Math.round(value / 5) * 5;
  if (value < 1000) return Math.round(value / 10) * 10;
  if (value < 5000) return Math.round(value / 25) * 25;
  return Math.round(value / 50) * 50;
}

export function TieredAmountSlider({
  config,
  valueUsd,
  onChange,
  maxUsd = 10_000,
  disabled = false,
  containerStyle,
  testID = "tiered-amount-slider",
}: TieredAmountSliderProps): React.ReactElement {
  const normalizedValue = Math.min(
    Math.max(Number.isFinite(valueUsd) ? valueUsd : 0, 0),
    maxUsd,
  );
  const tier = useMemo(
    () => getTierForAmount(normalizedValue, config),
    [normalizedValue, config],
  );
  const tierInfo = getTierInfo(tier, config);

  const handleChangeText = (text: string) => {
    const parsed = parseFloat(text);
    if (text === "" || text === ".") {
      onChange(0);
      return;
    }
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(parsed, 0), maxUsd);
      onChange(roundUsd(clamped));
    }
  };

  return (
    <View style={containerStyle} testID={testID}>
      <View style={styles.inputRow}>
        {/* Amount input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.currencySign}>$</Text>
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={normalizedValue > 0 ? String(normalizedValue) : ""}
            onChangeText={handleChangeText}
            placeholder="Enter amount"
            placeholderTextColor={colors.gray[400]}
            keyboardType="decimal-pad"
            editable={!disabled}
            testID={`${testID}-input`}
          />
        </View>

        {/* Tier badge */}
        <View style={styles.tierContainer}>
          <View style={[styles.badge, { backgroundColor: tierInfo.color + "20" }]}>
            <Text style={[styles.badgeText, { color: tierInfo.color }]}>
              {tierInfo.label}
            </Text>
          </View>
          <Text style={styles.tierDetail}>{tierInfo.detail}</Text>
        </View>
      </View>

      {/* Tier note */}
      {tierInfo.note && <Text style={styles.note}>{tierInfo.note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
  },
  currencySign: {
    fontSize: typography.sizes.lg,
    color: colors.gray[500],
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.base,
    color: colors.gray[900],
  },
  inputDisabled: {
    opacity: 0.5,
  },
  tierContainer: {
    alignItems: "flex-end",
    gap: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  tierDetail: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    textAlign: "right",
  },
  note: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.gray[50],
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
  },
});
