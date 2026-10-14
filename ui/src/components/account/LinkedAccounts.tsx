/**
 * LinkedAccounts — displays linked sign-in methods and allows unlinking.
 *
 * Each credential row shows an icon, display name, timestamps, and a remove button.
 * Linking new methods is handled via consumer-provided callbacks.
 */

import { useState, useCallback, type ComponentType } from 'react';
import type { Credential, CredentialType } from '../../types';
import { useCredentials } from '../../hooks/useCredentials';
import { useWebAuthn } from '../../hooks/useWebAuthn';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import {
  AppleProviderIcon,
  GoogleProviderIcon,
  PasskeyProviderIcon,
  SolanaProviderIcon,
} from '../shared/providerIcons';

export interface LinkedAccountsProps {
  /** Callback to start Google OAuth linking flow */
  onLinkGoogle?: () => void;
  /** Callback to start Apple OAuth linking flow */
  onLinkApple?: () => void;
  /** Override for passkey registration. If omitted, uses built-in registerPasskey(). */
  onAddPasskey?: () => void;
  /** Callback to start Solana wallet linking flow */
  onLinkSolana?: () => void;
  /** Additional CSS class */
  className?: string;
}

/** Human-readable names for credential types */
const CREDENTIAL_LABELS: Record<CredentialType, string> = {
  password: 'Email & Password',
  oauth_google: 'Google',
  oauth_apple: 'Apple',
  solana: 'Solana Wallet',
  webauthn_passkey: 'Passkey',
  webauthn_security_key: 'Security Key',
  totp: 'Authenticator App (2FA)',
  sso_oidc: 'Single Sign-On',
};

