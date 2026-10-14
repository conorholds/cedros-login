import { useTranslations } from '../../../i18n';

export interface ManualSettingCommitControls {
  onConfirm: (key: string) => Promise<void>;
  onCancel: (key: string) => void;
  isSaving: (key: string) => boolean;
  getError: (key: string) => string | null;
}

export function ManualSettingCommitActions({
  settingKey,
  isSaving,
  error,
  onConfirm,
  onCancel,
}: {
  settingKey: string;
  isSaving: boolean;
  error: string | null;
  onConfirm: (key: string) => Promise<void>;
  onCancel: (key: string) => void;
}) {
  const t = useTranslations();
  const noteId = `${settingKey}-manual-confirmation`;

  return (
    <div className="cedros-secret-actions" aria-describedby={noteId}>
      <span id={noteId} className="cedros-settings-change-count" role="status" aria-live="polite">
        {t.admin.settings.secretPendingConfirmation}
      </span>
      {error && (
        <span className="cedros-error-message" role="alert">
          {error}
        </span>
      )}
      <button
        type="button"
        className="cedros-button cedros-button-primary cedros-button-sm"
        onClick={() => void onConfirm(settingKey)}
        disabled={isSaving}
      >
        {isSaving ? t.admin.settings.secretUpdating : t.admin.settings.secretConfirmUpdate}
      </button>
      <button
        type="button"
        className="cedros-button cedros-button-secondary cedros-button-sm"
        onClick={() => onCancel(settingKey)}
        disabled={isSaving}
      >
        {t.common.cancel}
      </button>
    </div>
  );
}
