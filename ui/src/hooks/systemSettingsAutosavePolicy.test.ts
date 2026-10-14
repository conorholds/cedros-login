import { describe, expect, it } from 'vitest';
import type { SystemSetting } from '../types';
import {
  canAutosaveSystemSetting,
  filterSettingsPatch,
  indexSystemSettings,
} from './systemSettingsAutosavePolicy';

describe('systemSettingsAutosavePolicy', () => {
  it('allows known non-secret settings to autosave', () => {
    const setting = systemSetting('auth_email_require_verification', 'true');

    expect(canAutosaveSystemSetting(setting)).toBe(true);
  });

  it('keeps secrets on the manual save path', () => {
    const settings = indexSystemSettings({
      server: [
        systemSetting('server_metrics_api_key', 'secret', true),
        systemSetting('security_require_mfa', 'false'),
        systemSetting('server_log_level', 'info'),
      ],
    });
    const patch = [
      { key: 'server_metrics_api_key', value: 'updated-secret' },
      { key: 'security_require_mfa', value: 'true' },
      { key: 'server_log_level', value: 'warn' },
    ];

    expect(filterSettingsPatch(patch, settings, 'autosave')).toEqual([
      { key: 'security_require_mfa', value: 'true' },
      { key: 'server_log_level', value: 'warn' },
    ]);
    expect(filterSettingsPatch(patch, settings, 'manual')).toEqual([
      { key: 'server_metrics_api_key', value: 'updated-secret' },
    ]);
  });

  it('allows executable modes and blocks host-owned or unsupported settings', () => {
    const hot = withApplicationMode(systemSetting('auth_email_enabled', 'true'), 'hot');
    const restart = withApplicationMode(systemSetting('rate_limit_auth', '10'), 'restart');
    const hostOwned = withApplicationMode(
      systemSetting('server_environment', 'production'),
      'host-owned'
    );
    const unsupported = withApplicationMode(
      systemSetting('email_provider', 'custom'),
      'unsupported'
    );

    expect(canAutosaveSystemSetting(hot)).toBe(true);
    expect(canAutosaveSystemSetting(restart)).toBe(true);
    expect(canAutosaveSystemSetting(hostOwned)).toBe(false);
    expect(canAutosaveSystemSetting(unsupported)).toBe(false);

    const indexed = indexSystemSettings({ runtime: [hot, restart, hostOwned, unsupported] });
    const patch = [hot, restart, hostOwned, unsupported].map(({ key, value }) => ({ key, value }));
    expect(filterSettingsPatch(patch, indexed, 'all').map(({ key }) => key)).toEqual([
      'auth_email_enabled',
      'rate_limit_auth',
    ]);
  });
});

function withApplicationMode(
  setting: SystemSetting,
  applicationMode: 'hot' | 'restart' | 'host-owned' | 'unsupported'
): SystemSetting {
  return { ...setting, applicationMode, validationError: null } as SystemSetting;
}

function systemSetting(key: string, value: string, isSecret = false): SystemSetting {
  return {
    key,
    value,
    isSecret,
    description: null,
    updatedAt: '2026-07-01T00:00:00.000Z',
    updatedBy: null,
  };
}
