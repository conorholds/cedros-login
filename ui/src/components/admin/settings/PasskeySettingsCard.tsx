import { useCallback, useMemo, useRef, useState } from 'react';

import { useExternalEffect } from '../../../hooks/effects';
import { useCedrosLoginAdminRuntimeOptional } from '../../../admin/CedrosLoginAdminRuntimeContext';
import { ApiClient } from '../../../utils/apiClient';
import type { SystemSetting } from '../../../types';
import { AuthMethodCard } from './AuthMethodCard';

const ENABLED_KEY = 'auth_webauthn_enabled';
const RP_ID_KEY = 'auth_webauthn_rp_id';
const RP_NAME_KEY = 'auth_webauthn_rp_name';
const RP_ORIGIN_KEY = 'auth_webauthn_rp_origin';
const PASSKEY_CONFIG_KEYS = [RP_ID_KEY, RP_NAME_KEY, RP_ORIGIN_KEY] as const;

interface HostPasskeyDefaults {
  relyingPartyId: string;
  relyingPartyName: string;
  allowedOriginsValue: string;
  warnings: string[];
}

interface HostPasskeyDefaultsResponse {
  relyingPartyId?: unknown;
  relyingPartyName?: unknown;
  allowedOrigins?: unknown;
  warnings?: unknown;
}

type PasskeyValues = Record<(typeof PASSKEY_CONFIG_KEYS)[number], string>;

interface PasskeySettingBehaviorInput {
  defaults: HostPasskeyDefaults | null;
  onChange: (key: string, value: string) => void;
  savedRpId: string;
  values: PasskeyValues;
}

