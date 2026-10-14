/**
 * System settings types for admin configuration management
 */

import type { CedrosAutosaveSaveMetadata, CedrosAutosaveSaveResult } from '../autosave';

/** Individual system setting */
export interface SystemSetting {
  key: string;
  value: string;
  description: string | null;
  isSecret: boolean;
  /** Whether a redacted secret currently has a stored value. */
  hasValue?: boolean;
  /** Runtime timing/ownership contract. Optional for older server compatibility. */
  applicationMode?: 'hot' | 'restart' | 'host-owned' | 'unsupported';
  /** Diagnostic for a retained legacy value that violates the current contract. */
  validationError?: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

/** Response from GET /admin/settings */
export interface ListSystemSettingsResponse {
  /** Settings grouped by category (auth, email, rate_limit) */
  settings: Record<string, SystemSetting[]>;
  /** Present on standalone/autosave-aware servers; omitted by extension runtimes. */
  revision?: number;
  /** Present on standalone/autosave-aware servers; omitted by extension runtimes. */
  etag?: string;
}

/** Request to update a single setting */
export interface UpdateSettingRequest {
  key: string;
  value: string;
}

/** Request body for PATCH /admin/settings */
export interface UpdateSystemSettingsRequest {
  settings: UpdateSettingRequest[];
}

/** Response from PATCH /admin/settings */
export interface UpdateSystemSettingsResponse {
  updated: SystemSetting[];
  revision: number;
  etag: string;
}

/** Category metadata for UI display */
export interface SettingCategoryMeta {
  label: string;
  description: string;
}

/** Preset option for settings with suggested values */
export interface SettingPreset {
  label: string;
  value: string;
}

/** Setting metadata for UI rendering */
export interface SettingMeta {
  key: string;
  label: string;
  /** Detailed description explaining what this setting does */
  description: string;
  /** Unit for display (e.g., 'seconds', 'requests', '%') */
  unit?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Input type determines how the setting is rendered */
  inputType:
    | 'number'
    | 'duration'
    | 'percentage'
    | 'select'
    | 'text'
    | 'path'
    | 'boolean'
    | 'secret'
    | 'readonlySecret'
    | 'tokenSymbolList'
    | 'tokenList';
  /** Preset values for quick selection (used with 'select' or as suggestions) */
  presets?: SettingPreset[];
  /** Value threshold that triggers a warning */
  warningThreshold?: { above?: number; below?: number; message: string };
  /** Step for number inputs */
  step?: number;
  /** Whether secret inputs should be multiline (textarea) */
  multiline?: boolean;
  /** Placeholder text for text inputs */
  placeholder?: string;
}

/** Return type for useSystemSettings hook */
export interface UseSystemSettingsReturn {
  /** Settings grouped by category */
  settings: Record<string, SystemSetting[]>;
  /** Whether data is loading */
  isLoading: boolean;
  /** Whether an update is in progress */
  isUpdating: boolean;
  /** Error state */
  error: Error | null;
  /** Current server revision for optimistic autosave concurrency */
  revision: number | undefined;
  /** Current strong ETag for optimistic autosave concurrency */
  etag: string | undefined;
  /** Fetch settings from server */
  fetchSettings: () => Promise<void>;
  /** Update one or more settings */
  updateSettings: (updates: UpdateSettingRequest[]) => Promise<UpdateSystemSettingsResponse>;
  /** Autosave one or more non-secret settings */
  autosaveSettings: (
    updates: UpdateSettingRequest[],
    metadata: CedrosAutosaveSaveMetadata
  ) => Promise<CedrosAutosaveSaveResult<Record<string, string>>>;
  /** Get a setting value by key */
  getValue: (key: string) => string | undefined;
}
