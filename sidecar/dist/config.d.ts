/**
 * Sidecar configuration
 *
 * Minimal env vars (API key, port, host, database URL) plus database-sourced settings.
 * All configurable settings are stored in the database and managed via admin UI.
 */
export interface Config {
    port: number;
    host: string;
    apiKey: string;
    databaseUrl: string;
    solanaRpcUrl: string;
    solanaNetwork: 'devnet' | 'mainnet-beta';
    privacyCashProgramId: string;
    /** Company wallet address for withdrawals (receives funds from Privacy Cash) */
    companyWalletAddress: string;
    /** Jupiter Ultra API settings for gasless swaps */
    jupiter: {
        apiUrl: string;
        apiKey: string | null;
        /** Minimum swap amount in USD (Jupiter gasless requires ~$10) */
        minSwapUsd: number;
        /** Rate limit in requests per 10 seconds (for swap queue throttling) */
        rateLimit: number;
    };
}
export declare function resolveJupiterRateLimit(): number;
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
export declare function loadConfig(): Promise<Config>;
