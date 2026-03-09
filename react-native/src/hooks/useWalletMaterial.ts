/**
 * Hook for wallet material API operations (React Native)
 *
 * Uses singleton WalletApi instead of per-hook ApiClient.
 * See web useWalletMaterial.ts for architecture details.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { getWalletApi } from "../services/api";
import { toCredentialRequest } from "../utils/unlockCredential";
import type {
  UseWalletMaterialReturn,
  WalletMaterialResponse,
  WalletEnrollRequest,
  WalletRecoverRequest,
  RotateUserSecretRequest,
  SignTransactionRequest,
  SignTransactionResponse,
  WalletStatusApiResponse,
  UnlockCredential,
  WalletUnlockResponse,
  ShareCRecoveryRequest,
  ShareCRecoveryResponse,
  CreateDerivedWalletRequest,
  DerivedWalletResponse,
  AllWalletsListResponse,
} from "../types";

export function useWalletMaterial(): UseWalletMaterialReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleError = useCallback(
    (err: unknown, fallback: string): string => {
      const message =
        err instanceof Error ? err.message : fallback;
      if (isMountedRef.current) setError(message);
      return message;
    },
    [],
  );

  const getStatus = useCallback(async (): Promise<WalletStatusApiResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      return await getWalletApi().getWalletStatus();
    } catch (err) {
      const msg = handleError(err, "Failed to fetch wallet status");
      throw new Error(msg);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [handleError]);

  const getMaterial = useCallback(async (): Promise<WalletMaterialResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await getWalletApi().getWalletMaterial();
    } catch (err) {
      const apiError = err as { status?: number };
      if (apiError.status === 404) return null;
      const msg = handleError(err, "Failed to fetch wallet material");
      throw new Error(msg);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [handleError]);

  const enroll = useCallback(
    async (request: WalletEnrollRequest): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await getWalletApi().enroll(request);
      } catch (err) {
        const msg = handleError(err, "Failed to enroll wallet");
        throw new Error(msg);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [handleError],
  );

  const recover = useCallback(
    async (request: WalletRecoverRequest): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await getWalletApi().recover(request);
      } catch (err) {
        const msg = handleError(err, "Failed to recover wallet");
        throw new Error(msg);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [handleError],
  );

  const signTransaction = useCallback(
    async (request: SignTransactionRequest): Promise<SignTransactionResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getWalletApi().signTransaction(request);
      } catch (err) {
        const msg = handleError(err, "Failed to sign transaction");
        throw new Error(msg);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [handleError],
  );

  const rotateUserSecret = useCallback(
    async (request: RotateUserSecretRequest): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await getWalletApi().rotateUserSecret(request);
      } catch (err) {
        const msg = handleError(err, "Failed to rotate user secret");
        throw new Error(msg);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [handleError],
  );

  const unlock = useCallback(
    async (credential: UnlockCredential): Promise<WalletUnlockResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getWalletApi().unlock({
          credential: toCredentialRequest(credential),
        });
      } catch (err) {
        const msg = handleError(err, "Failed to unlock wallet");
        throw new Error(msg);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [handleError],
  );

  const lock = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await getWalletApi().lock();
    } catch (err) {
      const msg = handleError(err, "Failed to lock wallet");
      throw new Error(msg);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [handleError]);

  const getShareBForRecovery = useCallback(
    async (request: ShareCRecoveryRequest): Promise<ShareCRecoveryResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getWalletApi().getShareBForRecovery(request);
      } catch (err) {
        const msg = handleError(err, "Failed to get Share B for recovery");
        throw new Error(msg);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [handleError],
  );

  const createDerivedWallet = useCallback(
    async (request: CreateDerivedWalletRequest): Promise<DerivedWalletResponse> => {
      setIsLoading(true);
      setError(null);
      try {
        return await getWalletApi().createDerived(request);
      } catch (err) {
        const msg = handleError(err, "Failed to create derived wallet");
        throw new Error(msg);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [handleError],
  );

  const listAllWallets = useCallback(async (): Promise<AllWalletsListResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      return await getWalletApi().listDerived();
    } catch (err) {
      const msg = handleError(err, "Failed to list wallets");
      throw new Error(msg);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [handleError]);

  const deleteDerivedWallet = useCallback(
    async (walletId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await getWalletApi().deleteDerived(walletId);
      } catch (err) {
        const msg = handleError(err, "Failed to delete derived wallet");
        throw new Error(msg);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [handleError],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    getStatus,
    getMaterial,
    enroll,
    recover,
    signTransaction,
    rotateUserSecret,
    unlock,
    lock,
    getShareBForRecovery,
    createDerivedWallet,
    listAllWallets,
    deleteDerivedWallet,
    isLoading,
    error,
    clearError,
  };
}
