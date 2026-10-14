import { useMemo, useRef, useState } from 'react';

import { ErrorMessage } from '../components/shared/ErrorMessage';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { TotpVerify } from '../components/totp/TotpVerify';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { useExternalEffect } from '../hooks/effects';
import { useInstantLink } from '../hooks/useInstantLink';
import { useTranslations } from '../i18n';
import type { AuthError, AuthResponse } from '../types';
import { ApiClient, handleApiError } from '../utils/apiClient';
import { loginHrefWithReturnTo } from '../utils/returnTo';
import { clearPublicActionToken } from './publicActionUrl';

/** Consumes an email-verification token once and continues an authenticated signup. */
export function VerifyEmailAction({
  token,
  onAuthSuccess,
}: {
  token: string;
  onAuthSuccess: (response?: AuthResponse) => void;
}) {
  const t = useTranslations();
  const { config } = useCedrosLogin();
  const client = useMemo(
    () =>
      new ApiClient({
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        retryAttempts: config.retryAttempts,
      }),
    [config.requestTimeout, config.retryAttempts, config.serverUrl]
  );
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<AuthError | null>(null);
  const started = useRef(false);

  useExternalEffect(() => {
    if (started.current) return;
    started.current = true;
    void client
      .post<AuthResponse | { message: string }>('/verify-email', { token })
      .then((response) => {
        clearPublicActionToken();
        if (isAuthResponse(response)) {
          onAuthSuccess(response);
        } else {
          // Additional-address and account-email-change verification remain
          // message-only because those links are not login credentials.
          setStatus('success');
        }
      })
      .catch((cause) => {
        setError(
          handleApiError(cause, t.errors.linkExpired, {
            networkMessage: t.errors.unableToReachServer,
          })
        );
        setStatus('error');
      });
  }, [client, onAuthSuccess, t.errors.linkExpired, t.errors.unableToReachServer, token]);

  if (status === 'loading') return <ActionLoading label={t.auth.verifying} />;
  if (status === 'error') return <ActionFailure error={error} actionLabel={t.auth.goToLogin} />;
  return <ActionSuccess title={t.messages.emailVerified} actionLabel={t.auth.goToLogin} />;
}

function isAuthResponse(value: AuthResponse | { message: string }): value is AuthResponse {
  return 'user' in value && typeof value.isNewUser === 'boolean';
}

/** Verifies a passwordless link, including the server-requested MFA branch. */
export function InstantLinkAction({
  token,
  onAuthSuccess,
}: {
  token: string;
  onAuthSuccess: (response?: AuthResponse) => void;
}) {
  const t = useTranslations();
  const { verifyInstantLink, error } = useInstantLink();
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const started = useRef(false);

  useExternalEffect(() => {
    if (started.current) return;
    started.current = true;
    void verifyInstantLink(token)
      .then((response) => {
        if ('mfaRequired' in response) setMfaToken(response.mfaToken);
        else {
          clearPublicActionToken();
          onAuthSuccess(response);
        }
      })
      .catch(() => undefined);
  }, [onAuthSuccess, token, verifyInstantLink]);

  if (mfaToken) {
    return (
      <TotpVerify
        mfaToken={mfaToken}
        onSuccess={() => {
          clearPublicActionToken();
          onAuthSuccess();
        }}
      />
    );
  }
  if (error) return <ActionFailure error={error} actionLabel={t.auth.goToLogin} />;
  return <ActionLoading label={t.auth.verifying} />;
}

function ActionLoading({ label }: { label: string }) {
  return (
    <div className="cedros-form-header" role="status" aria-live="polite">
      <LoadingSpinner size="sm" />
      <p className="cedros-form-subtitle">{label}</p>
    </div>
  );
}

function ActionSuccess({ title, actionLabel }: { title: string; actionLabel: string }) {
  const loginHref = loginHrefWithReturnTo(
    typeof window === 'undefined' ? undefined : window.location.href
  );
  return (
    <div className="cedros-success-message" role="status">
      <p>{title}</p>
      <a className="cedros-button cedros-button-primary cedros-button-md" href={loginHref}>
        {actionLabel}
      </a>
    </div>
  );
}

function ActionFailure({ error, actionLabel }: { error: AuthError | null; actionLabel: string }) {
  const loginHref = loginHrefWithReturnTo(
    typeof window === 'undefined' ? undefined : window.location.href
  );
  return (
    <div className="cedros-form">
      <ErrorMessage error={error} autoFocus />
      <a className="cedros-button cedros-button-secondary cedros-button-md" href={loginHref}>
        {actionLabel}
      </a>
    </div>
  );
}
