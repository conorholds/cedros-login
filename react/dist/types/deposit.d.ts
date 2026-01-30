/**
 * Types for Privacy Cash deposits and credits
 */
/** Request to execute a privacy deposit */
export interface DepositRequest {
    /** Amount to deposit in lamports */
    amountLamports: number;
}
/** Response from executing a privacy deposit */
export interface DepositResponse {
    /** Session ID for tracking */
    sessionId: string;
    /** Transaction signature on Solana */
    txSignature: string;
    /** Amount deposited in lamports */
    amountLamports: number;
    /** Human-readable message */
    message: string;
    /** When withdrawal becomes available */
    withdrawalAvailableAt: string;
}
/** Deposit session status */
export interface DepositStatusResponse {
    sessionId: string;
    status: 'pending' | 'detected' | 'processing' | 'completed' | 'withdrawn' | 'partially_withdrawn' | 'expired' | 'failed' | 'pending_batch' | 'batched';
    walletAddress: string;
    amountLamports: number | null;
    txSignature?: string;
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
    withdrawalAvailableAt?: string;
}
/** Deposit tier type for tiered deposits */
export type DepositTier = 'private' | 'public' | 'sol_micro';
/** Fee policy options - who pays the deposit fees */
export type FeePolicy = 'company_pays_all' | 'user_pays_swap' | 'user_pays_privacy' | 'user_pays_all';
/** Custom token definition from admin settings */
export interface CustomTokenDefinition {
    /** Token symbol (e.g., "MYTOKEN") */
    symbol: string;
    /** Solana mint address */
    mint: string;
    /** Token decimals (e.g., 6 for USDC, 9 for SOL) */
    decimals: number;
    /** Optional logo URL */
    logoUrl?: string;
}
/** Deposit configuration with tiered thresholds */
export interface DepositConfigResponse {
    /** Whether deposits are enabled */
    enabled: boolean;
    /** Whether private deposits are available (false if recovery mode is enabled) */
    privateDepositsEnabled: boolean;
    /** Privacy period in seconds (time before withdrawal to company wallet) */
    privacyPeriodSecs: number;
    /** Company wallet address (destination for public/micro deposits) */
    companyWallet: string;
    /** Company's preferred currency (e.g., "USDC") */
    companyCurrency: string;
    /** Current SOL price in USD (cached, ~30s TTL) */
    solPriceUsd: number;
    /** Token prices in USD (symbol -> price), fetched from Jupiter */
    tokenPrices: Record<string, number>;
    /** Minimum SOL for private deposits (default: 0.25 SOL) */
    privateMinSol: number;
    /** USD equivalent of privateMinSol (rounded up to nearest $5) */
    privateMinUsd: number;
    /** Minimum USD for public deposits (Jupiter minimum: $10) */
    publicMinUsd: number;
    /** Maximum USD for SOL micro deposits (same as publicMinUsd: $10) */
    solMicroMaxUsd: number;
    /** Supported currencies for deposits */
    supportedCurrencies: string[];
    /** Token symbols shown as quick actions in the deposit flow */
    quickActionTokens: string[];
    /** Token symbols shown in the custom token list */
    customTokenSymbols: string[];
    /** Treasury wallet address for micro deposits (undefined if no treasury configured) */
    microDepositAddress?: string;
    /** Batch threshold in USD before executing Jupiter swap */
    microBatchThresholdUsd: number;
    /** Fee policy: who pays deposit fees */
    feePolicy: FeePolicy;
    /** Privacy Cash fee percentage (e.g., 0.35 for 0.35%) */
    privacyFeePercent: number;
    /** Privacy Cash fixed fee in lamports */
    privacyFeeFixedLamports: number;
    /** Swap fee percentage (e.g., 0.1 for 0.1%) */
    swapFeePercent: number;
    /** Swap fixed fee in lamports */
    swapFeeFixedLamports: number;
    /** Company processing fee percentage (e.g., 0.05 for 0.05%, default: 0) */
    companyFeePercent: number;
    /** Company processing fixed fee in lamports (default: 0) */
    companyFeeFixedLamports: number;
    /** Custom token definitions from admin settings */
    customTokens?: CustomTokenDefinition[];
}
/** Swap quote response from GET /deposit/quote */
export interface DepositQuoteResponse {
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    inUsdValue?: number;
    outUsdValue?: number;
    slippageBps?: number;
    /** Base64-encoded unsigned transaction to sign */
    transaction: string;
    /** Pass this back to POST /deposit/public */
    requestId: string;
}
/** Request for POST /deposit/public */
export interface PublicDepositRequest {
    signedTransaction: string;
    requestId: string;
    inputMint: string;
    inputAmount: number;
    walletAddress: string;
}
/** Request for POST /deposit/micro */
export interface MicroDepositRequest {
    txSignature: string;
    amountLamports: number;
    walletAddress: string;
}
/** Response from tiered deposit endpoints */
export interface TieredDepositResponse {
    sessionId: string;
    txSignature: string;
    message: string;
    depositType: DepositTier;
}
/** Individual deposit item in list response */
export interface DepositItemResponse {
    sessionId: string;
    status: 'pending' | 'detected' | 'processing' | 'completed' | 'withdrawn' | 'partially_withdrawn' | 'expired' | 'failed';
    amountLamports: number | null;
    txSignature?: string;
    withdrawalTxSignature?: string;
    createdAt: string;
    completedAt?: string;
    withdrawalAvailableAt?: string;
}
/** Deposit list response with pagination */
export interface DepositListResponse {
    deposits: DepositItemResponse[];
    total: number;
    limit: number;
    offset: number;
}
/** Credit balance */
export interface CreditBalanceResponse {
    /** Balance in lamports */
    balanceLamports: number;
    /** Currency (e.g., "SOL") */
    currency: string;
    /** Human-readable display (e.g., "0.5000 SOL") */
    display: string;
}
/** Multiple balances response */
export interface BalancesResponse {
    balances: CreditBalanceResponse[];
}
/** Credit transaction */
export interface CreditTransactionResponse {
    id: string;
    /** Amount in lamports (positive = credit, negative = debit) */
    amountLamports: number;
    currency: string;
    /** Transaction type: "deposit", "spend", "adjustment" */
    txType: string;
    /** Human-readable description */
    description: string;
    depositSessionId?: string;
    createdAt: string;
}
/** Credit history response with pagination */
export interface CreditHistoryResponse {
    transactions: CreditTransactionResponse[];
    total: number;
    limit: number;
    offset: number;
}
/** Return type for useDeposit hook */
export interface UseDepositReturn {
    /** Execute a private deposit (Privacy Cash) */
    deposit: (amountLamports: number) => Promise<DepositResponse>;
    /** Get swap quote for public deposits */
    getQuote: (params: {
        inputMint: string;
        amount: number;
        taker: string;
    }) => Promise<DepositQuoteResponse>;
    /** Execute a public deposit (Jupiter swap to company wallet) */
    publicDeposit: (request: PublicDepositRequest) => Promise<TieredDepositResponse>;
    /** Execute a SOL micro deposit (direct transfer) */
    microDeposit: (request: MicroDepositRequest) => Promise<TieredDepositResponse>;
    /** Get deposit status */
    getStatus: (sessionId: string) => Promise<DepositStatusResponse>;
    /** Get deposit config */
    getConfig: () => Promise<DepositConfigResponse>;
    /** List deposits with pagination */
    listDeposits: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<DepositListResponse>;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}
