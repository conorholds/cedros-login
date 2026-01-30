import { Token } from './tokens';
import { DepositResponse, DepositConfigResponse } from '../../types/deposit';
/** Currency configuration mode */
export type CurrencyMode = 'sol' | 'single-token' | 'multi-token';
/** Deposit method - how the user will deposit funds */
export type DepositMethod = 'sign' | 'receive';
/** Flow step */
export type DepositFlowStep = 'explainer' | 'unlock' | 'confirm' | 'signing' | 'show-address' | 'waiting' | 'success' | 'error';
/** Configuration for the optional explainer step */
export interface ExplainerConfig {
    /** Custom title (default: "How Deposits Work") */
    title?: string;
    /** Custom body text (default explains Solana and suggests exchange) */
    body?: string;
    /** Exchange URL (default: "https://www.coinbase.com") */
    exchangeUrl?: string;
    /** Exchange name (default: "Coinbase") */
    exchangeName?: string;
    /** Whether to show the exchange suggestion (default: true) */
    showExchangeSuggestion?: boolean;
}
export interface DepositFlowProps {
    /** Deposit configuration (required) */
    config: DepositConfigResponse;
    /**
     * Currency mode determines what tokens users can deposit:
     * - 'sol': SOL only (no token selection step)
     * - 'single-token': Single admin-configured token (shows token info, no selection)
     * - 'multi-token': User selects from available tokens
     */
    currencyMode: CurrencyMode;
    /**
     * Deposit method determines how the user deposits:
     * - 'sign': User has a connected wallet and signs transactions (default for browser wallets)
     * - 'receive': User sends from external source (exchange) to deposit address (embedded wallet)
     *
     * If not specified, auto-detects based on wallet status:
     * - If user has external wallet connected → 'sign'
     * - If user has embedded wallet only → 'receive'
     */
    depositMethod?: DepositMethod;
    /**
     * Available tokens for single-token or multi-token modes.
     * For single-token mode, only the first token is used.
     * Ignored in 'sol' mode.
     */
    tokens?: Token[];
    /** Pre-selected token (for multi-token mode) */
    defaultToken?: Token;
    /** Minimum deposit amount (overrides server config) */
    minAmount?: number;
    /** Maximum deposit amount */
    maxAmount?: number;
    /** Callback on successful deposit */
    onSuccess?: (result: DepositFlowResult) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
    /** Callback when user cancels */
    onCancel?: () => void;
    /** Callback to request wallet unlock */
    onUnlockRequired?: () => void;
    /**
     * Callback to authorize deposit with password/PIN.
     * This sends the password to the server to decrypt Share B for withdrawal signing.
     * Returns the session ID for tracking the deposit.
     *
     * For sign mode: amount is the user-entered deposit amount
     * For receive mode: amount is 0 (auto-detected when deposit arrives)
     */
    onAuthorize?: (password: string, amount: number | null, token: Token) => Promise<{
        sessionId: string;
        depositAddress: string;
    }>;
    /** Additional CSS classes */
    className?: string;
    /** Show step indicator */
    showStepIndicator?: boolean;
    /** Polling interval for checking deposit status in receive mode (ms, default: 5000) */
    pollInterval?: number;
    /** Demo mode - skips wallet checks for Storybook/testing (default: false) */
    demoMode?: boolean;
    /** Demo mode auto-confirm delay in ms (storybook only) */
    demoAutoConfirmMs?: number;
    /** USD price overrides for non-USD tokens (by symbol) */
    tokenPriceUsd?: Record<string, number>;
    /**
     * Show an optional explainer step for non-crypto-native users.
     * This explains Solana and suggests an exchange for purchasing.
     * Admin-controlled setting (default: false)
     */
    showExplainer?: boolean;
    /** Site name to display in explainer (e.g., "Acme Inc") */
    siteName?: string;
    /** Configuration for the explainer step content */
    explainerConfig?: ExplainerConfig;
}
export interface DepositFlowResult {
    /** Selected token (null for SOL) */
    token: Token | null;
    /** Amount in token units */
    amount: number;
    /** Amount in lamports (for SOL) or smallest unit */
    amountSmallestUnit: number;
    /** Transaction signature (for sign mode) */
    txSignature: string;
    /** Session ID for tracking */
    sessionId: string;
    /** Deposit response from server */
    response: DepositResponse;
    /** Deposit method used */
    method: DepositMethod;
    /** Deposit address (for receive mode) */
    depositAddress?: string;
}
/**
 * Multi-step deposit flow component
 */
export declare function DepositFlow({ config, currencyMode, depositMethod: depositMethodProp, tokens, defaultToken, minAmount, maxAmount, onSuccess, onError, onCancel, onUnlockRequired, onAuthorize, className, showStepIndicator, pollInterval, demoMode, demoAutoConfirmMs, tokenPriceUsd, showExplainer, siteName, explainerConfig, }: DepositFlowProps): import("react/jsx-runtime").JSX.Element;
