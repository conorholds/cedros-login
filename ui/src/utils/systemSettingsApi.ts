import type { CedrosAutosaveSaveMetadata, CedrosAutosaveSaveResult } from '../autosave';
import type {
  ListSystemSettingsResponse,
  SystemSetting,
  UpdateSettingRequest,
  UpdateSystemSettingsResponse,
} from '../types';
import { ApiClient, handleApiError } from './apiClient';

interface SettingsMutationResponse {
  updated: UpdateSystemSettingsResponse['updated'];
  revision?: UpdateSystemSettingsResponse['revision'];
  etag?: UpdateSystemSettingsResponse['etag'];
}

const LEGACY_SECRET_SETTING_KEYS = new Set([
  'signup_access_code',
  'email_smtp_password',
  'image_storage_access_key',
  'image_storage_secret_key',
  'server_metrics_api_key',
  'webhook_secret',
]);

/**
 * API client for system settings operations (admin only)
 */
export class SystemSettingsApiClient {
  private client: ApiClient;

  constructor(
    baseUrl: string,
    timeoutMs?: number,
    retryAttempts?: number,
    getAccessToken?: () => string | null
  ) {
    this.client = new ApiClient({ baseUrl, timeoutMs, retryAttempts, getAccessToken });
  }

  /**
   * Get all system settings grouped by category
   * Requires system admin privileges
   */
  async getSettings(): Promise<ListSystemSettingsResponse> {
    try {
      return await this.client.get<ListSystemSettingsResponse>('/admin/settings', {
        cacheTtlMs: 5_000,
        validator: parseSystemSettingsResponse,
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch system settings');
    }
  }

  /**
   * Update one or more system settings
   * Requires system admin privileges
   */
  async updateSettings(settings: UpdateSettingRequest[]): Promise<UpdateSystemSettingsResponse> {
    try {
      return await this.client.patch<UpdateSystemSettingsResponse>('/admin/settings', {
        settings,
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to update system settings');
    }
  }

  /**
   * Autosave non-secret system settings. Standalone servers use the Cedros
   * autosave protocol; bundled extension runtimes without ETags fall back to
   * their existing settings PATCH route. The extension host settings import
   * writes one key at a time, so a multi-field draft is serialized into
   * single-setting requests while still using the shared autosave state
   * machine in the UI.
   */
  async autosaveSettings(
    settings: UpdateSettingRequest[],
    metadata: CedrosAutosaveSaveMetadata
  ): Promise<CedrosAutosaveSaveResult<Record<string, string>>> {
    if (!metadata.etag) {
      return this.autosaveViaSettingsPatch(settings);
    }

    try {
      const response = await this.client.patch<UpdateSystemSettingsResponse>(
        '/admin/settings/autosave',
        {
          autosave: true,
          clientMutationId: metadata.clientMutationId,
          editingSessionId: metadata.editingSessionId,
          clientSeq: metadata.clientSeq,
          updateMask: metadata.updateMask ?? settings.map((setting) => setting.key),
          patch: settings,
          schemaVersion: 'v1',
        },
        {
          skipRetry: true,
          headers: {
            'If-Match': metadata.etag,
            'Idempotency-Key': metadata.idempotencyKey,
          },
        }
      );

      return {
        resourceId: 'global',
        revision: response.revision,
        etag: response.etag,
        canonicalPatchOrResource: settingsToDraft(response.updated),
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to autosave system settings');
    }
  }

  private async autosaveViaSettingsPatch(
    settings: UpdateSettingRequest[]
  ): Promise<CedrosAutosaveSaveResult<Record<string, string>>> {
    try {
      const requests = settings.length > 1 ? settings.map((setting) => [setting]) : [settings];
      const updated: SettingsMutationResponse['updated'] = [];
      let revision: SettingsMutationResponse['revision'];
      let etag: SettingsMutationResponse['etag'];

      for (const requestSettings of requests) {
        const response = await this.client.patch<SettingsMutationResponse>(
          '/admin/settings',
          { settings: requestSettings },
          { skipRetry: true }
        );
        updated.push(...response.updated);
        revision = response.revision ?? revision;
        etag = response.etag ?? etag;
      }

      return {
        resourceId: 'global',
        revision,
        etag,
        canonicalPatchOrResource: settingsToDraft(updated),
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to autosave system settings');
    }
  }
}

/**
 * Validates the cross-package Wasm/admin response before render. ZIPs upgraded
 * from the pre-grouped settings route can still encounter its flat key/value
 * payload until the host replaces the running Wasm instance, so normalize that
 * one historical shape while failing closed on every other mismatch.
 */
function parseSystemSettingsResponse(data: unknown): ListSystemSettingsResponse {
  const response = requireRecord(data, 'response');
  const rawSettings = requireRecord(response.settings, 'settings');
  const entries = Object.entries(rawSettings);
  const grouped = entries.every(([, value]) => Array.isArray(value));
  const flat = entries.every(([, value]) => isLegacySettingValue(value));

  if (!grouped && !flat) {
    throw new Error('settings must contain grouped setting arrays or legacy scalar values');
  }

  const settings = grouped
    ? Object.fromEntries(
        entries.map(([category, rows]) => [
          category,
          (rows as unknown[]).map((row) => parseSystemSetting(row)),
        ])
      )
    : normalizeLegacySettings(entries);
  const revision = readRevision(response.revision);

  return {
    settings,
    ...(revision !== undefined ? { revision } : {}),
    ...(typeof response.etag === 'string' ? { etag: response.etag } : {}),
  };
}

function parseSystemSetting(data: unknown): SystemSetting {
  const setting = requireRecord(data, 'setting');
  if (typeof setting.key !== 'string' || typeof setting.value !== 'string') {
    throw new Error('setting key and value must be strings');
  }
  if (typeof setting.isSecret !== 'boolean') {
    throw new Error(`setting ${setting.key} must declare isSecret`);
  }
  if (typeof setting.updatedAt !== 'string') {
    throw new Error(`setting ${setting.key} must declare updatedAt`);
  }
  const hasValue = readOptionalBoolean(setting.hasValue, 'hasValue', setting.key);
  const applicationMode = readApplicationMode(setting.applicationMode, setting.key);

  return {
    key: setting.key,
    value: setting.value,
    description: readNullableString(setting.description, 'description', setting.key),
    isSecret: setting.isSecret,
    ...(hasValue !== undefined ? { hasValue } : {}),
    ...(applicationMode ? { applicationMode } : {}),
    ...(setting.validationError !== undefined
      ? {
          validationError: readNullableString(
            setting.validationError,
            'validationError',
            setting.key
          ),
        }
      : {}),
    updatedAt: setting.updatedAt,
    updatedBy: readNullableString(setting.updatedBy, 'updatedBy', setting.key),
  };
}

function normalizeLegacySettings(
  entries: Array<[string, unknown]>
): Record<string, SystemSetting[]> {
  return {
    legacy: entries.map(([key, rawValue]) => {
      const isSecret = LEGACY_SECRET_SETTING_KEYS.has(key);
      const value = isSecret ? '' : String(rawValue ?? '');
      return {
        key,
        value,
        description: null,
        isSecret,
        hasValue: rawValue !== null && String(rawValue).length > 0,
        updatedAt: '',
        updatedBy: null,
      };
    }),
  };
}

function requireRecord(data: unknown, label: string): Record<string, unknown> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${label} must be an object`);
  }
  return data as Record<string, unknown>;
}

function isLegacySettingValue(value: unknown): boolean {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function readRevision(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readNullableString(value: unknown, field: string, key: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  throw new Error(`setting ${key} ${field} must be a string or null`);
}

function readOptionalBoolean(value: unknown, field: string, key: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  throw new Error(`setting ${key} ${field} must be a boolean`);
}

function readApplicationMode(
  value: unknown,
  key: string
): SystemSetting['applicationMode'] | undefined {
  if (value === undefined) return undefined;
  if (value === 'hot' || value === 'restart' || value === 'host-owned' || value === 'unsupported') {
    return value;
  }
  throw new Error(`setting ${key} applicationMode is invalid`);
}

function settingsToDraft(settings: Array<{ key: string; value: string }>): Record<string, string> {
  const draft: Record<string, string> = {};
  for (const setting of settings) {
    draft[setting.key] = setting.value;
  }
  return draft;
}
