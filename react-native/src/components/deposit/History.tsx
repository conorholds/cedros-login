/**
 * Transaction history component (React Native)
 *
 * Tabbed interface showing deposits, usage, and adjustments.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useCredits } from "../../hooks/useCredits";
import { styles } from "./historyStyles";
import { getDecimalsForCurrency } from "./tokens";
import type {
  CreditTransactionResponse,
  CreditHistoryResponse,
} from "../../types/deposit";

export type HistoryCategory = "all" | "deposits" | "usage" | "adjustments";

interface TabConfig {
  key: HistoryCategory;
  label: string;
  txTypes: string[] | null;
}

const TABS: TabConfig[] = [
  { key: "all", label: "All", txTypes: null },
  { key: "deposits", label: "Deposits", txTypes: ["deposit"] },
  { key: "usage", label: "Usage", txTypes: ["spend", "usage", "charge"] },
  {
    key: "adjustments",
    label: "Adjustments",
    txTypes: ["refund", "adjustment", "bonus", "credit"],
  },
];

export interface HistoryProps {
  defaultTab?: HistoryCategory;
  pageSize?: number;
  refreshInterval?: number;
  onLoad?: (history: CreditHistoryResponse) => void;
  onTransactionClick?: (transaction: CreditTransactionResponse) => void;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

function formatAmount(lamports: number, currency: string): string {
  const isNegative = lamports < 0;
  const absLamports = Math.abs(lamports);
  // C-04: Use token definitions for correct decimals (not just SOL=9, other=6)
  const decimals = getDecimalsForCurrency(currency);
  const amount = absLamports / Math.pow(10, decimals);
  const prefix = isNegative ? "-" : "+";
  const isUsd = currency.toUpperCase() !== "SOL";
  if (!isUsd) return `${prefix}${amount.toFixed(4)} SOL`;
  return `${prefix}$${amount.toFixed(2)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      return `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getTypeLabel(txType: string | undefined): string {
  if (!txType) return "Transaction";
  const labels: Record<string, string> = {
    deposit: "Deposit",
    spend: "Usage",
    usage: "Usage",
    charge: "Charge",
    refund: "Refund",
    adjustment: "Adjustment",
    bonus: "Bonus",
    credit: "Credit",
  };
  return labels[txType.toLowerCase()] || txType;
}

function getTypeIcon(txType: string | undefined, isPositive: boolean): string {
  const type = (txType || "").toLowerCase();
  if (type === "deposit") return "↓";
  if (type === "spend" || type === "usage" || type === "charge") return "↑";
  if (type === "refund") return "←";
  if (type === "bonus" || type === "credit") return "★";
  if (type === "adjustment") return isPositive ? "+" : "−";
  return isPositive ? "+" : "−";
}

export function History({
  defaultTab = "all",
  pageSize = 10,
  refreshInterval = 0,
  onLoad,
  onTransactionClick,
  containerStyle,
  testID = "history",
}: HistoryProps): React.ReactElement {
  const { getHistory, isLoading, error, clearError } = useCredits();

  const [activeTab, setActiveTab] = useState<HistoryCategory>(defaultTab);
  const [transactions, setTransactions] = useState<
    CreditTransactionResponse[]
  >([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];

  const filteredTransactions = useMemo(() => {
    if (currentTab.txTypes === null) return transactions;
    return transactions.filter((tx) => {
      const txType = tx.txType || "";
      return currentTab.txTypes!.some((type) =>
        txType.toLowerCase() === type.toLowerCase(),
      );
    });
  }, [transactions, currentTab.txTypes]);

  const fetchHistory = useCallback(async () => {
    try {
      const result = await getHistory({ limit: pageSize * 3, offset });
      setTransactions(result.transactions);
      setTotal(result.total);
      onLoad?.(result);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load history",
      );
    }
  }, [pageSize, offset, getHistory, onLoad]);

  useEffect(() => {
    setOffset(0);
  }, [activeTab]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (refreshInterval <= 0) return;
    const interval = setInterval(fetchHistory, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchHistory]);

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * pageSize;
    setOffset(Math.max(0, Math.min(newOffset, Math.max(0, total - 1))));
  };

  const getTabCount = (tab: TabConfig): number => {
    if (tab.txTypes === null) return transactions.length;
    return transactions.filter((tx) => {
      const txType = tx.txType || "";
      return tab.txTypes!.some((type) =>
        txType.toLowerCase() === type.toLowerCase(),
      );
    }).length;
  };

  // Error state
  if (loadError || error) {
    return (
      <View style={[styles.container, containerStyle]} testID={testID}>
        <Text style={styles.errorText}>{loadError || error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            clearError();
            setLoadError(null);
            fetchHistory();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading (initial)
  if (isLoading && transactions.length === 0) {
    return (
      <View style={[styles.container, styles.centered, containerStyle]} testID={testID}>
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: CreditTransactionResponse }) => {
    const isPositive = item.amountLamports >= 0;
    return (
      <TouchableOpacity
        style={styles.txItem}
        onPress={() => onTransactionClick?.(item)}
        disabled={!onTransactionClick}
      >
        <View
          style={[
            styles.txIcon,
            isPositive ? styles.txIconPositive : styles.txIconNegative,
          ]}
        >
          <Text style={styles.txIconText}>
            {getTypeIcon(item.txType, isPositive)}
          </Text>
        </View>

        <View style={styles.txContent}>
          <View style={styles.txMainRow}>
            <Text style={styles.txType}>{getTypeLabel(item.txType)}</Text>
            <Text
              style={[
                styles.txAmount,
                isPositive ? styles.txAmountPositive : styles.txAmountNegative,
              ]}
            >
              {formatAmount(item.amountLamports, item.currency)}
            </Text>
          </View>
          <View style={styles.txDetailRow}>
            <Text style={styles.txDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <TouchableOpacity
          onPress={fetchHistory}
          disabled={isLoading}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>{isLoading ? "..." : "↻"}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const count = getTabCount(tab);
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    isActive && styles.tabBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      isActive && styles.tabBadgeTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyMessage}>
            {activeTab === "all"
              ? "No transactions yet."
              : `No ${currentTab.label.toLowerCase()} found.`}
          </Text>
          {activeTab === "all" && (
            <Text style={styles.emptyHint}>
              Make a deposit to get started.
            </Text>
          )}
        </View>
      ) : (
        <>
          <FlatList
            data={filteredTransactions.slice(0, pageSize)}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                style={[
                  styles.pageButton,
                  currentPage <= 1 && styles.pageButtonDisabled,
                ]}
              >
                <Text style={styles.pageButtonText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </Text>
              <TouchableOpacity
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                style={[
                  styles.pageButton,
                  currentPage >= totalPages && styles.pageButtonDisabled,
                ]}
              >
                <Text style={styles.pageButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
