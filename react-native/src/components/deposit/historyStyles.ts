/**
 * Styles for History component
 */

import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
  },
  refreshButton: {
    padding: spacing.xs,
  },
  refreshText: {
    fontSize: typography.sizes.lg,
    color: colors.primary[600],
  },
  tabs: {
    flexDirection: "row",
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingBottom: spacing.xs,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    gap: 4,
  },
  tabActive: {
    backgroundColor: colors.primary[50],
  },
  tabText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
  },
  tabTextActive: {
    color: colors.primary[700],
    fontWeight: typography.weights.medium,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: colors.primary[100],
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.medium,
    color: colors.gray[600],
  },
  tabBadgeTextActive: {
    color: colors.primary[700],
  },
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  txIconPositive: {
    backgroundColor: colors.success + "20",
  },
  txIconNegative: {
    backgroundColor: colors.error + "20",
  },
  txIconText: {
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  txContent: {
    flex: 1,
  },
  txMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  txType: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
  },
  txAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  txAmountPositive: {
    color: colors.success,
  },
  txAmountNegative: {
    color: colors.error,
  },
  txDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  txDescription: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
    marginRight: spacing.sm,
  },
  txDate: {
    fontSize: typography.sizes.xs,
    color: colors.gray[400],
  },
  empty: {
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyMessage: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
  },
  emptyHint: {
    fontSize: typography.sizes.xs,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  pageButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary[600],
    fontWeight: typography.weights.medium,
  },
  pageInfo: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: "center",
    padding: spacing.md,
  },
  retryButton: {
    alignSelf: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    backgroundColor: colors.primary[600],
  },
  retryButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.medium,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
  },
});
