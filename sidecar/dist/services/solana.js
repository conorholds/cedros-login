"use strict";
/**
 * Solana RPC connection service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaService = void 0;
const web3_js_1 = require("@solana/web3.js");
class SolanaService {
    connection;
    networkName;
    constructor(config) {
        this.connection = new web3_js_1.Connection(config.solanaRpcUrl, {
            commitment: 'confirmed',
        });
        this.networkName = config.solanaNetwork;
    }
    /**
     * Get the Solana connection
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get the network name
     */
    getNetwork() {
        return this.networkName;
    }
    /**
     * Check if RPC is connected by fetching the latest blockhash
     */
    async isConnected() {
        try {
            await this.connection.getLatestBlockhash();
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get the latest blockhash with expiry info
     */
    async getLatestBlockhash() {
        return this.connection.getLatestBlockhash('confirmed');
    }
    /**
     * Get balance for a public key
     */
    async getBalance(publicKey) {
        return this.connection.getBalance(publicKey);
    }
    /**
     * Send a signed transaction and confirm it
     */
    async sendAndConfirmTransaction(signedTx, options) {
        const signature = await this.connection.sendRawTransaction(signedTx, {
            skipPreflight: options?.skipPreflight ?? false,
            preflightCommitment: 'confirmed',
        });
        // Wait for confirmation
        const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');
        await this.connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, 'confirmed');
        return signature;
    }
}
exports.SolanaService = SolanaService;
