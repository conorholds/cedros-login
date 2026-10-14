import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { CedrosAutosaveProvider } from '../autosave';
import type { CedrosAutosavePersistence, CedrosAutosavePersistenceSnapshot } from '../autosave';
import { CedrosLoginAdminRuntimeProvider } from '../admin/CedrosLoginAdminRuntimeProvider';
import type { AdminSectionProps } from '../admin/types';
import type { UseSystemSettingsReturn, SystemSetting, UpdateSettingRequest } from '../types';
import { useSettingsAutosave, type UseSettingsAutosaveReturn } from './useSettingsAutosave';
import { useSystemSettings } from './useSystemSettings';

vi.mock('./useSystemSettings', () => ({
  useSystemSettings: vi.fn(),
}));

describe('useSettingsAutosave', () => {
  let updateSettings: Mock<UseSystemSettingsReturn['updateSettings']>;
  let autosaveSettings: Mock<UseSystemSettingsReturn['autosaveSettings']>;
  let storage: CedrosAutosavePersistence;

  beforeEach(() => {
    vi.useFakeTimers();
    updateSettings = vi.fn<UseSystemSettingsReturn['updateSettings']>(
      async (updates: UpdateSettingRequest[]) => ({
        updated: updates.map((update) =>
          setting(update.key, update.value, update.key === 'server_metrics_api_key')
        ),
        revision: 2,
        etag: '"cedros.system_settings:2"',
      })
    );
    autosaveSettings = vi.fn<UseSystemSettingsReturn['autosaveSettings']>(
      async (updates: UpdateSettingRequest[]) => ({
        resourceId: 'global',
        revision: 2,
        etag: '"cedros.system_settings:2"',
        canonicalPatchOrResource: Object.fromEntries(
          updates.map((update) => [update.key, update.value])
        ),
      })
    );
    storage = {
      load: vi.fn(async () => null),
      save: vi.fn(),
      clear: vi.fn(),
    };
    vi.mocked(useSystemSettings).mockReturnValue(systemSettings());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('autosaves only non-secret settings and persists a secret-scrubbed draft', async () => {
    const { result } = renderAutosaveHook();

    await act(async () => {
      result.current.handleChange('server_metrics_api_key', 'new-secret');
      result.current.handleChange('server_log_level', 'warn');
      await Promise.resolve();
    });

    const snapshot = latestPersistedSnapshot();
    expect(snapshot.draft).toEqual({
      server_metrics_api_key: 'old-secret',
      server_log_level: 'warn',
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    expect(autosaveSettings).toHaveBeenCalledWith(
      [{ key: 'server_log_level', value: 'warn' }],
      expect.objectContaining({
        resourceType: 'cedros.system_settings',
        resourceId: 'global',
      })
    );
    expect(autosaveSettings).not.toHaveBeenCalledWith(
      expect.arrayContaining([{ key: 'server_metrics_api_key', value: 'new-secret' }]),
      expect.anything()
    );
  });

  it('persists a secret only through explicit manual confirmation', async () => {
    const { result } = renderAutosaveHook();

    await act(async () => {
      result.current.handleChange('server_metrics_api_key', 'new-secret');
      await Promise.resolve();
    });
    await act(async () => {
      await result.current.confirmManualSetting('server_metrics_api_key');
    });

    expect(updateSettings).toHaveBeenCalledWith([
      { key: 'server_metrics_api_key', value: 'new-secret' },
    ]);
    expect(autosaveSettings).not.toHaveBeenCalled();
    expect(result.current.edits).toEqual({});
  });

  it('scopes persisted settings drafts by admin server URL', async () => {
    const { result } = renderAutosaveHook({
      serverUrl: 'https://control.example.com/extensions/cedros-login/',
    });

    await act(async () => {
      result.current.handleChange('server_log_level', 'warn');
      await Promise.resolve();
    });

    expect(latestPersistedKey()).toBe(
      'cedros-login:system-settings:https://control.example.com/extensions/cedros-login'
    );
  });

  function renderAutosaveHook({ serverUrl }: { serverUrl?: string } = {}) {
    return renderHook((): UseSettingsAutosaveReturn => useSettingsAutosave(), {
      wrapper: ({ children }: PropsWithChildren) => (
        <AutosaveProviderWrapper serverUrl={serverUrl}>{children}</AutosaveProviderWrapper>
      ),
    });
  }

  function AutosaveProviderWrapper({
    children,
    serverUrl,
  }: PropsWithChildren<{ serverUrl?: string }>) {
    const content = serverUrl ? (
      <CedrosLoginAdminRuntimeProvider pluginContext={pluginContext(serverUrl)}>
        {children}
      </CedrosLoginAdminRuntimeProvider>
    ) : (
      children
    );

    return <CedrosAutosaveProvider storage={storage}>{content}</CedrosAutosaveProvider>;
  }

  function latestPersistedSnapshot(): CedrosAutosavePersistenceSnapshot<Record<string, string>> {
    const save = vi.mocked(storage.save);
    const call = save.mock.calls.at(-1);
    if (!call) throw new Error('Expected autosave draft to be persisted');
    return call[1] as CedrosAutosavePersistenceSnapshot<Record<string, string>>;
  }

  function latestPersistedKey(): string {
    const save = vi.mocked(storage.save);
    const call = save.mock.calls.at(-1);
    if (!call) throw new Error('Expected autosave draft to be persisted');
    return call[0];
  }

  function systemSettings(): UseSystemSettingsReturn {
    return {
      settings: {
        server: [
          setting('server_metrics_api_key', 'old-secret', true),
          setting('server_log_level', 'info'),
        ],
      },
      isLoading: false,
      isUpdating: false,
      error: null,
      revision: 1,
      etag: '"cedros.system_settings:1"',
      fetchSettings: vi.fn(async () => undefined),
      updateSettings,
      autosaveSettings,
      getValue: vi.fn(),
    };
  }
});

function pluginContext(serverUrl: string): AdminSectionProps['pluginContext'] {
  return {
    getAccessToken: vi.fn(() => 'admin-token'),
    hasPermission: vi.fn(() => true),
    pluginData: {
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
      },
    },
    serverUrl,
  };
}

function setting(key: string, value: string, isSecret = false): SystemSetting {
  return {
    key,
    value,
    isSecret,
    description: null,
    updatedAt: '2026-07-02T00:00:00.000Z',
    updatedBy: null,
  };
}
