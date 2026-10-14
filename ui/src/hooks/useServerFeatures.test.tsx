import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const fetchSettingsMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const loaderVersionRef = vi.hoisted(() => ({ value: 0 }));
const fetchSettingsByVersion = vi.hoisted(() => new Map<number, () => Promise<void>>());

vi.mock('./useSystemSettings', () => ({
  useSystemSettingsOptional: () => {
    const version = loaderVersionRef.value;
    if (!fetchSettingsByVersion.has(version)) {
      fetchSettingsByVersion.set(version, () => fetchSettingsMock());
    }
    return {
      settings: {},
      isLoading: false,
      isUpdating: false,
      error: null,
      revision: undefined,
      etag: undefined,
      fetchSettings: fetchSettingsByVersion.get(version)!,
      updateSettings: vi.fn(),
      autosaveSettings: vi.fn(),
      getValue: () => undefined,
    };
  },
}));

import { useServerFeatures } from './useServerFeatures';

describe('useServerFeatures', () => {
  it('fetches again when the settings loader changes after auth readiness changes', () => {
    fetchSettingsMock.mockClear();
    fetchSettingsByVersion.clear();
    loaderVersionRef.value = 0;

    const { rerender } = renderHook(() => useServerFeatures());

    expect(fetchSettingsMock).toHaveBeenCalledTimes(1);

    loaderVersionRef.value = 1;
    rerender();

    expect(fetchSettingsMock).toHaveBeenCalledTimes(2);
  });
});
