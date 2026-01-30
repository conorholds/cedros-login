/**
 * Embedded wallet detection utilities
 *
 * Allows other Cedros modules (like cedros-pay) to detect if an embedded
 * wallet is available in the current application.
 *
 * @security The window global only exposes availability info, NOT the signing
 * function. Signing must go through React context to prevent unauthorized access.
 */
/** Window global name for embedded wallet detection */
declare const GLOBAL_KEY = "__CEDROS_EMBEDDED_WALLET__";
/**
 * Embedded wallet info exposed via window global
 */
export interface EmbeddedWalletInfo {
    /** Whether user has enrolled SSS embedded wallet */
    available: boolean;
    /** Solana public key (base58) if available */
    publicKey: string | null;
}
declare global {
    interface Window {
        [GLOBAL_KEY]?: EmbeddedWalletInfo;
    }
}
/**
 * Set embedded wallet availability on window global
 *
 * Called by CedrosLoginProvider when wallet.exposeAvailability is true.
 *
 * @internal
 */
export declare function setEmbeddedWalletGlobal(info: EmbeddedWalletInfo): void;
/**
 * Clear embedded wallet availability from window global
 *
 * Called when user logs out or config changes.
 *
 * @internal
 */
export declare function clearEmbeddedWalletGlobal(): void;
/**
 * Check if embedded wallet is available
 *
 * Use this in other Cedros modules (like cedros-pay) to detect
 * if an embedded wallet is available for signing.
 *
 * @example
 * ```tsx
 * import { isEmbeddedWalletAvailable, getEmbeddedWalletInfo } from '@cedros/login-react';
 *
 * // Simple check
 * if (isEmbeddedWalletAvailable()) {
 *   // Show "Pay with Crypto" button
 * }
 *
 * // Get full info
 * const walletInfo = getEmbeddedWalletInfo();
 * if (walletInfo?.available && walletInfo.publicKey) {
 *   console.log('User wallet:', walletInfo.publicKey);
 * }
 * ```
 *
 * @returns true if embedded wallet is enrolled and available
 */
export declare function isEmbeddedWalletAvailable(): boolean;
/**
 * Get embedded wallet info
 *
 * Returns the full wallet info object if available.
 *
 * @returns Wallet info or null if not exposed
 */
export declare function getEmbeddedWalletInfo(): EmbeddedWalletInfo | null;
export {};
