import { useExternalEffect } from "./effects";
import { useState } from "react";
import { AppState } from "react-native";
import type { FeatureFlags, SignupAvailability } from "../types";
import { parseSignupAvailability } from "../utils/signupAvailability";

/**
 * Shape returned by `GET {serverUrl}/features`.
 *
 * Public endpoint — no auth required. The login screen calls this
 * before the user signs in to discover which auth methods to render.
 */
export interface AuthFeaturesResponse {
  email: boolean;
  google: boolean;
  apple: boolean;
  solana: boolean;
  webauthn: boolean;
  instantLink: boolean;
  googleClientId?: string;
  appleClientId?: string;
  signupAvailability?: unknown;
}

const FEATURE_CACHE_TTL_MS = 60_000;
const featureCache = new Map<
  string,
  {
    value?: AuthFeaturesResponse;
    expiresAt?: number;
    promise?: Promise<AuthFeaturesResponse>;
  }
>();

export function clearAutoFeaturesCache(): void {
  featureCache.clear();
}

export async function loadAutoFeatures(
  serverUrl: string,
  timeoutMs = 5_000,
  forceRefresh = false,
): Promise<AuthFeaturesResponse> {
  const baseUrl = serverUrl.replace(/\/$/, "");
  const cached = featureCache.get(baseUrl);
  if (!forceRefresh && cached?.value && (cached.expiresAt ?? 0) > Date.now())
    return cached.value;
  if (cached?.promise) return cached.promise;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const promise = fetch(`${baseUrl}/features`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: controller.signal,
  }).then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<AuthFeaturesResponse>;
  });
  featureCache.set(baseUrl, { promise });
  try {
    const value = await promise;
    featureCache.set(baseUrl, {
      value,
      expiresAt: Date.now() + FEATURE_CACHE_TTL_MS,
    });
    return value;
  } catch (error) {
    featureCache.delete(baseUrl);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/** All methods enabled — used as fallback when the server is unreachable. */
const ALL_ENABLED: FeatureFlags = {
  email: true,
  google: true,
  apple: true,
  solana: true,
  webauthn: true,
};

export interface AutoFeaturesResult {
  features: FeatureFlags | null;
  googleClientId?: string;
  appleClientId?: string;
  signupAvailability?: SignupAvailability;
  isLoading: boolean;
}

/**
 * Fetches auth feature flags from the server when `features: 'auto'`.
 *
 * - Fetches once, then refreshes disclosed signup availability every minute
 *   while active; stale responses are ignored after cleanup.
 * - Falls back to all-enabled on any error so the login screen is never blank.
 *
 * @param serverUrl  Base URL of the auth server.
 * @param enabled    `true` only when the consumer passed `features: 'auto'`.
 * @param timeoutMs  Optional request timeout (default 5 000 ms).
 */
export function useAutoFeatures(
  serverUrl: string,
  enabled: boolean,
  timeoutMs?: number,
): AutoFeaturesResult {
  const [features, setFeatures] = useState<FeatureFlags | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | undefined>();
  const [appleClientId, setAppleClientId] = useState<string | undefined>();
  const [signupAvailability, setSignupAvailability] = useState<
    SignupAvailability | undefined
  >();
  const [isLoading, setIsLoading] = useState(enabled);

  useExternalEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let isActive = true;
    let initialLoadComplete = false;
    let refreshInFlight = false;
    let shouldRefreshAvailability = false;
    let expirationId: ReturnType<typeof setTimeout> | undefined;
    setIsLoading(true);

    const load = async () => {
      if (refreshInFlight) return;
      refreshInFlight = true;
      try {
        const resp = await loadAutoFeatures(
          serverUrl,
          timeoutMs,
          initialLoadComplete,
        );
        if (!isActive) return;
        const availability = parseSignupAvailability(resp.signupAvailability);
        shouldRefreshAvailability =
          resp.signupAvailability !== undefined &&
          resp.signupAvailability !== null;
        if (expirationId !== undefined) clearTimeout(expirationId);
        expirationId = undefined;
        if (availability) {
          const maximumDelay = 2_147_483_647;
          const delay = Math.min(
            maximumDelay,
            Math.max(0, Date.parse(availability.resetsAt) - Date.now() + 250),
          );
          expirationId = setTimeout(() => {
            if (!isActive) return;
            setSignupAvailability(undefined);
            void load();
          }, delay);
        }
        setFeatures({
          email: resp.email,
          google: resp.google,
          apple: resp.apple,
          solana: resp.solana,
          webauthn: resp.webauthn,
        });
        setGoogleClientId(resp.googleClientId);
        setAppleClientId(resp.appleClientId);
        setSignupAvailability(availability);
      } catch {
        if (!isActive || initialLoadComplete) return;
        setFeatures(ALL_ENABLED);
      } finally {
        refreshInFlight = false;
        if (isActive && !initialLoadComplete) {
          initialLoadComplete = true;
          setIsLoading(false);
        }
      }
    };

    void load();
    const refreshId = setInterval(() => {
      if (shouldRefreshAvailability && AppState.currentState === "active")
        void load();
    }, 60_000);
    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (shouldRefreshAvailability && state === "active") void load();
      },
    );

    return () => {
      isActive = false;
      clearInterval(refreshId);
      if (expirationId !== undefined) clearTimeout(expirationId);
      appStateSubscription.remove();
    };
  }, [enabled, serverUrl, timeoutMs]);

  return {
    features,
    googleClientId,
    appleClientId,
    signupAvailability,
    isLoading,
  };
}
