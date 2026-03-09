/**
 * High-level hook for multi-wallet management (React Native)
 *
 * Wraps useWalletMaterial to provide a simpler API for listing,
 * creating, and deleting derived wallets.
 */

import { useState, useCallback } from "react";
import { useWalletMaterial } from "./useWalletMaterial";
import type {
  UseWalletsReturn,
  DerivedWalletSummary,
  DerivedWalletResponse,
} from "../types";

export function useWallets(): UseWalletsReturn {
  const { listAllWallets, createDerivedWallet, deleteDerivedWallet } =
    useWalletMaterial();
  const [wallets, setWallets] = useState<DerivedWalletSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAllWallets();
      setWallets(response.wallets);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to list wallets";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [listAllWallets]);

  const createWallet = useCallback(
    async (label: string): Promise<DerivedWalletResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await createDerivedWallet({ label });
        await refresh();
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create wallet";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [createDerivedWallet, refresh],
  );

  const deleteWallet = useCallback(
    async (walletId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await deleteDerivedWallet(walletId);
        await refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete wallet";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [deleteDerivedWallet, refresh],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    wallets,
    isLoading,
    createWallet,
    deleteWallet,
    refresh,
    error,
    clearError,
  };
}
