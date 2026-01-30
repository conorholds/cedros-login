/**
 * Wallet detection utilities for Solana browser wallets
 */
/**
 * Detects if any Solana wallet extensions are installed in the browser.
 * Checks for common wallet adapters like Phantom, Solflare, Backpack, etc.
 *
 * @returns true if at least one Solana wallet is detected
 *
 * @example
 * ```tsx
 * if (detectSolanaWallets()) {
 *   // Show Solana login button
 * }
 * ```
 */
export declare function detectSolanaWallets(): boolean;
/**
 * Returns list of detected Solana wallet names (for debugging/display)
 *
 * @returns Array of detected wallet provider names
 */
export declare function getDetectedWalletNames(): string[];
