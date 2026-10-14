import { useCallback, useMemo, useState } from 'react';

import { useExternalEffect } from '../../../hooks/effects';
import type { PluginContext } from '../../../admin/types';
import {
  RelyingPartyApiClient,
  type RelyingPartyDiagnostic,
  type RelyingPartyStatus,
} from '../../../utils/relyingPartyApi';

const SESSION_INTROSPECT_SCOPE = 'session:introspect';
const MEMBERSHIPS_SCOPE = 'memberships:read';
const IDENTITY_PROFILE_SCOPE = 'identity-profile:read';

export interface RelyingPartySettingsProps {
  pluginContext: PluginContext;
  canManage: boolean;
}

export function RelyingPartySettings({ pluginContext, canManage }: RelyingPartySettingsProps) {
  const api = useMemo(
    () => new RelyingPartyApiClient(pluginContext.serverUrl, pluginContext.getAccessToken),
    [pluginContext.getAccessToken, pluginContext.serverUrl]
  );
  const [statuses, setStatuses] = useState<RelyingPartyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const overallReady = statuses.length > 0 && statuses.every((status) => status.ready);

  const load = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(undefined);
      try {
        const response = await api.getReadiness(forceRefresh);
        setStatuses(response.relyingParties);
      } catch (loadError) {
        setError(errorMessage(loadError));
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  useExternalEffect(() => {
    void load();
  }, [load]);

  const replaceStatus = (next: RelyingPartyStatus) => {
    setStatuses((current) =>
      current.map((status) => (status.relyingPartyId === next.relyingPartyId ? next : status))
    );
  };

  return (
    <section className="cedros-system-settings cedros-data-stack cedros-rp-settings">
      <div className="cedros-data__header cedros-settings-page-header">
        <div className="cedros-data__header-text cedros-settings-page-header-content">
          <h2 className="cedros-data__title cedros-settings-page-title">Relying parties</h2>
          <p className="cedros-data__subtitle cedros-settings-page-description">
            Configure the private service relationships used by Portal and Pay for session
            introspection, Data for membership reauthorization, and Casino for tenant-bound identity
            profile reads. Stored tokens are never returned.
          </p>
        </div>
        {!loading && !error && (
          <span
            className={`cedros-data-status cedros-rp-overall-status ${
              overallReady ? 'cedros-data-status--success' : 'cedros-data-status--warning'
            }`}
            role="status"
          >
            {overallReady ? 'All required callers ready' : 'Setup incomplete'}
          </span>
        )}
      </div>

      {loading && statuses.length === 0 && <p role="status">Loading relying-party readiness…</p>}
      {error && (
        <div className="cedros-data-status cedros-data-status--error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="cedros-data-btn cedros-data-btn--secondary cedros-data-btn--sm"
            onClick={() => void load(true)}
          >
            Retry
          </button>
        </div>
      )}
      {!error &&
        statuses.map((status) => (
          <RelyingPartyCard
            key={status.relyingPartyId}
            api={api}
            status={status}
            canManage={canManage}
            onStatus={replaceStatus}
          />
        ))}
    </section>
  );
}

function RelyingPartyCard({
  api,
  status,
  canManage,
  onStatus,
}: {
  api: RelyingPartyApiClient;
  status: RelyingPartyStatus;
  canManage: boolean;
  onStatus: (status: RelyingPartyStatus) => void;
}) {
  const summary = status.policySummary;
  const requiredScope = requiredScopeFor(status.relyingPartyId);
  const [token, setToken] = useState('');
  const [scopes, setScopes] = useState(() =>
    (summary?.allowedScopes ?? [requiredScope]).join('\n')
  );
  const [audiences, setAudiences] = useState(() =>
    (summary?.allowedSessionAudiences ?? []).join('\n')
  );
  const [organizationIds, setOrganizationIds] = useState(() =>
    (summary?.allowedOrganizationIds ?? []).join('\n')
  );
  const [busy, setBusy] = useState<'save' | 'verify'>();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string }>();

  const save = async () => {
    setBusy('save');
    setMessage(undefined);
    try {
      const next = await api.configure(status.relyingPartyId, {
        ...(token ? { token } : {}),
        allowedScopes: values(scopes),
        allowedSessionAudiences: values(audiences),
        allowedOrganizationIds: values(organizationIds),
      });
      setToken('');
      onStatus(next);
      setMessage({
        kind: 'success',
        text: status.tokenConfigured ? 'Configuration saved.' : 'Relying party configured.',
      });
    } catch (saveError) {
      setMessage({ kind: 'error', text: errorMessage(saveError) });
    } finally {
      setBusy(undefined);
    }
  };

  const verify = async () => {
    const audience = values(audiences)[0];
    const organizationId = values(organizationIds)[0];
    if (!token || !audience || !organizationId) {
      setMessage({
        kind: 'error',
        text: 'Enter the caller token, at least one audience, and at least one organization ID.',
      });
      return;
    }
    setBusy('verify');
    setMessage(undefined);
    try {
      const result = await api.verify(status.relyingPartyId, {
        token,
        requiredScope,
        sessionAudience: audience,
        organizationId,
      });
      setMessage({
        kind: result.ready ? 'success' : 'error',
        text: verificationMessage(result),
      });
    } catch (verifyError) {
      setMessage({ kind: 'error', text: errorMessage(verifyError) });
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <article className="cedros-data-card cedros-data-stack cedros-rp-card">
      <div className="cedros-data__header">
        <div>
          <h3 className="cedros-data__title">{status.displayName}</h3>
          <p className="cedros-data__subtitle">
            Caller ID: <code>{status.relyingPartyId}</code>
          </p>
        </div>
        <span
          className={`cedros-data-status ${
            status.ready ? 'cedros-data-status--success' : 'cedros-data-status--warning'
          }`}
          role="status"
        >
          {status.ready ? 'Ready' : 'Not ready'}
        </span>
      </div>

      <dl className="cedros-rp-summary">
        <div>
          <dt>Service token</dt>
          <dd>{status.tokenConfigured ? 'Configured' : 'Missing'}</dd>
        </div>
        <div>
          <dt>Policy</dt>
          <dd>{status.policyConfigured ? 'Configured' : 'Missing'}</dd>
        </div>
      </dl>
      {status.validationErrors.length > 0 && (
        <p className="cedros-data-status cedros-data-status--warning">
          {status.validationErrors.map(validationMessage).join(' · ')}
        </p>
      )}

      <label className="cedros-data-field">
        <span className="cedros-data-label">
          {status.tokenConfigured ? 'New token (rotate)' : 'Shared service token'}
        </span>
        <input
          className="cedros-data-input"
          type="password"
          autoComplete="new-password"
          value={token}
          disabled={!canManage || busy !== undefined}
          placeholder={status.tokenConfigured ? 'Leave blank to keep the stored token' : undefined}
          onChange={(event) => setToken(event.target.value)}
        />
      </label>
      <PolicyField
        label="Allowed scopes"
        value={scopes}
        onChange={setScopes}
        disabled={!canManage || busy !== undefined}
      />
      <PolicyField
        label="Allowed session audiences"
        value={audiences}
        onChange={setAudiences}
        disabled={!canManage || busy !== undefined}
      />
      <PolicyField
        label="Allowed organization IDs"
        value={organizationIds}
        onChange={setOrganizationIds}
        disabled={!canManage || busy !== undefined}
      />

      {message && (
        <p
          className={`cedros-data-status cedros-data-status--${message.kind}`}
          role={message.kind === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}
      <div className="cedros-data-actions">
        <button
          type="button"
          className="cedros-data-btn cedros-data-btn--secondary"
          disabled={!canManage || busy !== undefined}
          onClick={() => void verify()}
        >
          {busy === 'verify' ? 'Verifying…' : 'Verify relationship'}
        </button>
        <button
          type="button"
          className="cedros-data-btn cedros-data-btn--primary"
          disabled={!canManage || busy !== undefined}
          onClick={() => void save()}
        >
          {busy === 'save' ? 'Saving…' : status.tokenConfigured ? 'Save / rotate' : 'Configure'}
        </button>
      </div>
      {!canManage && (
        <p className="cedros-data__subtitle">
          You have read access. An owner with Login settings write access must make changes.
        </p>
      )}
    </article>
  );
}

function PolicyField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label className="cedros-data-field">
      <span className="cedros-data-label">{label}</span>
      <textarea
        className="cedros-data-input cedros-rp-policy-input"
        value={value}
        disabled={disabled}
        rows={2}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="cedros-data-field__description">One value per line or comma-separated.</span>
    </label>
  );
}

function values(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
}

function validationMessage(code: string): string {
  return (
    {
      token_absent: 'Service token missing',
      policy_absent: 'Policy missing',
      policy_malformed: 'Policy malformed',
      scope_missing: 'Required scope missing',
      audience_policy_empty: 'Session audience policy empty',
      organization_policy_empty: 'Organization policy empty',
    }[code] ?? code
  );
}

function verificationMessage(result: {
  diagnostic: RelyingPartyDiagnostic;
  identityProfile?: { status: 404; error: 'not_found' };
  membership?: { status: 404; error: 'not_found' };
}): string {
  if (result.diagnostic === 'ready' && result.membership) {
    return 'Service authentication and organization membership authorization succeeded.';
  }
  if (result.diagnostic === 'ready' && result.identityProfile) {
    return 'Service authentication and tenant-bound identity profile authorization succeeded.';
  }
  return {
    caller_unknown: 'Caller is unknown.',
    token_absent: 'No service token is stored.',
    token_mismatch: 'The supplied token does not match.',
    policy_absent: 'No policy is stored.',
    policy_malformed: 'The stored policy is malformed.',
    scope_missing: 'The required scope is missing.',
    audience_policy_mismatch: 'The session audience is not allowed.',
    organization_policy_mismatch: 'The organization is not allowed.',
    ready: 'Service authentication succeeded; the invalid test session was inactive as expected.',
  }[result.diagnostic];
}

function requiredScopeFor(relyingPartyId: string): string {
  if (relyingPartyId === 'cedros-data') return MEMBERSHIPS_SCOPE;
  return relyingPartyId === 'cedros-casino' ? IDENTITY_PROFILE_SCOPE : SESSION_INTROSPECT_SCOPE;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected relying-party error';
}
