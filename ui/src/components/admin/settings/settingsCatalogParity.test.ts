import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SETTING_METADATA } from './settingsMetadata';

interface SettingsCatalogContract {
  settings: Array<{
    key: string;
    category: string;
    isSecret: boolean;
  }>;
}

const settingsCatalog = JSON.parse(
  readFileSync(resolve(process.cwd(), '../contracts/src/settings-catalog.json'), 'utf8')
) as SettingsCatalogContract;

const STANDALONE_ONLY_SETTINGS = new Set([
  // Host/runtime-owned security envelope in extension mode; standalone still exposes these knobs.
  'security_cors_origins',
  'security_cookie_domain',
  'security_cookie_same_site',
  'security_cookie_secure',
  'security_jwt_audience',
  'security_jwt_issuer',
  'security_session_timeout',

  // Standalone server rate limiter. Extension request throttling belongs to the host runtime.
  'rate_limit_auth',
  'rate_limit_general',
  'rate_limit_window',

  // Standalone notification webhook delivery; extension callbacks are host-coordinated.
  'webhook_enabled',
  'webhook_notify_registrations',
  'webhook_notify_signins',
  'webhook_url',

  // Standalone observability controls; extension logging/metrics are owned by the host.
  'server_log_level',
  'server_metrics_api_key',

  // Standalone object-storage credentials. Wasm exposes only the avatar upload feature gate.
  'image_storage_access_key',
  'image_storage_bucket',
  'image_storage_cdn_url',
  'image_storage_enabled',
  'image_storage_endpoint',
  'image_storage_provider',
  'image_storage_region',
  'image_storage_secret_key',

  // Legacy standalone rows retained for API compatibility. Delivery is
  // configured through POSTMARK_* env vars and extension hosts own the sender.
  'email_from_address',
  'email_from_name',
  'email_provider',
  'email_smtp_host',
  'email_smtp_password',
  'email_smtp_port',
  'email_smtp_tls',
  'email_smtp_user',
]);

describe('settings catalog parity', () => {
  it('keeps the committed catalog shaped as key/category/isSecret entries', () => {
    const keys = settingsCatalog.settings.map((setting) => setting.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(settingsCatalog.settings).not.toHaveLength(0);

    for (const setting of settingsCatalog.settings) {
      expect(setting).toEqual({
        key: expect.any(String),
        category: expect.any(String),
        isSecret: expect.any(Boolean),
      });
    }
  });

  it('covers admin metadata keys with the wasm catalog or reviewed standalone allowlist', () => {
    const catalogKeys = new Set(settingsCatalog.settings.map((setting) => setting.key));
    const metadataKeys = Object.keys(SETTING_METADATA);
    const uncoveredKeys = metadataKeys.filter(
      (key) => !catalogKeys.has(key) && !STANDALONE_ONLY_SETTINGS.has(key)
    );
    const staleAllowlistKeys = [...STANDALONE_ONLY_SETTINGS].filter(
      (key) => catalogKeys.has(key) || !metadataKeys.includes(key)
    );

    expect(uncoveredKeys).toEqual([]);
    expect(staleAllowlistKeys).toEqual([]);
  });
});
