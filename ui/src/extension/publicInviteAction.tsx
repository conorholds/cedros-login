import { useMemo, useRef, useState } from 'react';

import { NonWalletLoginForm } from '../components/NonWalletLoginForm';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useAuthState } from '../context/useCedrosLogin';
import { useExternalEffect } from '../hooks/effects';
import { useTranslations } from '../i18n';
import type { AcceptInviteResponse, AuthError } from '../types';
import { handleApiError } from '../utils/apiClient';
import { InviteApiClient } from '../utils/inviteApi';
import { clearPublicActionToken } from './publicActionUrl';

/** Authenticates the recipient when needed, then accepts the URL-bound invite. */
export function PublicInviteAction({ token }: { token: string }) {
  const { config, authState, user, logout, _internal } = useAuthState();
  const t = useTranslations();
  const client = useMemo(
    () =>
      new InviteApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.requestTimeout, config.retryAttempts, config.serverUrl, _internal?.getAccessToken]
  );
  const [accepted, setAccepted] = useState<AcceptInviteResponse | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const started = useRef(false);
  const isAuthenticated = authState === 'authenticated' && user !== null;

  useExternalEffect(() => {
    if (!isAuthenticated || started.current) return;
    started.current = true;
    void client
      .acceptInvite({ token })
      .then((response) => {
        clearPublicActionToken();
        setAccepted(response);
      })
      .catch((cause) => {
        let nextError = handleApiError(cause, t.messages.inviteAcceptFailed, {
          friendlyMessages: { FORBIDDEN: t.messages.inviteWrongAccount },
        });
        if (nextError.code === 'FORBIDDEN') {
          nextError = { ...nextError, message: t.messages.inviteWrongAccount };
        }
        setError(nextError);
      });
  }, [
    attempt,
    client,
    isAuthenticated,
    t.messages.inviteAcceptFailed,
    t.messages.inviteWrongAccount,
    token,
  ]);

  const retry = () => {
    started.current = false;
    setError(null);
    setAttempt((current) => current + 1);
  };

  const handleUseAnotherAccount = async () => {
    setIsSwitchingAccount(true);
    try {
      await logout();
      started.current = false;
      setError(null);
    } catch (cause) {
      setError(handleApiError(cause, t.errors.unknownError));
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  if (accepted) {
    return (
      <div className="cedros-success-message" role="status">
        <p>
          You joined {accepted.orgName} as {accepted.role}.
        </p>
        <a className="cedros-button cedros-button-primary cedros-button-md" href="/profile">
          Continue to profile
        </a>
      </div>
    );
  }
  if (error) {
    return (
      <div className="cedros-login-form-shell">
        <ErrorMessage error={error} autoFocus />
        <div className="cedros-login-session-actions">
          {error.code === 'FORBIDDEN' ? (
            <button
              type="button"
              className="cedros-button cedros-button-primary cedros-button-md"
              onClick={() => void handleUseAnotherAccount()}
              disabled={isSwitchingAccount}
            >
              {t.buttons.useAnotherAccount}
            </button>
          ) : (
            <button
              type="button"
              className="cedros-button cedros-button-primary cedros-button-md"
              onClick={retry}
            >
              {t.common.retry}
            </button>
          )}
        </div>
      </div>
    );
  }
  if (isAuthenticated || authState === 'loading') {
    return (
      <div className="cedros-form-header" role="status" aria-live="polite">
        <LoadingSpinner size="sm" />
        <p className="cedros-form-subtitle">Accepting your invite…</p>
      </div>
    );
  }
  return (
    <div>
      <p className="cedros-form-subtitle">Sign in with the invited account to continue.</p>
      <NonWalletLoginForm />
    </div>
  );
}