export interface PasskeySettingsCardProps {
  byKey: Record<string, SystemSetting>;
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function PasskeySettingsCard({ byKey, edits, onChange }: PasskeySettingsCardProps) {
  const values = useMemo(() => readPasskeyValues(byKey, edits), [byKey, edits]);
  const hasIncompleteSettings = PASSKEY_CONFIG_KEYS.some((key) => !values[key]);
  const savedRpId = byKey[RP_ID_KEY]?.value.trim() ?? '';
  const { defaults, error, isLoading, isHostManaged } =
    useHostPasskeyDefaults(hasIncompleteSettings);
  const { blockedMessage, externalWarnings, handleChange } = usePasskeySettingBehavior({
    defaults,
    onChange,
    savedRpId,
    values,
  });

  // When the host manages passkeys it derives the relying-party ID/name/origins
  // from its site settings and applies them at runtime, so those auto-configured
  // fields are hidden entirely — the admin only toggles passkeys on/off. Defaults
  // are still written to the stored settings silently; only genuine problems (a
  // load error, host warning, or incomplete-setup block) surface so the toggle
  // never fails silently.
  if (isHostManaged) {
    const hasNotice = isLoading || Boolean(error) || Boolean(defaults?.warnings.length);
    const bodyPrefix =
      hasNotice || blockedMessage ? (
        <>
          {hasNotice && (
            <PasskeyDefaultsNotice defaults={defaults} error={error} isLoading={isLoading} />
          )}
          {blockedMessage && <p className="cedros-setting-warning">{blockedMessage}</p>}
        </>
      ) : undefined;
    return (
      <AuthMethodCard
        enabledKey={ENABLED_KEY}
        configKeys={[]}
        byKey={byKey}
        edits={edits}
        onChange={handleChange}
        forceBodyOpen={Boolean(bodyPrefix)}
        bodyPrefix={bodyPrefix}
      />
    );
  }

  // Standalone consumers have no host endpoint; the relying-party fields stay
  // editable for manual setup.
  return (
    <AuthMethodCard
      enabledKey={ENABLED_KEY}
      configKeys={PASSKEY_CONFIG_KEYS}
      byKey={byKey}
      edits={edits}
      onChange={handleChange}
      externalWarnings={externalWarnings}
      forceBodyOpen={hasIncompleteSettings}
    />
  );
}

function useHostPasskeyDefaults(shouldFetch: boolean) {
  const runtime = useCedrosLoginAdminRuntimeOptional();
  const isHostManaged = Boolean(runtime?.passkeyDefaultsEndpoint);
  const [defaults, setDefaults] = useState<HostPasskeyDefaults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useExternalEffect(() => {
    if (!shouldFetch || !runtime?.passkeyDefaultsEndpoint) return;
    let active = true;
    setIsLoading(true);
    setError(null);
    const endpoint = runtime.passkeyDefaultsEndpoint;
    const client = new ApiClient({
      baseUrl: endpoint.serverUrl.replace(/\/+$/, ''),
      timeoutMs: runtime.config.requestTimeout,
      retryAttempts: runtime.config.retryAttempts,
      getAccessToken: runtime.getAccessToken,
    });

    client
      .get<HostPasskeyDefaultsResponse>(endpoint.path)
      .then((response) => {
        if (!active) return;
        setDefaults(normalizeHostPasskeyDefaults(response));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load site passkey defaults.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [runtime, shouldFetch]);

  return { defaults, error, isLoading, isHostManaged };
}

function usePasskeySettingBehavior({
  defaults,
  onChange,
  savedRpId,
  values,
}: PasskeySettingBehaviorInput) {
  const [blockedRpChange, setBlockedRpChange] = useState<string | null>(null);
  const appliedDefaultsRef = useRef<string | null>(null);
  const rpIdDiffersFromHost =
    Boolean(savedRpId && defaults?.relyingPartyId) && savedRpId !== defaults?.relyingPartyId;

  const applyMissingDefaults = useCallback(
    (nextDefaults: HostPasskeyDefaults) => {
      const updates = missingDefaultUpdates(values, nextDefaults);
      if (updates.length === 0) return;
      const signature = updates.map(([key, value]) => `${key}:${value}`).join('|');
      if (appliedDefaultsRef.current === signature) return;
      appliedDefaultsRef.current = signature;
      for (const [key, value] of updates) onChange(key, value);
    },
    [onChange, values]
  );

  useExternalEffect(() => {
    if (!defaults) return;
    applyMissingDefaults(defaults);
  }, [applyMissingDefaults, defaults]);

  const handleChange = useCallback(
    (key: string, value: string) => {
      if (key === RP_ID_KEY && savedRpId && value.trim() !== savedRpId) {
        setBlockedRpChange(
          'Relying Party ID changes are blocked because existing passkeys may be registered.'
        );
        return;
      }

      if (key === ENABLED_KEY && value === 'true') {
        if (hasMissingValues(valuesAfterDefaults(values, defaults))) {
          setBlockedRpChange('Complete passkey relying party settings before enabling passkeys.');
          return;
        }
        if (defaults) applyMissingDefaults(defaults);
      }

      setBlockedRpChange(null);
      onChange(key, value);
    },
    [applyMissingDefaults, defaults, onChange, savedRpId, values]
  );

  const externalWarnings = useMemo(() => {
    const warning = blockedRpChange ?? rpIdConflictWarning(rpIdDiffersFromHost, defaults);
    return warning ? { [RP_ID_KEY]: warning } : undefined;
  }, [blockedRpChange, defaults, rpIdDiffersFromHost]);

  return { blockedMessage: blockedRpChange, externalWarnings, handleChange };
}

function PasskeyDefaultsNotice({
  defaults,
  error,
  isLoading,
}: {
  defaults: HostPasskeyDefaults | null;
  error: string | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="cedros-auth-method-card-description">Loading site passkey defaults…</p>;
  }
  if (error) {
    return <p className="cedros-setting-warning">Could not load site passkey defaults: {error}</p>;
  }
  if (!defaults) return null;
  return (
    <>
      {defaults.warnings.map((warning) => (
        <p key={warning} className="cedros-setting-warning">
          {warning}
        </p>
      ))}
    </>
  );
}

function readPasskeyValues(
  byKey: Record<string, SystemSetting>,
  edits: Record<string, string>
): PasskeyValues {
  return {
    [RP_ID_KEY]: (edits[RP_ID_KEY] ?? byKey[RP_ID_KEY]?.value ?? '').trim(),
    [RP_NAME_KEY]: (edits[RP_NAME_KEY] ?? byKey[RP_NAME_KEY]?.value ?? '').trim(),
    [RP_ORIGIN_KEY]: (edits[RP_ORIGIN_KEY] ?? byKey[RP_ORIGIN_KEY]?.value ?? '').trim(),
  };
}

function missingDefaultUpdates(values: PasskeyValues, defaults: HostPasskeyDefaults) {
  const candidates: Array<[keyof PasskeyValues, string]> = [
    [RP_ID_KEY, defaults.relyingPartyId],
    [RP_NAME_KEY, defaults.relyingPartyName],
    [RP_ORIGIN_KEY, defaults.allowedOriginsValue],
  ];
  return candidates.filter(([key, value]) => !values[key] && value);
}

function valuesAfterDefaults(
  values: PasskeyValues,
  defaults: HostPasskeyDefaults | null
): PasskeyValues {
  if (!defaults) return values;
  return Object.fromEntries(
    PASSKEY_CONFIG_KEYS.map((key) => [key, values[key] || defaultValueForKey(key, defaults)])
  ) as PasskeyValues;
}

function defaultValueForKey(key: keyof PasskeyValues, defaults: HostPasskeyDefaults): string {
  switch (key) {
    case RP_ID_KEY:
      return defaults.relyingPartyId;
    case RP_NAME_KEY:
      return defaults.relyingPartyName;
    case RP_ORIGIN_KEY:
      return defaults.allowedOriginsValue;
  }
}

function hasMissingValues(values: PasskeyValues): boolean {
  return PASSKEY_CONFIG_KEYS.some((key) => !values[key]);
}

function normalizeHostPasskeyDefaults(
  response: HostPasskeyDefaultsResponse
): HostPasskeyDefaults | null {
  const relyingPartyId = stringValue(response.relyingPartyId);
  const relyingPartyName = stringValue(response.relyingPartyName);
  const allowedOrigins = Array.isArray(response.allowedOrigins)
    ? response.allowedOrigins.map(stringValue).filter(Boolean)
    : [];
  const validOrigins = uniqueValues(allowedOrigins.map(exactOriginValue).filter(Boolean));
  if (!relyingPartyId && !relyingPartyName && validOrigins.length === 0) return null;
  return {
    relyingPartyId,
    relyingPartyName,
    allowedOriginsValue: validOrigins.join(', '),
    warnings: Array.isArray(response.warnings)
      ? response.warnings.map(stringValue).filter(Boolean)
      : [],
  };
}

function rpIdConflictWarning(
  rpIdDiffersFromHost: boolean,
  defaults: HostPasskeyDefaults | null
): string | null {
  if (!rpIdDiffersFromHost || !defaults?.relyingPartyId) return null;
  return `Site settings suggest ${defaults.relyingPartyId}, but this extension already has a different RP ID.`;
}

function exactOriginValue(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return value === url.origin ? value : '';
  } catch {
    return '';
  }
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueValues(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}
