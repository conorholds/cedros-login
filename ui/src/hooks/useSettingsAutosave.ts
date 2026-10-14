import { useCallback, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useExternalEffect } from './effects';
import { useCedrosAutosave } from '../autosave';
import type { CedrosAutosaveStatus } from '../autosave';
import type { SystemSetting, UpdateSettingRequest } from '../types';
import {
  blockedSystemSettingKeys,
  canAutosaveSystemSetting,
  filterSettingsPatch,
  indexSystemSettings,
} from './systemSettingsAutosavePolicy';
import { useCedrosLoginAdminClientContextOptional } from './useCedrosLoginAdminClientContext';
import { useSystemSettings } from './useSystemSettings';

type SettingsDraft = Record<string, string>;

/** Autosave status exposed by the shared Cedros autosave state machine. */
export type AutosaveStatus = CedrosAutosaveStatus;

export interface UseSettingsAutosaveReturn {
  /** Settings grouped by category */
  settings: Record<string, SystemSetting[]>;
  /** Current edits (key -> value) */
  edits: SettingsDraft;
  /** Whether initial load is in progress */
  isLoading: boolean;
  /** Current autosave status */
  autosaveStatus: AutosaveStatus;
  /** Error message if autosave failed */
  autosaveError: string | null;
  /** Whether manual-only settings have unsaved changes */
  hasManualChanges: boolean;
  /** Number of manual-only settings with unsaved changes */
  manualChangeCount: number;
  /** Whether a manual settings save is in progress */
  isManualSaving: boolean;
  /** Error message if manual save failed */
  manualSaveError: string | null;
  /** Confirm and persist a single manual-only setting, such as a secret. */
  confirmManualSetting: (key: string) => Promise<void>;
  /** Discard local edits for a single manual-only setting. */
  discardManualSetting: (key: string) => void;
  /** Whether a single manual-only setting is currently being persisted. */
  isManualSettingSaving: (key: string) => boolean;
  /** Error message for a single manual-only setting. */
  getManualSettingError: (key: string) => string | null;
  /** Loading error */
  error: Error | null;
  /** Fetch settings from server */
  fetchSettings: () => Promise<void>;
  /** Handle a setting change (triggers autosave) */
  handleChange: (key: string, value: string) => void;
  /** Get effective value (edit or original) */
  getEffectiveValue: (key: string) => string;
  /** Flush pending autosave work immediately. */
  flushAutosave: () => Promise<void>;
  /** Save all current manual-only settings changes. */
  saveManualChanges: () => Promise<void>;
  /** Discard current manual-only settings changes. */
  resetManualChanges: () => void;
}

/**
 * Settings autosave bridge.
 *
 * Settings pages keep local draft edits separate from confirmed server values;
 * the shared Cedros autosave hook owns queueing, retry, offline status,
 * persistence, and accessible save-state semantics.
 */
