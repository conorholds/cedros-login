/**
 * Sidecar configuration loaded from environment variables
 */
export interface Config {
    port: number;
    host: string;
    apiKey: string;
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
export declare function loadConfig(): Config;
