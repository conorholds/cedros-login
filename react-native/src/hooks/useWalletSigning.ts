/**
 * Hook for wallet transaction signing (React Native)
 *
 * Signing happens server-side. Client sends credential + transaction,
 * receives signature. No passkey/PRF support on mobile.
 */

import { useState, useCallback } from "react";
import { useCedrosLogin } from "../context";
import { useWalletMaterial } from "./useWalletMaterial";
import { base64ToUint8Array, uint8ArrayToBase64 } from "../crypto";
import { toCredentialRequest } from "../utils/unlockCredential";
import type { UseWalletSigningReturn, UnlockCredential } from "../types";

export function useWalletSigning(): UseWalletSigningReturn {
  const { user } = useCedrosLogin();
  const { signTransaction: apiSignTransaction } = useWalletMaterial();

  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signTransaction = useCallback(
    async (
      transaction: Uint8Array,
      credential?: UnlockCredential,
    ): Promise<Uint8Array> => {
      if (!user) {
        const msg = "User not authenticated";
        setError(msg);
        throw new Error(msg);
      }

      setIsSigning(true);
      setError(null);

      try {
        const request = {
          transaction: uint8ArrayToBase64(transaction),
          ...(credential
            ? { credential: toCredentialRequest(credential) }
            : {}),
        };

        const response = await apiSignTransaction(request);
        return base64ToUint8Array(response.signature);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Signing failed";
        setError(msg);
        throw err;
      } finally {
        setIsSigning(false);
      }
    },
    [user, apiSignTransaction],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    signTransaction,
    isSigning,
    error,
    clearError,
  };
}
