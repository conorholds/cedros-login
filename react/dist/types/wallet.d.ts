import { WalletStatus, CryptoCapabilities, EnrollmentState, RecoveryState, KdfParams } from '../crypto';
export type { WalletStatus, CryptoCapabilities, EnrollmentState, RecoveryState, KdfParams };
/**
 * Wallet recovery mode (configured server-side via WALLET_RECOVERY_MODE)
 * - share_c_only: User gets Share C only. Recovery within app, not portable.
 * - full_seed: User gets full seed. Can use wallet elsewhere (portable).
 * - none: No recovery option. Used for Privacy Cash deposits to prevent front-running.
 */
export type WalletRecoveryMode = 'share_c_only' | 'full_seed' | 'none';
/**
 * Wallet discovery config from server
 */
export interface WalletDiscoveryConfig {
    /** Whether wallet feature is enabled */
    enabled: boolean;
    /** Recovery mode: share_c_only or full_seed */
    recoveryMode: WalletRecoveryMode;
    /** Session unlock TTL in seconds */
    unlockTtlSeconds: number;
}
/**
 * Authentication method for Share A encryption
 * - password: Email users use their login password (Argon2id KDF)
 * - passkey: Users with passkey login use PRF extension (HKDF)
 */
export type ShareAAuthMethod = 'password' | 'passkey';
/**
 * Wallet material response from server
 * Note: Server no longer returns share ciphertexts - shares stay on server
 */
export interface WalletMaterialResponse {
    solanaPubkey: string;
    schemeVersion: number;
    shareAAuthMethod: ShareAAuthMethod;
    /** PRF salt for passkey auth method (base64, 32 bytes) */
    prfSalt?: string;
    createdAt: string;
    updatedAt: string;
}
/** Request to enroll wallet  */
export interface WalletEnrollRequest {
    solanaPubkey: string;
    /** Auth method for Share A encryption */
    shareAAuthMethod: ShareAAuthMethod;
    /** Encrypted Share A (base64) */
    shareACiphertext: string;
    /** Nonce for Share A encryption (base64, 12 bytes) */
    shareANonce: string;
    /** KDF salt for password/PIN method (base64) */
    shareAKdfSalt?: string;
    /** KDF params for password/PIN method */
    shareAKdfParams?: KdfParams;
    /** PRF salt for passkey method (base64, 32 bytes) */
    prfSalt?: string;
    /** Plaintext Share B (base64) - SSS math protects it */
    shareB: string;
    /**
     * Recovery data (base64) - sent when recovery mode is enabled
     * Contains the full seed for server-side storage until user acknowledges
     */
    recoveryData?: string;
}
/** Request to get Share B for Share C recovery mode */
export interface ShareCRecoveryRequest {
    /** Share C data (base64, 32 bytes decoded from mnemonic) */
    shareC: string;
}
/** Response from Share C recovery endpoint */
export interface ShareCRecoveryResponse {
    /** Share B (base64) */
    shareB: string;
    /** Solana pubkey (for verification) */
    solanaPubkey: string;
}
/** Request to recover wallet (replace existing with new credentials) */
export interface WalletRecoverRequest {
    /** Solana pubkey (must match existing wallet to prove ownership) */
    solanaPubkey: string;
    /** Auth method for Share A encryption */
    shareAAuthMethod: ShareAAuthMethod;
    /** Encrypted Share A (base64) */
    shareACiphertext: string;
    /** Nonce for Share A encryption (base64, 12 bytes) */
    shareANonce: string;
    /** KDF salt for password/PIN method (base64) */
    shareAKdfSalt?: string;
    /** KDF params for password/PIN method */
    shareAKdfParams?: KdfParams;
    /** PRF salt for passkey method (base64, 32 bytes) */
    prfSalt?: string;
    /** Plaintext Share B (base64) */
    shareB: string;
}
/**
 * Credential for unlocking wallet / signing transactions (frontend internal use)
 *
 * TYPE-02: This type uses explicit `type` discriminator for TypeScript narrowing.
 * When sending to server API, convert to `UnlockCredentialRequest` which uses
 * the flattened format expected by the backend (`{ password: '...' }` not
 * `{ type: 'password', password: '...' }`).
 *
 * @see UnlockCredentialRequest for API request format
 */
