/**
 * Token selector component (React Native)
 *
 * Modal-based dropdown for selecting deposit token.
 * Shows search, token icons, and symbol/name.
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Image,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import type { Token } from "./tokens";

export interface TokenSelectorProps {
  tokens: Token[];
  selectedToken?: Token;
  onSelect: (token: Token) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
  placeholder = "Select token",
  disabled = false,
  searchable = true,
  containerStyle,
  testID = "token-selector",
}: TokenSelectorProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTokens = useMemo(() => {
    if (!search.trim()) return tokens;
    const lower = search.toLowerCase();
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(lower) ||
        t.name.toLowerCase().includes(lower) ||
        t.mint.toLowerCase().includes(lower),
    );
  }, [tokens, search]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setSearch("");
    }
  }, [disabled]);

  const handleSelect = useCallback(
    (token: Token) => {
      onSelect(token);
      setIsOpen(false);
      setSearch("");
    },
    [onSelect],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearch("");
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Token }) => {
      const isSelected = selectedToken?.mint === item.mint;
      return (
        <TouchableOpacity
          style={[styles.option, isSelected && styles.optionSelected]}
          onPress={() => handleSelect(item)}
          testID={`${testID}-option-${item.symbol}`}
        >
          {item.logoUrl ? (
            <Image
              source={{ uri: item.logoUrl }}
              style={styles.tokenIcon}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.tokenIcon, styles.tokenIconPlaceholder]}>
              <Text style={styles.tokenIconText}>
                {item.symbol.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenSymbol}>{item.symbol}</Text>
            <Text style={styles.tokenName}>{item.name}</Text>
          </View>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      );
    },
    [selectedToken, handleSelect, testID],
  );

  return (
    <View style={containerStyle} testID={testID}>
      {/* Trigger button */}
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={handleToggle}
        disabled={disabled}
        testID={`${testID}-trigger`}
      >
        {selectedToken ? (
          <View style={styles.selectedDisplay}>
            {selectedToken.logoUrl ? (
              <Image
                source={{ uri: selectedToken.logoUrl }}
                style={styles.triggerIcon}
                resizeMode="contain"
              />
            ) : null}
            <Text style={styles.triggerSymbol}>{selectedToken.symbol}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>{placeholder}</Text>
        )}
        <Text style={styles.arrow}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Modal dropdown */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Token</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {searchable && (
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search tokens..."
                placeholderTextColor={colors.gray[400]}
                autoFocus
                testID={`${testID}-search`}
              />
            )}

            <FlatList
              data={filteredTokens}
              renderItem={renderItem}
              keyExtractor={(item) => item.mint}
              style={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No tokens found</Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  selectedDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  triggerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  triggerSymbol: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
  },
  placeholderText: {
    fontSize: typography.sizes.base,
    color: colors.gray[400],
  },
  arrow: {
    fontSize: 12,
    color: colors.gray[400],
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    maxHeight: 400,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  dropdownTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
  },
  closeButton: {
    fontSize: 18,
    color: colors.gray[400],
    padding: 4,
  },
  searchInput: {
    margin: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    fontSize: typography.sizes.sm,
    color: colors.gray[900],
  },
  list: {
    maxHeight: 300,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  tokenIconPlaceholder: {
    backgroundColor: colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
  },
  tokenIconText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.gray[600],
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[900],
  },
  tokenName: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary[600],
    fontWeight: typography.weights.bold,
  },
  emptyText: {
    textAlign: "center",
    padding: spacing.lg,
    color: colors.gray[400],
    fontSize: typography.sizes.sm,
  },
});
