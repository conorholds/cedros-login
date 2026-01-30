import { CryptoCapabilities } from './types';
/**
 * Check all required crypto capabilities
 *
 * @returns Capability check results
 */
export declare function checkCryptoCapabilities(): Promise<CryptoCapabilities>;
/**
 * Get a human-readable message about missing capabilities
 *
 * @param capabilities - Capability check results
 * @returns Error message describing what's missing, or null if all supported
 */
export declare function getMissingCapabilitiesMessage(capabilities: CryptoCapabilities): string | null;
/**
 * Check if the browser is known to support all required features
 *
 * @returns Object with browser info and support status
 */
export declare function getBrowserSupportInfo(): {
    browser: string;
    version: string;
    likelySupported: boolean;
};
/**
 * Get cached capabilities or check if not cached
 *
 * @param forceRefresh - If true, bypass cache and recheck
 * @returns Capability check results
 */
export declare function getCryptoCapabilities(forceRefresh?: boolean): Promise<CryptoCapabilities>;
/**
 * Clear the capability cache (useful for testing)
 */
export declare function clearCapabilityCache(): void;
