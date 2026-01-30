"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyCashService = void 0;
const web3_js_1 = require("@solana/web3.js");
const hasher_rs_1 = require("@lightprotocol/hasher.rs");
const node_localstorage_1 = require("node-localstorage");
const bs58_1 = __importDefault(require("bs58"));
const node_path_1 = __importDefault(require("node:path"));
// SDK module cache
let sdkModule = null;
async function loadSdk() {
    if (!sdkModule) {
        // Dynamic import of SDK (using any to bypass type checking for untyped package)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exportUtils = await import('privacycash');
        sdkModule = {
            deposit: exportUtils.deposit,
            withdraw: exportUtils.withdraw,
            EncryptionService: exportUtils.EncryptionService,
            getUtxos: exportUtils.getUtxos,
            getBalanceFromUtxos: exportUtils.getBalanceFromUtxos,
        };
    }
    return sdkModule;
}
class PrivacyCashService {
    solana;
    connection;
    companyWalletAddress;
    storage;
    lightWasm = null;
    keyBasePath;
    sdkInitialized = false;
    constructor(config, solanaService) {
        this.solana = solanaService;
        this.connection = solanaService.getConnection();
        // Company wallet is the recipient for withdrawals (no private key needed here)
        this.companyWalletAddress = new web3_js_1.PublicKey(config.companyWalletAddress);
        // Initialize storage for UTXO caching
        this.storage = new node_localstorage_1.LocalStorage(node_path_1.default.join(process.cwd(), 'privacy-cache'));
        // Path to circuit files (bundled with SDK)
        this.keyBasePath = '';
        console.log(`[PrivacyCash] Initialized with company wallet: ${this.companyWalletAddress.toBase58()}`);
    }
    /**
     * Initialize SDK components (lazy loading)
     */
    async ensureInitialized() {
        const sdk = await loadSdk();
        if (!this.lightWasm) {
            this.lightWasm = await hasher_rs_1.WasmFactory.getInstance();
        }
        // Set keyBasePath if not already set
        if (!this.keyBasePath) {
            this.keyBasePath = node_path_1.default.join(process.cwd(), 'node_modules', 'privacycash', 'circuit2', 'transaction2');
        }
        this.sdkInitialized = true;
        return sdk;
    }
    /**
     * Create an encryption service for a specific user keypair
     */
    async createEncryptionService(sdk, keypair) {
        const encryptionService = new sdk.EncryptionService();
        encryptionService.deriveEncryptionKeyFromWallet(keypair);
        return encryptionService;
    }
    /**
     * Execute a deposit for an SSS embedded wallet
     *
     * Deposits to the USER's Privacy Cash account (user's pubkey is the owner).
     * The user signs the transaction.
     *
     * @param userKeypair - The user's reconstructed keypair (from Share A + Share B)
     * @param amountLamports - Amount to deposit in lamports
     */
    async executeDeposit(userKeypair, amountLamports) {
        const sdk = await this.ensureInitialized();
        const encryptionService = await this.createEncryptionService(sdk, userKeypair);
        // Deposit to USER's Privacy Cash account (user owns the private balance)
        const result = await sdk.deposit({
            lightWasm: this.lightWasm,
            amount_in_lamports: amountLamports,
            connection: this.connection,
            encryptionService,
            publicKey: userKeypair.publicKey, // User owns the Privacy Cash account
            transactionSigner: async (tx) => {
                tx.sign([userKeypair]);
                return tx;
            },
            keyBasePath: this.keyBasePath,
            storage: this.storage,
        });
        return {
            success: true,
            txSignature: result.tx,
        };
    }
    /**
     * Withdraw funds from a user's Privacy Cash account to the company wallet
     *
     * This is called server-side after the "privacy period" has elapsed.
     * Requires the user's keypair (reconstructed from stored shares).
     *
     * @param userKeypair - The user's reconstructed keypair (from Share A + Share B)
     * @param amountLamports - Amount to withdraw in lamports
     */
    async withdrawFromUser(userKeypair, amountLamports) {
        const sdk = await this.ensureInitialized();
        const encryptionService = await this.createEncryptionService(sdk, userKeypair);
        const result = await sdk.withdraw({
            lightWasm: this.lightWasm,
            amount_in_lamports: amountLamports,
            connection: this.connection,
            encryptionService,
            publicKey: userKeypair.publicKey, // User's Privacy Cash account
            recipient: this.companyWalletAddress, // Withdraw to company wallet
            keyBasePath: this.keyBasePath,
            storage: this.storage,
        });
        return {
            success: true,
            txSignature: result.tx,
            feeLamports: result.fee_in_lamports,
            amountLamports: result.amount_in_lamports,
            isPartial: result.isPartial,
        };
    }
    /**
     * Get a user's private balance in Privacy Cash
     *
     * @param userKeypair - The user's reconstructed keypair
     */
    async getUserPrivateBalance(userKeypair) {
        const sdk = await this.ensureInitialized();
        const encryptionService = await this.createEncryptionService(sdk, userKeypair);
        const utxos = await sdk.getUtxos({
            connection: this.connection,
            encryptionService,
            publicKey: userKeypair.publicKey,
            storage: this.storage,
        });
        const { lamports } = sdk.getBalanceFromUtxos(utxos);
        return lamports;
    }
    /**
     * Check if the SDK is properly loaded
     */
    async isLoaded() {
        try {
            await this.ensureInitialized();
            return true;
        }
        catch {
            return false;
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
exports.PrivacyCashService = PrivacyCashService;
