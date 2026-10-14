import { useExternalEffect } from './effects';
import { useCallback, useMemo } from 'react';
import { useSystemSettingsOptional } from './useSystemSettings';

/**
 * Server-side feature flags stored in system settings.
 *
 * These control which features are available in the application.
 * Unlike client-side FeatureFlags (passed to CedrosLoginProvider),
 * these can be toggled at runtime via the admin dashboard.
 *
 * **Cosmetic vs enforced:**
 * Some flags only affect UI visibility (cosmetic) while others are
 * enforced server-side. See per-field docs below.
 *
 * Settings that are enforced per-request by the server (hard 403 if disabled):
 * `auth_email_enabled`, `auth_google_enabled`, `auth_apple_enabled`,
 * `auth_instantlink_enabled`, and startup/runtime auth settings.
 *
 * Settings applied at server startup (take effect after restart):
 * `security_cors_origins`, `rate_limit_*`, `auth_webauthn_*`, `webhook_*`.
 */
export interface ServerFeatures {
  /**
   * Enable multi-tenant organizations. Controls: Team, Invites sections.
   *
   * **Cosmetic** — org endpoints are always reachable server-side.
   * This flag only controls admin dashboard section visibility.
   */
  organizations: boolean;
  /** Enable Enterprise SSO for organizations. Startup-config enforced. */
  sso: boolean;
  /**
   * Enable two-factor authentication (TOTP).
   *
   * **Cosmetic** — MFA is actually gated by whether the user has TOTP
   * enrolled (`has_mfa_enabled()`), not by this flag. This controls
   * admin dashboard visibility only.
   */
  mfa: boolean;
  /**
   * Require email/password users to set up TOTP two-factor authentication.
   *
   * **Enforced** — the server returns a `setup_mfa` post-login action for
   * password users who haven't enrolled TOTP. Works independently of `mfa`
   * (which only controls UI visibility).
   */
  mfaRequired: boolean;
  /**
   * Require an access code to register.
   *
   * **Enforced** — the server rejects registrations without a valid code
   * when this is enabled. The EmailRegisterForm shows an access code field
   * when this flag is true.
   */
  signupAccessCodeRequired: boolean;
}

/**
 * Default feature values when settings haven't loaded yet.
 * All features disabled by default for safety.
 */
const DEFAULT_FEATURES: ServerFeatures = {
  organizations: false,
  sso: false,
  mfa: false,
  mfaRequired: false,
  signupAccessCodeRequired: false,
};

export interface UseServerFeaturesReturn {
  /** Current feature flag states */
  features: ServerFeatures;
  /** Whether settings are still loading */
  isLoading: boolean;
  /** Error if settings failed to load */
  error: Error | null;
  /** Refresh feature flags from server */
  refetch: () => Promise<void>;
  /** Check if a specific feature is enabled */
  isEnabled: (feature: keyof ServerFeatures) => boolean;
}

/**
 * Hook for reading server-side feature flags from system settings.
 *
 * Use this to conditionally show/hide features based on admin settings.
 *
 * @example
 * ```tsx
 * function AdminDashboard() {
 *   const { features, isLoading, isEnabled } = useServerFeatures();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return (
 *     <nav>
 *       {isEnabled('organizations') && <NavItem>Team</NavItem>}
 *       {isEnabled('organizations') && <NavItem>Team</NavItem>}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useServerFeatures(): UseServerFeaturesReturn {
  const { settings, isLoading, error, fetchSettings, getValue } = useSystemSettingsOptional();

  // Fetch when the underlying settings loader becomes able to fetch.
  // `fetchSettings` changes identity when auth readiness changes.
  useExternalEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Parse boolean value from string setting
  const parseBoolean = useCallback((value: string | undefined): boolean => {
    if (value === undefined) return false;
    return value === 'true' || value === '1';
  }, []);

  // Derive features from settings
  const features = useMemo<ServerFeatures>(() => {
    // If no settings loaded yet, return defaults
    if (Object.keys(settings).length === 0) {
      return DEFAULT_FEATURES;
    }

    return {
      organizations: parseBoolean(getValue('feature_organizations')),
      sso: parseBoolean(getValue('feature_sso')),
      mfa: parseBoolean(getValue('feature_mfa')),
      mfaRequired: parseBoolean(getValue('security_require_mfa')),
      signupAccessCodeRequired: parseBoolean(getValue('signup_access_code_enabled')),
    };
  }, [settings, getValue, parseBoolean]);

  const refetch = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  const isEnabled = useCallback(
    (feature: keyof ServerFeatures): boolean => {
      return features[feature];
    },
    [features]
  );

  return {
    features,
    isLoading,
    error,
    refetch,
    isEnabled,
  };
}
