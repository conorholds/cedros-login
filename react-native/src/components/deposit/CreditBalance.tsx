import React from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { getDecimalsForCurrency } from "./tokens";

export interface CreditBalanceProps {
  balanceLamports: number;
  currency?: string;
  /** USD price of SOL — when provided, shows approximate USD value */
  solPriceUsd?: number;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CreditBalance({
  balanceLamports,
  currency = "SOL",
  solPriceUsd,
  containerStyle,
  testID = "credit-balance",
}: CreditBalanceProps): React.ReactElement {
  const formatBalance = (lamports: number, cur: string): string => {
    const decimals = getDecimalsForCurrency(cur);
    const divisor = Math.pow(10, decimals);
    const balance = lamports / divisor;
    return `${balance.toFixed(4)} ${cur}`;
  };

  // C-05: Use real SOL price from prop instead of hardcoded $100
  const getUsdValue = (lamports: number): string | null => {
    if (!solPriceUsd || solPriceUsd <= 0) return null;
    const solBalance = lamports / 1e9;
    const usdValue = solBalance * solPriceUsd;
    return `~$${usdValue.toFixed(2)} USD`;
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.primary[600],
          borderRadius: 12,
          padding: spacing.lg,
        },
        containerStyle,
      ]}
      testID={testID}
    >
      <Text
        style={{
          fontSize: typography.sizes.sm,
          color: colors.white + "80",
          marginBottom: spacing.xs,
        }}
      >
        Available Balance
      </Text>
      <Text
        style={{
          fontSize: typography.sizes["3xl"],
          fontWeight: typography.weights.bold,
          color: colors.white,
          marginBottom: spacing.xs,
        }}
      >
        {formatBalance(balanceLamports, currency)}
      </Text>
      {currency === "SOL" && getUsdValue(balanceLamports) != null && (
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.white + "60",
          }}
        >
          {getUsdValue(balanceLamports)}
        </Text>
      )}
    </View>
  );
}
