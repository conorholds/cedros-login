/**
 * Jupiter Ultra API service for gasless SPL token → SOL swaps
 *
 * Jupiter Ultra provides gasless swaps when:
 * - User wallet has < 0.01 SOL (embedded wallets qualify)
 * - Trade size > ~$10 USD (configured via JUPITER_MIN_SWAP_USD)
 * - Jupiter pays transaction fees, deducted from swap output
 *
 * Flow:
 * 1. GET /order - Get unsigned swap transaction
 * 2. Sign transaction with user keypair
 * 3. POST /execute - Submit signed transaction (Jupiter pays gas)
 */
import { Keypair } from '@solana/web3.js';
import { Config } from '../config.js';
/** USDC token mint address on Solana mainnet */
export declare const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
/** USDT token mint address on Solana mainnet */
export declare const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
/** Parameters for getting a swap order */
export interface SwapOrderParams {
    /** SPL token mint address to swap from (e.g., USDC) */
    inputMint: string;
    /** Amount in token's smallest unit (e.g., 10 USDC = 10_000_000 for 6 decimals) */
    amount: string;
    /** User's wallet address (taker) */
    takerAddress: string;
}
/** Result of getting a swap order */
export interface SwapOrder {
    /** Base64 encoded unsigned transaction */
    transaction: string;
    /** Request ID for tracking */
    requestId: string;
    /** Expected output amount in smallest unit */
    expectedOutAmount: string;
    /** Price impact percentage */
    priceImpactPct: string;
    /** Whether this order qualifies for gasless execution */
    gasless: boolean;
    /** Slippage in basis points */
    slippageBps: number;
}
/** Result of executing a swap */
export interface SwapResult {
    success: boolean;
    /** Transaction signature */
    txSignature: string;
    /** Expected output amount (from order) */
    expectedOutAmount: string;
    /** Actual output amount received (if available) */
    actualOutAmount?: string;
    /** Whether gasless was used */
    gasless: boolean;
    /** Error message if failed */
    error?: string;
    /** Error code if failed */
    errorCode?: number;
}
export declare class JupiterService {
    private apiUrl;
    private apiKey;
    private minSwapUsd;
    private rateLimit;
    private readonly requestTimestampsMs;
    private throttleLock;
    /** F-06: Circuit breaker to avoid wasting resources during Jupiter outages */
    private readonly circuitBreaker;
    constructor(config: Config);
    /**
     * Get minimum swap amount in USD required for gasless swaps
     */
    getMinSwapUsd(): number;
    /**
     * Get configured rate limit (requests per 10 seconds) for queue throttling
     */
    getRateLimit(): number;
    /**
     * Enforce max N requests per 10-second rolling window.
     * P-04: Uses mutex pattern instead of promise chain to prevent memory leak
     * under sustained load. Each call awaits the previous lock then releases its own.
     */
    private throttle;
    /**
     * Get a swap order (unsigned transaction) from Jupiter Ultra API
     *
     * @param params - Swap parameters (inputMint, amount, takerAddress)
     * @returns SwapOrder with unsigned transaction and expected output
     * @throws Error if Jupiter API returns an error or network fails
     */
    getSwapOrder(params: SwapOrderParams): Promise<SwapOrder>;
    /**
     * Sign and execute a swap transaction
     *
     * Takes an unsigned transaction from getSwapOrder(), signs it with the user's
     * keypair, and submits it to Jupiter for execution (gasless).
     *
     * @param order - SwapOrder from getSwapOrder()
     * @param userKeypair - User's keypair to sign the transaction
     * @returns SwapResult with transaction signature
     * @throws Error if signing fails or Jupiter execution fails
     */
    executeSwap(order: SwapOrder, userKeypair: Keypair): Promise<SwapResult>;
    /**
     * Perform a complete gasless swap from SPL token to SOL
     *
     * Combines getSwapOrder() and executeSwap() into a single call.
     * This is the main method to use for swapping tokens.
     *
     * @param inputMint - SPL token mint address to swap from
     * @param amount - Amount in token's smallest unit
     * @param userKeypair - User's keypair (for signing and as taker address)
     * @returns SwapResult with transaction signature and output amount
     */
    swapToSol(inputMint: string, amount: string, userKeypair: Keypair): Promise<SwapResult>;
    /**
     * Perform a complete swap from SOL to SPL token (for withdrawals)
     *
     * This is used when the company's preferred currency is not SOL.
     * The SOL from Privacy Cash is swapped to USDC/USDT via Jupiter.
     *
     * @param outputMint - SPL token mint address to swap to (e.g., USDC, USDT)
     * @param amountLamports - Amount of SOL in lamports to swap
     * @param userKeypair - User's keypair (for signing and as taker address)
     * @returns SwapResult with transaction signature and output amount
     */
    swapFromSol(outputMint: string, amountLamports: string, userKeypair: Keypair): Promise<SwapResult>;
    /**
     * Get the mint address for a currency code
     *
     * @param currency - Currency code (SOL, USDC, USDT)
     * @returns Mint address or null if unsupported/is SOL
     */
    static getMintForCurrency(currency: string): string | null;
    /**
     * Parse a base58-encoded private key into a Keypair
     */
    static parseKeypair(privateKeyBase58: string): Keypair;
}
