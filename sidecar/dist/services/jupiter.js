"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JupiterService = exports.USDT_MINT = exports.USDC_MINT = void 0;
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const fetchWithTimeout_js_1 = require("../utils/fetchWithTimeout.js");
const circuitBreaker_js_1 = require("../utils/circuitBreaker.js");
/** SOL token mint address (native SOL wrapped) */
const SOL_MINT = 'So11111111111111111111111111111111111111112';
/** Default Jupiter HTTP timeout (ms) */
const JUPITER_TIMEOUT_MS = 10_000;
/** USDC token mint address on Solana mainnet */
exports.USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
/** USDT token mint address on Solana mainnet */
exports.USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
class JupiterService {
    apiUrl;
    apiKey;
    minSwapUsd;
    rateLimit;
    requestTimestampsMs = [];
    throttleLock = Promise.resolve();
    /** F-06: Circuit breaker to avoid wasting resources during Jupiter outages */
    circuitBreaker;
    constructor(config) {
        this.apiUrl = config.jupiter.apiUrl;
        this.apiKey = config.jupiter.apiKey;
        this.minSwapUsd = config.jupiter.minSwapUsd;
        this.rateLimit = config.jupiter.rateLimit;
        this.circuitBreaker = new circuitBreaker_js_1.CircuitBreaker({
            failureThreshold: 5,
            cooldownMs: 30_000,
            name: 'Jupiter',
        });
        if (!this.apiKey) {
            console.warn('[Jupiter] WARNING: No API key configured. Jupiter Ultra API requires an API key. Get one free at https://portal.jup.ag');
        }
        console.log(`[Jupiter] Initialized with API: ${this.apiUrl}, minSwapUsd: ${this.minSwapUsd}, rateLimit: ${this.rateLimit}/10s`);
    }
    /**
     * Get minimum swap amount in USD required for gasless swaps
     */
    getMinSwapUsd() {
        return this.minSwapUsd;
    }
    /**
     * Get configured rate limit (requests per 10 seconds) for queue throttling
     */
    getRateLimit() {
        return this.rateLimit;
    }
    /**
     * Enforce max N requests per 10-second rolling window.
     * P-04: Uses mutex pattern instead of promise chain to prevent memory leak
     * under sustained load. Each call awaits the previous lock then releases its own.
     */
    async throttle() {
        const prevLock = this.throttleLock;
        let releaseLock;
        this.throttleLock = new Promise((r) => { releaseLock = r; });
        await prevLock;
        try {
            const windowMs = 10_000;
            while (true) {
                const now = Date.now();
                while (this.requestTimestampsMs.length > 0 &&
                    now - this.requestTimestampsMs[0] >= windowMs) {
                    this.requestTimestampsMs.shift();
                }
                if (this.requestTimestampsMs.length < this.rateLimit) {
                    this.requestTimestampsMs.push(now);
                    return;
                }
                const waitMs = Math.max(1, windowMs - (now - this.requestTimestampsMs[0]));
                await new Promise((resolve) => setTimeout(resolve, waitMs));
            }
        }
        finally {
            releaseLock();
        }
    }
    /**
     * Get a swap order (unsigned transaction) from Jupiter Ultra API
     *
     * @param params - Swap parameters (inputMint, amount, takerAddress)
     * @returns SwapOrder with unsigned transaction and expected output
     * @throws Error if Jupiter API returns an error or network fails
     */
    async getSwapOrder(params) {
        const { inputMint, amount, takerAddress } = params;
        // Build query parameters
        const queryParams = new URLSearchParams({
            inputMint,
            outputMint: SOL_MINT,
            amount,
            taker: takerAddress,
        });
        const url = `${this.apiUrl}/order?${queryParams.toString()}`;
        const headers = {
            'Accept': 'application/json',
        };
        // Add API key if configured (required for production)
        if (this.apiKey) {
            headers['x-api-key'] = this.apiKey;
        }
        console.log(`[Jupiter] Getting swap order: ${inputMint} -> SOL, amount: ${amount}`);
        await this.throttle();
        const response = await (0, fetchWithTimeout_js_1.fetchWithTimeout)(fetch, url, { headers }, JUPITER_TIMEOUT_MS);
        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = `Jupiter API error: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.error || errorMessage;
            }
            catch {
                errorMessage = errorBody || errorMessage;
            }
            throw new Error(errorMessage);
        }
        const order = await response.json();
        // Check for order-level errors (codes 1, 2, 3)
        if (order.error || order.code) {
            const errorMessages = {
                1: 'Insufficient token balance for swap',
                2: 'Insufficient SOL for gas fees',
                3: 'Trade size below minimum for gasless swap',
            };
            const errorMsg = order.error || errorMessages[order.code] || `Order failed with code ${order.code}`;
            throw new Error(errorMsg);
        }
        // Validate required fields are present
        if (!order.transaction || !order.requestId || !order.outAmount) {
            throw new Error('Invalid order response: missing required fields');
        }
        console.log(`[Jupiter] Order received: requestId=${order.requestId}, outAmount=${order.outAmount}, gasless=${order.gasless}, router=${order.router}`);
        return {
            transaction: order.transaction,
            requestId: order.requestId,
            expectedOutAmount: order.outAmount,
            priceImpactPct: order.priceImpactPct || '0',
            gasless: order.gasless ?? false,
            slippageBps: order.slippageBps ?? 0,
        };
    }
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
    async executeSwap(order, userKeypair) {
        console.log(`[Jupiter] Executing swap: requestId=${order.requestId}, gasless=${order.gasless}`);
        // Deserialize the transaction from base64
        const txBuffer = Buffer.from(order.transaction, 'base64');
        const transaction = web3_js_1.VersionedTransaction.deserialize(txBuffer);
        // Sign the transaction with user's keypair
        transaction.sign([userKeypair]);
        // Serialize the signed transaction back to base64
        const signedTxBase64 = Buffer.from(transaction.serialize()).toString('base64');
        // Submit to Jupiter execute endpoint
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (this.apiKey) {
            headers['x-api-key'] = this.apiKey;
        }
        await this.throttle();
        const response = await (0, fetchWithTimeout_js_1.fetchWithTimeout)(fetch, `${this.apiUrl}/execute`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                signedTransaction: signedTxBase64,
                requestId: order.requestId,
            }),
        }, JUPITER_TIMEOUT_MS);
        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = `Jupiter execute error: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.error || errorMessage;
            }
            catch {
                errorMessage = errorBody || errorMessage;
            }
            throw new Error(errorMessage);
        }
        const result = await response.json();
        // Check for failure via status or error code
        if (result.status !== 'Success' || (result.code !== undefined && result.code !== 0)) {
            return {
                success: false,
                txSignature: result.signature || '',
                expectedOutAmount: order.expectedOutAmount,
                gasless: order.gasless,
                error: result.error || `Swap failed with code ${result.code}`,
                errorCode: result.code,
            };
        }
        console.log(`[Jupiter] Swap executed: signature=${result.signature}, actualOut=${result.outputAmountResult || 'N/A'}`);
        return {
            success: true,
            txSignature: result.signature,
            expectedOutAmount: order.expectedOutAmount,
            actualOutAmount: result.outputAmountResult,
            gasless: order.gasless,
        };
    }
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
    async swapToSol(inputMint, amount, userKeypair) {
        // F-06: Wrap in circuit breaker to fail fast during Jupiter outages
        return this.circuitBreaker.call(async () => {
            const takerAddress = userKeypair.publicKey.toBase58();
            // Get the swap order (unsigned transaction)
            const order = await this.getSwapOrder({
                inputMint,
                amount,
                takerAddress,
            });
            // Sign and execute the swap
            return this.executeSwap(order, userKeypair);
        });
    }
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
    async swapFromSol(outputMint, amountLamports, userKeypair) {
        // F-06: Wrap in circuit breaker to fail fast during Jupiter outages
        return this.circuitBreaker.call(async () => {
            const takerAddress = userKeypair.publicKey.toBase58();
            // Build query parameters for SOL -> outputMint
            const queryParams = new URLSearchParams({
                inputMint: SOL_MINT,
                outputMint,
                amount: amountLamports,
                taker: takerAddress,
            });
            const url = `${this.apiUrl}/order?${queryParams.toString()}`;
            const headers = {
                'Accept': 'application/json',
            };
            if (this.apiKey) {
                headers['x-api-key'] = this.apiKey;
            }
            console.log(`[Jupiter] Getting swap order: SOL -> ${outputMint}, amount: ${amountLamports} lamports`);
            await this.throttle();
            const response = await (0, fetchWithTimeout_js_1.fetchWithTimeout)(fetch, url, { headers }, JUPITER_TIMEOUT_MS);
            if (!response.ok) {
                const errorBody = await response.text();
                let errorMessage = `Jupiter API error: ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorBody);
                    errorMessage = errorJson.error || errorMessage;
                }
                catch {
                    errorMessage = errorBody || errorMessage;
                }
                throw new Error(errorMessage);
            }
            const order = await response.json();
            // Check for order-level errors (codes 1, 2, 3)
            if (order.error || order.code) {
                const errorMessages = {
                    1: 'Insufficient token balance for swap',
                    2: 'Insufficient SOL for gas fees',
                    3: 'Trade size below minimum for gasless swap',
                };
                const errorMsg = order.error || errorMessages[order.code] || `Order failed with code ${order.code}`;
                throw new Error(errorMsg);
            }
            // Validate required fields are present
            if (!order.transaction || !order.requestId || !order.outAmount) {
                throw new Error('Invalid order response: missing required fields');
            }
            console.log(`[Jupiter] Order received: requestId=${order.requestId}, outAmount=${order.outAmount}, gasless=${order.gasless}, router=${order.router}`);
            // Execute the swap
            return this.executeSwap({
                transaction: order.transaction,
                requestId: order.requestId,
                expectedOutAmount: order.outAmount,
                priceImpactPct: order.priceImpactPct || '0',
                gasless: order.gasless ?? false,
                slippageBps: order.slippageBps ?? 0,
            }, userKeypair);
        }); // end circuitBreaker.call
    }
    /**
     * Get the mint address for a currency code
     *
     * @param currency - Currency code (SOL, USDC, USDT)
     * @returns Mint address or null if unsupported/is SOL
     */
    static getMintForCurrency(currency) {
        switch (currency.toUpperCase()) {
            case 'USDC':
                return exports.USDC_MINT;
            case 'USDT':
                return exports.USDT_MINT;
            case 'SOL':
            default:
                return null; // No swap needed for SOL
        }
    }
    /**
     * Parse a base58-encoded private key into a Keypair
     */
    static parseKeypair(privateKeyBase58) {
        const privateKeyBytes = bs58_1.default.decode(privateKeyBase58);
        return web3_js_1.Keypair.fromSecretKey(privateKeyBytes);
    }
}
exports.JupiterService = JupiterService;
