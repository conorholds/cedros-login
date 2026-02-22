"use strict";
/**
 * Solana RPC connection service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaService = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
/** F-37: Explicit RPC timeout to prevent indefinite hangs (ms) */
const RPC_TIMEOUT_MS = 30_000;
class SolanaService {
    connection;
    networkName;
    constructor(config) {
        this.connection = new web3_js_1.Connection(config.solanaRpcUrl, {
            commitment: 'confirmed',
            // F-37: Explicit fetch timeout — prevents indefinite hang on slow/unresponsive RPC
            // SC-05: Must return the fetch promise for timeout to take effect
            fetchMiddleware: (info, init, fetch) => {
                const controller = new AbortController();
                setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
                return fetch(info, { ...init, signal: controller.signal });
            },
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
     * Get all SPL token accounts with non-zero balance for a wallet.
     * Returns SOL balance + all SPL token holdings.
     */
    async getTokenBalances(publicKey) {
        const [solBalance, tokenAccounts] = await Promise.all([
            this.connection.getBalance(publicKey),
            this.connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            }),
        ]);
        const tokens = tokenAccounts.value
            .map((account) => {
            const info = account.account.data.parsed.info;
            return {
                mint: info.mint,
                amount: info.tokenAmount.amount,
                decimals: info.tokenAmount.decimals,
            };
        })
            .filter((t) => t.amount !== '0');
        return { sol_lamports: solBalance, tokens };
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
    /**
     * Transfer SOL from one keypair to a destination address.
     * Returns the transaction signature.
     */
    async transferSol(keypair, destination, lamports) {
        // SC-15: Reject non-integer or out-of-safe-integer-range lamport values.
        if (!Number.isSafeInteger(lamports) || lamports <= 0) {
            throw new Error(`Invalid lamports value: ${lamports}`);
        }
        const tx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: destination,
            lamports,
        }));
        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.feePayer = keypair.publicKey;
        tx.sign(keypair);
        const rawTx = tx.serialize();
        const signature = await this.connection.sendRawTransaction(rawTx, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
        });
        await this.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
        return signature;
    }
    /**
     * Get the actual fee paid for a confirmed transaction.
     * Returns 0 if the transaction is not yet available.
     */
    async getTransactionFee(signature) {
        try {
            const tx = await this.connection.getTransaction(signature, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0,
            });
            return tx?.meta?.fee ?? 0;
        }
        catch {
            return 0;
        }
    }
    /**
     * Transfer SPL tokens from one keypair to a destination address.
     * Creates the destination ATA if it doesn't exist.
     * Returns the transaction signature.
     */
    async transferSplToken(keypair, destination, mint, amount) {
        // Get or create the destination's associated token account
        const destAta = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(this.connection, keypair, mint, destination);
        const sourceAta = await (0, spl_token_1.getAssociatedTokenAddress)(mint, keypair.publicKey);
        const tx = new web3_js_1.Transaction().add((0, spl_token_1.createTransferInstruction)(sourceAta, destAta.address, keypair.publicKey, amount));
        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        tx.feePayer = keypair.publicKey;
        tx.sign(keypair);
        const rawTx = tx.serialize();
        const signature = await this.connection.sendRawTransaction(rawTx, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
        });
        await this.connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');
        return signature;
    }
}
exports.SolanaService = SolanaService;
