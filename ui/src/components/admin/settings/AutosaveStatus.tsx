/**
 * Settings autosave status indicator.
 *
 * This wrapper keeps the admin settings import path stable while delegating
 * status language and ARIA behavior to the shared Cedros autosave component.
 */
import { AutosaveStatusIndicator } from '../../../autosave';
import type { AutosaveStatus as Status } from '../../../hooks/useSettingsAutosave';
import { useTranslations } from '../../../i18n';

export interface AutosaveStatusProps {
  status: Status;
  error?: string | null;
}

export function AutosaveStatus({ status, error }: AutosaveStatusProps) {
  const t = useTranslations();

  return (
    <AutosaveStatusIndicator
      status={status}
      error={error}
      labels={{
        dirty: t.admin.settings.unsaved,
        debouncing: t.admin.settings.unsaved,
        queued: t.admin.settings.unsaved,
        saving: t.admin.settings.saving,
        saved: t.admin.settings.saved,
        retrying: t.admin.settings.saving,
        offline: t.admin.settings.offline,
        conflict: t.admin.settings.conflict,
        failed: error ?? t.admin.settings.saveFailed,
      }}
    />
  );
}
