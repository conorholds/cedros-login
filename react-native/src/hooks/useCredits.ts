/**
 * Hook for credit balance and transaction history (React Native)
 *
 * Uses singleton DepositApi for credit-related endpoints.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getDepositApi } from "../services/api";
import type {
  UseCreditsReturn,
  CreditBalanceResponse,
  CreditHistoryResponse,
} from "../types";

export function useCredits(): UseCreditsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const getBalance = useCallback(async (): Promise<CreditBalanceResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      return await getDepositApi().getBalance();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch credit balance";
      if (isMountedRef.current) setError(msg);
      throw err;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  const getAllBalances = useCallback(
    async (): Promise<CreditBalanceResponse[]> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getDepositApi().getAllBalances();
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to fetch credit balances";
        if (isMountedRef.current) setError(msg);
        throw err;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [],
  );

  const getHistory = useCallback(
    async (options?: {
      currency?: string;
      limit?: number;
      offset?: number;
    }): Promise<CreditHistoryResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getDepositApi().getHistory(options);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to fetch transaction history";
        if (isMountedRef.current) setError(msg);
        throw err;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [],
  );

  return {
    getBalance,
    getAllBalances,
    getHistory,
    isLoading,
    error,
    clearError,
  };
}