export function useSettingsAutosave(): UseSettingsAutosaveReturn {
  const adminClientContext = useCedrosLoginAdminClientContextOptional();
  const {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
    autosaveSettings,
    revision,
    etag,
  } = useSystemSettings();
  const [edits, setEdits] = useState<SettingsDraft>({});
  const [manualSaveError, setManualSaveError] = useState<string | null>(null);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [manualSettingErrors, setManualSettingErrors] = useState<Record<string, string>>({});
  const [manualSavingKeys, setManualSavingKeys] = useState<Record<string, boolean>>({});
  const restoredAppliedRef = useRef(false);

  const confirmedDraft = useMemo(() => settingsToDraft(settings), [settings]);
  const draft = useMemo(() => ({ ...confirmedDraft, ...edits }), [confirmedDraft, edits]);
  const settingsByKey = useMemo(() => indexSystemSettings(settings), [settings]);
  const persistenceKey = useMemo(
    () => systemSettingsPersistenceKey(adminClientContext?.config.serverUrl),
    [adminClientContext?.config.serverUrl]
  );
  const autosaveDraft = useMemo(
    () => makeAutosaveSafeDraft(confirmedDraft, draft, settingsByKey),
    [confirmedDraft, draft, settingsByKey]
  );
  const hasLoadedSettings = Object.keys(confirmedDraft).length > 0;
  const manualPatch = useMemo(
    () => makeSettingsPatch(confirmedDraft, draft, settingsByKey, 'manual') ?? [],
    [confirmedDraft, draft, settingsByKey]
  );
  const manualChangeCount = manualPatch.length;

  const autosave = useCedrosAutosave<UpdateSettingRequest[], SettingsDraft>({
    resourceType: 'cedros.system_settings',
    resourceId: 'global',
    extensionId: 'cedros-login',
    baseRevision: revision,
    etag,
    confirmedDraft,
    draft: autosaveDraft,
    makePatch: (previous, current) =>
      makeSettingsPatch(previous, current, settingsByKey, 'autosave'),
    validatePatch: validateSettingsPatch,
    save: async (patch, metadata) => {
      const result = await autosaveSettings(patch, metadata);
      clearSavedEdits(setEdits, patch);
      return result;
    },
    debounceProfile: 'text',
    conflictStrategy: 'reject',
    persistenceKey,
    enabled: hasLoadedSettings,
    blockedFields: blockedSystemSettingKeys(settingsByKey),
  });

  useExternalEffect(() => {
    if (restoredAppliedRef.current || !autosave.restoredDraft || !hasLoadedSettings) return;
    restoredAppliedRef.current = true;
    setEdits(diffSettingsDraft(confirmedDraft, autosave.restoredDraft));
  }, [autosave.restoredDraft, confirmedDraft, hasLoadedSettings]);

  const handleChange = useCallback((key: string, value: string) => {
    setManualSaveError(null);
    setManualSettingErrors((prev) => withoutKey(prev, key));
    setEdits((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getEffectiveValue = useCallback(
    (key: string) => {
      return draft[key] ?? '';
    },
    [draft]
  );

  const saveManualChanges = useCallback(async () => {
    const patch = makeSettingsPatch(confirmedDraft, draft, settingsByKey, 'all') ?? [];
    if (patch.length === 0) return;

    setIsManualSaving(true);
    setManualSaveError(null);
    try {
      await updateSettings(patch);
      clearSavedEdits(setEdits, patch);
      autosave.discard();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      setManualSaveError(message);
      throw err;
    } finally {
      setIsManualSaving(false);
    }
  }, [autosave, confirmedDraft, draft, settingsByKey, updateSettings]);

  const resetManualChanges = useCallback(() => {
    setManualSaveError(null);
    clearSavedEdits(setEdits, manualPatch);
  }, [manualPatch]);

  const confirmManualSetting = useCallback(
    async (key: string) => {
      const setting = settingsByKey.get(key);
      if (!setting || canAutosaveSystemSetting(setting)) return;

      const value = draft[key] ?? '';
      if (confirmedDraft[key] === value) {
        setManualSettingErrors((prev) => withoutKey(prev, key));
        return;
      }

      setManualSavingKeys((prev) => ({ ...prev, [key]: true }));
      setManualSettingErrors((prev) => withoutKey(prev, key));
      try {
        await updateSettings([{ key, value }]);
        clearSavedEdits(setEdits, [{ key, value }]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update setting';
        setManualSettingErrors((prev) => ({ ...prev, [key]: message }));
        throw err;
      } finally {
        setManualSavingKeys((prev) => withoutKey(prev, key));
      }
    },
    [confirmedDraft, draft, settingsByKey, updateSettings]
  );

  const discardManualSetting = useCallback((key: string) => {
    setManualSaveError(null);
    setManualSettingErrors((prev) => withoutKey(prev, key));
    setEdits((prev) => withoutKey(prev, key));
  }, []);

  const isManualSettingSaving = useCallback(
    (key: string) => Boolean(manualSavingKeys[key]),
    [manualSavingKeys]
  );

  const getManualSettingError = useCallback(
    (key: string) => manualSettingErrors[key] ?? null,
    [manualSettingErrors]
  );

  return {
    settings,
    edits,
    isLoading,
    autosaveStatus: autosave.status,
    autosaveError: autosave.error,
    hasManualChanges: manualChangeCount > 0,
    manualChangeCount,
    isManualSaving,
    manualSaveError,
    confirmManualSetting,
    discardManualSetting,
    isManualSettingSaving,
    getManualSettingError,
    error,
    fetchSettings,
    handleChange,
    getEffectiveValue,
    flushAutosave: autosave.flush,
    saveManualChanges,
    resetManualChanges,
  };
}

function settingsToDraft(settings: Record<string, SystemSetting[]>): SettingsDraft {
  const draft: SettingsDraft = {};
  for (const categorySettings of Object.values(settings)) {
    for (const setting of categorySettings) {
      draft[setting.key] = setting.value;
    }
  }
  return draft;
}

function systemSettingsPersistenceKey(serverUrl: string | undefined): string {
  const baseKey = 'cedros-login:system-settings';
  const scope = normalizePersistenceScope(serverUrl);
  return scope ? `${baseKey}:${scope}` : baseKey;
}

function normalizePersistenceScope(serverUrl: string | undefined): string {
  const value = serverUrl?.trim();
  if (!value) return '';

  try {
    const fallbackOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(value, fallbackOrigin);
    const path = url.pathname.replace(/\/+$/, '');
    return `${url.origin}${path}`;
  } catch {
    return value.replace(/\s+/g, '_');
  }
}

function makeAutosaveSafeDraft(
  confirmed: SettingsDraft,
  draft: SettingsDraft,
  settingsByKey: Map<string, SystemSetting>
): SettingsDraft {
  const safeDraft = { ...draft };
  for (const key of Object.keys(safeDraft)) {
    if (!canAutosaveSystemSetting(settingsByKey.get(key))) {
      safeDraft[key] = confirmed[key] ?? '';
    }
  }
  return safeDraft;
}

function makeSettingsPatch(
  previous: SettingsDraft,
  current: SettingsDraft,
  settingsByKey: Map<string, SystemSetting>,
  mode: 'autosave' | 'manual' | 'all'
): UpdateSettingRequest[] | null {
  const updates = Object.entries(current)
    .filter(([key, value]) => previous[key] !== value)
    .map(([key, value]) => ({ key, value }));
  const filtered = filterSettingsPatch(updates, settingsByKey, mode);
  return filtered.length > 0 ? filtered : null;
}

function validateSettingsPatch(patch: UpdateSettingRequest[]): string | null {
  if (patch.length === 0) return 'No settings provided';
  const invalid = patch.find((update) => update.key.trim().length === 0);
  return invalid ? 'Invalid setting key' : null;
}

function clearSavedEdits(
  setEdits: Dispatch<SetStateAction<SettingsDraft>>,
  patch: UpdateSettingRequest[]
) {
  setEdits((prev) => {
    const next = { ...prev };
    for (const update of patch) {
      if (next[update.key] === update.value) delete next[update.key];
    }
    return next;
  });
}

function diffSettingsDraft(confirmed: SettingsDraft, restored: SettingsDraft): SettingsDraft {
  const edits: SettingsDraft = {};
  for (const [key, value] of Object.entries(restored)) {
    if (confirmed[key] !== undefined && confirmed[key] !== value) {
      edits[key] = value;
    }
  }
  return edits;
}

function withoutKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  if (!Object.prototype.hasOwnProperty.call(record, key)) return record;
  const next = { ...record };
  delete next[key];
  return next;
}
