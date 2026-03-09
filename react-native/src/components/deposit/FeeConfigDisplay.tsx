/**
 * Fee configuration display component (React Native)
 *
 * Shows fee policy and breakdown with appropriate warnings.
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { DepositConfigResponse, FeePolicy } from "../../types/deposit";

export interface FeeConfigDisplayProps {
  config: DepositConfigResponse;
  showBreakdown?: boolean;
  showTierContext?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const LAMPORTS_PER_SOL = 1_000_000_000;

function getUserFacingLabel(policy: FeePolicy, hasCompanyFee: boolean): string {
  if (policy === "company_pays_all" && !hasCompanyFee) return "No fees";
  if (policy === "company_pays_all" && hasCompanyFee)
    return "Processing fee only";
  if (policy === "user_pays_all") return "Standard fees apply";
  return "Partial fees apply";
}

function getUserFacingDescription(
  policy: FeePolicy,
  hasCompanyFee: boolean,
  companyFeePercent: number,
): string {
  if (policy === "company_pays_all" && !hasCompanyFee) {
    return "You receive the full value of your deposit with no deductions.";
  }
  if (policy === "company_pays_all" && hasCompanyFee) {
    return `A small ${companyFeePercent.toFixed(2)}% processing fee is deducted from your deposit.`;
  }
  if (policy === "user_pays_all") {
    return "Network and processing fees are deducted from your deposit amount.";
  }
  return "Some fees are deducted from your deposit amount.";
}

export function FeeConfigDisplay({
  config,
  showBreakdown = true,
  showTierContext = false,
  containerStyle,
  testID = "fee-config-display",
}: FeeConfigDisplayProps): React.ReactElement {
  const hasCompanyFee = config.companyFeePercent > 0;
  const showWarning = config.feePolicy === "company_pays_all" && hasCompanyFee;

  const privateFeeTotal = config.privacyFeePercent + config.companyFeePercent;
  const publicFeeTotal = config.swapFeePercent + config.companyFeePercent;
  const privacyFixedSol = config.privacyFeeFixedLamports / LAMPORTS_PER_SOL;
  const swapFixedSol = config.swapFeeFixedLamports / LAMPORTS_PER_SOL;
  const companyFixedSol = config.companyFeeFixedLamports / LAMPORTS_PER_SOL;
  const formatFixed = (value: number) => `${value.toFixed(4)} SOL`;
  const hasFixedFees =
    config.privacyFeeFixedLamports > 0 ||
    config.swapFeeFixedLamports > 0 ||
    config.companyFeeFixedLamports > 0;

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Deposit Fees</Text>
        <View style={styles.policyBadge}>
          <Text style={styles.policyBadgeText}>
            {getUserFacingLabel(config.feePolicy, hasCompanyFee)}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        {getUserFacingDescription(
          config.feePolicy,
          hasCompanyFee,
          config.companyFeePercent,
        )}
      </Text>

      {/* Warning */}
      {showWarning && (
        <View style={styles.warning}>
          <Text style={styles.warningIcon}>!</Text>
          <View style={styles.warningBody}>
            <Text style={styles.warningTitle}>
              Processing fee still applies
            </Text>
            <Text style={styles.warningText}>
              "Company pays all" covers swap/privacy fees, but the company
              processing fee is still deducted.
            </Text>
          </View>
        </View>
      )}

      {/* Percentage fee breakdown */}
      {showBreakdown && config.feePolicy !== "company_pays_all" && (
        <View style={styles.breakdown}>
          <FeeRow
            label="Private deposits"
            value={`~${privateFeeTotal.toFixed(2)}%`}
          />
          <Text style={styles.feeNote}>
            Enhanced privacy, minimum ${config.privateMinUsd}
          </Text>
          <FeeRow
            label="Standard deposits"
            value={`~${publicFeeTotal.toFixed(2)}%`}
          />
          <Text style={styles.feeNote}>
            Faster processing, minimum ${config.publicMinUsd}
          </Text>
          <FeeRow
            label="Small deposits (SOL only)"
            value={
              hasCompanyFee
                ? `~${config.companyFeePercent.toFixed(2)}%`
                : "Network fees only"
            }
          />
          <Text style={styles.feeNote}>
            Under ${config.publicMinUsd}, SOL transfers only
          </Text>
        </View>
      )}

      {/* Fixed fee breakdown */}
      {showBreakdown && hasFixedFees && (
        <View style={styles.breakdown}>
          {config.privacyFeeFixedLamports > 0 && (
            <FeeRow label="Privacy fixed fee" value={formatFixed(privacyFixedSol)} />
          )}
          {config.swapFeeFixedLamports > 0 && (
            <FeeRow label="Swap fixed fee" value={formatFixed(swapFixedSol)} />
          )}
          {config.companyFeeFixedLamports > 0 && (
            <FeeRow
              label="Company fixed fee"
              value={formatFixed(companyFixedSol)}
            />
          )}
        </View>
      )}

      {/* Processing fee for company_pays_all with company fee */}
      {showBreakdown &&
        config.feePolicy === "company_pays_all" &&
        hasCompanyFee && (
          <View style={styles.breakdown}>
            <FeeRow
              label="Processing fee"
              value={`${config.companyFeePercent.toFixed(2)}%`}
            />
            <Text style={styles.feeNote}>Applied to all deposits</Text>
          </View>
        )}

      {/* Tier context */}
      {showTierContext && (
        <View style={styles.tierNote}>
          <Text style={styles.tierNoteText}>
            Fees vary by deposit type and amount. Larger deposits may qualify for
            reduced rates.
          </Text>
        </View>
      )}
    </View>
  );
}

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.feeRow}>
      <Text style={styles.feeLabel}>{label}</Text>
      <Text style={styles.feeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
  },
  policyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.primary[100],
  },
  policyBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.primary[800],
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
  },
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  warningIcon: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: "#92400e",
  },
  warningBody: {
    flex: 1,
  },
  warningTitle: {
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
    color: "#92400e",
    marginBottom: 4,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    color: "#92400e",
  },
  breakdown: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.gray[700],
  },
  feeValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
  },
  feeNote: {
    fontSize: typography.sizes.xs,
    color: colors.gray[400],
  },
  tierNote: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.gray[100],
  },
  tierNoteText: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
});
