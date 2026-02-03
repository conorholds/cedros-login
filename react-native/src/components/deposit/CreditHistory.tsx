import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { CreditTransactionResponse } from "../../types";

export interface CreditHistoryProps {
  transactions: CreditTransactionResponse[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function CreditHistory({
  transactions,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  containerStyle,
  testID = "credit-history",
}: CreditHistoryProps): React.ReactElement {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (lamports: number, currency: string): string => {
    const decimals = currency === "SOL" ? 9 : 6;
    const divisor = Math.pow(10, decimals);
    const amount = lamports / divisor;
    const sign = amount >= 0 ? "+" : "";
    return `${sign}${amount.toFixed(4)} ${currency}`;
  };

  const getTypeColor = (txType: string): string => {
    switch (txType) {
      case "deposit":
        return colors.success;
      case "spend":
        return colors.error;
      case "adjustment":
        return colors.info;
      default:
        return colors.gray[500];
    }
  };

  const getTypeLabel = (txType: string): string => {
    switch (txType) {
      case "deposit":
        return "Deposit";
      case "spend":
        return "Spend";
      case "adjustment":
        return "Adjustment";
      default:
        return txType;
    }
  };

  const renderTransaction = ({ item }: { item: CreditTransactionResponse }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: getTypeColor(item.txType) + "20",
          justifyContent: "center",
          alignItems: "center",
          marginRight: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: getTypeColor(item.txType),
          }}
        >
          {item.txType === "deposit"
            ? "&#8595;"
            : item.txType === "spend"
              ? "&#8593;"
              : "&#8634;"}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.medium,
            color: colors.gray[900],
          }}
        >
          {item.description || getTypeLabel(item.txType)}
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.xs,
            color: colors.gray[500],
            marginTop: spacing.xs,
          }}
        >
          {formatDate(item.createdAt)} at {formatTime(item.createdAt)}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: typography.sizes.base,
            fontWeight: typography.weights.medium,
            color: item.amountLamports >= 0 ? colors.success : colors.gray[900],
          }}
        >
          {formatAmount(item.amountLamports, item.currency)}
        </Text>
        <View
          style={{
            backgroundColor: getTypeColor(item.txType) + "20",
            paddingHorizontal: spacing.xs,
            paddingVertical: 2,
            borderRadius: 4,
            marginTop: spacing.xs,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: getTypeColor(item.txType),
              fontWeight: typography.weights.medium,
            }}
          >
            {getTypeLabel(item.txType)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={containerStyle} testID={testID}>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[200],
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.semibold,
            color: colors.gray[900],
          }}
        >
          Transaction History ({transactions.length})
        </Text>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: spacing.lg,
        }}
        ListEmptyComponent={
          <View
            style={{
              padding: spacing.xl,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.base,
                color: colors.gray[500],
              }}
            >
              No transactions yet
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && onLoadMore ? (
            <TouchableOpacity
              onPress={onLoadMore}
              disabled={isLoading}
              style={{
                padding: spacing.md,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  color: colors.primary[600],
                  fontWeight: typography.weights.medium,
                }}
              >
                {isLoading ? "Loading..." : "Load More"}
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}
