import { useExternalEffect } from '../hooks/effects';
import { useState, useCallback, useMemo, useRef, type ReactNode } from 'react';
import type { CedrosLoginConfig, FeatureFlags, AuthError, AuthCallbacks } from '../types';
import type { FeatureFlagName, ResolvedFeatureFlags } from '../featureFlags';
import { AuthStateContext, AuthUIContext } from './CedrosLoginContext';
import { DeviceAccountLinkProvider } from './DeviceAccountLinkProvider';
import { isFeatureEnabled, resolveFeatureFlags } from '../featureFlags';
import { useThemeManager } from '../hooks/useThemeManager';
import { useAutoFeatures } from '../hooks/useAutoFeatures';
import { useAuthSession } from '../hooks/useAuthSession';
import { notifyCrmIdentifyLogin } from '../utils/crmIdentify';
import { recordDeviceAccountHint } from '../utils/deviceAccountHint';
import { I18nProvider } from '../i18n';

/**
 * Config prop type for `<CedrosLoginProvider>`.
 *
 * Extends {@link CedrosLoginConfig} with one additional feature:
 * the `features` field also accepts `'auto'` to fetch enabled
 * auth methods from the server at startup. Server discovery also runs by
 * default when `features` is omitted.
 *
 * **Server discovery contract:**
 * - Calls `GET {serverUrl}/features` (no auth required, credentials omitted).
 * - Response shape: `{ email, google, apple, solana, webauthn, instantLink }` (all booleans).
 * - Timeout: `requestTimeout` or 5 000 ms. 1 retry on failure.
 * - Fallback: all methods enabled (so the login page is never blank).
 * - With `features: 'auto'`, children are not rendered until discovery completes.
 * - When `features` is omitted, the app renders immediately and applies
 *   discovered settings after they load.
 * - `walletEnrollment` flag is client-only and is not part of the server response.
 *
 * When `features` is set to a `FeatureFlags` object, no server call is made
 * and the flags are used as-is.
 *
 * @example
 * ```tsx
 * // Auto-discover enabled methods from the server:
 * <CedrosLoginProvider config={{ serverUrl: '...' }}>
 *
 * // Or pin methods explicitly:
 * <CedrosLoginProvider config={{ serverUrl: '...', features: { email: true, google: true } }}>
 * ```
 */
export type CedrosLoginProviderConfig = Omit<CedrosLoginConfig, 'features'> & {
  features?: FeatureFlags | 'auto';
};

export interface CedrosLoginProviderProps {
  config: CedrosLoginProviderConfig;
  children: ReactNode;
}

/**
 * Provider component that wraps your app and provides authentication context.
 *
 * @example
 * ```tsx
 * <CedrosLoginProvider config={{ serverUrl: 'https://api.example.com' }}>
 *   <App />
 * </CedrosLoginProvider>
 * ```
 */
