"use strict";
/**
 * Sidecar configuration
 *
 * Minimal env vars (API key, port, host, database URL) plus database-sourced settings.
 * All configurable settings are stored in the database and managed via admin UI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveJupiterRateLimit = resolveJupiterRateLimit;
exports.loadConfig = loadConfig;
const settings_1 = require("./db/settings");
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
function resolveJupiterRateLimit() {
    // Backward compatibility:
    // - JUPITER_RATE_LIMIT is the canonical key used by runtime config
    // - JUPITER_RPS is a legacy/docs alias supported for compatibility
    const raw = process.env.JUPITER_RATE_LIMIT ||
        process.env.JUPITER_RPS ||
        '50';
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 50;
    }
    // Conservative upper bound to avoid accidental traffic spikes from bad config.
    return Math.min(parsed, 500);
}
/**
 * Load configuration from environment and database
 *
 * Required env vars:
 *   - DATABASE_URL: PostgreSQL connection string
 *   - SIDECAR_API_KEY: API key for authenticating requests to sidecar
 *
 * Optional env vars (for local dev/testing only):
 *   - PORT: Listen port (default: 3100)
 *   - HOST: Listen host (default: 127.0.0.1)
 *
 * All other settings are loaded from the database (system_settings table)
 */
async function loadConfig() {
    const databaseUrl = getEnvRequired('DATABASE_URL');
    const apiKey = getEnvRequired('SIDECAR_API_KEY');
    const port = parseInt(getEnvOptional('PORT', '3100'), 10);
    // SC-08: Validate port is a usable number
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT value: must be 1-65535`);
    }
    const host = getEnvOptional('HOST', '127.0.0.1');
    // Fetch settings from database
    const dbSettings = await (0, settings_1.fetchDbSettings)(databaseUrl);
    // Always mainnet
    const network = 'mainnet-beta';
    // Validate required database settings
    if (!dbSettings.companyWalletAddress) {
        throw new Error('Missing required setting: treasury_wallet_address (set via admin UI)');
    }
    // Infrastructure settings with hardcoded defaults (env can override)
    const privacyCashProgramId = getEnvOptional('PRIVACY_CASH_PROGRAM_ID', '9fhQBbumKEFuXtMBDw8AaQyAjCorLGJQiS3skWZdQyQD');
    const _jupiterMinSwapUsdRaw = parseFloat(getEnvOptional('JUPITER_MIN_SWAP_USD', '10'));
    // SC-13: Reject non-finite or non-positive values; fall back to safe default.
    const jupiterMinSwapUsd = Number.isFinite(_jupiterMinSwapUsdRaw) && _jupiterMinSwapUsdRaw > 0
        ? _jupiterMinSwapUsdRaw
        : 10;
    // Ultra API rate limit: starts at 5 RPS, scales with 24-hour swap volume
    const jupiterRateLimit = resolveJupiterRateLimit();
    return {
        port,
        host,
        apiKey,
        databaseUrl,
        solanaRpcUrl: dbSettings.solanaRpcUrl || 'https://api.mainnet-beta.solana.com',
        solanaNetwork: network,
        privacyCashProgramId,
        companyWalletAddress: dbSettings.companyWalletAddress,
        jupiter: {
            apiUrl: 'https://api.jup.ag/ultra/v1',
            apiKey: dbSettings.jupiterApiKey,
            minSwapUsd: jupiterMinSwapUsd,
            rateLimit: jupiterRateLimit,
        },
    };
}
