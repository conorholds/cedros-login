/**
 * Shared types for the multi-step deposit flow (React Native)
 */

import type { Token } from "./tokens";
import type {
  DepositResponse,
  DepositConfigResponse,
  FeePolicy,
} from "../../types/deposit";

/** Currency configuration mode */
export type CurrencyMode = "sol" | "single-token" | "multi-token";

/** Deposit method — mobile always uses 'receive' (send from exchange to deposit address) */
export type DepositMethod = "receive";

/** Flow step */
export type DepositFlowStep =
  | "explainer"
  | "show-address"
  | "waiting"
  | "success"
  | "error";

/** Configuration for the optional explainer step */
export interface ExplainerConfig {
  title?: string;
  body?: string;
  exchangeUrl?: string;
  exchangeName?: string;
  showExchangeSuggestion?: boolean;
}

/** Result returned on successful deposit */
export interface DepositFlowResult {
  token: Token | null;
  amount: number;
  amountSmallestUnit: number;
  txSignature: string;
  sessionId: string;
  response: DepositResponse;
  method: DepositMethod;
  depositAddress?: string;
}

export interface DepositFlowProps {
  /** Deposit configuration (required) */
  config: DepositConfigResponse;
  /** Currency mode: 'sol' | 'single-token' | 'multi-token' */
  currencyMode: CurrencyMode;
  /** Available tokens (for single-token or multi-token modes) */
  tokens?: Token[];
  /** Pre-selected token */
  defaultToken?: Token;
  /** Max deposit in USD (default: 10000) */
  maxAmount?: number;
  /** Callback on successful deposit */
  onSuccess?: (result: DepositFlowResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback when user cancels */
  onCancel?: () => void;
  /** Deposit address (from embedded wallet) */
  depositAddress?: string;
  /** Polling interval for status checks in ms (default: 5000) */
  pollInterval?: number;
  /** Show explainer step for non-crypto users */
  showExplainer?: boolean;
  /** Site name for explainer */
  siteName?: string;
  /** Explainer content config */
  explainerConfig?: ExplainerConfig;
  /** USD price overrides for tokens */
  tokenPriceUsd?: Record<string, number>;
  /** Container style */
  containerStyle?: import("react-native").StyleProp<import("react-native").ViewStyle>;
  /** Test ID */
  testID?: string;
}

// ─── Fee Utilities ───────────────────────────────────────────────────────────

const LAMPORTS_PER_SOL = 1_000_000_000;

const USD_STABLE_TOKENS = new Set([
  "USDC",
  "USDT",
  "USD1",
  "PYUSD",
  "USDH",
  "CASH",
]);

/** Calculate effective user-facing fee percentage */
export function getEffectiveFeePercent(
  config: DepositConfigResponse,
  isPrivate: boolean,
  isMicro: boolean,
): number {
  const { feePolicy, privacyFeePercent, swapFeePercent, companyFeePercent } =
    config;
  let userFee = companyFeePercent;
  if (isMicro) return userFee;
  if (feePolicy === "user_pays_all") {
    userFee += swapFeePercent;
    if (isPrivate) userFee += privacyFeePercent;
  } else if (feePolicy === "user_pays_privacy" && isPrivate) {
    userFee += privacyFeePercent;
  } else if (feePolicy === "user_pays_swap") {
    userFee += swapFeePercent;
  }
  return userFee;
}

/** Calculate total fee in USD for an amount */
export function getTotalFeeUsd(
  config: DepositConfigResponse,
  amountUsd: number,
): number {
  if (amountUsd <= 0) return 0;
  const isMicro = amountUsd < config.publicMinUsd;
  const isPrivate = amountUsd >= config.privateMinUsd;
  const feePercent = getEffectiveFeePercent(config, isPrivate, isMicro);
  let userFixedLamports = config.companyFeeFixedLamports;
  if (!isMicro) {
    if (
      isPrivate &&
      (config.feePolicy === "user_pays_all" ||
        config.feePolicy === "user_pays_privacy")
    ) {
      userFixedLamports += config.privacyFeeFixedLamports;
    }
    if (
      config.feePolicy === "user_pays_all" ||
      config.feePolicy === "user_pays_swap"
    ) {
      userFixedLamports += config.swapFeeFixedLamports;
    }
  }
  const fixedFeeUsd =
    (userFixedLamports / LAMPORTS_PER_SOL) * config.solPriceUsd;
  const percentFeeUsd = amountUsd * (feePercent / 100);
  return fixedFeeUsd + percentFeeUsd;
}

/** Get USD price for a token */
export function getTokenUsdPrice(
  token: Token,
  config: DepositConfigResponse,
  priceOverrides?: Record<string, number>,
): number | null {
  if (USD_STABLE_TOKENS.has(token.symbol)) return 1;
  const serverPrice = config.tokenPrices?.[token.symbol];
  if (serverPrice && serverPrice > 0) return serverPrice;
  if (token.symbol === "SOL") return config.solPriceUsd || null;
  const override = priceOverrides?.[token.symbol];
  if (override && override > 0) return override;
  return null;
}

/** Format token amount for display */
export function formatTokenAmount(amount: number, symbol: string): string {
  const decimals = USD_STABLE_TOKENS.has(symbol) ? 2 : 4;
  return amount.toFixed(decimals);
}

/** User-facing fee label */
export function getUserFacingFeeLabel(
  policy: FeePolicy,
  hasCompanyFee: boolean,
): string {
  if (policy === "company_pays_all" && !hasCompanyFee) return "No fees";
  if (policy === "company_pays_all" && hasCompanyFee)
    return "Processing fee only";
  if (policy === "user_pays_all") return "Standard fees apply";
  return "Partial fees apply";
}
