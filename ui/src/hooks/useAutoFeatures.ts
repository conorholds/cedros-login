import { useExternalEffect } from './effects';
import { useState } from 'react';
import type { FeatureFlags, SignupAvailability } from '../types';
import { getAutoDiscoverableFeatureDefaults } from '../featureFlags';
import { ApiClient } from '../utils/apiClient';
import { parseSignupAvailability } from '../utils/signupAvailability';

/**
 * Shape returned by `GET {serverUrl}/features`.
 *
 * No authentication required — the endpoint is public so the login page
 * can discover which auth methods to render before the user signs in.
 *
 * Note: `walletEnrollment` (present in {@link FeatureFlags}) is client-only
 * and not included in this response.
 */
interface AuthFeaturesResponse {
  email: boolean;
  google: boolean;
  apple: boolean;
  solana: boolean;
  webauthn: boolean;
  instantLink: boolean;
  signupAccessCodeRequired?: boolean;
  /** Google OAuth client ID, present when Google auth is enabled on the server. */
  googleClientId?: string;
  /** Apple Services ID, present when Apple auth is enabled on the server. */
  appleClientId?: string;
  /** Whether post-login username selection is enabled. */
  usernameEnabled?: boolean;
  /** Display order for social login buttons. */
  socialButtonOrder?: string[];
  signupAvailability?: unknown;
}

/** Registry defaults for server-discoverable flags. */
const AUTO_DISCOVERABLE_DEFAULTS: FeatureFlags = getAutoDiscoverableFeatureDefaults();

/**
 * Fetches auth feature flags from the server when `features: 'auto'`.
 *
 * - Fetches once, then refreshes disclosed signup availability every minute
 *   while the page is visible; stale responses are ignored after cleanup.
 * - Falls back to all-enabled on any error so the login page is never blank.
 *
 * @param serverUrl  Base URL of the auth server.
 * @param enabled    `true` only when the consumer passed `features: 'auto'`.
 * @param timeoutMs  Optional request timeout (default 5 000 ms).
 */
/** Return type for {@link useAutoFeatures}. */
export interface AutoFeaturesResult {
  features: FeatureFlags | null;
  /** Google OAuth client ID from the server, if available. */
  googleClientId?: string;
  /** Apple Services ID from the server, if available. */
  appleClientId?: string;
  /** Whether post-login username selection is enabled. */
  usernameEnabled?: boolean;
  /** Display order for social login buttons. */
  socialButtonOrder?: string[];
  /** Whether new registrations must include an invite/access code. */
  signupAccessCodeRequired?: boolean;
  /** Public signup quota snapshot when disclosure is enabled. */
  signupAvailability?: SignupAvailability;
  isLoading: boolean;
}

export function useAutoFeatures(
  serverUrl: string,
  enabled: boolean,
  timeoutMs?: number
): AutoFeaturesResult {
  const [features, setFeatures] = useState<FeatureFlags | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | undefined>();
  const [appleClientId, setAppleClientId] = useState<string | undefined>();
  const [usernameEnabled, setUsernameEnabled] = useState<boolean | undefined>();
  const [socialButtonOrder, setSocialButtonOrder] = useState<string[] | undefined>();
  const [signupAccessCodeRequired, setSignupAccessCodeRequired] = useState<boolean | undefined>();
  const [signupAvailability, setSignupAvailability] = useState<SignupAvailability | undefined>();
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
    let expirationId: number | undefined;
    setIsLoading(true);

    const client = new ApiClient({
      baseUrl: serverUrl,
      timeoutMs: timeoutMs ?? 5_000,
      retryAttempts: 1,
    });

    const load = async () => {
      if (refreshInFlight) return;
      refreshInFlight = true;
      try {
        const resp = await client.get<AuthFeaturesResponse>('/features', {
          credentials: 'omit',
          cacheTtlMs: 0,
          forceRefresh: initialLoadComplete,
        });
        if (!isActive) return;
        const availability = parseSignupAvailability(resp.signupAvailability);
        shouldRefreshAvailability =
          resp.signupAvailability !== undefined && resp.signupAvailability !== null;
        if (expirationId !== undefined) window.clearTimeout(expirationId);
        expirationId = undefined;
        if (availability) {
          const maximumDelay = 2_147_483_647;
          const delay = Math.min(
            maximumDelay,
            Math.max(0, Date.parse(availability.resetsAt) - Date.now() + 250)
          );
          expirationId = window.setTimeout(() => {
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
          instantLink: resp.instantLink,
        });
        setGoogleClientId(resp.googleClientId);
        setAppleClientId(resp.appleClientId);
        setUsernameEnabled(resp.usernameEnabled);
        setSocialButtonOrder(resp.socialButtonOrder);
        setSignupAccessCodeRequired(resp.signupAccessCodeRequired);
        setSignupAvailability(availability);
      } catch {
        if (!isActive || initialLoadComplete) return;
        // Server unreachable on initial load — fall back to package defaults.
        setFeatures(AUTO_DISCOVERABLE_DEFAULTS);
      } finally {
        refreshInFlight = false;
        if (isActive && !initialLoadComplete) {
          initialLoadComplete = true;
          setIsLoading(false);
        }
      }
    };

    void load();
    const refreshId = window.setInterval(() => {
      if (shouldRefreshAvailability && document.visibilityState === 'visible') void load();
    }, 60_000);
    const handleVisibility = () => {
      if (shouldRefreshAvailability && document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isActive = false;
      window.clearInterval(refreshId);
      if (expirationId !== undefined) window.clearTimeout(expirationId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, serverUrl, timeoutMs]);

  return {
    features,
    googleClientId,
    appleClientId,
    usernameEnabled,
    socialButtonOrder,
    signupAccessCodeRequired,
    signupAvailability,
    isLoading,
  };
}
