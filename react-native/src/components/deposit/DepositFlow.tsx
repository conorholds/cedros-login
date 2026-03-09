/**
 * Multi-step deposit flow orchestrator (React Native)
 *
 * Receive-mode only on mobile: user sends from exchange/wallet to deposit address.
 * Steps: explainer (optional) → show-address → waiting → success/error
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { spacing } from "../../theme/spacing";
import { useDeposit } from "../../hooks/useDeposit";
import { SOL_TOKEN, SUPPORTED_TOKENS } from "./tokens";
import { getTotalFeeUsd } from "./depositFlowTypes";
import { DepositExplainerStep } from "./DepositExplainerStep";
import { DepositReceiveStep } from "./DepositReceiveStep";
import { WaitingStep, SuccessStep, ErrorStep } from "./DepositResultStep";
import type { Token } from "./tokens";
import type {
  DepositFlowStep,
  DepositFlowResult,
  DepositFlowProps,
} from "./depositFlowTypes";

export function DepositFlow({
  config,
  currencyMode,
  tokens = [],
  defaultToken,
  maxAmount: _maxAmount = 10_000,
  onSuccess,
  onError: _onError,
  onCancel,
  depositAddress,
  pollInterval = 5000,
  showExplainer = false,
  siteName,
  explainerConfig,
  tokenPriceUsd,
  containerStyle,
  testID = "deposit-flow",
}: DepositFlowProps): React.ReactElement {
  const { getStatus, clearError } = useDeposit();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Merge tokens: preset + admin-configured custom tokens
  const mergedTokens = useMemo(() => {
    const customDefs = config.customTokens ?? [];
    const base = tokens.length > 0 ? tokens : SUPPORTED_TOKENS;
    if (customDefs.length === 0) return base;
    const seen = new Set(base.map((t) => t.symbol));
    const merged = [...base];
    for (const def of customDefs) {
      if (!seen.has(def.symbol)) {
        merged.push({
          mint: def.mint,
          symbol: def.symbol,
          name: def.symbol,
          decimals: def.decimals,
          logoUrl: def.logoUrl,
        });
        seen.add(def.symbol);
      }
    }
    return merged;
  }, [tokens, config.customTokens]);

  // Effective token based on currency mode
  const effectiveToken = useMemo(() => {
    if (currencyMode === "sol") return SOL_TOKEN;
    if (currencyMode === "single-token") {
      return (
        mergedTokens.find((t) => t.symbol === "USDC") ??
        mergedTokens[0] ??
        SOL_TOKEN
      );
    }
    return (
      defaultToken ??
      mergedTokens.find((t) => t.symbol === "USDC") ??
      mergedTokens.find((t) => t.symbol !== "SOL") ??
      mergedTokens[0] ??
      SOL_TOKEN
    );
  }, [currencyMode, mergedTokens, defaultToken]);

  // State
  const getFirstStep = useCallback(
    (): DepositFlowStep => (showExplainer ? "explainer" : "show-address"),
    [showExplainer],
  );

  const [step, setStep] = useState<DepositFlowStep>(getFirstStep);
  const [selectedToken, setSelectedToken] = useState<Token>(effectiveToken);
  const [result, setResult] = useState<DepositFlowResult | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [receiveAmountUsd, setReceiveAmountUsd] = useState<number | null>(null);

  // Reset on config changes
  useEffect(() => {
    setStep(getFirstStep());
    setSelectedToken(effectiveToken);
    setResult(null);
    setFlowError(null);
    setSessionId(null);
    setReceiveAmountUsd(null);
    clearError();
  }, [currencyMode, effectiveToken, clearError, getFirstStep]);

  // Fee line for waiting step
  const feeLine = useMemo(() => {
    const amountUsd = receiveAmountUsd ?? config.privateMinUsd;
    const totalFeeUsd = getTotalFeeUsd(config, amountUsd);
    const display = totalFeeUsd < 0.01 ? 0.01 : totalFeeUsd;
    return `Fees: $${display.toFixed(2)} total`;
  }, [config, receiveAmountUsd]);

  // Poll for deposit status in waiting step
  useEffect(() => {
    if (step !== "waiting" || !sessionId) return;

    const poll = async () => {
      try {
        const status = await getStatus(sessionId);
        if (!isMountedRef.current) return;

        if (status.status === "completed" || status.status === "withdrawn") {
          const amount = status.amountLamports ?? 0;
          const flowResult: DepositFlowResult = {
            token: currencyMode === "sol" ? null : selectedToken,
            amount: amount / Math.pow(10, selectedToken.decimals),
            amountSmallestUnit: amount,
            txSignature: status.txSignature || "",
            sessionId: status.sessionId,
            response: {
              sessionId: status.sessionId,
              txSignature: status.txSignature || "",
              amountLamports: amount,
              message: "Deposit received",
              withdrawalAvailableAt: status.withdrawalAvailableAt || "",
            },
            method: "receive",
            depositAddress: depositAddress ?? undefined,
          };
          setResult(flowResult);
          setStep("success");
          onSuccess?.(flowResult);
        } else if (status.status === "failed") {
          setFlowError(status.errorMessage || "Deposit failed");
          setStep("error");
        }
      } catch {
        // Polling errors are silently ignored — we retry next interval
      }
    };

    poll();
    const interval = setInterval(poll, pollInterval);
    return () => clearInterval(interval);
  }, [
    step,
    sessionId,
    pollInterval,
    getStatus,
    selectedToken,
    currencyMode,
    depositAddress,
    onSuccess,
  ]);

  // Handlers
  const handleExplainerContinue = useCallback(() => {
    setStep("show-address");
  }, []);

  const handleSent = useCallback(() => {
    setStep("waiting");
  }, []);

  const handleBack = useCallback(() => {
    if (showExplainer) {
      setStep("explainer");
    } else {
      onCancel?.();
    }
  }, [showExplainer, onCancel]);

  const handleNewDeposit = useCallback(() => {
    setStep(getFirstStep());
    setResult(null);
    setFlowError(null);
    setSessionId(null);
    setReceiveAmountUsd(null);
  }, [getFirstStep]);

  const handleRetry = useCallback(() => {
    setFlowError(null);
    setStep("show-address");
  }, []);

  // Render current step
  const renderStep = () => {
    switch (step) {
      case "explainer":
        return (
          <DepositExplainerStep
            siteName={siteName}
            explainerConfig={explainerConfig}
            onContinue={handleExplainerContinue}
            onCancel={onCancel}
          />
        );
      case "show-address":
        return (
          <DepositReceiveStep
            config={config}
            currencyMode={currencyMode}
            tokens={mergedTokens}
            selectedToken={selectedToken}
            onTokenSelect={setSelectedToken}
            depositAddress={depositAddress ?? null}
            tokenPriceUsd={tokenPriceUsd}
            onSent={handleSent}
            onBack={handleBack}
            onAmountChange={setReceiveAmountUsd}
          />
        );
      case "waiting":
        return (
          <WaitingStep
            token={selectedToken}
            depositAddress={depositAddress ?? null}
            feeLine={feeLine}
          />
        );
      case "success":
        return result ? (
          <SuccessStep
            result={result}
            config={config}
            onNewDeposit={handleNewDeposit}
          />
        ) : null;
      case "error":
        return (
          <ErrorStep
            error={flowError || "An error occurred"}
            onRetry={handleRetry}
            onCancel={onCancel}
          />
        );
    }
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
});
