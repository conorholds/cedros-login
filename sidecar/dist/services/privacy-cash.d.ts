/**
 * Privacy Cash SDK wrapper service
 *
 * This service wraps the Privacy Cash SDK for SSS embedded wallets only.
 *
 * Architecture:
 * - User deposits to THEIR OWN Privacy Cash account (user's pubkey)
 * - Server holds Share A + temporarily stores Share B during privacy period
 * - Server can reconstruct keypair to withdraw to company wallet
 * - On-chain: User deposit and Company withdrawal are unlinkable
 *
 * Requirements:
 * - SSS wallets only (no external wallets like Phantom)
 * - No-recovery option required (user has only Share B, no Share C)
 * - Server stores Share B during "privacy period" until withdrawal completes
 */
import { Keypair } from '@solana/web3.js';
import { Config } from '../config.js';
import { SolanaService } from './solana.js';
export interface ExecuteDepositResult {
    success: boolean;
    txSignature: string;
}
export interface WithdrawResult {
    success: boolean;
    txSignature: string;
    feeLamports: number;
    /** Actual amount withdrawn (after fees) - may be less than requested if partial */
    amountLamports: number;
    /** True if the full requested amount couldn't be withdrawn (insufficient balance) */
    isPartial: boolean;
}
export declare class PrivacyCashService {
    private solana;
    private connection;
    private companyWalletAddress;
    private storage;
    private lightWasm;
    private keyBasePath;
    private sdkInitialized;
    constructor(config: Config, solanaService: SolanaService);
    /**
     * Initialize SDK components (lazy loading)
     */
    private ensureInitialized;
    /**
     * Create an encryption service for a specific user keypair
     */
    private createEncryptionService;
    /**
     * Execute a deposit for an SSS embedded wallet
     *
     * Deposits to the USER's Privacy Cash account (user's pubkey is the owner).
     * The user signs the transaction.
     *
     * @param userKeypair - The user's reconstructed keypair (from Share A + Share B)
     * @param amountLamports - Amount to deposit in lamports
     */
    executeDeposit(userKeypair: Keypair, amountLamports: number): Promise<ExecuteDepositResult>;
    /**
     * Withdraw funds from a user's Privacy Cash account to the company wallet
     *
     * This is called server-side after the "privacy period" has elapsed.
     * Requires the user's keypair (reconstructed from stored shares).
     *
     * @param userKeypair - The user's reconstructed keypair (from Share A + Share B)
     * @param amountLamports - Amount to withdraw in lamports
     */
    withdrawFromUser(userKeypair: Keypair, amountLamports: number): Promise<WithdrawResult>;
    /**
     * Get a user's private balance in Privacy Cash
     *
     * @param userKeypair - The user's reconstructed keypair
     */
    getUserPrivateBalance(userKeypair: Keypair): Promise<number>;
    /**
     * Check if the SDK is properly loaded
     */
    isLoaded(): Promise<boolean>;
    /**
     * Parse a base58-encoded private key into a Keypair
     */
    static parseKeypair(privateKeyBase58: string): Keypair;
}
