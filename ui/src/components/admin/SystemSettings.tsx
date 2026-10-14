import { useExternalEffect } from '../../hooks/effects';
import { useMemo } from 'react';
import type { SystemSetting, SettingMeta } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useSettingsAutosave } from '../../hooks/useSettingsAutosave';
import { SETTING_METADATA, type CategoryMeta } from './settings/settingsMetadata';
import { SettingsSection as SettingsGrid } from './settings/settingsInputs';
import { AutosaveStatus } from './settings/AutosaveStatus';
import { useI18n } from '../../i18n';
import { useLocalizedSettingMetadata } from './settings/localizedSettingsMetadata';

export interface SystemSettingsProps {
  /** Whether to show section descriptions */
  showDescriptions?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Callback when autosave reports a saved state */
  onSave?: () => void;
}

/**
 * System settings management component for administrators.
 * Non-secret settings use the shared Cedros autosave flow. Secret settings are
 * manual-only exceptions and require explicit field-level confirmation.
 */
export function SystemSettings({
  showDescriptions = true,
  className = '',
  onSave,
}: SystemSettingsProps) {
  const { t } = useI18n();
  const { settingMetadata, categoryMetadata } = useLocalizedSettingMetadata();
  const {
    settings,
    edits,
    isLoading,
    autosaveStatus,
    autosaveError,
    error,
    fetchSettings,
    handleChange,
    confirmManualSetting,
    discardManualSetting,
    isManualSettingSaving,
    getManualSettingError,
  } = useSettingsAutosave();

  useExternalEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useExternalEffect(() => {
    if (autosaveStatus === 'saved') onSave?.();
  }, [autosaveStatus, onSave]);

  if (isLoading && Object.keys(settings).length === 0) {
    return (
      <div className={`cedros-system-settings cedros-system-settings-loading ${className}`}>
        <LoadingSpinner />
        <span>{t.admin.settings.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`cedros-system-settings ${className}`}>
        <ErrorMessage error={error.message} />
      </div>
    );
  }

  const categories = Object.keys(settings)
    .filter((category) => settings[category].some(isLoginSetting))
    .sort();

  if (categories.length === 0) {
    return (
      <div className={`cedros-system-settings cedros-system-settings-empty ${className}`}>
        <p>{t.admin.settings.empty}</p>
      </div>
    );
  }

  return (
    <div className={`cedros-system-settings ${className}`}>
      <AutosaveStatus status={autosaveStatus} error={autosaveError} />

      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          settings={settings[category].filter(isLoginSetting)}
          edits={edits}
          showDescription={showDescriptions}
          categoryMetadata={categoryMetadata}
          settingMetadata={settingMetadata}
          onChange={handleChange}
          manualCommit={{
            onConfirm: confirmManualSetting,
            onCancel: discardManualSetting,
            isSaving: isManualSettingSaving,
            getError: getManualSettingError,
          }}
        />
      ))}
    </div>
  );
}

/** Stable key order derived from SETTING_METADATA insertion order */
const METADATA_KEY_ORDER = Object.keys(SETTING_METADATA);

interface CategorySectionProps {
  category: string;
  settings: SystemSetting[];
  edits: Record<string, string>;
  showDescription: boolean;
  categoryMetadata: Record<string, CategoryMeta>;
  settingMetadata: Record<string, SettingMeta>;
  onChange: (key: string, value: string) => void;
  manualCommit: {
    onConfirm: (key: string) => Promise<void>;
    onCancel: (key: string) => void;
    isSaving: (key: string) => boolean;
    getError: (key: string) => string | null;
  };
}

function CategorySection({
  category,
  settings,
  edits,
  showDescription,
  categoryMetadata,
  settingMetadata,
  onChange,
  manualCommit,
}: CategorySectionProps) {
  const meta = categoryMetadata[category] || {
    label: category,
    description: '',
    icon: '',
  };

  // Sort settings by SETTING_METADATA order; unknown keys sort to end
  const orderedSettings = useMemo(() => {
    return [...settings].sort((a, b) => {
      const ai = METADATA_KEY_ORDER.indexOf(a.key);
      const bi = METADATA_KEY_ORDER.indexOf(b.key);
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
    });
  }, [settings]);

  return (
    <section className="cedros-settings-section">
      <div className="cedros-settings-section-header">
        <span className="cedros-settings-section-icon">{meta.icon}</span>
        <div>
          <h3 className="cedros-settings-section-title">{meta.label}</h3>
          {showDescription && meta.description && (
            <p className="cedros-settings-section-description">{meta.description}</p>
          )}
        </div>
      </div>

      <SettingsGrid
        settings={orderedSettings}
        edits={edits}
        metadata={settingMetadata}
        onChange={onChange}
        manualCommit={manualCommit}
      />
    </section>
  );
}

function isLoginSetting(setting: SystemSetting): boolean {
  return (
    setting.key !== 'subscription_selection_pay_base_url' && setting.key !== 'team_plan_seat_limits'
  );
}
