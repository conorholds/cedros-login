import { UseWalletEnrollmentReturn } from '../types/wallet';
/**
 * Hook for wallet enrollment
 *
 * Supports auth methods:
 * - password: User sets a wallet password (Argon2id KDF)
 * - passkey: Uses passkey PRF extension
 */
export declare function useWalletEnrollment(): UseWalletEnrollmentReturn;
