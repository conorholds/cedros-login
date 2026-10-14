import { useExternalEffect } from '../../../hooks/effects';
/**
 * Email settings page - SMTP configuration with provider-aware auto-fill
 */
import { useMemo } from 'react';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { ErrorMessage } from '../../shared/ErrorMessage';
import { useSettingsAutosave } from '../../../hooks/useSettingsAutosave';
import { SettingsSection } from './settingsInputs';
import { AutosaveStatus } from './AutosaveStatus';
import { ALL_EMAIL_FIELDS } from './emailSettingsFields';
import { useTranslations } from '../../../i18n';

export interface EmailSettingsProps {
  className?: string;
}

export function EmailSettings({ className }: EmailSettingsProps) {
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

  const currentSettings = useMemo(() => {
    const categorySettings = settings['email'] ?? [];
    return categorySettings
      .filter((setting) => ALL_EMAIL_FIELDS.includes(setting.key))
      .sort(
        (left, right) => ALL_EMAIL_FIELDS.indexOf(left.key) - ALL_EMAIL_FIELDS.indexOf(right.key)
      );
  }, [settings]);

  if (isLoading && Object.keys(settings).length === 0) {
    return (
      <div className={`cedros-system-settings cedros-system-settings-loading ${className ?? ''}`}>
        <LoadingSpinner />
        <span>{t.admin.settings.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`cedros-system-settings ${className ?? ''}`}>
        <ErrorMessage error={error.message} />
      </div>
    );
  }

  return (
    <div className={`cedros-system-settings ${className ?? ''}`}>
      <div className="cedros-settings-page-header">
        <div className="cedros-settings-page-header-content">
          <h2 className="cedros-settings-page-title">{t.admin.settings.emailTitle}</h2>
          <p className="cedros-settings-page-description">{t.admin.settings.emailDescription}</p>
        </div>
        <AutosaveStatus status={autosaveStatus} error={autosaveError} />
      </div>

      {currentSettings.length === 0 ? (
        <div className="cedros-system-settings-empty">
          <p>{t.admin.settings.empty}</p>
        </div>
      ) : (
        <SettingsSection
          settings={currentSettings}
          edits={edits}
          onChange={handleChange}
          manualCommit={{
            onConfirm: confirmManualSetting,
            onCancel: discardManualSetting,
            isSaving: isManualSettingSaving,
            getError: getManualSettingError,
          }}
        />
      )}
    </div>
  );
}