export type UnlockCredential = {
    type: 'password';
    password: string;
} | {
    type: 'prfOutput';
    prfOutput: string;
};
/** Request to sign a transaction  */
export interface SignTransactionRequest {
    /** Transaction bytes (base64) */
    transaction: string;
    /** Unlock credential */
    credential?: UnlockCredentialRequest;
}
/**
 * Credential for API request (flattened format matching server)
 *
 * TYPE-02: Server uses Serde's flattened enum format, so only ONE of these
 * fields should be present in the request object. Do NOT include `type` field.
 *
 * @example { password: 'secret' }
 * @example { prfOutput: 'base64...' }
 */
export type UnlockCredentialRequest = {
    password: string;
} | {
    prfOutput: string;
};
/** Response from transaction signing */
export interface SignTransactionResponse {
    /** Ed25519 signature (base64, 64 bytes) */
    signature: string;
    /** Solana pubkey that signed */
    pubkey: string;
}
/**
 * Request to rotate user secret (re-encrypt Share A)
 *
 * TYPE-04: Current credential fields are FLATTENED into this struct (not nested).
 * The server uses `#[serde(flatten)]` so credential fields appear at root level.
 * E.g., send `{ password: "xxx", newAuthMethod: "passkey", ... }` not `{ currentCredential: {...} }`
 *
 * BUILD-01: Uses intersection type instead of interface-extends because
 * UnlockCredentialRequest is a union type (TypeScript doesn't allow interfaces
 * to extend union types).
 */
export type RotateUserSecretRequest = UnlockCredentialRequest & {
    /** New auth method */
    newAuthMethod: ShareAAuthMethod;
    /** New encrypted Share A (base64) */
    shareACiphertext: string;
    /** New nonce (base64, 12 bytes) */
    shareANonce: string;
    /** New KDF salt for password/PIN (base64) */
    shareAKdfSalt?: string;
    /** New KDF params for password/PIN */
    shareAKdfParams?: KdfParams;
    /** New PRF salt for passkey (base64, 32 bytes) */
    prfSalt?: string;
};
/** Message response from server */
export interface MessageResponse {
    message: string;
}
/** Request to unlock wallet for session-based signing */
export interface WalletUnlockRequest {
    /** Unlock credential (flattened format) */
    credential: UnlockCredentialRequest;
}
/** Response from wallet unlock */
export interface WalletUnlockResponse {
    /** Whether wallet is now unlocked */
    unlocked: boolean;
    /** TTL in seconds until auto-lock */
    ttlSeconds: number;
}
/** Wallet status response from server */
export interface WalletStatusApiResponse {
    /** Whether SSS embedded wallet is enrolled */
    enrolled: boolean;
    /** Whether wallet is currently unlocked for signing */
    unlocked: boolean;
    /** Solana public key (from SSS wallet if enrolled, or external wallet if connected) */
    solanaPubkey?: string;
    /** Auth method for SSS wallet (if enrolled) */
    authMethod?: ShareAAuthMethod;
    /** Whether user signed in with external Solana wallet (not SSS) */
    hasExternalWallet: boolean;
}
/** Wallet context value */
export interface WalletContextValue {
    /** Current wallet status */
    status: WalletStatus;
    /** Solana public key (from SSS wallet if enrolled, or external wallet) */
    solanaPubkey: string | null;
    /** Auth method for Share A (if enrolled in SSS wallet) */
    authMethod: ShareAAuthMethod | null;
    /** Whether user signed in with external Solana wallet (not SSS) */
    hasExternalWallet: boolean;
    /** Whether SSS wallet is unlocked for signing */
    isUnlocked: boolean;
    /** Crypto capabilities */
    capabilities: CryptoCapabilities | null;
    /** Whether all required capabilities are available */
    isSupported: boolean;
    /** Error message if any */
    error: string | null;
    /** Refresh wallet status */
    refresh: () => Promise<void>;
    /** Clear error */
    clearError: () => void;
}
/** Enrollment hook return value  */
export interface UseWalletEnrollmentReturn {
    /** Current enrollment state */
    state: EnrollmentState;
    /** Start enrollment with password (email users) */
    startEnrollmentWithPassword: (password: string) => Promise<void>;
    /** Start enrollment with passkey PRF */
    startEnrollmentWithPasskey: () => Promise<void>;
    /** Confirm user has saved recovery phrase */
    confirmRecoveryPhrase: () => void;
    /** Cancel enrollment */
    cancel: () => void;
    /** Whether enrollment is in progress */
    isEnrolling: boolean;
}
/**
 * Signing hook return value
 * Signing is server-side. Client just provides credential.
 */
