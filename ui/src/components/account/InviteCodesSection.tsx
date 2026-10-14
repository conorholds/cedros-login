import { useCallback, useMemo, useState } from 'react';
import { useAuthState } from '../../context/useCedrosLogin';
import { useExternalEffect } from '../../hooks/effects';
import { InviteCodeApiClient } from '../../utils/inviteCodeApi';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import type { InviteCode } from '../../types';

export interface InviteCodesSectionProps {
  className?: string;
}

export function InviteCodesSection({ className = '' }: InviteCodesSectionProps) {
  const { config, _internal } = useAuthState();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const client = useMemo(
    () =>
      new InviteCodeApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal?.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal?.getAccessToken]
  );

  const loadCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.listAccountCodes();
      setCodes(response.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load invite codes.');
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useExternalEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  const copyCode = useCallback(async (code: InviteCode) => {
    if (!navigator.clipboard) {
      setError('Clipboard access is not available in this browser.');
      return;
    }

    try {
      await navigator.clipboard.writeText(code.code);
      setCopiedId(code.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to copy invite code.');
    }
  }, []);

  return (
    <section className={`cedros-account-card cedros-account-card--pad ${className}`.trim()}>
      <header className="cedros-account-card__header">
        <h3 className="cedros-account-card__title">Invite codes</h3>
        <p className="cedros-account-card__desc">Share your available one-time invite codes.</p>
      </header>

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      {isLoading ? (
        <LoadingSpinner label="Loading invite codes" />
      ) : codes.length === 0 ? (
        <p className="cedros-account-card__desc">No invite codes are available for your account.</p>
      ) : (
        <div className="cedros-invite-code-list">
          {codes.map((code) => (
            <div key={code.id} className="cedros-invite-code-row">
              <div>
                <code className="cedros-invite-code-value">{code.code}</code>
                <p className="cedros-account-card__desc">{formatInviteCodeStatus(code)}</p>
              </div>
              <button
                type="button"
                className="cedros-button cedros-button-outline cedros-button-sm"
                onClick={() => void copyCode(code)}
              >
                {copiedId === code.id ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatInviteCodeStatus(code: InviteCode): string {
  const expires = code.expiresAt
    ? ` Expires ${new Date(code.expiresAt).toLocaleDateString()}.`
    : '';
  return `One-time use.${expires}`;
}
