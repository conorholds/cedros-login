import { useExternalEffect } from '../../../hooks/effects';
import { useCallback, useMemo, useState } from 'react';
import type { AdminUserStatsResponse } from '../../../types';
import { useAdminUsers } from '../../../hooks/useAdminUsers';
import { useSystemSettings } from '../../../hooks/useSystemSettings';
import type { StatItem } from '../StatsBar';
import { useTranslations, type Translations } from '../../../i18n';

const METHOD_ORDER = ['email', 'google', 'apple', 'solana', 'webauthn', 'sso'] as const;

const METHOD_SETTINGS: Record<(typeof METHOD_ORDER)[number], string> = {
  email: 'auth_email_enabled',
  google: 'auth_google_enabled',
  apple: 'auth_apple_enabled',
  solana: 'auth_solana_enabled',
  webauthn: 'auth_webauthn_enabled',
  sso: 'feature_sso',
};

export interface UsersStatsSummary {
  statsItems: StatItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUsersStatsSummary(): UsersStatsSummary {
  const t = useTranslations();
  const { getStats } = useAdminUsers();
  const { fetchSettings, getValue } = useSystemSettings();
  const [stats, setStats] = useState<AdminUserStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsFetched, setSettingsFetched] = useState(false);

  useExternalEffect(() => {
    if (!settingsFetched) {
      fetchSettings();
      setSettingsFetched(true);
    }
  }, [fetchSettings, settingsFetched]);

  const isSettingEnabled = useCallback(
    (key: string): boolean => {
      const value = getValue(key);
      if (value === undefined) return false;
      return value === 'true' || value === '1';
    },
    [getValue]
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getStats();
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.users.loadStatsFailed);
    } finally {
      setIsLoading(false);
    }
  }, [getStats, t.admin.users.loadStatsFailed]);

  useExternalEffect(() => {
    void refresh();
  }, [refresh]);

  const statsItems = useMemo(() => {
    const items: StatItem[] = [
      { label: t.admin.dashboard.totalUsers, value: stats?.total ?? '—' },
      { label: t.admin.dashboard.verified, value: stats?.verified ?? '—' },
      { label: t.admin.dashboard.new7d, value: stats?.newAccounts7d ?? '—' },
      { label: t.admin.dashboard.new30d, value: stats?.newAccounts30d ?? '—' },
    ];

    METHOD_ORDER.forEach((method) => {
      if (!isSettingEnabled(METHOD_SETTINGS[method])) return;
      // The per-method breakdown is reserved server-side (the JSONB seam can't
      // GROUP BY the authMethods array). Only show a method when a real count is
      // present — never a misleading zero for every enabled provider.
      const count = stats?.authMethodCounts[method];
      if (typeof count !== 'number') return;
      items.push({ label: methodLabel(method, t), value: count });
    });

    return items;
  }, [stats, isSettingEnabled, t]);

  return { statsItems, isLoading, error, refresh };
}

function methodLabel(method: (typeof METHOD_ORDER)[number], t: Translations): string {
  switch (method) {
    case 'email':
      return t.admin.users.emailUsers;
    case 'google':
      return t.admin.users.googleUsers;
    case 'apple':
      return t.admin.users.appleUsers;
    case 'solana':
      return t.admin.users.solanaUsers;
    case 'webauthn':
      return t.admin.users.passkeyUsers;
    case 'sso':
      return t.admin.users.ssoUsers;
  }
}
