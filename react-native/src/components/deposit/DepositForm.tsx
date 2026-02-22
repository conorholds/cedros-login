import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { Button } from "../shared/Button";
import { ErrorMessage } from "../shared/ErrorMessage";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import type { DepositConfigResponse, DepositTier } from "../../types";

export interface DepositFormProps {
  config: DepositConfigResponse;
  onDeposit?: (amount: number, tier: DepositTier) => Promise<void>;
  onSuccess?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function DepositForm({
  config,
  onDeposit,
  onSuccess,
  containerStyle,
  testID = "deposit-form",
}: DepositFormProps): React.ReactElement {
  const [amount, setAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState<DepositTier>("public");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tiers = useMemo(() => [
    {
      value: "private" as DepositTier,
      label: "Private",
      description: `Min ${config.privateMinSol} SOL - Enhanced privacy`,
      minAmount: config.privateMinSol,
      color: colors.primary[600],
    },
    {
      value: "public" as DepositTier,
      label: "Public",
      description: `Min $${config.publicMinUsd} USD worth - Standard deposit`,
      minAmount: config.publicMinUsd / config.solPriceUsd,
      color: colors.info,
    },
    {
      value: "sol_micro" as DepositTier,
      label: "Micro",
      description: `Up to $${config.solMicroMaxUsd} USD worth - Direct SOL`,
      minAmount: 0.001,
      color: colors.success,
    },
  ], [config.privateMinSol, config.publicMinUsd, config.solPriceUsd, config.solMicroMaxUsd]);

  const validateForm = useCallback((): boolean => {
    const numAmount = parseFloat(amount);
    if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      setAmountError("Please enter a valid amount");
      return false;
    }

    const selectedTierConfig = tiers.find((t) => t.value === selectedTier);
    if (selectedTierConfig && numAmount < selectedTierConfig.minAmount) {
      setAmountError(
        `Minimum amount for ${selectedTierConfig.label} is ${selectedTierConfig.minAmount} SOL`,
      );
      return false;
    }

    setAmountError(undefined);
    return true;
  }, [amount, selectedTier, tiers]);

  const handleDeposit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const amountLamports = Math.floor(parseFloat(amount) * 1e9);
      if (onDeposit) {
        await onDeposit(amountLamports, selectedTier);
      }
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create deposit. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [amount, selectedTier, onDeposit, onSuccess, validateForm]);

  return (
    <ScrollView
      style={[{ flex: 1 }, containerStyle]}
      contentContainerStyle={{ padding: spacing.lg }}
      testID={testID}
    >
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes["2xl"],
            fontWeight: typography.weights.bold,
            color: colors.gray[900],
            marginBottom: spacing.sm,
          }}
        >
          Make a Deposit
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.base,
            color: colors.gray[600],
          }}
        >
          Choose your deposit type and amount
        </Text>
      </View>

      {!config.enabled && (
        <View
          style={{
            backgroundColor: colors.warning + "20",
            borderRadius: 8,
            padding: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.warning,
              fontWeight: typography.weights.medium,
            }}
          >
            Deposits are currently disabled
          </Text>
        </View>
      )}

      {error && (
        <ErrorMessage error={error} style={{ marginBottom: spacing.md }} />
      )}

      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.gray[700],
            marginBottom: spacing.xs,
          }}
        >
          Deposit Type
        </Text>
        <View style={{ gap: spacing.sm }}>
          {tiers.map((tier) => (
            <TouchableOpacity
              key={tier.value}
              onPress={() => setSelectedTier(tier.value)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: spacing.md,
                borderRadius: 8,
                borderWidth: 2,
                borderColor:
                  selectedTier === tier.value ? tier.color : colors.gray[300],
                backgroundColor:
                  selectedTier === tier.value
                    ? tier.color + "10"
                    : colors.white,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    selectedTier === tier.value ? tier.color : colors.gray[300],
                  backgroundColor:
                    selectedTier === tier.value
                      ? tier.color
                      : colors.transparent,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: spacing.md,
                }}
              >
                {selectedTier === tier.value && (
                  <Text style={{ color: colors.white, fontSize: 12 }}>
                    &#10003;
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: typography.sizes.base,
                    fontWeight: typography.weights.medium,
                    color: colors.gray[900],
                  }}
                >
                  {tier.label}
                </Text>
                <Text
                  style={{
                    fontSize: typography.sizes.sm,
                    color: colors.gray[500],
                  }}
                >
                  {tier.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.medium,
            color: colors.gray[700],
            marginBottom: spacing.xs,
          }}
        >
          Amount (SOL)
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          editable={!isLoading && config.enabled}
          style={{
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: amountError ? colors.error : colors.gray[300],
            borderRadius: 8,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            fontSize: typography.sizes.base,
            color: colors.gray[900],
          }}
          placeholderTextColor={colors.gray[400]}
        />
        {amountError && (
          <Text
            style={{
              fontSize: typography.sizes.xs,
              color: colors.error,
              marginTop: spacing.xs,
            }}
          >
            {amountError}
          </Text>
        )}
        {amount && !isNaN(parseFloat(amount)) && (
          <Text
            style={{
              fontSize: typography.sizes.sm,
              color: colors.gray[500],
              marginTop: spacing.xs,
            }}
          >
            &#8776; ${(parseFloat(amount) * config.solPriceUsd).toFixed(2)} USD
          </Text>
        )}
      </View>

      <View
        style={{
          backgroundColor: colors.gray[50],
          borderRadius: 8,
          padding: spacing.md,
          marginBottom: spacing.lg,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[600],
            marginBottom: spacing.xs,
          }}
        >
          Company Wallet:
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[900],
            fontFamily: "monospace",
          }}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {config.companyWallet}
        </Text>
        <Text
          style={{
            fontSize: typography.sizes.xs,
            color: colors.gray[500],
            marginTop: spacing.sm,
          }}
        >
          Privacy Period: {Math.floor(config.privacyPeriodSecs / 3600)} hours
        </Text>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Button
          title="Create Deposit"
          onPress={handleDeposit}
          variant="primary"
          size="lg"
          disabled={!config.enabled || !amount.trim()}
        />
      )}
    </ScrollView>
  );
}
