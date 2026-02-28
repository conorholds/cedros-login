import { useState, useEffect, useRef } from "react";
import type { FeatureFlags } from "../types";

/**
 * Shape returned by `GET {serverUrl}/features`.
 *
 * Public endpoint — no auth required. The login screen calls this
 * before the user signs in to discover which auth methods to render.
 */
interface AuthFeaturesResponse {
  email: boolean;
  google: boolean;
  apple: boolean;
  solana: boolean;
  webauthn: boolean;
  instantLink: boolean;
  googleClientId?: string;
  appleClientId?: string;
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
  isLoading: boolean;
}

/**
 * Fetches auth feature flags from the server when `features: 'auto'`.
 *
 * - One-shot fetch on mount (guarded by ref to prevent StrictMode double-fire).
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
  const [isLoading, setIsLoading] = useState(enabled);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || fetchedRef.current) return;
    fetchedRef.current = true;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      timeoutMs ?? 5_000,
    );

    const baseUrl = serverUrl.replace(/\/$/, "");

    fetch(`${baseUrl}/features`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<AuthFeaturesResponse>;
      })
      .then((resp) => {
        setFeatures({
          email: resp.email,
          google: resp.google,
          apple: resp.apple,
          solana: resp.solana,
          webauthn: resp.webauthn,
        });
        setGoogleClientId(resp.googleClientId);
        setAppleClientId(resp.appleClientId);
      })
      .catch(() => {
        setFeatures(ALL_ENABLED);
      })
      .finally(() => {
        clearTimeout(timeout);
        setIsLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [enabled, serverUrl, timeoutMs]);

  return { features, googleClientId, appleClientId, isLoading };
}