export function LinkedAccounts({
  onLinkGoogle,
  onLinkApple,
  onAddPasskey,
  onLinkSolana,
  className = '',
}: LinkedAccountsProps) {
  const { credentials, isLoading, error, unlinkCredential, clearError, fetchCredentials } =
    useCredentials();
  const {
    registerPasskey,
    isSupported: passkeysSupported,
    error: passkeyError,
    clearError: clearPasskeyError,
  } = useWebAuthn();
  const { confirm, dialogProps } = useConfirmDialog();
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);

  const handleAddPasskey = useCallback(async () => {
    if (onAddPasskey) {
      onAddPasskey();
      return;
    }
    setIsAddingPasskey(true);
    try {
      await registerPasskey();
      await fetchCredentials();
    } catch {
      // Error surfaced via useWebAuthn().error
    } finally {
      setIsAddingPasskey(false);
    }
  }, [onAddPasskey, registerPasskey, fetchCredentials]);

  const handleUnlink = useCallback(
    async (cred: Credential) => {
      const label = cred.label || CREDENTIAL_LABELS[cred.credentialType];
      const confirmed = await confirm({
        title: `Remove ${label}?`,
        description: `You won't be able to sign in with "${label}" anymore.`,
        confirmLabel: 'Remove',
        destructive: true,
      });
      if (!confirmed) return;

      setUnlinkingId(cred.id);
      try {
        await unlinkCredential(cred.id);
      } catch {
        // Error is surfaced via hook state
      } finally {
        setUnlinkingId(null);
      }
    },
    [confirm, unlinkCredential]
  );

  // Determine which link buttons to show (only providers not already linked)
  const linkedTypes = new Set(credentials.map((c) => c.credentialType));
  const canLinkGoogle = onLinkGoogle && !linkedTypes.has('oauth_google');
  const canLinkApple = onLinkApple && !linkedTypes.has('oauth_apple');
  const canAddPasskey = (onAddPasskey || passkeysSupported) && !linkedTypes.has('webauthn_passkey');
  const canLinkSolana = onLinkSolana && !linkedTypes.has('solana');
  const hasLinkOptions = canLinkGoogle || canLinkApple || canAddPasskey || canLinkSolana;

  if (isLoading && credentials.length === 0) {
    return (
      <div className={`cedros-linked-accounts cedros-linked-accounts-loading ${className}`}>
        <LoadingSpinner size="sm" />
        <span>Loading linked accounts…</span>
      </div>
    );
  }

  return (
    <div className={`cedros-linked-accounts ${className}`}>
      {passkeyError && <ErrorMessage error={passkeyError} onDismiss={clearPasskeyError} />}
      {error && (
        <ErrorMessage
          error={{ code: 'UNKNOWN_ERROR', message: error.message }}
          onDismiss={clearError}
        />
      )}

      {credentials.length === 0 && !isLoading && (
        <p className="cedros-linked-accounts-empty">No linked sign-in methods found.</p>
      )}

      {credentials.length > 0 && (
        <ul className="cedros-linked-credential-list">
          {credentials.map((cred) => (
            <CredentialRow
              key={cred.id}
              credential={cred}
              isUnlinking={unlinkingId === cred.id}
              onUnlink={handleUnlink}
            />
          ))}
        </ul>
      )}

      {hasLinkOptions && (
        <div className="cedros-linked-add">
          <p className="cedros-linked-add-label">Link a new sign-in method</p>
          <div className="cedros-linked-add-buttons">
            {canLinkGoogle && (
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={onLinkGoogle}
              >
                <GoogleProviderIcon /> Google
              </button>
            )}
            {canLinkApple && (
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={onLinkApple}
              >
                <AppleProviderIcon /> Apple
              </button>
            )}
            {canAddPasskey && (
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={handleAddPasskey}
                disabled={isAddingPasskey}
              >
                {isAddingPasskey ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <PasskeyProviderIcon /> Passkey
                  </>
                )}
              </button>
            )}
            {canLinkSolana && (
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={onLinkSolana}
              >
                <SolanaProviderIcon /> Solana
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

// --- Credential row ---
function CredentialRow({
  credential,
  isUnlinking,
  onUnlink,
}: {
  credential: Credential;
  isUnlinking: boolean;
  onUnlink: (cred: Credential) => void;
}) {
  const label = credential.label || CREDENTIAL_LABELS[credential.credentialType];
  const Icon = CREDENTIAL_ICONS[credential.credentialType] || DefaultIcon;
  const managedByMfaFlow = credential.credentialType === 'totp';

  return (
    <li className="cedros-linked-credential">
      <div className="cedros-linked-credential__icon">
        <Icon />
      </div>
      <div className="cedros-linked-credential__info">
        <span className="cedros-linked-credential__name">{label}</span>
        <span className="cedros-linked-credential__meta">
          Added {formatRelativeTime(credential.createdAt)}
          {credential.lastUsedAt && (
            <> &middot; Last used {formatRelativeTime(credential.lastUsedAt)}</>
          )}
          {credential.isPrimary && <> &middot; Primary</>}
        </span>
      </div>
      <div className="cedros-linked-credential__action">
        {managedByMfaFlow ? (
          <span title="MFA removal requires verification">Manage in MFA settings</span>
        ) : (
          <button
            type="button"
            className="cedros-button cedros-button-outline cedros-button-sm cedros-button-danger-outline"
            onClick={() => onUnlink(credential)}
            disabled={isUnlinking}
            title="Remove"
          >
            {isUnlinking ? <LoadingSpinner size="sm" /> : 'Remove'}
          </button>
        )}
      </div>
    </li>
  );
}

// --- Helpers ---
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// --- Icons ---
const CREDENTIAL_ICONS: Partial<Record<CredentialType, ComponentType>> = {
  password: PasswordIcon,
  oauth_google: GoogleProviderIcon,
  oauth_apple: AppleProviderIcon,
  solana: SolanaProviderIcon,
  webauthn_passkey: PasskeyProviderIcon,
  webauthn_security_key: PasskeyProviderIcon,
  totp: TotpIcon,
  sso_oidc: SsoIcon,
};

function DefaultIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PasswordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 11V7a5 5 0 0110 0v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function TotpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SsoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
