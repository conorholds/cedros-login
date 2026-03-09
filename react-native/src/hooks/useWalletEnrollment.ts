/**
 * Hook for wallet enrollment flow (React Native)
 *
 * Key differences from web:
 * - Uses argon2Derive() directly (no Web Worker)
 * - No passkey/PRF support (password-only)
 * - Uses singleton WalletApi via useWalletMaterial
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useCedrosLogin } from "../context";
import {
  generateSeed,
  generateArgon2Salt,
  splitSecret,
  argon2Derive,
  aesGcmEncryptToBase64,
  uint8ArrayToBase64,
  getPublicKeyFromSeed,
  publicKeyToBase58,
  seedToMnemonic,
  shareToMnemonic,
  wipeAll,
  toEncryptionKey,
  toShamirShare,
  DEFAULT_KDF_PARAMS,
} from "../crypto";
import { useWalletMaterial } from "./useWalletMaterial";
import { useWalletDiscovery } from "./useWalletDiscovery";
import type {
  UseWalletEnrollmentReturn,
  EnrollmentState,
  WalletEnrollRequest,
  ShareAAuthMethod,
} from "../types";

export function useWalletEnrollment(): UseWalletEnrollmentReturn {
  const { user } = useCedrosLogin();
  const { enroll } = useWalletMaterial();
  const { recoveryMode } = useWalletDiscovery();

  const [state, setState] = useState<EnrollmentState>({ step: "idle" });
  const [isEnrolling, setIsEnrolling] = useState(false);

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

  const doEnrollment = useCallback(
    async (
      authMethod: ShareAAuthMethod,
      encryptionKey: Uint8Array,
      kdfSalt?: Uint8Array,
    ): Promise<void> => {
      setState({ step: "generating_seed" });
      const seed = generateSeed();
      sensitiveData.current.push(seed);

      setState({ step: "splitting_shares" });
      const { shareA, shareB, shareC } = splitSecret(seed);
      sensitiveData.current.push(shareA, shareB, shareC);

      setState({ step: "encrypting_shares" });
      const encryptedA = await aesGcmEncryptToBase64(
        shareA,
        toEncryptionKey(encryptionKey),
      );

      const publicKey = getPublicKeyFromSeed(seed);
      const solanaPubkey = publicKeyToBase58(publicKey);

      setState({ step: "uploading" });

      const request: WalletEnrollRequest = {
        solanaPubkey,
        shareAAuthMethod: authMethod,
        shareACiphertext: encryptedA.ciphertext,
        shareANonce: encryptedA.nonce,
        shareB: uint8ArrayToBase64(shareB),
      };

      if (authMethod === "password") {
        if (!kdfSalt) throw new Error("KDF salt required for password method");
        request.shareAKdfSalt = uint8ArrayToBase64(kdfSalt);
        request.shareAKdfParams = DEFAULT_KDF_PARAMS;
      }

      await enroll(request);

      if (recoveryMode === "none") {
        cleanup();
        setState({ step: "complete", solanaPubkey });
      } else {
        const recoveryPhrase =
          recoveryMode === "full_seed"
            ? seedToMnemonic(seed)
            : shareToMnemonic(toShamirShare(shareC));

        setState({
          step: "showing_recovery",
          recoveryPhrase,
          solanaPubkey,
        });
      }
    },
    [enroll, recoveryMode, cleanup],
  );

  const startEnrollmentWithPassword = useCallback(
    async (password: string): Promise<void> => {
      if (!user) {
        setState({ step: "error", error: "User not authenticated" });
        return;
      }

      setIsEnrolling(true);
      cleanup();

      try {
        const salt = generateArgon2Salt();
        // RN: argon2Derive on main thread (~200ms, acceptable with loading indicator)
        const key = await argon2Derive(password, salt, DEFAULT_KDF_PARAMS);
        sensitiveData.current.push(key);

        await doEnrollment("password", key, salt);
      } catch (err) {
        setState({
          step: "error",
          error: err instanceof Error ? err.message : "Enrollment failed",
        });
      } finally {
        setIsEnrolling(false);
      }
    },
    [user, cleanup, doEnrollment],
  );

  const startEnrollmentWithPasskey = useCallback(async (): Promise<void> => {
    setState({
      step: "error",
      error: "Passkey enrollment is not supported on mobile. Use password instead.",
    });
  }, []);

  const confirmRecoveryPhrase = useCallback(() => {
    const solanaPubkey = state.solanaPubkey;
    cleanup();
    setState({ step: "complete", solanaPubkey });
  }, [state.solanaPubkey, cleanup]);

  const cancel = useCallback(() => {
    cleanup();
    setState({ step: "idle" });
    setIsEnrolling(false);
  }, [cleanup]);

  return {
    state,
    startEnrollmentWithPassword,
    startEnrollmentWithPasskey,
    confirmRecoveryPhrase,
    cancel,
    isEnrolling,
  };
}
