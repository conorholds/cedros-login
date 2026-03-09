/**
 * Hook for wallet recovery flow (React Native)
 *
 * Key differences from web:
 * - Uses argon2Derive() directly (no Web Worker)
 * - No passkey/PRF recovery path (password-only)
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  mnemonicToSeed,
  mnemonicToShare,
  isValidMnemonic,
  combineShares,
  splitSecret,
  generateArgon2Salt,
  argon2Derive,
  aesGcmEncryptToBase64,
  getPublicKeyFromSeed,
  publicKeyToBase58,
  wipeAll,
  toEncryptionKey,
  toShamirShare,
  DEFAULT_KDF_PARAMS,
  base64ToUint8Array,
  uint8ArrayToBase64,
  type Seed,
} from "../crypto";
import { useWalletMaterial } from "./useWalletMaterial";
import { useWalletDiscovery } from "./useWalletDiscovery";
import type {
  UseWalletRecoveryReturn,
  RecoveryState,
  WalletRecoverRequest,
  ShareAAuthMethod,
} from "../types";

export function useWalletRecovery(): UseWalletRecoveryReturn {
  const { recover, getShareBForRecovery } = useWalletMaterial();
  const { recoveryMode } = useWalletDiscovery();

  const [state, setState] = useState<RecoveryState>({ step: "idle" });
  const [isRecovering, setIsRecovering] = useState(false);

  const sensitiveData = useRef<Uint8Array[]>([]);

  const cleanup = useCallback(() => {
    wipeAll(...sensitiveData.current);
    sensitiveData.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startRecovery = useCallback(
    async (
      words: string[],
      method: ShareAAuthMethod,
      credential: string,
    ): Promise<void> => {
      if (method === "passkey") {
        setState({
          step: "error",
          error: "Passkey recovery is not supported on mobile. Use password instead.",
        });
        return;
      }

      setIsRecovering(true);
      cleanup();

      try {
        setState({ step: "validating" });

        if (!isValidMnemonic(words)) {
          throw new Error("Invalid recovery phrase. Please check your words.");
        }

        let seed: Seed;

        if (recoveryMode === "share_c_only") {
          const shareC = mnemonicToShare(words);
          sensitiveData.current.push(shareC);

          const shareCBase64 = uint8ArrayToBase64(shareC);
          const response = await getShareBForRecovery({
            shareC: shareCBase64,
          });

          const shareB = base64ToUint8Array(response.shareB);
          sensitiveData.current.push(shareB);

          seed = combineShares(
            toShamirShare(shareB),
            toShamirShare(shareC),
          );
          sensitiveData.current.push(seed);
        } else {
          seed = mnemonicToSeed(words);
          sensitiveData.current.push(seed);
        }

        const publicKey = getPublicKeyFromSeed(seed);
        const solanaPubkey = publicKeyToBase58(publicKey);

        const { shareA, shareB } = splitSecret(seed);
        sensitiveData.current.push(shareA, shareB);

        setState({ step: "encrypting" });

        // RN: argon2Derive on main thread
        const kdfSalt = generateArgon2Salt();
        const encryptionKey = await argon2Derive(
          credential,
          kdfSalt,
          DEFAULT_KDF_PARAMS,
        );
        sensitiveData.current.push(encryptionKey);

        const encryptedA = await aesGcmEncryptToBase64(
          shareA,
          toEncryptionKey(encryptionKey),
        );

        setState({ step: "uploading" });

        const request: WalletRecoverRequest = {
          solanaPubkey,
          shareAAuthMethod: "password",
          shareACiphertext: encryptedA.ciphertext,
          shareANonce: encryptedA.nonce,
          shareB: uint8ArrayToBase64(shareB),
          shareAKdfSalt: uint8ArrayToBase64(kdfSalt),
          shareAKdfParams: DEFAULT_KDF_PARAMS,
        };

        await recover(request);

        cleanup();
        setState({ step: "complete" });
      } catch (err) {
        cleanup();
        setState({
          step: "error",
          error: err instanceof Error ? err.message : "Recovery failed",
        });
      } finally {
        setIsRecovering(false);
      }
    },
    [recover, getShareBForRecovery, recoveryMode, cleanup],
  );

  const cancel = useCallback(() => {
    cleanup();
    setState({ step: "idle" });
    setIsRecovering(false);
  }, [cleanup]);

  return {
    state,
    startRecovery,
    cancel,
    isRecovering,
  };
}
