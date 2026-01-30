/**
 * Silent wallet enrollment utility
 *
 * Performs wallet enrollment in the background without UI interaction.
 * Used for auto-enrolling wallets during registration.
 *
 * Security: Uses the same Shamir Secret Sharing scheme as manual enrollment.
 * The recovery phrase is not shown - user can retrieve it later if needed.
 */
export interface SilentEnrollOptions {
    /** User's password for Share A encryption */
    password: string;
    /** Server base URL */
    serverUrl: string;
    /** Access token for authentication (optional if using cookies) */
    accessToken?: string;
    /** Request timeout in ms */
    timeoutMs?: number;
}
export interface SilentEnrollResult {
    success: boolean;
    solanaPubkey?: string;
    error?: string;
}
/**
 * Silently enroll a wallet for a user
 *
 * This function performs the complete wallet enrollment process:
 * 1. Generate 32-byte seed
 * 2. Split into 3 Shamir shares (threshold 2)
 * 3. Encrypt Share A with password-derived key (Argon2id)
 * 4. Derive Solana public key from seed
 * 5. Upload encrypted Share A + plaintext Share B to server
 *
 * The recovery phrase (Share C) is not returned - user can recover it
 * later through the wallet recovery flow if needed.
 *
 * @param options - Enrollment options
 * @returns Result with success status and Solana public key
 */
export declare function silentWalletEnroll(options: SilentEnrollOptions): Promise<SilentEnrollResult>;
