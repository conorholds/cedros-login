/**
 * Hook to fetch wallet discovery config from server (React Native)
 *
 * Uses singleton WalletApi. Fetches on mount and caches the result.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getWalletApi } from "../services/api";
import type { WalletDiscoveryConfig, WalletRecoveryMode } from "../types";

const VALID_RECOVERY_MODES: WalletRecoveryMode[] = [
  "share_c_only",
  "full_seed",
  "none",
];

function normalizeRecoveryMode(
  mode: string | undefined,
): WalletRecoveryMode {
  if (!mode) return "share_c_only";
  return VALID_RECOVERY_MODES.includes(mode as WalletRecoveryMode)
    ? (mode as WalletRecoveryMode)
    : "share_c_only";
}

export interface UseWalletDiscoveryReturn {
  walletEnabled: boolean;
  recoveryMode: WalletRecoveryMode;
  unlockTtlSeconds: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWalletDiscovery(): UseWalletDiscoveryReturn {
  const [walletConfig, setWalletConfig] =
    useState<WalletDiscoveryConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getWalletApi().getDiscovery();

      if (!isMountedRef.current) return;

      if (response.wallet) {
        setWalletConfig({
          enabled: response.wallet.enabled,
          recoveryMode: normalizeRecoveryMode(
            response.wallet.recoveryMode,
          ),
          unlockTtlSeconds: response.wallet.unlockTtlSeconds,
        });
      } else {
        setWalletConfig({
          enabled: false,
          recoveryMode: "share_c_only",
          unlockTtlSeconds: 900,
        });
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch wallet config";
      setError(message);
      setWalletConfig({
        enabled: false,
        recoveryMode: "share_c_only",
        unlockTtlSeconds: 900,
      });
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    walletEnabled: walletConfig?.enabled ?? false,
    recoveryMode: walletConfig?.recoveryMode ?? "share_c_only",
    unlockTtlSeconds: walletConfig?.unlockTtlSeconds ?? 900,
    isLoading,
    error,
    refetch: fetchConfig,
  };
}
