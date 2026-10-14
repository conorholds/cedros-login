import { useCallback, useMemo, useState } from 'react';
import { useCedrosLoginAdminClientContext } from '../../../hooks/useCedrosLoginAdminClientContext';
import { useExternalEffect } from '../../../hooks/effects';
import { InviteCodeApiClient } from '../../../utils/inviteCodeApi';
import { AuthMethodCard } from './AuthMethodCard';
import { ErrorMessage } from '../../shared/ErrorMessage';
import { InviteCodeManager } from './InviteCodeManager';
import { EarlyAccessSettings } from './EarlyAccessSettings';
import type {
  CreateInviteCodeRequest,
  InviteCode,
  SettingMeta,
  SystemSetting,
  UpdateInviteCodeRequest,
} from '../../../types';

const INVITE_SETTING_KEYS = [
  'invite_codes_enabled',
  'invite_codes_users_can_issue',
  'invite_codes_per_user',
  'invite_codes_reset_interval_days',
] as const;

const USER_INVITE_CODE_CONFIG_KEYS = [
  'invite_codes_per_user',
  'invite_codes_reset_interval_days',
] as const;

const INVITE_SETTING_METADATA: Record<string, SettingMeta> = {
  invite_codes_enabled: {
    key: 'invite_codes_enabled',
    label: 'Require invite codes',
    description:
      'New registrations create pending accounts until the user enters an available invite code.',
    inputType: 'boolean',
  },
  invite_codes_users_can_issue: {
    key: 'invite_codes_users_can_issue',
    label: 'Give users invite codes',
    description: 'Authenticated users receive one-time invite codes in their account settings.',
    inputType: 'boolean',
  },
  invite_codes_per_user: {
    key: 'invite_codes_per_user',
    label: 'Codes per user',
    description: 'Number of one-time codes issued to each user per reset window.',
    inputType: 'number',
    min: 0,
    max: 100,
  },
  invite_codes_reset_interval_days: {
    key: 'invite_codes_reset_interval_days',
    label: 'User code reset interval',
    description: 'Days before unused user invite codes are replaced. Use 0 to never reset.',
    inputType: 'number',
    unit: 'days',
    min: 0,
    max: 3650,
  },
};

interface InviteCodeSettingsProps {
  byKey: Record<string, SystemSetting>;
  edits: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onRefreshSettings: () => Promise<void>;
}

export function InviteCodeSettings({
  byKey,
  edits,
  onChange,
  onRefreshSettings,
}: InviteCodeSettingsProps) {
  const { config, _internal } = useCedrosLoginAdminClientContext();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const settings = useMemo(
    () =>
      INVITE_SETTING_KEYS.map((key) => byKey[key]).filter((setting): setting is SystemSetting =>
        Boolean(setting)
      ),
    [byKey]
  );

  const client = useMemo(
    () =>
      new InviteCodeApiClient(
        config.serverUrl,
        config.requestTimeout,
        config.retryAttempts,
        _internal.getAccessToken
      ),
    [config.serverUrl, config.requestTimeout, config.retryAttempts, _internal.getAccessToken]
  );

  const loadCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.listAdminCodes();
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

  const createCode = useCallback(
    async (request: CreateInviteCodeRequest) => {
      setError(null);
      try {
        const created = await client.createAdminCode(request);
        setCodes((current) => [created, ...current]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to create invite code.');
        throw err;
      }
    },
    [client]
  );

  const updateCode = useCallback(
    async (inviteCode: InviteCode, request: UpdateInviteCodeRequest) => {
      setError(null);
      try {
        const updated = await client.updateAdminCode(inviteCode.id, request);
        setCodes((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to update invite code.');
        throw err;
      }
    },
    [client]
  );

  const deleteCode = useCallback(
    async (inviteCode: InviteCode) => {
      setError(null);
      try {
        await client.deleteAdminCode(inviteCode.id);
        setCodes((current) => current.filter((item) => item.id !== inviteCode.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to delete invite code.');
        throw err;
      }
    },
    [client]
  );

  return (
    <section className="cedros-auth-subsection">
      {settings.length > 0 && (
        <div className="cedros-auth-method-list">
          <EarlyAccessSettings onInviteCodePolicyChanged={onRefreshSettings} />
          <AuthMethodCard
            enabledKey="invite_codes_enabled"
            byKey={byKey}
            edits={edits}
            onChange={onChange}
            metadata={INVITE_SETTING_METADATA}
          />
          <AuthMethodCard
            enabledKey="invite_codes_users_can_issue"
            configKeys={USER_INVITE_CODE_CONFIG_KEYS}
            byKey={byKey}
            edits={edits}
            onChange={onChange}
            metadata={INVITE_SETTING_METADATA}
          />
        </div>
      )}

      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}

      <InviteCodeManager
        codes={codes}
        isLoading={isLoading}
        onCreate={createCode}
        onUpdate={updateCode}
        onDelete={deleteCode}
      />
    </section>
  );
}
