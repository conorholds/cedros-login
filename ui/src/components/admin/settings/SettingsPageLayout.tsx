import { useExternalEffect } from '../../../hooks/effects';
/**
 * Shared layout for settings pages with autosave
 */

import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { ErrorMessage } from '../../shared/ErrorMessage';
import { useSettingsAutosave } from '../../../hooks/useSettingsAutosave';
import { SettingsSection } from './settingsInputs';
import { AutosaveStatus } from './AutosaveStatus';
import { useTranslations } from '../../../i18n';

export interface SettingsPageLayoutProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Categories to display on this page */
  categories: string[];
  /** Additional CSS class */
  className?: string;
}

/**
 * Shared layout component for settings pages.
 * Handles loading and displaying settings for specified categories.
 * Changes are automatically saved after a brief debounce.
 */
export function SettingsPageLayout({
  title,
  description,
  categories,
  className = '',
}: SettingsPageLayoutProps) {
  const t = useTranslations();
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

  // Filter settings to only show relevant categories
  const relevantCategories = categories.filter((cat) => settings[cat]?.length > 0);

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

  return (
    <div className={`cedros-system-settings ${className}`}>
      <div className="cedros-settings-page-header">
        <div className="cedros-settings-page-header-content">
          <h2 className="cedros-settings-page-title">{title}</h2>
          <p className="cedros-settings-page-description">{description}</p>
        </div>
        <AutosaveStatus status={autosaveStatus} error={autosaveError} />
      </div>

      {relevantCategories.length === 0 ? (
        <div className="cedros-system-settings-empty">
          <p>{t.admin.settings.empty}</p>
        </div>
      ) : (
        relevantCategories.map((category) => (
          <SettingsSection
            key={category}
            settings={settings[category]}
            edits={edits}
            onChange={handleChange}
            manualCommit={{
              onConfirm: confirmManualSetting,
              onCancel: discardManualSetting,
              isSaving: isManualSettingSaving,
              getError: getManualSettingError,
            }}
          />
        ))
      )}
    </div>
  );
}
