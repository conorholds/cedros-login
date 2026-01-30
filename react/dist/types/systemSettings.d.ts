/**
 * System settings types for admin configuration management
 */
/** Individual system setting */
export interface SystemSetting {
    key: string;
    value: string;
    description: string | null;
    updatedAt: string;
    updatedBy: string | null;
}
/** Response from GET /admin/settings */
export interface ListSystemSettingsResponse {
    /** Settings grouped by category (privacy, withdrawal, rate_limit) */
    settings: Record<string, SystemSetting[]>;
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
    inputType: 'number' | 'duration' | 'percentage' | 'select' | 'text' | 'tokenSymbolList' | 'tokenList';
    /** Preset values for quick selection (used with 'select' or as suggestions) */
    presets?: SettingPreset[];
    /** Value threshold that triggers a warning */
    warningThreshold?: {
        above?: number;
        below?: number;
        message: string;
    };
    /** Step for number inputs */
    step?: number;
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
    /** Fetch settings from server */
    fetchSettings: () => Promise<void>;
    /** Update one or more settings */
    updateSettings: (updates: UpdateSettingRequest[]) => Promise<void>;
    /** Get a setting value by key */
    getValue: (key: string) => string | undefined;
}
