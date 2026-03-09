/**
 * Hook for Privacy Cash deposit operations (React Native)
 *
 * Uses singleton DepositApi. Supports private deposits, public deposits
 * (Jupiter swap), and SOL micro deposits.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getDepositApi } from "../services/api";
import type {
  UseDepositReturn,
  DepositResponse,
  DepositStatusResponse,
  DepositConfigResponse,
  DepositListResponse,
  DepositQuoteResponse,
  PublicDepositRequest,
  MicroDepositRequest,
  TieredDepositResponse,
} from "../types";

export function useDeposit(): UseDepositReturn {
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

  const deposit = useCallback(
    async (amountLamports: number): Promise<DepositResponse> => {
      if (!Number.isInteger(amountLamports) || amountLamports <= 0) {
        const err = new Error(
          `Invalid deposit amount: ${amountLamports}. Must be a positive integer (lamports).`,
        );
        setError(err.message);
        throw err;
      }
      setIsLoading(true);
      setError(null);
      try {
        return await getDepositApi().deposit(amountLamports);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to execute deposit";
        if (isMountedRef.current) setError(msg);
        throw err;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [],
  );

  const getStatus = useCallback(
    async (sessionId: string): Promise<DepositStatusResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getDepositApi().getStatus(sessionId);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to get deposit status";
        if (isMountedRef.current) setError(msg);
        throw err;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [],
  );

  const getConfig = useCallback(async (): Promise<DepositConfigResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      return await getDepositApi().getConfig();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to get deposit config";
      if (isMountedRef.current) setError(msg);
      throw err;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, []);

  const listDeposits = useCallback(
    async (options?: {
      limit?: number;
      offset?: number;
    }): Promise<DepositListResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getDepositApi().listDeposits(options);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to list deposits";
        if (isMountedRef.current) setError(msg);
        throw err;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [],
  );

  const getQuote = useCallback(
    async (params: {
      inputMint: string;
      amount: number;
      taker: string;
    }): Promise<DepositQuoteResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getDepositApi().getQuote(params);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to get deposit quote";
        if (isMountedRef.current) setError(msg);
        throw err;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [],
  );

  const publicDeposit = useCallback(
    async (request: PublicDepositRequest): Promise<TieredDepositResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getDepositApi().publicDeposit(request);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to execute public deposit";
        if (isMountedRef.current) setError(msg);
        throw err;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [],
  );

  const microDeposit = useCallback(
    async (request: MicroDepositRequest): Promise<TieredDepositResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getDepositApi().microDeposit(request);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to execute micro deposit";
        if (isMountedRef.current) setError(msg);
        throw err;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [],
  );

  return {
    deposit,
    getQuote,
    publicDeposit,
    microDeposit,
    getStatus,
    getConfig,
    listDeposits,
    isLoading,
    error,
    clearError,
  };
}
