import { useCallback, useRef, useState } from 'react';

import { ForgotPasswordForm } from '../components/email/ForgotPasswordForm';
import { ResetPasswordForm } from '../components/email/ResetPasswordForm';
import { NonWalletLoginForm } from '../components/NonWalletLoginForm';
import { useCedrosLogin } from '../context/useCedrosLogin';
import { useExternalEffect } from '../hooks/effects';
import type { AuthResponse } from '../types';
import { sessionSubscriptionAction } from '../utils/sessionSubscription';
import type { AuthFormMode } from './authFormBlockRenderer';
import { clearPublicActionToken, readPublicActionToken } from './publicActionUrl';
import { PublicInviteAction } from './publicInviteAction';
import { InstantLinkAction, VerifyEmailAction } from './publicTokenActions';

interface PublicAuthActionsProps {
  mode: AuthFormMode;
  onAuthSuccess: (response?: Pick<AuthResponse, 'postLogin'>) => void;
}

/** Routes each public auth block mode to its fully wired package workflow. */
export function PublicAuthActions({ mode, onAuthSuccess }: PublicAuthActionsProps) {
  if (mode === 'sign-in' || mode === 'create-account') {
    return <PublicSessionAction mode={mode} onAuthSuccess={onAuthSuccess} />;
  }
  if (mode === 'forgot-password') return <ForgotPasswordForm />;

  return <TokenizedPublicAuthAction mode={mode} onAuthSuccess={onAuthSuccess} />;
}

function PublicSessionAction({ mode, onAuthSuccess }: PublicAuthActionsProps) {
  const { authState, user, config, _internal } = useCedrosLogin();
  const [resumeError, setResumeError] = useState(false);
  const [resumeAttempt, setResumeAttempt] = useState(0);
  const continuedUserId = useRef<string | null>(null);
  const authenticatedThroughForm = useRef(false);
  const handleAuthSuccess = useCallback(
    (response?: AuthResponse) => {
      authenticatedThroughForm.current = true;
      onAuthSuccess(response);
    },
    [onAuthSuccess]
  );

  useExternalEffect(() => {
    if (
      authState !== 'authenticated' ||
      !user ||
      authenticatedThroughForm.current ||
      continuedUserId.current === user.id
    ) {
      return;
    }
    let active = true;
    void sessionSubscriptionAction(
      {
        baseUrl: config.serverUrl,
        timeoutMs: config.requestTimeout,
        getAccessToken: _internal?.getAccessToken,
      },
      window.location.href
    ).then(
      (postLogin) => {
        if (!active || authenticatedThroughForm.current) return;
        continuedUserId.current = user.id;
        onAuthSuccess(postLogin ? { postLogin } : undefined);
      },
      () => {
        if (active && !authenticatedThroughForm.current) setResumeError(true);
      }
    );
    return () => {
      active = false;
    };
  }, [
    authState,
    onAuthSuccess,
    user,
    config.serverUrl,
    config.requestTimeout,
    _internal?.getAccessToken,
    resumeAttempt,
  ]);

  if (authState === 'authenticated' && user && resumeError) {
    return (
      <div className="cedros-error" role="alert">
        <span className="cedros-error-message">
          Unable to resume your account setup. Please try again.
        </span>
        <button
          className="cedros-button cedros-button-primary cedros-button-md"
          onClick={() => {
            setResumeError(false);
            setResumeAttempt((attempt) => attempt + 1);
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Session discovery and automatic handoff are not separate user-facing screens.
  if (authState === 'idle' || authState === 'loading' || (authState === 'authenticated' && user)) {
    return null;
  }

  return (
    <NonWalletLoginForm
      defaultTab={mode === 'create-account' ? 'register' : 'login'}
      onSuccess={handleAuthSuccess}
    />
  );
}

function TokenizedPublicAuthAction({ mode, onAuthSuccess }: PublicAuthActionsProps) {
  const [token] = useState(readPublicActionToken);
  useExternalEffect(() => {
    if (token) clearPublicActionToken();
  }, [token]);

  if (!token) return <MissingActionToken mode={mode} />;
  if (mode === 'reset-password') {
    return <ResetPasswordForm token={token} onLoginClick={() => navigateTo('/login')} />;
  }
  if (mode === 'verify-email') {
    return <VerifyEmailAction token={token} onAuthSuccess={onAuthSuccess} />;
  }
  if (mode === 'instant-link-verify') {
    return <InstantLinkAction token={token} onAuthSuccess={onAuthSuccess} />;
  }
  return <PublicInviteAction token={token} />;
}

function MissingActionToken({ mode }: { mode: AuthFormMode }) {
  const recoveryHref = mode === 'reset-password' ? '/password-recovery' : '/login';
  return (
    <div className="cedros-error" role="alert">
      <span className="cedros-error-message">
        This link is missing its secure token. Request a new link and try again.
      </span>
      <a className="cedros-link" href={recoveryHref}>
        {mode === 'reset-password' ? 'Request a new link' : 'Go to login'}
      </a>
    </div>
  );
}

function navigateTo(path: string) {
  if (typeof window !== 'undefined') window.location.assign(path);
}
