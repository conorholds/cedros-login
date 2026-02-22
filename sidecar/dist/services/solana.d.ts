/**
 * Solana RPC connection service
 */
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Config } from '../config.js';
export declare class SolanaService {
    private connection;
    private networkName;
    constructor(config: Config);
    /**
     * Get the Solana connection
     */
    getConnection(): Connection;
    /**
     * Get the network name
     */
    getNetwork(): string;
    /**
     * Check if RPC is connected by fetching the latest blockhash
     */
    isConnected(): Promise<boolean>;
    /**
     * Get the latest blockhash with expiry info
     */
    getLatestBlockhash(): Promise<{
        blockhash: string;
        lastValidBlockHeight: number;
    }>;
    /**
     * Get balance for a public key
     */
    getBalance(publicKey: PublicKey): Promise<number>;
    /**
     * Get all SPL token accounts with non-zero balance for a wallet.
     * Returns SOL balance + all SPL token holdings.
     */
    getTokenBalances(publicKey: PublicKey): Promise<{
        sol_lamports: number;
        tokens: Array<{
            mint: string;
            amount: string;
            decimals: number;
        }>;
    }>;
    /**
     * Send a signed transaction and confirm it
     */
    sendAndConfirmTransaction(signedTx: Buffer, options?: {
        skipPreflight?: boolean;
    }): Promise<string>;
    /**
     * Transfer SOL from one keypair to a destination address.
     * Returns the transaction signature.
     */
    transferSol(keypair: Keypair, destination: PublicKey, lamports: number): Promise<string>;
    /**
     * Get the actual fee paid for a confirmed transaction.
     * Returns 0 if the transaction is not yet available.
     */
    getTransactionFee(signature: string): Promise<number>;
    /**
     * Transfer SPL tokens from one keypair to a destination address.
     * Creates the destination ATA if it doesn't exist.
     * Returns the transaction signature.
     */
    transferSplToken(keypair: Keypair, destination: PublicKey, mint: PublicKey, amount: bigint): Promise<string>;
}