export function CedrosLoginProvider({ config, children }: CedrosLoginProviderProps) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Keep the latest callbacks in a ref so their identities never
  // participate in memoization comparisons. Stable wrapper functions delegate
  // to the ref at call time, giving useAuthSession a constant callbacks object
  // whose identity never changes across renders.
  const callbacksRef = useRef<AuthCallbacks | undefined>(config.callbacks);
  callbacksRef.current = config.callbacks;

  // These wrappers are created once (empty dep arrays) and read from the ref
  // at invocation time, so they are always up-to-date without being recreated.
  const stableCallbacks = useRef<AuthCallbacks>({
    onLoginSuccess: (user, method) => {
      void recordDeviceAccountHint(user, method);
      callbacksRef.current?.onLoginSuccess?.(user, method);
    },
    onLoginError: (...args) => callbacksRef.current?.onLoginError?.(...args),
    onLogout: () => callbacksRef.current?.onLogout?.(),
    onSessionExpired: () => callbacksRef.current?.onSessionExpired?.(),
  });
  // stableCallbacks.current is assigned once at mount and never replaced,
  // so useAuthSession receives the same object reference on every render.

  // Capture referral code from URL parameter (?ref=CODE) on mount.
  // Stored in a ref so it persists across renders without causing re-renders.
  const referralCodeRef = useRef<string | null>(null);
  useExternalEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referral');
    if (ref) {
      referralCodeRef.current = ref;
    }
  }, []);

  // Resolve omitted features or features: 'auto' by fetching enabled methods
  // from the server. Explicit feature objects remain static. Only the
  // explicit 'auto' mode blocks initial render; omitted features update in
  // the background to preserve the current provider startup behavior.
  const isAutoFeatures = config.features === undefined || config.features === 'auto';
  const shouldBlockForFeatureDiscovery = config.features === 'auto';
  const {
    features: serverFeatures,
    googleClientId: serverGoogleClientId,
    appleClientId: serverAppleClientId,
    socialButtonOrder: serverSocialButtonOrder,
    signupAccessCodeRequired: serverSignupAccessCodeRequired,
    signupAvailability: serverSignupAvailability,
    isLoading: featuresLoading,
  } = useAutoFeatures(config.serverUrl, isAutoFeatures, config.requestTimeout);

  const explicitFeatureOverrides = isAutoFeatures
    ? undefined
    : (config.features as FeatureFlags | undefined);

  const resolvedFeatureFlags = useMemo(
    () =>
      resolveFeatureFlags({
        config: explicitFeatureOverrides,
        env: config.featureFlagEnv,
        base: isAutoFeatures ? (serverFeatures ?? undefined) : undefined,
      }),
    [config.featureFlagEnv, explicitFeatureOverrides, isAutoFeatures, serverFeatures]
  );

  // Build resolved config and merge server-provided client IDs.
  const resolvedConfig = useMemo((): CedrosLoginConfig => {
    return {
      ...config,
      callbacks: stableCallbacks.current,
      features: resolvedFeatureFlags,
      googleClientId: isAutoFeatures
        ? (config.googleClientId ?? serverGoogleClientId)
        : config.googleClientId,
      appleClientId: isAutoFeatures
        ? (config.appleClientId ?? serverAppleClientId)
        : config.appleClientId,
      signupAccessCodeRequired: isAutoFeatures
        ? (config.signupAccessCodeRequired ?? serverSignupAccessCodeRequired)
        : config.signupAccessCodeRequired,
      signupAvailability: isAutoFeatures
        ? (config.signupAvailability ?? serverSignupAvailability)
        : config.signupAvailability,
    } as CedrosLoginConfig;
  }, [
    config,
    isAutoFeatures,
    resolvedFeatureFlags,
    serverGoogleClientId,
    serverAppleClientId,
    serverSignupAccessCodeRequired,
    serverSignupAvailability,
  ]);

  // Memoize config with JSON.stringify for nested objects to prevent
  // re-renders when parent recreates objects with identical content.
  // Memoize the stringification itself so local provider state changes
  // (e.g. error/modal state) don't repeatedly serialize large objects.
  // Callbacks are intentionally excluded — functions are not
  // serializable and their identity changes on every render. The callbacksRef
  // above ensures useAuthSession always sees the latest callbacks without
  // causing memoizedConfig to become unstable.
  const themeOverridesKey = useMemo(
    () => JSON.stringify(resolvedConfig.themeOverrides ?? null),
    [resolvedConfig.themeOverrides]
  );
  const sessionKey = useMemo(
    () => JSON.stringify(resolvedConfig.session ?? null),
    [resolvedConfig.session]
  );
  const featuresKey = useMemo(
    () => JSON.stringify(resolvedConfig.features ?? null),
    [resolvedConfig.features]
  );
  const socialButtonOrderKey = useMemo(
    () => JSON.stringify(resolvedConfig.socialButtonOrder ?? null),
    [resolvedConfig.socialButtonOrder]
  );
  const formsKey = useMemo(
    () => JSON.stringify(resolvedConfig.forms ?? null),
    [resolvedConfig.forms]
  );
  const translationsKey = useMemo(
    () => JSON.stringify(resolvedConfig.translations ?? null),
    [resolvedConfig.translations]
  );
  const memoizedConfig = useMemo(
    () => resolvedConfig,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Using serialized keys for deep comparison; callbacks excluded
    [
      resolvedConfig.serverUrl,
      resolvedConfig.googleClientId,
      resolvedConfig.appleClientId,
      resolvedConfig.requestTimeout,
      resolvedConfig.retryAttempts,
      resolvedConfig.signupAccessCodeRequired,
      resolvedConfig.signupAvailability,
      socialButtonOrderKey,
      resolvedConfig.locale,
      resolvedConfig.theme,
      themeOverridesKey,
      sessionKey,
      featuresKey,
      formsKey,
      translationsKey,
    ]
  );

  // Apply theme — returns className + style for the wrapper div.
  // Both MUST be on the same element so inline overrides beat class declarations.
  // When `unstyled` is true, skip theme application entirely.
  const isUnstyled = memoizedConfig.unstyled ?? false;
  const themeResult = useThemeManager({
    theme: isUnstyled ? undefined : memoizedConfig.theme,
    themeOverrides: isUnstyled ? undefined : memoizedConfig.themeOverrides,
    applyThemeToDocument: memoizedConfig.applyThemeToDocument,
  });

  // Manage auth session.
  // Pass stableCallbacks.current — a fixed object whose identity never
  // changes — so useAuthSession's internal `useExternalEffect([callbacks])` sync only
  // fires once on mount, not on every render.
  const {
    user,
    authState,
    handleLoginSuccess,
    logout: sessionLogout,
    refreshUser,
    getAccessToken,
  } = useAuthSession({
    serverUrl: memoizedConfig.serverUrl,
    session: memoizedConfig.session,
    callbacks: stableCallbacks.current,
    requestTimeoutMs: memoizedConfig.requestTimeout,
  });

  // Wrap logout to also clear error
  const logout = useCallback(async () => {
    setError(null);
    await sessionLogout();
  }, [sessionLogout]);

  // Wrap login success to also clear error
  const wrappedHandleLoginSuccess = useCallback(
    (...args: Parameters<typeof handleLoginSuccess>) => {
      setError(null);
      handleLoginSuccess(...args);
    },
    [handleLoginSuccess]
  );

  // Fire cedros-data CRM identify-login once per authenticated user.
  // Covers all entry paths (login, signup, OAuth callback, session restoration)
  // by watching the transition into authState='authenticated'.
  const crmIdentifiedUserIdRef = useRef<string | null>(null);
  const crmPreconditionFailedRef = useRef(false);
  useExternalEffect(() => {
    if (authState !== 'authenticated' || !user) return;
    if (crmIdentifiedUserIdRef.current === user.id) return;
    if (crmPreconditionFailedRef.current) return;
    const crmConfig = memoizedConfig.crmIdentify;
    if (!crmConfig?.enabled) return;
    const accessToken = getAccessToken();
    if (!accessToken) return;
    crmIdentifiedUserIdRef.current = user.id;
    void notifyCrmIdentifyLogin({ config: crmConfig, user, accessToken }).then((outcome) => {
      if (outcome.kind === 'precondition-failed') {
        crmPreconditionFailedRef.current = true;
      }
    });
  }, [authState, user, memoizedConfig.crmIdentify, getAccessToken]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const featureFlags = memoizedConfig.features as ResolvedFeatureFlags;
  const isResolvedFeatureEnabled = useCallback(
    (name: FeatureFlagName) => isFeatureEnabled(name, { flags: featureFlags }),
    [featureFlags]
  );

  // Split into auth state (stable) and UI state (volatile)
  const authStateValue = useMemo(
    () => ({
      config: memoizedConfig,
      featureFlags,
      isFeatureEnabled: isResolvedFeatureEnabled,
      user,
      authState,
      logout,
      refreshUser,
      socialButtonOrder:
        memoizedConfig.socialButtonOrder ?? (isAutoFeatures ? serverSocialButtonOrder : undefined),
      _internal: {
        handleLoginSuccess: wrappedHandleLoginSuccess,
        getAccessToken,
        getReferralCode: () => referralCodeRef.current,
      },
    }),
    [
      memoizedConfig,
      featureFlags,
      isResolvedFeatureEnabled,
      user,
      authState,
      logout,
      refreshUser,
      isAutoFeatures,
      serverSocialButtonOrder,
      wrappedHandleLoginSuccess,
      getAccessToken,
    ]
  );

  const uiValue = useMemo(
    () => ({
      error,
      isModalOpen,
      openModal,
      closeModal,
    }),
    [error, isModalOpen, openModal, closeModal]
  );

  // Explicit 'auto' mode waits for discovery before rendering children.
  // In practice this is <100 ms thanks to the 60 s server cache.
  if (shouldBlockForFeatureDiscovery && featuresLoading) return null;

  return (
    <I18nProvider locale={memoizedConfig.locale} translations={memoizedConfig.translations}>
      <AuthStateContext.Provider value={authStateValue}>
        <AuthUIContext.Provider value={uiValue}>
          <div
            className={['cedros-login-theme', themeResult.className].filter(Boolean).join(' ')}
            style={themeResult.style}
          >
            <DeviceAccountLinkProvider>{children}</DeviceAccountLinkProvider>
          </div>
        </AuthUIContext.Provider>
      </AuthStateContext.Provider>
    </I18nProvider>
  );
}
