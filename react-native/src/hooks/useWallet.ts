import { useCallback, useState, useEffect, useRef } from "react";
import { getWalletApi } from "../services/api";
import type {
  WalletMaterialResponse,
  WalletStatusApiResponse,
  WalletEnrollRequest,
  AuthError,
} from "../types";

export interface UseWalletReturn {
  wallet: WalletMaterialResponse | null;
  status: WalletStatusApiResponse | null;
  isLoading: boolean;
  error: AuthError | null;
  publicKey: string | null;
  enroll: (request: WalletEnrollRequest) => Promise<void>;
  refreshWallet: () => Promise<void>;
  clearError: () => void;
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<WalletMaterialResponse | null>(null);
  const [status, setStatus] = useState<WalletStatusApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const isMountedRef = useRef(true);

  const refreshWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [walletData, statusData] = await Promise.all([
        getWalletApi().getWalletMaterial(),
        getWalletApi().getWalletStatus(),
      ]);
      if (isMountedRef.current) {
        setWallet(walletData);
        setStatus(statusData);
      }
    } catch (err) {
      const authError: AuthError =
        err instanceof Error
          ? { code: "SERVER_ERROR", message: err.message }
          : { code: "SERVER_ERROR", message: "Failed to load wallet" };
      if (isMountedRef.current) {
        setError(authError);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    refreshWallet();
    return () => {
      isMountedRef.current = false;
    };
  }, [refreshWallet]);

  const enroll = useCallback(
    async (request: WalletEnrollRequest): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await getWalletApi().enroll(request);
        await refreshWallet();
      } catch (err) {
        const authError: AuthError =
          err instanceof Error
            ? { code: "VALIDATION_ERROR", message: err.message }
            : { code: "VALIDATION_ERROR", message: "Failed to enroll wallet" };
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshWallet],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const publicKey = wallet?.solanaPubkey || null;

  return {
    wallet,
    status,
    isLoading,
    error,
    publicKey,
    enroll,
    refreshWallet,
    clearError,
  };
}
