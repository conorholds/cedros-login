import type { CedrosLoginProviderConfig } from '../context/CedrosLoginProvider';
import type { FeatureFlags } from '../types';
import {
  runtimeAuthFeaturesFromProps,
  sameOriginExtensionRuntimeUrl,
  type RuntimeAuthFeatures,
} from './authRuntimeFeatures';

function resolveExtensionProviderConfig(
  props: Record<string, unknown>,
  runtimeBaseUrl?: string,
  colorMode?: 'light' | 'dark'
): CedrosLoginProviderConfig {
  const features = runtimeAuthFeaturesFromProps(props.features);
  const config: CedrosLoginProviderConfig = {
    serverUrl: resolveServerUrl(runtimeBaseUrl),
    features: features ? featureFlagsFromRuntime(features) : 'auto',
    // Embedded in a host page the site's color mode is authoritative: the
    // footer toggle owns <html>.cedros-dark and the host re-invokes block
    // renderers with the resolved colorMode on every change. Pin the theme to
    // that value (light when unknown, per the host contract) instead of the
    // provider's prefers-color-scheme fallback, which would diverge from a
    // manual site override.
    theme: colorMode ?? 'light',
    // Never mutate document.documentElement: the host's toggle owns the global
    // cedros-dark class, and a stray copy half-flips host theme tokens on
    // surfaces we don't own. Runtime blocks scope dark at their own roots.
    applyThemeToDocument: false,
  };
  const googleClientId =
    stringProp(props.googleClientId) ?? stringPropFromRecord(props.features, 'googleClientId');
  const appleClientId =
    stringProp(props.appleClientId) ?? stringPropFromRecord(props.features, 'appleClientId');
  const socialButtonOrder =
    stringArrayProp(props.socialButtonOrder) ??
    stringArrayPropFromRecord(props.features, 'socialButtonOrder');
  const signupAccessCodeRequired = booleanPropFromRecord(
    props.features,
    'signupAccessCodeRequired'
  );
  const signupAvailability = features?.signupAvailability;

  if (googleClientId) config.googleClientId = googleClientId;
  if (appleClientId) config.appleClientId = appleClientId;
  if (socialButtonOrder) config.socialButtonOrder = socialButtonOrder;
  if (signupAccessCodeRequired !== undefined) {
    config.signupAccessCodeRequired = signupAccessCodeRequired;
  }
  if (signupAvailability) config.signupAvailability = signupAvailability;

  return config;
}

export function resolveExtensionPublicAuthProviderConfig(
  props: Record<string, unknown>,
  runtimeBaseUrl?: string,
  colorMode?: 'light' | 'dark'
): CedrosLoginProviderConfig {
  const config = resolveExtensionProviderConfig(props, runtimeBaseUrl, colorMode);
  return {
    ...config,
    serverUrl: publicAuthServerUrl(config.serverUrl),
  };
}

export function resolveExtensionAccountProviderConfig(
  props: Record<string, unknown>,
  runtimeBaseUrl?: string,
  colorMode?: 'light' | 'dark'
): CedrosLoginProviderConfig {
  // The host's public site only proxies the allowlisted
  // `/extensions/cedros-login/public-auth/*` surface (with cookie relay); the
  // bare runtime base 404s there, so the account workspace must use the same
  // public-auth base as the auth form.
  const config = resolveExtensionPublicAuthProviderConfig(props, runtimeBaseUrl, colorMode);
  if (config.features !== 'auto') return config;

  // The account workspace has its own session loading/signed-out UI. Avoid
  // replacing that shell with null while feature discovery is pending.
  return { ...config, features: undefined };
}

function featureFlagsFromRuntime(features: RuntimeAuthFeatures): FeatureFlags {
  return {
    email: features.email,
    google: features.google,
    apple: features.apple,
    solana: features.solana,
    webauthn: features.webauthn,
    instantLink: features.instantLink,
  };
}

function resolveServerUrl(runtimeBaseUrl: string | undefined): string {
  const sameOriginRuntime = sameOriginExtensionRuntimeUrl() ?? '';
  const runtimeUrl = stringProp(runtimeBaseUrl);
  if (!runtimeUrl) return sameOriginRuntime;
  if (!isSameOriginRuntimeUrl(runtimeUrl)) return sameOriginRuntime;
  return runtimeUrl;
}

function isSameOriginRuntimeUrl(runtimeUrl: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URL(runtimeUrl, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function publicAuthServerUrl(serverUrl: string): string {
  const trimmed = serverUrl.replace(/\/+$/, '');
  if (trimmed.endsWith('/public-auth')) return trimmed;
  return trimmed ? `${trimmed}/public-auth` : trimmed;
}

function stringProp(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function stringPropFromRecord(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return stringProp((value as Record<string, unknown>)[key]);
}

function stringArrayProp(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const values = value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  );
  return values.length ? values.map((item) => item.trim()) : undefined;
}

function stringArrayPropFromRecord(value: unknown, key: string): string[] | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return stringArrayProp((value as Record<string, unknown>)[key]);
}

function booleanPropFromRecord(value: unknown, key: string): boolean | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'boolean' ? candidate : undefined;
}
