"use strict";
/**
 * Sidecar configuration loaded from environment variables
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
function getEnvRequired(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
function getEnvOptional(key, defaultValue) {
    return process.env[key] || defaultValue;
}
function loadConfig() {
    const rawNetwork = getEnvOptional('SOLANA_NETWORK', 'devnet');
    const network = rawNetwork === 'mainnet' ? 'mainnet-beta' : rawNetwork;
    if (network !== 'devnet' && network !== 'mainnet-beta') {
        throw new Error(`Invalid SOLANA_NETWORK: ${rawNetwork}. Must be 'devnet' or 'mainnet-beta' (or 'mainnet' alias)`);
    }
    return {
        port: parseInt(getEnvOptional('PORT', '3100'), 10),
        host: getEnvOptional('HOST', '127.0.0.1'),
        apiKey: getEnvRequired('SIDECAR_API_KEY'),
        solanaRpcUrl: getEnvOptional('SOLANA_RPC_URL', network === 'devnet'
            ? 'https://api.devnet.solana.com'
            : 'https://api.mainnet-beta.solana.com'),
        solanaNetwork: network,
        privacyCashProgramId: getEnvRequired('PRIVACY_CASH_PROGRAM_ID'),
        companyWalletAddress: getEnvRequired('COMPANY_WALLET_ADDRESS'),
        jupiter: {
            apiUrl: getEnvOptional('JUPITER_API_URL', 'https://api.jup.ag/ultra/v1'),
            apiKey: process.env.JUPITER_API_KEY || null,
            minSwapUsd: parseFloat(getEnvOptional('JUPITER_MIN_SWAP_USD', '10')),
            rateLimit: parseInt(getEnvOptional('JUPITER_RATE_LIMIT', '50'), 10),
        },
    };
}
