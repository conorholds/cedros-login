import React from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export interface CreditBalanceProps {
  balanceLamports: number;
  currency?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CreditBalance({
  balanceLamports,
  currency = "SOL",
  containerStyle,
  testID = "credit-balance",
}: CreditBalanceProps): React.ReactElement {
  const formatBalance = (lamports: number, currency: string): string => {
    const decimals = currency === "SOL" ? 9 : 6;
    const divisor = Math.pow(10, decimals);
    const balance = lamports / divisor;
    return `${balance.toFixed(4)} ${currency}`;
  };

  const getUsdValue = (lamports: number): string => {
    // Simplified: assume 1 SOL = $100 for display
    const solPrice = 100;
    const solBalance = lamports / 1e9;
    const usdValue = solBalance * solPrice;
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
      {currency === "SOL" && (
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
