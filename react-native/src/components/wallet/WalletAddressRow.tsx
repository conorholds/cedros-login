import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export interface WalletAddressRowProps {
  address: string;
  label?: string;
  showCopy?: boolean;
  showExplorerLink?: boolean;
  allowReveal?: boolean;
  network?: string;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Try clipboard — optional dep with fallback */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ClipboardModule = require("@react-native-clipboard/clipboard");
    const Clipboard = ClipboardModule.default ?? ClipboardModule;
    Clipboard.setString(text);
    return true;
  } catch {
    // Clipboard package not installed — no-op
    return false;
  }
}

export function WalletAddressRow({
  address,
  label = "Wallet Address",
  showCopy = true,
  showExplorerLink = true,
  allowReveal = true,
  network = "mainnet-beta",
  containerStyle,
  testID = "wallet-address-row",
}: WalletAddressRowProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [revealFull, setRevealFull] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const explorerUrl = useMemo(() => {
    const base = `https://explorer.solana.com/address/${address}`;
    if (network === "mainnet-beta") return base;
    return `${base}?cluster=${encodeURIComponent(network)}`;
  }, [address, network]);

  const isTruncatable = allowReveal && address.length > 18;

  const displayAddress = useMemo(() => {
    if (!isTruncatable || revealFull) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  }, [address, isTruncatable, revealFull]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(address);
    if (!ok) return;
    setCopied(true);
    if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
      copyTimerRef.current = null;
    }, 2000);
  }, [address]);

  const handleExplorer = useCallback(() => {
    Linking.openURL(explorerUrl);
  }, [explorerUrl]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) clearTimeout(copyTimerRef.current);
    };
  }, []);

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]} testID={testID}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.xs,
        }}
      >
        <Text
          style={{
            fontSize: typography.sizes.sm,
            color: colors.gray[500],
          }}
        >
          {label}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {isTruncatable && (
            <TouchableOpacity onPress={() => setRevealFull((v) => !v)}>
              <Text
                style={{
                  fontSize: typography.sizes.xs,
                  color: colors.primary[600],
                }}
              >
                {revealFull ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          )}
          {showExplorerLink && (
            <TouchableOpacity onPress={handleExplorer}>
              <Text
                style={{
                  fontSize: typography.sizes.xs,
                  color: colors.primary[600],
                }}
              >
                Explorer
              </Text>
            </TouchableOpacity>
          )}
          {showCopy && (
            <TouchableOpacity onPress={handleCopy}>
              <Text
                style={{
                  fontSize: typography.sizes.xs,
                  color: copied ? colors.success : colors.primary[600],
                }}
              >
                {copied ? "Copied" : "Copy"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text
        style={{
          fontSize: typography.sizes.sm,
          color: colors.gray[900],
          fontFamily: "monospace",
        }}
        selectable
      >
        {displayAddress}
      </Text>
    </View>
  );
}
