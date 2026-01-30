/**
 * Solana RPC connection service
 */
import { Connection, PublicKey } from '@solana/web3.js';
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
     * Send a signed transaction and confirm it
     */
    sendAndConfirmTransaction(signedTx: Buffer, options?: {
        skipPreflight?: boolean;
    }): Promise<string>;
}
