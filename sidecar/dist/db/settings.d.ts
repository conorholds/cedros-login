/**
 * Database settings loader for sidecar configuration
 *
 * Fetches runtime settings from the system_settings table in the main database.
 * Falls back to defaults if database is unavailable or settings are missing.
 */
export interface DbSettings {
    solanaRpcUrl: string | null;
    companyWalletAddress: string | null;
    jupiterApiKey: string | null;
}
/**
 * Fetch settings from the database
 * Returns null values for any settings not found
 */
export declare function fetchDbSettings(databaseUrl: string): Promise<DbSettings>;