/** Admin deposit item (includes user info) */
export interface AdminDepositItem {
    id: string;
    userId: string;
    walletAddress: string;
    status: 'pending' | 'detected' | 'processing' | 'completed' | 'withdrawn' | 'partially_withdrawn' | 'expired' | 'failed';
    amountLamports: number | null;
    txSignature?: string;
    withdrawalTxSignature?: string;
    createdAt: string;
    completedAt?: string;
    withdrawalAvailableAt?: string;
    errorMessage?: string;
}
/** Admin deposit list response */
export interface AdminDepositListResponse {
    deposits: AdminDepositItem[];
    total: number;
    limit: number;
    offset: number;
}
/** Admin deposit stats response */
export interface AdminDepositStatsResponse {
    totalDeposits: number;
    totalDepositedLamports: number;
    totalDepositedSol: number;
    pendingWithdrawalCount: number;
    pendingWithdrawalLamports: number;
    pendingWithdrawalSol: number;
    totalWithdrawnCount: number;
    totalWithdrawnLamports: number;
    totalWithdrawnSol: number;
    failedCount: number;
    readyForWithdrawalCount: number;
    readyForWithdrawalLamports: number;
    readyForWithdrawalSol: number;
    inPrivacyPeriodCount: number;
    inPrivacyPeriodLamports: number;
    inPrivacyPeriodSol: number;
    usdcDepositCount: number;
    totalUsdcInput: number;
    totalUsdcDisplay: number;
    usdtDepositCount: number;
    totalUsdtInput: number;
    totalUsdtDisplay: number;
    nativeSolDepositCount: number;
    totalNativeSolInput: number;
    totalNativeSolDisplay: number;
}
/** Request to process a single withdrawal */
export interface ProcessWithdrawalRequest {
    /** Force early withdrawal (before privacy period ends) */
    force?: boolean;
}
/** Response from processing a single withdrawal */
export interface ProcessWithdrawalResponse {
    success: boolean;
    sessionId: string;
    txSignature?: string;
    error?: string;
    /** True if this was an early withdrawal (before privacy period) */
    earlyWithdrawal: boolean;
}
/** Response from processing all withdrawals */
export interface ProcessAllWithdrawalsResponse {
    totalProcessed: number;
    totalSucceeded: number;
    totalFailed: number;
    results: ProcessWithdrawalResponse[];
}
/** Credit stats for a single currency */
export interface CurrencyCreditStatsResponse {
    totalCredited: number;
    totalSpent: number;
    totalPositiveAdjustments: number;
    totalNegativeAdjustments: number;
    currentOutstanding: number;
    depositCount: number;
    spendCount: number;
    adjustmentCount: number;
    totalCreditedDisplay: number;
    totalSpentDisplay: number;
    currentOutstandingDisplay: number;
}
/** Admin credit stats response */
export interface AdminCreditStatsResponse {
    sol: CurrencyCreditStatsResponse;
    usd: CurrencyCreditStatsResponse;
    totalUsersWithBalance: number;
    totalOutstandingLamports: number;
    totalOutstandingSol: number;
}
/** Privacy Cash system status response */
export interface PrivacyStatusResponse {
    enabled: boolean;
    companyWallet: string | null;
    companyCurrency: string;
    privacyPeriodSecs: number;
    privacyPeriodDisplay: string;
    minDepositLamports: number;
    minDepositSol: number;
    withdrawalPollIntervalSecs: number;
    withdrawalBatchSize: number;
    /** Percentage of ready funds to withdraw per cycle (1-100) */
    withdrawalPercentage: number;
    /** Minimum amount (lamports) to withdraw - smaller amounts are skipped */
    withdrawalMinLamports: number;
    /** Minimum amount (SOL) to withdraw */
    withdrawalMinSol: number;
    /** Maximum partial withdrawals per batch (0 = disabled) */
    partialWithdrawalCount: number;
    /** Minimum amount (lamports) for partial withdrawals */
    partialWithdrawalMinLamports: number;
    /** Minimum amount (SOL) for partial withdrawals */
    partialWithdrawalMinSol: number;
    sidecarStatus: string;
    sidecarUrl: string;
    webhookConfigured: boolean;
}
/** Return type for useAdminDeposits hook */
export interface UseAdminDepositsReturn {
    /** List all deposits (admin) */
    listDeposits: (options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }) => Promise<AdminDepositListResponse>;
    /** Get deposit statistics (admin) */
    getStats: () => Promise<AdminDepositStatsResponse>;
    /** List deposits in privacy period (completed but not yet ready for withdrawal) */
    listInPrivacyPeriod: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<AdminDepositListResponse>;
    /** List pending withdrawals (admin) */
    listPendingWithdrawals: (options?: {
        limit?: number;
        offset?: number;
    }) => Promise<AdminDepositListResponse>;
    /** Process a single withdrawal (admin) */
    processWithdrawal: (sessionId: string, options?: ProcessWithdrawalRequest) => Promise<ProcessWithdrawalResponse>;
    /** Process all ready withdrawals (admin) */
    processAllWithdrawals: () => Promise<ProcessAllWithdrawalsResponse>;
    /** Get Privacy Cash system status */
    getPrivacyStatus: () => Promise<PrivacyStatusResponse>;
    /** Get credit spending stats */
    getCreditStats: () => Promise<AdminCreditStatsResponse>;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}
