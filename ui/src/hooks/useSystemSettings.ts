import { useState, useCallback, useMemo, useRef } from 'react';
import type { CedrosAutosaveSaveMetadata, CedrosAutosaveSaveResult } from '../autosave';
import type {
  SystemSetting,
  UpdateSettingRequest,
  UpdateSystemSettingsResponse,
  UseSystemSettingsReturn,
} from '../types';
import { SystemSettingsApiClient } from '../utils/systemSettingsApi';
import {
  useCedrosLoginAdminClientContext,
  useCedrosLoginAdminClientContextOptional,
  type CedrosLoginAdminClientContextValue,
} from './useCedrosLoginAdminClientContext';

type SettingsContext = CedrosLoginAdminClientContextValue | null;

function useSettingsApiClient(context: SettingsContext): SystemSettingsApiClient | null {
  const config = context?.config;
  const getAccessToken = context?._internal.getAccessToken;

  return useMemo(() => {
    if (!config) {
      return null;
    }

    return new SystemSettingsApiClient(
      config.serverUrl,
      config.requestTimeout,
      config.retryAttempts,
      getAccessToken
    );
  }, [config, getAccessToken]);
}

/**
 * Hook for managing system settings (admin only).
 *
 * Provides CRUD operations for system-wide configuration settings
 * stored in the database. Only accessible to system administrators.
 *
 * @example
 * ```tsx
 * function SystemSettingsPanel() {
 *   const {
 *     settings,
 *     isLoading,
 *     error,
 *     fetchSettings,
 *     updateSettings,
 *     getValue,
 *   } = useSystemSettings();
 *
 *   useExternalEffect(() => {
 *     fetchSettings();
 *   }, [fetchSettings]);
 *
 *   const handleSave = async () => {
 *     await updateSettings([
 *       { key: 'privacy_period_secs', value: '1209600' },
 *     ]);
 *   };
 *
 *   return (
 *     <div>
 *       {Object.entries(settings).map(([category, items]) => (
 *         <section key={category}>
 *           <h3>{category}</h3>
 *           {items.map(item => (
 *             <div key={item.key}>
 *               {item.key}: {item.value}
 *             </div>
 *           ))}
 *         </section>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSystemSettings(): UseSystemSettingsReturn {
  return useSystemSettingsWithContext(useCedrosLoginAdminClientContext());
}

/**
 * Optional settings reader for UI that can safely render with default feature
 * values before an admin runtime exists.
 */
export function useSystemSettingsOptional(): UseSystemSettingsReturn {
  return useSystemSettingsWithContext(useCedrosLoginAdminClientContextOptional());
}

function useSystemSettingsWithContext(context: SettingsContext): UseSystemSettingsReturn {
  const [settings, setSettings] = useState<Record<string, SystemSetting[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [revision, setRevision] = useState<number | undefined>();
  const [etag, setEtag] = useState<string | undefined>();
  const requestIdRef = useRef(0);
  const authState = context?.authState ?? 'unauthenticated';

  const apiClient = useSettingsApiClient(context);

  // Use ref to avoid apiClient in callback dependencies
  const apiClientRef = useRef(apiClient);
  apiClientRef.current = apiClient;

  const fetchSettings = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const client = apiClientRef.current;
    if (!client || authState !== 'authenticated') {
      setSettings({});
      setRevision(undefined);
      setEtag(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await client.getSettings();
      if (requestId !== requestIdRef.current) return;
      setSettings(response.settings);
      setVersion(response, setRevision, setEtag);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [authState]);

  const updateSettings = useCallback(
    async (updates: UpdateSettingRequest[]): Promise<UpdateSystemSettingsResponse> => {
      const client = apiClientRef.current;
      if (!client) {
        throw new Error('Login admin hooks require CedrosLoginAdminRuntimeProvider');
      }

      if (authState !== 'authenticated') {
        throw new Error('Not authenticated');
      }

      setIsUpdating(true);
      setError(null);

      try {
        const response = await client.updateSettings(updates);
        setSettings((prev) => mergeUpdatedSettings(prev, response.updated));
        setVersion(response, setRevision, setEtag);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update settings');
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [authState]
  );

  const autosaveSettings = useCallback(
    async (
      updates: UpdateSettingRequest[],
      metadata: CedrosAutosaveSaveMetadata
    ): Promise<CedrosAutosaveSaveResult<Record<string, string>>> => {
      const client = apiClientRef.current;
      if (!client) {
        throw new Error('Login admin hooks require CedrosLoginAdminRuntimeProvider');
      }

      if (authState !== 'authenticated') {
        throw new Error('Not authenticated');
      }

      const result = await client.autosaveSettings(updates, metadata);
      setVersion(result, setRevision, setEtag);
      if (result.canonicalPatchOrResource) {
        setSettings((prev) => mergeDraftValues(prev, result.canonicalPatchOrResource ?? {}));
      }
      return result;
    },
    [authState]
  );

  const getValue = useCallback(
    (key: string): string | undefined => {
      for (const categorySettings of Object.values(settings)) {
        const found = categorySettings.find((s) => s.key === key);
        if (found) return found.value;
      }
      return undefined;
    },
    [settings]
  );

  // Components start their first request in an effect. Treat the authenticated
  // pre-effect render as loading too, otherwise empty/default settings can paint
  // for one frame before fetchSettings flips the request state to loading.
  const initialLoadPending = authState === 'authenticated' && requestIdRef.current === 0;

  return {
    settings,
    isLoading: isLoading || initialLoadPending,
    isUpdating,
    error,
    revision,
    etag,
    fetchSettings,
    updateSettings,
    autosaveSettings,
    getValue,
  };
}

function setVersion(
  response: { revision?: number | string; etag?: string },
  setRevision: (revision: number | undefined) => void,
  setEtag: (etag: string | undefined) => void
) {
  if (typeof response.revision === 'number') {
    setRevision(response.revision);
  } else if (typeof response.revision === 'string') {
    const parsed = Number(response.revision);
    setRevision(Number.isFinite(parsed) ? parsed : undefined);
  }
  if (response.etag) setEtag(response.etag);
}

function mergeUpdatedSettings(
  current: Record<string, SystemSetting[]>,
  updated: SystemSetting[]
): Record<string, SystemSetting[]> {
  const values = new Map(updated.map((setting) => [setting.key, setting]));
  return mapSettings(current, (setting) => values.get(setting.key) ?? setting);
}

function mergeDraftValues(
  current: Record<string, SystemSetting[]>,
  draft: Record<string, string>
): Record<string, SystemSetting[]> {
  return mapSettings(current, (setting) =>
    Object.prototype.hasOwnProperty.call(draft, setting.key)
      ? { ...setting, value: draft[setting.key] ?? setting.value }
      : setting
  );
}

function mapSettings(
  settings: Record<string, SystemSetting[]>,
  mapSetting: (setting: SystemSetting) => SystemSetting
): Record<string, SystemSetting[]> {
  return Object.fromEntries(
    Object.entries(settings).map(([category, categorySettings]) => [
      category,
      categorySettings.map(mapSetting),
    ])
  );
}
