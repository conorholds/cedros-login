"use strict";
/**
 * Database settings loader for sidecar configuration
 *
 * Fetches runtime settings from the system_settings table in the main database.
 * Falls back to defaults if database is unavailable or settings are missing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDbSettings = fetchDbSettings;
const pg_1 = require("pg");
/**
 * Fetch settings from the database
 * Returns null values for any settings not found
 */
async function fetchDbSettings(databaseUrl) {
    const pool = new pg_1.Pool({
        connectionString: databaseUrl,
        max: 1,
        connectionTimeoutMillis: 5_000,
    });
    try {
        const result = await pool.query(`SELECT key, value FROM system_settings
       WHERE key IN (
         'solana_rpc_url',
         'treasury_wallet_address',
         'jupiter_api_key'
       )`);
        const settings = {};
        for (const row of result.rows) {
            settings[row.key] = row.value;
        }
        return {
            solanaRpcUrl: settings['solana_rpc_url'] || null,
            companyWalletAddress: settings['treasury_wallet_address'] || null,
            jupiterApiKey: settings['jupiter_api_key'] || null,
        };
    }
    finally {
        // CI-05: Wrap pool cleanup in try/catch to prevent unhandled rejection
        try {
            await pool.end();
        }
        catch (cleanupErr) {
            console.warn('Failed to close settings pool:', cleanupErr);
        }
    }
}