/** Return type for useCredits hook */
export interface UseCreditsReturn {
    /** Get SOL credit balance */
    getBalance: () => Promise<CreditBalanceResponse>;
    /** Get all balances */
    getAllBalances: () => Promise<CreditBalanceResponse[]>;
    /** Get transaction history */
    getHistory: (options?: {
        currency?: string;
        limit?: number;
        offset?: number;
    }) => Promise<CreditHistoryResponse>;
    /** Loading state */
    isLoading: boolean;
    /** Error message */
    error: string | null;
    /** Clear error */
    clearError: () => void;
}
/** Request to spend credits (server-to-server) */
export interface SpendCreditsRequest {
    /** Amount in lamports (must be positive) */
    amountLamports: number;
    /** Currency (default: "SOL") */
    currency?: string;
    /** Idempotency key to prevent duplicate charges */
    idempotencyKey: string;
    /** Type of reference (e.g., "order", "subscription") */
    referenceType: string;
    /** ID of the referenced entity */
    referenceId: string;
    /** Optional metadata (items, SKUs, etc.) */
    metadata?: Record<string, unknown>;
}
/** Response from spend operation */
export interface SpendCreditsResponse {
    /** Transaction ID */
    transactionId: string;
    /** New balance after spend */
    newBalanceLamports: number;
    /** Amount spent */
    amountLamports: number;
    /** Currency */
    currency: string;
    /** Human-readable display */
    display: string;
}
/** Request to create a credit hold */
export interface CreateHoldRequest {
    /** Amount in lamports (must be positive) */
    amountLamports: number;
    /** Currency (default: "SOL") */
    currency?: string;
    /** Idempotency key (returns existing hold if duplicate) */
    idempotencyKey: string;
    /** Hold duration in minutes (default: 15, max: 60) */
    ttlMinutes?: number;
    /** Type of reference (e.g., "order") */
    referenceType?: string;
    /** ID of the referenced entity */
    referenceId?: string;
    /** Optional metadata */
    metadata?: Record<string, unknown>;
}
/** Response from creating a hold */
export interface CreateHoldResponse {
    /** Hold ID (use this to capture or release) */
    holdId: string;
    /** Whether this is a new hold (false = idempotent return of existing) */
    isNew: boolean;
    /** Amount held */
    amountLamports: number;
    /** When the hold expires */
    expiresAt: string;
    /** Currency */
    currency: string;
}
/** Response from capturing a hold */
export interface CaptureHoldResponse {
    /** Transaction ID from the captured spend */
    transactionId: string;
    /** New balance after capture */
    newBalanceLamports: number;
    /** Amount captured */
    amountLamports: number;
    /** Currency */
    currency: string;
    /** Human-readable display */
    display: string;
}
/** Response from releasing a hold */
export interface ReleaseHoldResponse {
    /** Indicates the hold was released */
    released: boolean;
    /** Message */
    message: string;
}
/** Individual withdrawal history entry */
export interface WithdrawalHistoryItem {
    id: string;
    depositSessionId: string;
    amountLamports: number;
    amountSol: number;
    txSignature: string;
    cumulativeWithdrawnLamports: number;
    cumulativeWithdrawnSol: number;
    remainingLamports: number;
    remainingSol: number;
    isFinal: boolean;
    withdrawalPercentage: number | null;
    createdAt: string;
}
/** User withdrawal history response */
export interface AdminUserWithdrawalHistoryResponse {
    withdrawals: WithdrawalHistoryItem[];
    total: number;
    limit: number;
    offset: number;
}
