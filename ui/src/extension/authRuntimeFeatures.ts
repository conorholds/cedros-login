import { useState } from 'react';

import { useCedrosLoginOptional } from '../context/useCedrosLogin';
import type { FeatureFlagName } from '../featureFlags';
import { useExternalEffect } from '../hooks/effects';
import type { SignupAvailability } from '../types';
import { parseSignupAvailability } from '../utils/signupAvailability';

export type RuntimeAuthProvider =
  | 'email'
  | 'google'
  | 'apple'
  | 'solana'
  | 'passkey'
  | 'instant-link';

export interface RuntimeAuthFeatures {
  email: boolean;
  google: boolean;
  apple: boolean;
  solana: boolean;
  webauthn: boolean;
  instantLink: boolean;
  googleClientId?: string;
  appleClientId?: string;
  signupAccessCodeRequired?: boolean;
  signupAvailability?: SignupAvailability;
}

const EXTENSION_RUNTIME_BASE_PATH = '/extensions/cedros-login';
const RUNTIME_FEATURES_TIMEOUT_MS = 5_000;

/**
 * Filters authored auth-form providers through runtime auth features.
 *
 * Resolution order — the first authoritative source wins:
 *  1. `ssrFeatures`: the `/features` snapshot the host (Cedros Data) injects into
 *     the block props when it server-renders the page. Authoritative AND
 *     synchronous, so the static `/login` HTML shows the operator's enabled
 *     providers with no client hydration required.
 *  2. live `CedrosLoginProvider` flags, when the block runs inside a mounted
 *     provider (standalone embedding).
 *  3. a client-side `GET {serverUrl}/features` fetch — fallback for hydrated or
 *     standalone contexts where the host supplied no SSR features.
 *
 * The client fetch is skipped entirely when `ssrFeatures` is supplied. Until some
 * source confirms features, only `email` shows (fail closed).
 */
export function useRuntimeAuthProviders(
  providers: RuntimeAuthProvider[],
  ssrFeatures?: RuntimeAuthFeatures | null
): RuntimeAuthProvider[] {
  const loginContext = useCedrosLoginOptional();
  const runtimeServerUrl = loginContext?.config.serverUrl ?? sameOriginExtensionRuntimeUrl();
  // Host-supplied SSR features are authoritative — never fetch when they exist.
  const fetchedFeatures = useRuntimeAuthFeatures(ssrFeatures ? null : runtimeServerUrl);
  const contextFeatures = loginContext
    ? runtimeFeaturesFromContext(loginContext.isFeatureEnabled, loginContext.config)
    : null;
  const features = ssrFeatures ?? contextFeatures ?? fetchedFeatures;

  if (!features) return providers.filter((provider) => provider === 'email');
  return providers.filter((provider) => isProviderEnabled(provider, features));
}

function useRuntimeAuthFeatures(serverUrl: string | null): RuntimeAuthFeatures | null {
  const [features, setFeatures] = useState<RuntimeAuthFeatures | null>(null);

  useExternalEffect(() => {
    if (!serverUrl || typeof fetch !== 'function') {
      setFeatures(null);
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), RUNTIME_FEATURES_TIMEOUT_MS);

    fetch(`${serverUrl}/features`, {
      credentials: 'omit',
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!isActive) return;
        setFeatures(runtimeFeaturesFromResponse(data));
      })
      .catch(() => {
        if (isActive) setFeatures(null);
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [serverUrl]);

  return features;
}

function runtimeFeaturesFromContext(
  isFeatureEnabled: (name: FeatureFlagName) => boolean,
  config: {
    googleClientId?: string;
    appleClientId?: string;
    signupAccessCodeRequired?: boolean;
    signupAvailability?: SignupAvailability;
  }
): RuntimeAuthFeatures {
  return {
    email: isFeatureEnabled('email'),
    google: isFeatureEnabled('google'),
    apple: isFeatureEnabled('apple'),
    solana: isFeatureEnabled('solana'),
    webauthn: isFeatureEnabled('webauthn'),
    instantLink: isFeatureEnabled('instantLink'),
    googleClientId: config.googleClientId,
    appleClientId: config.appleClientId,
    signupAccessCodeRequired: config.signupAccessCodeRequired,
    signupAvailability: config.signupAvailability,
  };
}

function runtimeFeaturesFromResponse(data: unknown): RuntimeAuthFeatures | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const googleClientId = stringProp(record.googleClientId);
  const appleClientId = stringProp(record.appleClientId);
  return {
    email: record.email === true,
    google: record.google === true,
    apple: record.apple === true,
    solana: record.solana === true,
    webauthn: record.webauthn === true,
    instantLink: record.instantLink === true,
    googleClientId,
    appleClientId,
    signupAccessCodeRequired: record.signupAccessCodeRequired === true,
    signupAvailability: parseSignupAvailability(record.signupAvailability),
  };
}

/**
 * Reads host-supplied SSR auth features from auth-form block props. The host
 * (Cedros Data) injects the `/features` response object as `props.features` when
 * it server-renders the block, so static `/login` HTML reflects the operator's
 * enabled providers. Returns null when absent/malformed → the block falls back
 * to the client `/features` fetch (hydrated/standalone contexts).
 */
export function runtimeAuthFeaturesFromProps(value: unknown): RuntimeAuthFeatures | null {
  return runtimeFeaturesFromResponse(value);
}

function isProviderEnabled(provider: RuntimeAuthProvider, features: RuntimeAuthFeatures): boolean {
  switch (provider) {
    case 'email':
      return features.email;
    case 'google':
      return features.google && Boolean(features.googleClientId);
    case 'apple':
      return features.apple && Boolean(features.appleClientId);
    case 'solana':
      return features.solana;
    case 'passkey':
      return features.webauthn;
    case 'instant-link':
      return features.instantLink;
  }
}

export function sameOriginExtensionRuntimeUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return `${window.location.origin}${EXTENSION_RUNTIME_BASE_PATH}`;
}

function stringProp(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