export interface UseWalletSigningReturn {
    /** Sign a transaction */
    signTransaction: (transaction: Uint8Array, credential?: UnlockCredential) => Promise<Uint8Array>;
    /** Whether signing is in progress */
    isSigning: boolean;
    /** Error from last signing attempt */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}
/** Recovery hook return value */
export interface UseWalletRecoveryReturn {
    /** Current recovery state */
    state: RecoveryState;
    /** Start recovery: validate phrase, then set new credential */
    startRecovery: (words: string[], method: ShareAAuthMethod, credential: string) => Promise<void>;
    /** Cancel recovery */
    cancel: () => void;
    /** Whether recovery is in progress */
    isRecovering: boolean;
}
/** Wallet material hook return value */
export interface UseWalletMaterialReturn {
    /** Fetch wallet status (enrolled, unlocked, external wallet) */
    getStatus: () => Promise<WalletStatusApiResponse>;
    /** Fetch wallet material (for SSS wallet details) */
    getMaterial: () => Promise<WalletMaterialResponse | null>;
    /** Enroll new SSS wallet */
    enroll: (request: WalletEnrollRequest) => Promise<void>;
    /** Recover wallet (replace existing with new credentials) */
    recover: (request: WalletRecoverRequest) => Promise<void>;
    /** Sign a transaction (SSS wallet) */
    signTransaction: (request: SignTransactionRequest) => Promise<SignTransactionResponse>;
    /** Rotate user secret */
    rotateUserSecret: (request: RotateUserSecretRequest) => Promise<void>;
    /** Unlock wallet for session-based signing (credential cached server-side) */
    unlock: (credential: UnlockCredential) => Promise<WalletUnlockResponse>;
    /** Lock wallet (clear cached credential) */
    lock: () => Promise<void>;
    /** Get Share B for Share C recovery mode (proves ownership via Share C) */
    getShareBForRecovery: (request: ShareCRecoveryRequest) => Promise<ShareCRecoveryResponse>;
    /** Whether request is in progress */
    isLoading: boolean;
    /** Error from last request */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}
/** PRF capability hook return value */
export interface UsePrfCapabilityReturn {
    /** Whether PRF is supported */
    isSupported: boolean;
    /** Whether check is in progress */
    isChecking: boolean;
    /** Error message if check failed */
    error: string | null;
    /** Recheck PRF support */
    recheck: () => Promise<void>;
}
/** Response from pending wallet recovery check */
export interface PendingWalletRecoveryResponse {
    /** Whether there is pending recovery data to acknowledge */
    hasPendingRecovery: boolean;
    /** Type of recovery data: "share_c" or "full_seed" */
    recoveryType?: string;
    /** Recovery phrase (BIP-39 mnemonic or base64 seed) */
    recoveryPhrase?: string;
    /** When the recovery data expires */
    expiresAt?: string;
}
/** Request to acknowledge receipt of recovery phrase */
export interface AcknowledgeRecoveryRequest {
    /** Confirmation that user has saved the recovery phrase */
    confirmed: boolean;
}
