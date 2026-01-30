/**
 * Token types and constants for deposit currency selection
 */
export interface Token {
    /** Token mint address */
    mint: string;
    /** Token symbol (e.g., SOL, USDC) */
    symbol: string;
    /** Token name (e.g., Solana, USD Coin) */
    name: string;
    /** Token decimals */
    decimals: number;
    /** Token logo URL */
    logoUrl?: string;
}
/**
 * Supported stablecoins for deposits
 */
export declare const SUPPORTED_TOKENS: Token[];
